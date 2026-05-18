import { NextResponse } from 'next/server'

// ─── Types ─────────────────────────────────────────────────────
interface SessionData {
  user: {
    id: string
    email?: string | null
    name?: string | null
    role: string
    kycStatus: string
    avatarUrl?: string | null
  }
}

interface AuthResult {
  error: NextResponse | null
  session: SessionData | null
}

// ─── Lightweight JWT helpers (no external deps) ─────────────────

function base64urlDecode(str: string): string {
  // Replace base64url chars with standard base64
  const replaced = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = '='.repeat((4 - replaced.length % 4) % 4)
  return Buffer.from(replaced + pad, 'base64').toString('utf-8')
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(base64urlDecode(parts[1]))
  } catch {
    return null
  }
}

// ─── HMAC-SHA256 sign for JWT (lightweight, no deps) ───────────

function createHmacSha256(key: Buffer, message: string): string {
  const crypto = require('crypto')
  return crypto.createHmac('sha256', key).update(message).digest('base64url')
}

function signJwt(payload: Record<string, unknown>, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url')
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signingInput = `${headerB64}.${payloadB64}`
  const signature = createHmacSha256(Buffer.from(secret, 'utf-8'), signingInput)
  return `${signingInput}.${signature}`
}

// ─── Session from cookie ────────────────────────────────────────

async function getSessionFromCookie(cookieHeader: string | null): Promise<SessionData | null> {
  if (!cookieHeader) return null

  try {
    const match = cookieHeader.match(/(?:^|;\s*)next-auth\.session-token=([^;]+)/)
    if (!match) return null

    const token = match[1].trim()
    const payload = decodeJwtPayload(token)
    if (!payload || !payload.userId) return null

    return {
      user: {
        id: payload.userId as string,
        email: (payload.email as string) || undefined,
        name: (payload.name as string) || undefined,
        role: (payload.role as string) || 'investor',
        kycStatus: (payload.kycStatus as string) || 'pending',
        avatarUrl: (payload.picture as string) || undefined,
      },
    }
  } catch (err) {
    console.error('[Auth] JWT decode failed:', err)
    return null
  }
}

/**
 * Require authentication — user must be logged in
 * @param cookieHeader - Pass `request.headers.get('cookie')` from the route handler
 */
export async function requireAuth(cookieHeader: string | null): Promise<AuthResult> {
  const session = await getSessionFromCookie(cookieHeader)

  if (!session) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }), session: null }
  }

  return { error: null, session }
}

/**
 * Require admin role — user must be admin or superadmin
 * @param cookieHeader - Pass `request.headers.get('cookie')` from the route handler
 */
export async function requireAdmin(cookieHeader: string | null): Promise<AuthResult> {
  const session = await getSessionFromCookie(cookieHeader)

  if (!session) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }), session: null }
  }

  if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }), session: null }
  }

  return { error: null, session }
}
