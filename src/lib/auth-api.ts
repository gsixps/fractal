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
// Uses proper NextAuth session verification (JWT signature checked by next-auth internally)
export async function authenticate(
  request?: Request,
  requiredRoles?: string[]
): Promise<AuthResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { authenticated: false, error: 'Authentication required', status: 401 }
    }

    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(session.user.role)) {
      return { authenticated: false, error: 'Insufficient permissions', status: 403 }
    }

    return {
      authenticated: true,
      userId: session.user.id,
      email: session.user.email || '',
      role: session.user.role,
      status: 200,
    }
  } catch (error) {
    console.error('[Auth] Authentication error:', error)
    return { authenticated: false, error: 'Authentication failed', status: 401 }
  }
}

// ─── Shorthand for auth-only routes (alias for authenticate) ──
export async function requireAuth(request?: Request): Promise<AuthResult> {
  return authenticate(request)
}

// ─── Shorthand for admin-only routes ───────────────────────────
export async function requireAdmin(request?: Request): Promise<AuthResult> {
  return authenticate(request, ['superadmin', 'admin'])
}

// ─── Shorthand for superadmin-only routes ──────────────────────
export async function requireSuperAdmin(request?: Request): Promise<AuthResult> {
  return authenticate(request, ['superadmin'])
}
