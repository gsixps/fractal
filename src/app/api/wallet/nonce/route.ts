import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

// POST /api/wallet/nonce — genera un nonce para la firma SIWE
export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth(request.headers.get('cookie'))
  if (error) return error

  try {
    const nonce = randomBytes(16).toString('hex') // 32 chars, alnum
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await db.user.update({
      where: { id: session!.user.id },
      data: { walletNonce: nonce, walletNonceExpiresAt: expiresAt },
    })

    return NextResponse.json({ nonce, expiresAt })
  } catch (err) {
    console.error('[Wallet nonce]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}