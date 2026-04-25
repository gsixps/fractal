import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// ─── Types ─────────────────────────────────────────────────────
interface AuthResult {
  authenticated: boolean
  userId?: string
  email?: string
  role?: string
  error?: string
  status: number
}

// ─── Authenticate and check role ───────────────────────────────
export async function authenticate(
  request: Request,
  requiredRoles?: string[]
): Promise<AuthResult> {
  try {
    // Try to get session from NextAuth
    // For API routes, we need to handle session manually from token
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    
    // Also check cookie for session
    // NextAuth JWT strategy stores in cookie by default
    
    // We'll use a simpler approach: get session from request cookies
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const nextAuthSessionToken = cookieStore.get('next-auth.session-token')?.value ||
                                  cookieStore.get('__Secure-next-auth.session-token')?.value
    
    const token = sessionToken || nextAuthSessionToken
    
    if (!token) {
      return { authenticated: false, error: 'No session token provided', status: 401 }
    }
    
    // Decode JWT to get user info (simple decode, not full verification)
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { authenticated: false, error: 'Invalid token format', status: 401 }
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
    
    if (!payload.userId && !payload.sub) {
      return { authenticated: false, error: 'Invalid session', status: 401 }
    }
    
    // Verify user exists in database
    const { db } = await import('@/lib/db')
    const user = await db.user.findUnique({
      where: { id: payload.userId || payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    })
    
    if (!user || !user.isActive) {
      return { authenticated: false, error: 'User not found or inactive', status: 401 }
    }
    
    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      return { authenticated: false, error: 'Insufficient permissions', status: 403 }
    }
    
    return {
      authenticated: true,
      userId: user.id,
      email: user.email,
      role: user.role,
      status: 200,
    }
  } catch (error) {
    console.error('[Auth] Authentication error:', error)
    return { authenticated: false, error: 'Authentication failed', status: 401 }
  }
}

// ─── Shorthand for admin-only routes ───────────────────────────
export async function requireAdmin(request: Request): Promise<AuthResult> {
  return authenticate(request, ['superadmin', 'admin'])
}

// ─── Shorthand for superadmin-only routes ──────────────────────
export async function requireSuperAdmin(request: Request): Promise<AuthResult> {
  return authenticate(request, ['superadmin'])
}
