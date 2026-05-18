import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

// GET: Return referral stats for the current user
export async function GET(request: Request) {
  const { error, session } = await requireAuth(request.headers.get('cookie'))
  if (error) return error

  try {
    const userId = session!.user!.id

    // Get the user's referral code
    const referralCode = await db.referralCode.findUnique({
      where: { userId },
    })

    // Get all referrals made by this user
    const referrals = await db.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: { select: { id: true, name: true, email: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const totalReferrals = referrals.length
    const completedReferrals = referrals.filter((r) => r.status === 'completed')
    const pendingBonuses = referrals
      .filter((r) => r.status === 'pending' || r.status === 'completed')
      .reduce((sum, r) => sum + r.bonusAmount, 0)
    const paidBonuses = referrals
      .filter((r) => r.status === 'paid')
      .reduce((sum, r) => sum + r.bonusAmount, 0)

    // Check if user was referred by someone
    const myReferral = await db.referral.findUnique({
      where: { referredId: userId },
      include: {
        referrer: { select: { id: true, name: true, email: true } },
        referralCode: { select: { code: true } },
      },
    })

    return NextResponse.json({
      referralCode: referralCode
        ? { code: referralCode.code, usesCount: referralCode.usesCount, isActive: referralCode.isActive }
        : null,
      stats: {
        totalReferrals,
        completedReferrals: completedReferrals.length,
        pendingBonuses,
        paidBonuses,
        totalEarned: pendingBonuses + paidBonuses,
      },
      referrals: referrals.map((r) => ({
        id: r.id,
        referredName: r.referred.name || r.referred.email,
        referredEmail: r.referred.email,
        bonusAmount: r.bonusAmount,
        bonusCurrency: r.bonusCurrency,
        status: r.status,
        referredAt: r.referred.createdAt,
        createdAt: r.createdAt,
      })),
      wasReferred: myReferral
        ? {
            referrerName: myReferral.referrer.name || myReferral.referrer.email,
            codeUsed: myReferral.referralCode?.code || null,
          }
        : null,
    })
  } catch (err) {
    console.error('[Referral Stats GET]', err)
    return NextResponse.json({ error: 'Failed to get referral stats' }, { status: 500 })
  }
}
