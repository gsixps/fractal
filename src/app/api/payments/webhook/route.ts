import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { ensurePosition, transferPosition } from '@/lib/erc-6551-service'
import { settleSecondaryPurchase, expireSecondaryPurchase } from '@/lib/secondary-settlement'
import Stripe from 'stripe'

// Disable body parsing — Stripe needs raw body for signature verification
export const dynamic = 'force-dynamic'

/**
 * Store the PaymentIntent id on the completed transaction so `charge.refunded`
 * events (which only carry a PaymentIntent id) can be correlated back to the
 * investment. The Checkout Session metadata is copied to the PaymentIntent at
 * creation time, so a `session_id` key can never be added retroactively there.
 */
function resolvePaymentIntentId(session: Stripe.Checkout.Session): string | null {
  if (typeof session.payment_intent === 'string') return session.payment_intent
  return session.payment_intent?.id ?? null
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { assetId, userId, fractionCount, assetName, type, listingId, sellerId } = session.metadata

  if (!assetId || !userId || !fractionCount) {
    console.error('[Webhook] Missing metadata in checkout session:', session.id)
    return
  }

  const qty = parseInt(fractionCount, 10)
  const paymentIntentId = resolvePaymentIntentId(session)
  const isSecondary = type === 'secondary_market'

  // Idempotency guard: Stripe retries webhooks — never process the same session twice.
  const alreadyProcessed = await db.investment.findFirst({
    where: { stripePaymentId: session.id, status: 'active' },
    select: { id: true },
  })
  if (alreadyProcessed) return

  // ─── Mercado secundario: no se vuelven a consumir fracciones del asset ───
  if (isSecondary) {
    if (!listingId || !sellerId) {
      console.error('[Webhook] Secondary purchase without listingId/sellerId:', session.id)
      return
    }

    const grossUsd = session.amount_total ? session.amount_total / 100 : 0

    await db.$transaction(async (tx) => {
      await settleSecondaryPurchase(tx, {
        sessionId: session.id,
        assetId,
        buyerUserId: userId,
        sellerId,
        listingId,
        qty,
        grossUsd,
        assetName,
        paymentIntentId,
      })
    })

    // ERC-6551: la posición del vendedor se transfiere al comprador (dry-run).
    try {
      const completed = await db.investment.findFirst({
        where: { userId, assetId, stripePaymentId: session.id, status: 'active' },
        select: { id: true },
      })
      if (completed) {
        const result = await transferPosition({ listingId, buyerUserId: userId, buyerInvestmentId: completed.id })
        if (!result.ok) {
          console.warn('[Webhook] transferPosition skipped:', result.error)
        }
      }
    } catch (err) {
      console.error('[Webhook] transferPosition failed (non-blocking):', err)
    }
    return
  }

  await db.$transaction(async (tx) => {
    const asset = await tx.asset.findUnique({ where: { id: assetId } })
    if (!asset) {
      throw new Error(`Asset not found: ${assetId}`)
    }

    const totalFractions = asset.totalFractions > 0 ? asset.totalFractions : 1
    const fundedIncrement = Math.round((qty / totalFractions) * 10000) / 100

    // Atomically decrement fractions; guard against overselling under retry/race.
    const updateResult = await tx.asset.updateMany({
      where: { id: assetId, availableFractions: { gte: qty } },
      data: {
        availableFractions: { decrement: qty },
        fundedPercentage: { increment: fundedIncrement },
      },
    })
    if (updateResult.count === 0) {
      throw new Error(`Not enough available fractions for asset ${assetId}`)
    }

    // Update investment to active
    await tx.investment.updateMany({
      where: {
        userId,
        assetId,
        stripePaymentId: session.id,
        status: 'pending',
      },
      data: {
        status: 'active',
        completedAt: new Date(),
      },
    })

    // Update transaction (also persist PI id for refund correlation)
    await tx.transaction.updateMany({
      where: {
        userId,
        referenceId: session.id,
        status: 'pending',
      },
      data: {
        status: 'completed',
        metadata: paymentIntentId ? JSON.stringify({ paymentIntentId }) : undefined,
      },
    })

    // Update user stats
    await tx.user.update({
      where: { id: userId },
      data: {
        totalInvested: { increment: parseFloat(session.amount_total ? (session.amount_total / 100).toString() : '0') },
        stripeCustomerId: (session.customer as string) || undefined,
      },
    })

    // Create notification
    await tx.notification.create({
      data: {
        userId,
        type: 'payment_success',
        title: '¡Inversión completada!',
        message: `Tu inversión de ${qty} fracción(es) de ${assetName || 'activos'} ha sido procesada exitosamente.`,
      },
    })

    // Check if this user was referred — if so, complete the pending referral bonus
    const pendingReferral = await tx.referral.findFirst({
      where: { referredId: userId, status: 'pending' },
    })

    if (pendingReferral) {
      await tx.referral.update({
        where: { id: pendingReferral.id },
        data: { status: 'completed' },
      })

      await tx.user.update({
        where: { id: pendingReferral.referrerId },
        data: { balance: { increment: pendingReferral.bonusAmount } },
      })

      await tx.notification.create({
        data: {
          userId: pendingReferral.referrerId,
          type: 'referral_bonus',
          title: '¡Bono de referido completado!',
          message: `Tu referido ha completado su primera inversión. Se han acreditado $${pendingReferral.bonusAmount} ${pendingReferral.bonusCurrency} a tu saldo.`,
        },
      })
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        userId,
        action: 'checkout_completed',
        entity: 'investment',
        entityId: session.id,
        details: JSON.stringify({ assetId, fractionCount: qty, amount: session.amount_total }),
      },
    })
  })

  // ERC-6551: crear/cosechar la posición on-chain (dry-run hasta configurar RPC).
  // Nunca debe romper el flujo de pagos — se registra un receipt OnChainAction.
  try {
    const completed = await db.investment.findFirst({
      where: { userId, assetId, stripePaymentId: session.id, status: 'active' },
      select: { id: true },
    })
    if (completed) {
      const result = await ensurePosition({ investmentId: completed.id })
      if (!result.ok) {
        console.warn('[Webhook] ensurePosition skipped:', result.error)
      }
    }
  } catch (err) {
    console.error('[Webhook] ensurePosition failed (non-blocking):', err)
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const { userId, assetId, type, listingId, sellerId, fractionCount } = session.metadata
  if (!userId || !assetId) return

  const isSecondary = type === 'secondary_market'

  // Cancelar la inversión y transactions del comprador (idempotente por status).
  await db.investment.updateMany({
    where: { userId, assetId, stripePaymentId: session.id, status: 'pending' },
    data: { status: 'cancelled' },
  })

  await db.transaction.updateMany({
    where: { userId, referenceId: session.id, status: 'pending' },
    data: { status: 'cancelled' },
  })

  // En secundaria, además: cancelar la venta del vendedor y liberar las
  // fracciones reservadas en el listing (antes quedaban pendientes para siempre).
  if (isSecondary && listingId && sellerId) {
    const qty = parseInt(fractionCount || '0', 10)
    if (qty > 0) {
      await db.$transaction((tx) =>
        expireSecondaryPurchase(tx, {
          sessionId: session.id,
          userId,
          listingId,
          sellerId,
          qty,
        })
      ).catch((err) => {
        console.error('[Webhook] expireSecondaryPurchase failed:', err)
      })
    }
  }

  await db.auditLog.create({
    data: {
      userId,
      action: 'checkout_expired',
      entity: 'investment',
      details: JSON.stringify({ sessionId: session.id }),
    },
  })
}

async function findInvestmentForCharge(charge: Stripe.Charge) {
  const metadata = charge.metadata || {}
  const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null

  // Primary: PaymentIntent id recorded on the transaction at checkout completion.
  if (paymentIntentId) {
    const txn = await db.transaction.findFirst({
      where: { metadata: { contains: paymentIntentId } },
      select: { investmentId: true },
    })
    if (txn?.investmentId) {
      const investment = await db.investment.findUnique({ where: { id: txn.investmentId } })
      if (investment) return investment
    }
  }

  // Fallback: legacy sessions (pre-PI metadata) via correlation to active investments.
  if (metadata.userId && metadata.assetId) {
    return db.investment.findFirst({
      where: { userId: metadata.userId, assetId: metadata.assetId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    })
  }

  return null
}

async function handleRefund(charge: Stripe.Charge) {
  // Only handle full refunds. Partial refunds are out of scope for this engine.
  if (charge.partial_refund || charge.amount_refunded < charge.amount) return

  const investment = await findInvestmentForCharge(charge)

  if (!investment) {
    console.warn('[Webhook] Refund ignored: no matching investment for charge', charge.id)
    return
  }

  if (investment.status === 'refunded') return // idempotency guard

  await db.$transaction(async (tx) => {
    // Status-guarded update — only one of the retried webhooks can win.
    const updated = await tx.investment.updateMany({
      where: { id: investment.id, status: { not: 'refunded' } },
      data: { status: 'refunded' },
    })
    if (updated.count === 0) return

    // Return fractions to available pool
    await tx.asset.update({
      where: { id: investment.assetId },
      data: { availableFractions: { increment: investment.quantity } },
    })

    await tx.user.update({
      where: { id: investment.userId },
      data: { totalInvested: { decrement: investment.totalAmount } },
    })

    await tx.notification.create({
      data: {
        userId: investment.userId,
        type: 'refund',
        title: 'Reembolso procesado',
        message: `Tu inversión ha sido reembolsada. El monto será acreditado a tu método de pago original.`,
      },
    })

    await tx.auditLog.create({
      data: {
        userId: investment.userId,
        action: 'refund_processed',
        entity: 'investment',
        entityId: investment.id,
        details: JSON.stringify({ amount: charge.amount_refunded }),
      },
    })
  })
}

async function handleDispute(charge: Stripe.Charge) {
  const investment = await findInvestmentForCharge(charge)

  if (investment) {
    await db.auditLog.create({
      data: {
        userId: investment.userId,
        action: 'dispute_created',
        entity: 'investment',
        entityId: investment.id,
        details: JSON.stringify({ chargeId: charge.id, reason: charge.dispute?.reason }),
      },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('[Webhook] Missing stripe-signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      )
    } catch (err) {
      console.error('[Webhook] Signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Log all events
    console.log(`[Webhook] Received: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'checkout.session.expired':
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.succeeded':
        console.log('[Webhook] Payment intent succeeded:', event.data.object.id)
        break

      case 'payment_intent.payment_failed':
        console.log('[Webhook] Payment intent failed:', event.data.object.id)
        break

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge)
        break

      case 'charge.dispute.created':
        await handleDispute(event.data.object as Stripe.Charge)
        break

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)
    // Return 500 so Stripe retries. Idempotency guards make retries safe, and a
    // 2xx here would silently lose money movements (e.g. never-decremented fractions).
    return NextResponse.json({ received: false }, { status: 500 })
  }
}