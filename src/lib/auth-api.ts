import { getToken } from 'next-auth/jwt'

// ─── Types ─────────────────────────────────────────────────────
interface AuthResult {
  authenticated: boolean
  userId?: string
  email?: string
  role?: string
  error?: string
  status: number
}

/**
 * Decode JWT from cookie directly using next-auth/jwt getToken().
 * Pass the raw Cookie header string to avoid importing `cookies()`
 * from `next/headers` which can cause Turbopack compilation issues.
 */
async function getSessionFromCookie(cookieHeader: string | null): Promise<AuthResult> {
  if (!cookieHeader) {
    return { authenticated: false, error: 'Authentication required', status: 401 }
  }

  try {
    const token = await getToken({
      req: { headers: { cookie: cookieHeader } },
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token?.userId) {
      return { authenticated: false, error: 'Authentication required', status: 401 }
    }

    return {
      authenticated: true,
      userId: token.userId as string,
      email: (token.email as string) || '',
      role: (token.role as string) || 'investor',
      status: 200,
    }
  } catch (error) {
    console.error('[Auth] Authentication error:', error)
    return { authenticated: false, error: 'Authentication failed', status: 401 }
  }
}

/**
 * Authenticate and check role
 * @param _request - Unused, kept for backward compatibility
 * @param cookieHeader - Pass `request.headers.get('cookie')` from the route handler
 * @param requiredRoles - Optional roles to check
 */
export async function authenticate(
  _request?: Request,
  requiredRoles?: string[],
  cookieHeader?: string | null,
): Promise<AuthResult> {
  // Support both old calling pattern and new cookie-header pattern
  const header = cookieHeader || (_request instanceof Request ? _request.headers.get('cookie') : null)
  const result = await getSessionFromCookie(header)

  if (!result.authenticated) return result

  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(result.role || '')) {
    return { authenticated: false, error: 'Insufficient permissions', status: 403 }
  }

  return result
}

// ─── Shorthand for auth-only routes ────────────────────────────
export async function requireAuth(cookieHeader?: string | null): Promise<AuthResult> {
  return authenticate(undefined, undefined, cookieHeader)
}

// ─── Shorthand for admin-only routes ───────────────────────────
export async function requireAdmin(cookieHeader?: string | null): Promise<AuthResult> {
  return authenticate(undefined, ['superadmin', 'admin'], cookieHeader)
}

// ─── Shorthand for superadmin-only routes ──────────────────────
export async function requireSuperAdmin(cookieHeader?: string | null): Promise<AuthResult> {
  return authenticate(undefined, ['superadmin'], cookieHeader)
}
