import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─── In-memory rate limiter ─────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

function rateLimit(ip: string, windowMs = 60000, maxRequests = 100): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now - record.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now })
    return true
  }

  if (record.count >= maxRequests) return false
  record.count++
  return true
}

// ─── Allowed CORS origins ──────────────────────────────────────
function isAllowedOrigin(origin: string): boolean {
  if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return true
  if (/^https?:\/\/([a-zA-Z0-9-]+\.)?space-z\.ai(:\d+)?$/.test(origin)) return true
  if (process.env.NEXTAUTH_URL) {
    try {
      const url = new URL(process.env.NEXTAUTH_URL)
      if (origin === `${url.protocol}//${url.host}`) return true
    } catch { /* ignore */ }
  }
  return false
}

// ─── Security Headers ──────────────────────────────────────────
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'Content-Security-Policy': "default-src 'self' *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com *; font-src 'self' https://fonts.gstatic.com *; img-src 'self' data: blob: https: *; connect-src 'self' https://js.stripe.com https://api.stripe.com https://*.space-z.ai https://space-z.ai *; frame-ancestors *;",
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const origin = request.headers.get('origin') || ''

  // ─── Dynamic CORS ────────────────────────────────────────────
  if (isAllowedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Vary', 'Origin')
  }

  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    if (isAllowedOrigin(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
      response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization')
      response.headers.set('Vary', 'Origin')
      return new NextResponse(null, { status: 204, headers: response.headers })
    }
    return new NextResponse(null, { status: 403 })
  }

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // ─── Rate limiting for API routes ────────────────────────────
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

    const isAuthEndpoint = request.nextUrl.pathname.includes('/auth/') ||
                          request.nextUrl.pathname.includes('/register')
    const isPaymentEndpoint = request.nextUrl.pathname.includes('/payments/')

    if (isAuthEndpoint) {
      if (!rateLimit(ip, 60000, 10)) {
        return NextResponse.json(
          { error: 'Too many authentication attempts. Please try again later.' },
          { status: 429 }
        )
      }
    } else if (isPaymentEndpoint) {
      if (!rateLimit(ip, 60000, 20)) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }
    } else if (!rateLimit(ip, 60000, 100)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
