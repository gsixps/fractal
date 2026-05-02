import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

// POST: Apply a referral code
export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const userId = session!.user!.id
    const body = await request.json()
    const { code } = body as { code?: string }

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 })
    }

    const trimmedCode = code.trim().toUpperCase()

    // Check if user already has a referrer
    const existingReferral = await db.referral.findUnique({
      where: { referredId: userId },
    })

    if (existingReferral) {
      return NextResponse.json({ error: 'You already have a referrer' }, { status: 400 })
    }

    // Find the referral code
    const referralCode = await db.referralCode.findUnique({
      where: { code: trimmedCode },
      include: { user: true },
    })

    if (!referralCode) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
    }

    if (!referralCode.isActive) {
      return NextResponse.json({ error: 'This referral code is no longer active' }, { status: 400 })
    }

    // Can't refer yourself
    if (referralCode.userId === userId) {
      return NextResponse.json({ error: 'You cannot use your own referral code' }, { status: 400 })
    }

    // Create the referral
    const referral = await db.referral.create({
      data: {
        referrerId: referralCode.userId,
        referredId: userId,
        referralCodeId: referralCode.id,
        bonusAmount: 25,
        bonusCurrency: 'USD',
        status: 'completed',
      },
      include: {
        referrer: { select: { id: true, name: true, email: true } },
        referred: { select: { id: true, name: true, email: true } },
      },
    })

    // Increment uses count
    await db.referralCode.update({
      where: { id: referralCode.id },
      data: { usesCount: { increment: 1 } },
    })

    return NextResponse.json({
      message: 'Referral code applied successfully',
      referral: {
        id: referral.id,
        referrerName: referral.referrer.name || referral.referrer.email,
        bonusAmount: referral.bonusAmount,
        bonusCurrency: referral.bonusCurrency,
        status: referral.status,
      },
    })
  } catch (err) {
    console.error('[Referral Apply POST]', err)
    return NextResponse.json({ error: 'Failed to apply referral code' }, { status: 500 })
  }
}
