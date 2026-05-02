import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─── In-memory rate limiter (simple but effective) ─────────────
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

function rateLimit(ip: string, windowMs = 60000, maxRequests = 100): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now - record.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

// ─── Allowed CORS origins ──────────────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
]

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true
  // Allow any *.space-z.ai subdomain (http or https)
  if (/^https?:\/\/([a-zA-Z0-9-]+\.)?space-z\.ai(:\d+)?$/.test(origin)) return true
  return false
}

// ─── Security Headers ──────────────────────────────────────────
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://js.stripe.com https://api.stripe.com https://*.space-z.ai https://space-z.ai;",
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
    // Reject preflight from disallowed origins
    return new NextResponse(null, { status: 403 })
  }

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // Stricter rate limiting for auth endpoints
    const isAuthEndpoint = request.nextUrl.pathname.includes('/auth/') || 
                          request.nextUrl.pathname.includes('/register')
    const isPaymentEndpoint = request.nextUrl.pathname.includes('/payments/')
    
    if (isAuthEndpoint) {
      if (!rateLimit(ip, 60000, 10)) { // 10 req/min for auth
        return NextResponse.json(
          { error: 'Too many authentication attempts. Please try again later.' },
          { status: 429 }
        )
      }
    } else if (isPaymentEndpoint) {
      if (!rateLimit(ip, 60000, 20)) { // 20 req/min for payments
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }
    } else {
      if (!rateLimit(ip, 60000, 100)) { // 100 req/min for general API
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
    }
  }
  
  // Note: Admin API route auth is handled in each route handler via requireAdmin()
  // from @/lib/api-auth (which uses getServerSession). The middleware does NOT
  // block admin API routes here — allowing cookie-based NextAuth sessions to pass
  // through. Rate limiting and security headers are still applied above.

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
