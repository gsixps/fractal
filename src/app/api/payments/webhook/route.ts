import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import Stripe from 'stripe'

// Disable body parsing — Stripe needs raw body for signature verification
export const dynamic = 'force-dynamic'

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { assetId, userId, fractionCount, assetName } = session.metadata

  if (!assetId || !userId || !fractionCount) {
    console.error('[Webhook] Missing metadata in checkout session:', session.id)
    return
  }

  const qty = parseInt(fractionCount, 10)

  // Update investment to active
  await db.investment.updateMany({
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

  // Update transaction
  await db.transaction.updateMany({
    where: {
      userId,
      referenceId: session.id,
      status: 'pending',
    },
    data: { status: 'completed' },
  })

  // Decrement available fractions
  await db.asset.update({
    where: { id: assetId },
    data: {
      availableFractions: { decrement: qty },
      fundedPercentage: {
        increment: Math.round((qty / 1000) * 10000) / 100, // Assuming 1000 total fractions
      },
    },
  })

  // Update user stats
  await db.user.update({
    where: { id: userId },
    data: {
      totalInvested: { increment: parseFloat(session.amount_total ? (session.amount_total / 100).toString() : '0') },
      stripeCustomerId: session.customer as string || undefined,
    },
  })

  // Create notification
  await db.notification.create({
    data: {
      userId,
      type: 'payment_success',
      title: '¡Inversión completada!',
      message: `Tu inversión de ${qty} fracción(es) de ${assetName || 'activos'} ha sido procesada exitosamente.`,
    },
  })

  // Audit log
  await db.auditLog.create({
    data: {
      userId,
      action: 'checkout_completed',
      entity: 'investment',
      entityId: session.id,
      details: JSON.stringify({ assetId, fractionCount: qty, amount: session.amount_total }),
    },
  })
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const { userId, assetId } = session.metadata
  if (!userId || !assetId) return

  await db.investment.updateMany({
    where: { userId, assetId, stripePaymentId: session.id, status: 'pending' },
    data: { status: 'cancelled' },
  })

  await db.transaction.updateMany({
    where: { userId, referenceId: session.id, status: 'pending' },
    data: { status: 'cancelled' },
  })

  await db.auditLog.create({
    data: {
      userId,
      action: 'checkout_expired',
      entity: 'investment',
      details: JSON.stringify({ sessionId: session.id }),
    },
  })
}

async function handleRefund(charge: Stripe.Charge) {
  const session = charge.metadata?.session_id
  if (!session) return

  // Find the investment by stripe payment ID
  const investment = await db.investment.findFirst({
    where: { stripePaymentId: session },
  })

  if (!investment) return

  // Mark investment as refunded
  await db.investment.update({
    where: { id: investment.id },
    data: { status: 'refunded' },
  })

  // Return fractions to available pool
  await db.asset.update({
    where: { id: investment.assetId },
    data: {
      availableFractions: { increment: investment.quantity },
    },
  })

  // Update user stats
  await db.user.update({
    where: { id: investment.userId },
    data: { totalInvested: { decrement: investment.totalAmount } },
  })

  // Notify user
  await db.notification.create({
    data: {
      userId: investment.userId,
      type: 'refund',
      title: 'Reembolso procesado',
      message: `Tu inversión ha sido reembolsada. El monto será acreditado a tu método de pago original.`,
    },
  })

  await db.auditLog.create({
    data: {
      userId: investment.userId,
      action: 'refund_processed',
      entity: 'investment',
      entityId: investment.id,
      details: JSON.stringify({ amount: charge.amount_refunded }),
    },
  })
}

async function handleDispute(charge: Stripe.Charge) {
  // Find investment and flag it
  const session = charge.metadata?.session_id
  if (!session) return

  const investment = await db.investment.findFirst({
    where: { stripePaymentId: session },
  })

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
    // Always return 200 to prevent Stripe retries on our errors
    return NextResponse.json({ received: true, error: 'Webhook processed with errors' })
  }
}
