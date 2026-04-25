import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { authenticate } from '@/lib/auth-api'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    })

    return NextResponse.json({
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_details?.email,
      created: session.created,
    })
  } catch (error) {
    console.error('[Payments] Status error:', error)
    return NextResponse.json({ error: 'Error fetching payment status' }, { status: 500 })
  }
}
