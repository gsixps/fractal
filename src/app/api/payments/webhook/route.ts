import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/stripe'
import { db } from '@/lib/db'
import Stripe from 'stripe'

/**
 * POST /api/payments/webhook
 *
 * Receives Stripe webhook events and updates the database accordingly.
 *
 * Supported events:
 *  - payment_intent.succeeded  → Investment completed, transaction created
 *  - payment_intent.payment_failed → Investment marked failed
 *  - charge.refunded           → Investment marked refunded, transaction created
 */
export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') || ''

  // ── Verify webhook signature ──────────────────────────────────────────────
  let event: Stripe.Event
  try {
    event = verifyWebhookSignature(body, sig)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown verification error'
    console.error('[webhook] Verification failed:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  // ── Acknowledge receipt early (Stripe expects a fast 200) ─────────────────
  // We'll process the event asynchronously below.
  console.log(`[webhook] Received event: ${event.type}`)

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        await handlePaymentSucceeded(pi)
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(pi)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleChargeRefunded(charge)
        break
      }

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`[webhook] Error processing ${event.type}:`, err)
    // Return 200 to Stripe anyway — we'll handle retry/reconciliation manually.
  }

  return NextResponse.json({ received: true })
}

// ─── Event Handlers ──────────────────────────────────────────────────────────

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent) {
  const paymentIntentId = pi.id
  const metadata = pi.metadata as Record<string, string>
  const userId = metadata.userId
  const assetId = metadata.assetId
  const fractions = metadata.fractions

  if (!userId || !assetId) {
    console.warn(`[webhook] Missing metadata on PI ${paymentIntentId}, skipping.`)
    return
  }

  // Find the investment by stripePaymentId
  const investment = await db.investment.findFirst({
    where: { stripePaymentId: paymentIntentId },
  })

  if (!investment) {
    console.warn(`[webhook] No investment found for PI ${paymentIntentId}`)
    return
  }

  // Skip if already completed (idempotent)
  if (investment.status === 'completed') {
    console.log(`[webhook] Investment ${investment.id} already completed, skipping.`)
    return
  }

  // ── Update investment status ──────────────────────────────────────────────
  await db.investment.update({
    where: { id: investment.id },
    data: {
      status: 'completed',
      completedAt: new Date(),
    },
  })

  // ── Decrease available fractions on the asset ─────────────────────────────
  await db.asset.update({
    where: { id: assetId },
    data: {
      availableFractions: {
        decrement: parseInt(fractions || '0', 10),
      },
    },
  })

  // ── Update funded percentage ──────────────────────────────────────────────
  const updatedAsset = await db.asset.findUnique({ where: { id: assetId } })
  if (updatedAsset && updatedAsset.totalFractions > 0) {
    const numFractions = parseInt(fractions || '0', 10)
    const fundedPct = ((updatedAsset.totalFractions - updatedAsset.availableFractions + numFractions) / updatedAsset.totalFractions) * 100
    const newAvailable = updatedAsset.availableFractions - numFractions
    await db.asset.update({
      where: { id: assetId },
      data: {
        fundedPercentage: Math.min(Math.round(fundedPct * 100) / 100, 100),
        status: newAvailable <= 0 ? 'funded' : updatedAsset.status,
      },
    })
  }

  // ── Update user totals ────────────────────────────────────────────────────
  await db.user.update({
    where: { id: userId },
    data: {
      totalInvested: { increment: investment.totalAmount },
    },
  })

  // ── Create transaction record ─────────────────────────────────────────────
  await db.transaction.create({
    data: {
      userId,
      investmentId: investment.id,
      type: 'investment',
      amount: investment.totalAmount,
      currency: pi.currency.toUpperCase(),
      status: 'completed',
      description: `Inversión en ${assetId} — ${fractions} fracciones`,
      referenceId: paymentIntentId,
      metadata: JSON.stringify({
        stripePaymentIntentId: paymentIntentId,
        chargeId: pi.latest_charge,
      }),
    },
  })

  // ── Create notification ───────────────────────────────────────────────────
  const assetForNotification = await db.asset.findUnique({ where: { id: assetId }, select: { name: true } })
  await db.notification.create({
    data: {
      userId,
      type: 'payment_success',
      title: 'Inversión exitosa',
      message: `Tu inversión de ${investment.totalAmount.toLocaleString('es-CL')} CLP en ${assetForNotification?.name || assetId} ha sido procesada correctamente.`,
    },
  })

  console.log(`[webhook] Investment ${investment.id} marked completed for user ${userId}`)
}

async function handlePaymentFailed(pi: Stripe.PaymentIntent) {
  const paymentIntentId = pi.id

  const investment = await db.investment.findFirst({
    where: { stripePaymentId: paymentIntentId },
  })

  if (!investment) {
    console.warn(`[webhook] No investment found for failed PI ${paymentIntentId}`)
    return
  }

  await db.investment.update({
    where: { id: investment.id },
    data: { status: 'failed' },
  })

  // Create failed transaction record
  await db.transaction.create({
    data: {
      userId: investment.userId,
      investmentId: investment.id,
      type: 'investment',
      amount: investment.totalAmount,
      currency: pi.currency.toUpperCase(),
      status: 'failed',
      description: `Pago fallido para inversión en ${investment.assetId}`,
      referenceId: paymentIntentId,
    },
  })

  console.log(`[webhook] Investment ${investment.id} marked failed`)
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id

  if (!paymentIntentId) {
    console.warn('[webhook] Charge refund has no payment_intent, skipping.')
    return
  }

  const investment = await db.investment.findFirst({
    where: { stripePaymentId: paymentIntentId },
  })

  if (!investment) {
    console.warn(`[webhook] No investment found for refunded PI ${paymentIntentId}`)
    return
  }

  // Mark investment as refunded
  await db.investment.update({
    where: { id: investment.id },
    data: { status: 'refunded' },
  })

  // Restore available fractions
  await db.asset.update({
    where: { id: investment.assetId },
    data: {
      availableFractions: { increment: investment.quantity },
    },
  })

  // Decrease user total invested
  await db.user.update({
    where: { id: investment.userId },
    data: {
      totalInvested: { decrement: investment.totalAmount },
    },
  })

  // Create refund transaction
  const amountRefunded = charge.amount_refunded || investment.totalAmount
  await db.transaction.create({
    data: {
      userId: investment.userId,
      investmentId: investment.id,
      type: 'refund',
      amount: amountRefunded,
      currency: (charge.currency || 'clp').toUpperCase(),
      status: 'completed',
      description: `Reembolso de inversión en ${investment.assetId}`,
      referenceId: paymentIntentId,
    },
  })

  // Create notification
  await db.notification.create({
    data: {
      userId: investment.userId,
      type: 'refund',
      title: 'Reembolso procesado',
      message: `Tu reembolso de ${amountRefunded.toLocaleString('es-CL')} CLP ha sido procesado.`,
    },
  })

  console.log(`[webhook] Investment ${investment.id} marked refunded`)
}
