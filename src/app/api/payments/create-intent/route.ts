import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { authenticate } from '@/lib/auth-api'

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Authentication required' }, { status: auth.status })
    }

    // 2. Parse and validate input
    const body = await request.json()
    const { assetId, fractionCount } = body

    if (!assetId || !fractionCount || fractionCount < 1) {
      return NextResponse.json(
        { error: 'Se requiere assetId y fractionCount (mínimo 1)' },
        { status: 400 }
      )
    }

    // 3. Get asset and validate
    const asset = await db.asset.findUnique({
      where: { id: assetId },
      include: {
        images: {
          where: { isCover: true },
          select: { url: true },
          take: 1,
        },
      },
    })

    if (!asset || asset.status !== 'active') {
      return NextResponse.json(
        { error: 'Activo no encontrado o no disponible' },
        { status: 404 }
      )
    }

    if (fractionCount > asset.availableFractions) {
      return NextResponse.json(
        { error: `Solo hay ${asset.availableFractions} fracciones disponibles` },
        { status: 400 }
      )
    }

    // 4. Calculate amount in USD cents
    const amountPerFraction = Math.round(asset.pricePerFraction * 100) // Stripe needs cents
    const totalAmountCents = amountPerFraction * fractionCount
    const totalAmountUSD = asset.pricePerFraction * fractionCount

    // 5. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${asset.name} - Fracción Inmobiliaria`,
              description: `${fractionCount} fracción(es) de ${asset.name} en ${asset.city}, ${asset.country}`,
              images: asset.images.length > 0 ? asset.images.map(img => img.url) : [],
            },
            unit_amount: amountPerFraction,
          },
          quantity: fractionCount,
        },
      ],
      metadata: {
        assetId: asset.id,
        userId: auth.userId,
        fractionCount: fractionCount.toString(),
        assetName: asset.name,
        pricePerFraction: asset.pricePerFraction.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?payment=cancelled`,
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Error al crear la sesión de pago' },
        { status: 500 }
      )
    }

    // 6. Create pending Investment record
    const investment = await db.investment.create({
      data: {
        userId: auth.userId,
        assetId: asset.id,
        quantity: fractionCount,
        pricePerUnit: asset.pricePerFraction,
        totalAmount: totalAmountUSD,
        status: 'pending',
        stripePaymentId: session.id,
      },
    })

    // 7. Create Transaction record
    await db.transaction.create({
      data: {
        userId: auth.userId,
        investmentId: investment.id,
        type: 'investment',
        amount: totalAmountUSD,
        currency: 'USD',
        status: 'pending',
        description: `Inversión: ${fractionCount} fracción(es) de ${asset.name}`,
        referenceId: session.id,
      },
    })

    // 8. Audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        action: 'create_checkout_session',
        entity: 'investment',
        entityId: investment.id,
        details: JSON.stringify({
          assetId: asset.id,
          fractionCount,
          totalAmount: totalAmountUSD,
          sessionId: session.id,
        }),
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      investmentId: investment.id,
    })
  } catch (error) {
    console.error('[Payments] Create checkout error:', error)
    return NextResponse.json(
      { error: 'Error interno al procesar el pago' },
      { status: 500 }
    )
  }
}
