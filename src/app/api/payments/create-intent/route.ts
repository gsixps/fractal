import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { createPaymentIntent } from '@/lib/stripe'
import { db } from '@/lib/db'

/**
 * POST /api/payments/create-intent
 *
 * Creates a Stripe PaymentIntent for an investment purchase.
 *
 * Body: { amount: number, currency: string, assetId: string, fractions: number }
 * Returns: { clientSecret: string, paymentIntentId: string }
 */
export async function POST(req: NextRequest) {
  // ── Auth guard ────────────────────────────────────────────────────────────
  const { error: authError, session } = await requireAuth()
  if (authError) return authError

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'User session not found' }, { status: 401 })
  }

  // ── Validate request body ─────────────────────────────────────────────────
  let body: { amount?: number; currency?: string; assetId?: string; fractions?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { amount, currency = 'clp', assetId, fractions } = body

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'A valid positive amount is required' }, { status: 400 })
  }

  if (!assetId || typeof assetId !== 'string') {
    return NextResponse.json({ error: 'assetId is required' }, { status: 400 })
  }

  if (!fractions || typeof fractions !== 'number' || fractions < 1) {
    return NextResponse.json({ error: 'fractions must be at least 1' }, { status: 400 })
  }

  // ── Verify the asset exists and has enough fractions ──────────────────────
  try {
    const asset = await db.asset.findUnique({
      where: { id: assetId },
      select: {
        id: true,
        status: true,
        pricePerFraction: true,
        availableFractions: true,
      },
    })

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    if (asset.status !== 'active') {
      return NextResponse.json({ error: 'Asset is not currently available for investment' }, { status: 400 })
    }

    if (asset.availableFractions < fractions) {
      return NextResponse.json(
        { error: `Only ${asset.availableFractions} fractions available` },
        { status: 400 },
      )
    }

    // ── Create PaymentIntent ─────────────────────────────────────────────────
    const result = await createPaymentIntent(amount, currency, {
      assetId,
      userId: session.user.id,
      fractions: String(fractions),
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Payment service is not configured. Please set STRIPE_SECRET_KEY.' },
        { status: 503 },
      )
    }

    // ── Create a pending Investment record ───────────────────────────────────
    const investment = await db.investment.create({
      data: {
        userId: session.user.id,
        assetId,
        quantity: fractions,
        pricePerUnit: asset.pricePerFraction,
        totalAmount: amount,
        status: 'pending',
        stripePaymentId: result.paymentIntentId,
      },
    })

    // ── Return client secret to the frontend ────────────────────────────────
    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
      investmentId: investment.id,
    })
  } catch (err) {
    console.error('[create-intent] DB error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
