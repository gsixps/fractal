import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAdmin(request.headers.get('cookie'))
    if (error) return error

    const adminUserId = session!.user.id
    const { investmentId, reason } = await request.json()

    if (!investmentId) {
      return NextResponse.json({ error: 'investmentId is required' }, { status: 400 })
    }

    // Get investment with payment info
    const investment = await db.investment.findUnique({
      where: { id: investmentId },
      include: {
        asset: { select: { name: true } },
        user: { select: { email: true, name: true } },
      },
    })

    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 })
    }

    if (investment.status !== 'active') {
      return NextResponse.json({ error: 'Solo se pueden reembolsar inversiones activas' }, { status: 400 })
    }

    if (!investment.stripePaymentId) {
      return NextResponse.json({ error: 'No payment ID associated with this investment' }, { status: 400 })
    }

    // Get the payment intent from Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(investment.stripePaymentId)
    const paymentIntentId = stripeSession.payment_intent as string

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'No payment intent found' }, { status: 400 })
    }

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: {
        investmentId: investment.id,
        adminId: adminUserId,
        reason: reason || 'Refund requested by admin',
      },
    })

    // Update investment status
    await db.investment.update({
      where: { id: investment.id },
      data: { status: 'refunded' },
    })

    // Return fractions
    await db.asset.update({
      where: { id: investment.assetId },
      data: { availableFractions: { increment: investment.quantity } },
    })

    // Update user
    await db.user.update({
      where: { id: investment.userId },
      data: { totalInvested: { decrement: investment.totalAmount } },
    })

    // Create transaction
    await db.transaction.create({
      data: {
        userId: investment.userId,
        investmentId: investment.id,
        type: 'refund',
        amount: investment.totalAmount,
        currency: 'USD',
        status: 'completed',
        description: `Reembolso: ${investment.quantity} fracción(es) de ${investment.asset.name}. Motivo: ${reason || 'Solicitado por admin'}`,
        referenceId: refund.id,
        processedBy: adminUserId,
      },
    })

    // Notify user
    await db.notification.create({
      data: {
        userId: investment.userId,
        type: 'refund',
        title: 'Reembolso procesado',
        message: `Tu inversión de ${investment.quantity} fracción(es) de ${investment.asset.name} ha sido reembolsada. El monto de $${investment.totalAmount.toFixed(2)} USD será acreditado a tu tarjeta en 5-10 días hábiles.`,
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'admin_refund',
        entity: 'investment',
        entityId: investment.id,
        details: JSON.stringify({
          investmentId,
          amount: investment.totalAmount,
          reason,
          refundId: refund.id,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status,
    })
  } catch (error) {
    console.error('[Admin Refund] Error:', error)
    return NextResponse.json({ error: 'Error processing refund' }, { status: 500 })
  }
}
