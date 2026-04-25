import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { authenticate } from '@/lib/auth-api'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get the investment
    const investment = await db.investment.findFirst({
      where: {
        userId: auth.userId,
        stripePaymentId: sessionId,
      },
      include: {
        asset: {
          select: { name: true, city: true, country: true },
        },
      },
    })

    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 })
    }

    return NextResponse.json({
      status: session.payment_status,
      investment: {
        id: investment.id,
        assetName: investment.asset.name,
        quantity: investment.quantity,
        totalAmount: investment.totalAmount,
        investmentStatus: investment.status,
        completedAt: investment.completedAt,
      },
      session: {
        id: session.id,
        amount_total: session.amount_total,
        payment_status: session.payment_status,
        customer: session.customer,
      },
    })
  } catch (error) {
    console.error('[Payments] Confirm error:', error)
    return NextResponse.json({ error: 'Error confirming payment' }, { status: 500 })
  }
}
