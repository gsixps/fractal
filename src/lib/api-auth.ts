import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

/**
 * Require authentication - user must be logged in
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }), session: null }
  }

  return { error: null, session }
}

/**
 * Require admin role - user must be admin or superadmin
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }), session: null }
  }

  if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }), session: null }
  }

  return { error: null, session }
}
