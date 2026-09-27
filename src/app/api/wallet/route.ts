import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

// GET /api/wallet — estado de la wallet enlazada
export async function GET(request: NextRequest) {
  const { error, session } = await requireAuth(request.headers.get('cookie'))
  if (error) return error

  try {
    const user = await db.user.findUnique({
      where: { id: session!.user.id },
      select: { walletAddress: true, walletLinkedAt: true },
    })

    return NextResponse.json({
      walletAddress: user?.walletAddress ?? null,
      walletLinkedAt: user?.walletLinkedAt ?? null,
    })
  } catch (err) {
    console.error('[Wallet status]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}