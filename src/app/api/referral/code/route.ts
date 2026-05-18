import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

async function ensureReferralCode(userId: string) {
  const existing = await db.referralCode.findUnique({
    where: { userId },
  })

  if (existing) {
    return existing
  }

  // Generate a unique code
  let code = generateReferralCode()
  let attempts = 0
  while (await db.referralCode.findUnique({ where: { code } })) {
    code = generateReferralCode()
    attempts++
    if (attempts > 10) break
  }

  return db.referralCode.create({
    data: { code, userId },
  })
}

// GET: Return current user's referral code (generate if not exists)
export async function GET(request: NextRequest) {
  const { error, session } = await requireAuth(request.headers.get('cookie'))
  if (error) return error

  try {
    const referralCode = await ensureReferralCode(session!.user!.id)

    return NextResponse.json({
      code: referralCode.code,
      usesCount: referralCode.usesCount,
      isActive: referralCode.isActive,
      createdAt: referralCode.createdAt,
    })
  } catch (err) {
    console.error('[Referral Code GET]', err)
    return NextResponse.json({ error: 'Failed to get referral code' }, { status: 500 })
  }
}

// POST: Generate a new referral code for the user
export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth(request.headers.get('cookie'))
  if (error) return error

  try {
    const userId = session!.user!.id

    // Deactivate existing code
    await db.referralCode.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    })

    // Generate new unique code
    let code = generateReferralCode()
    let attempts = 0
    while (await db.referralCode.findUnique({ where: { code } })) {
      code = generateReferralCode()
      attempts++
      if (attempts > 10) break
    }

    const referralCode = await db.referralCode.create({
      data: { code, userId },
    })

    return NextResponse.json({
      code: referralCode.code,
      usesCount: referralCode.usesCount,
      isActive: referralCode.isActive,
      createdAt: referralCode.createdAt,
      message: 'New referral code generated',
    })
  } catch (err) {
    console.error('[Referral Code POST]', err)
    return NextResponse.json({ error: 'Failed to generate referral code' }, { status: 500 })
  }
}
