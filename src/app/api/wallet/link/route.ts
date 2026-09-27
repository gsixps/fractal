import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { parseSiweMessage, recoverAddressFromSignature } from '@/lib/siwe'

function expectedHost(request: NextRequest): string | null {
  const origin = request.headers.get('origin')
  if (origin) {
    try {
      return new URL(origin).host.toLowerCase()
    } catch {
      /* ignore */
    }
  }
  const forwarded = request.headers.get('x-forwarded-host')
  if (forwarded) return forwarded.split(',')[0].trim().toLowerCase()
  return request.headers.get('host')?.toLowerCase() ?? null
}

// POST /api/wallet/link — verifica una firma SIWE (EIP-4361) y enlaza la wallet
export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth(request.headers.get('cookie'))
  if (error) return error

  try {
    const body = await request.json()
    const { message, signature } = body

    if (typeof message !== 'string' || typeof signature !== 'string') {
      return NextResponse.json({ error: 'message y signature son requeridos' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: session!.user.id } })
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    if (!user.walletNonce || !user.walletNonceExpiresAt) {
      return NextResponse.json({ error: 'Solicita un nonce primero' }, { status: 400 })
    }
    if (user.walletNonceExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: 'Nonce expirado, solicita uno nuevo' }, { status: 400 })
    }

    const parsed = parseSiweMessage(message)
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const fields = parsed.fields

    const host = expectedHost(request)
    if (!host || fields.domain.toLowerCase() !== host) {
      return NextResponse.json({ error: 'El dominio del mensaje no coincide con el sitio' }, { status: 400 })
    }
    try {
      const uriHost = new URL(fields.uri).host.toLowerCase()
      if (uriHost !== fields.domain.toLowerCase()) {
        return NextResponse.json({ error: 'La URI del mensaje no coincide con el dominio' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'URI SIWE inválida' }, { status: 400 })
    }

    if (fields.nonce !== user.walletNonce) {
      return NextResponse.json({ error: 'Nonce de la firma no coincide' }, { status: 400 })
    }

    const issuedMs = Date.parse(fields.issuedAt)
    if (Number.isNaN(issuedMs)) {
      return NextResponse.json({ error: 'Issued At inválido' }, { status: 400 })
    }
    if (issuedMs > Date.now() + 5 * 60 * 1000 || issuedMs < Date.now() - 10 * 60 * 1000) {
      return NextResponse.json({ error: 'La firma está fuera de la ventana de tiempo válida' }, { status: 400 })
    }
    if (fields.expirationTime && Date.now() > Date.parse(fields.expirationTime)) {
      return NextResponse.json({ error: 'La firma ha expirado' }, { status: 400 })
    }

    const recovered = recoverAddressFromSignature(message, signature)
    if (!recovered) {
      return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
    }
    if (recovered !== fields.address.toLowerCase()) {
      return NextResponse.json({ error: 'La firma no corresponde a la dirección del mensaje' }, { status: 400 })
    }
    const claimed = typeof body.address === 'string' ? body.address.toLowerCase() : null
    if (claimed && claimed !== recovered) {
      return NextResponse.json({ error: 'La dirección declarada no coincide con la firma' }, { status: 400 })
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        walletAddress: recovered,
        walletLinkedAt: new Date(),
        walletNonce: null,
        walletNonceExpiresAt: null,
      },
    })

    return NextResponse.json({
      success: true,
      walletAddress: updated.walletAddress,
      walletLinkedAt: updated.walletLinkedAt,
    })
  } catch (err) {
    console.error('[Wallet link]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}