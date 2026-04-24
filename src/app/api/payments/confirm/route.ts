import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { retrievePaymentIntent } from '@/lib/stripe'
import { db } from '@/lib/db'

/**
 * POST /api/payments/confirm
 *
 * Called by the frontend after a successful Stripe payment confirmation.
 * Verifies the PaymentIntent status and ensures DB records are consistent.
 *
 * Body: { paymentIntentId: string }
 * Returns: { success: true, investment: { id, status, ... } }
 */
export async function POST(req: NextRequest) {
  // ── Auth guard ────────────────────────────────────────────────────────────
  const { error: authError, session } = await requireAuth()
  if (authError) return authError

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'User session not found' }, { status: 401 })
  }

  // ── Validate request body ─────────────────────────────────────────────────
  let body: { paymentIntentId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { paymentIntentId } = body

  if (!paymentIntentId || typeof paymentIntentId !== 'string') {
    return NextResponse.json({ error: 'paymentIntentId is required' }, { status: 400 })
  }

  // ── Retrieve the PaymentIntent from Stripe ────────────────────────────────
  let paymentIntent
  try {
    paymentIntent = await retrievePaymentIntent(paymentIntentId)
  } catch (err) {
    console.error('[confirm] Stripe error:', err)
    return NextResponse.json({ error: 'Failed to retrieve payment from Stripe' }, { status: 502 })
  }

  if (!paymentIntent) {
    return NextResponse.json(
      { error: 'Payment service is not configured. Please set STRIPE_SECRET_KEY.' },
      { status: 503 },
    )
  }

  // ── Find the associated investment ────────────────────────────────────────
  const investment = await db.investment.findFirst({
    where: { stripePaymentId: paymentIntentId },
    include: {
      asset: {
        select: { id: true, name: true, pricePerFraction: true },
      },
    },
  })

  if (!investment) {
    return NextResponse.json({ error: 'Investment not found for this payment' }, { status: 404 })
  }

  // Verify ownership
  if (investment.userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // ── Handle based on payment status ────────────────────────────────────────
  if (paymentIntent.status === 'succeeded') {
    // Ensure the investment is marked as completed (idempotent with webhook)
    if (investment.status !== 'completed') {
      await db.investment.update({
        where: { id: investment.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      })

      // Create transaction if none exists yet
      const existingTx = await db.transaction.findFirst({
        where: {
          investmentId: investment.id,
          type: 'investment',
          referenceId: paymentIntentId,
        },
      })

      if (!existingTx) {
        await db.transaction.create({
          data: {
            userId: session.user.id,
            investmentId: investment.id,
            type: 'investment',
            amount: investment.totalAmount,
            currency: paymentIntent.currency.toUpperCase(),
            status: 'completed',
            description: `Inversión en ${investment.asset.name} — ${investment.quantity} fracciones`,
            referenceId: paymentIntentId,
          },
        })
      }
    }

    // Refresh dashboard data (update user totals)
    await db.user.update({
      where: { id: session.user.id },
      data: {
        totalInvested: { increment: investment.status === 'completed' ? 0 : investment.totalAmount },
      },
    })

    return NextResponse.json({
      success: true,
      investment: {
        id: investment.id,
        status: 'completed',
        quantity: investment.quantity,
        totalAmount: investment.totalAmount,
        assetName: investment.asset.name,
        completedAt: investment.completedAt || new Date().toISOString(),
      },
    })
  }

  if (paymentIntent.status === 'processing') {
    return NextResponse.json({
      success: false,
      status: 'processing',
      message: 'Payment is still being processed. Please check back shortly.',
      investment: {
        id: investment.id,
        status: 'pending',
      },
    })
  }

  // payment_failed, requires_payment_method, canceled, etc.
  const failedStatus = paymentIntent.status === 'canceled' ? 'canceled' : 'failed'

  if (investment.status === 'pending') {
    await db.investment.update({
      where: { id: investment.id },
      data: { status: failedStatus },
    })
  }

  return NextResponse.json({
    success: false,
    status: paymentIntent.status,
    message: `Payment ${paymentIntent.status}. Please try again or contact support.`,
    investment: {
      id: investment.id,
      status: failedStatus,
    },
  })
}
