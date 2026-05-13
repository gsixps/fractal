import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const subscribeSchema = z.object({
  email: z.string().email('Email inválido'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = subscribeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Email inválido' },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    // Check for duplicate (use upsert to handle race conditions)
    const existing = await db.newsletter.findUnique({
      where: { email },
    })

    if (existing) {
      // Reactivate if previously unsubscribed
      if (!existing.isActive) {
        await db.newsletter.update({
          where: { email },
          data: { isActive: true },
        })
        return NextResponse.json({ success: true, message: 'Suscripción reactivada exitosamente.' })
      }
      // Already subscribed and active
      return NextResponse.json({ success: true, message: 'Ya estás suscrito al newsletter.' })
    }

    // Create new subscription
    await db.newsletter.create({
      data: {
        email,
        source: 'homepage',
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, message: '¡Suscripción exitosa! Te contactaremos pronto.' })
  } catch (err) {
    console.error('[Newsletter] Subscribe error:', err)
    return NextResponse.json(
      { error: 'Error al procesar la suscripción' },
      { status: 500 }
    )
  }
}
