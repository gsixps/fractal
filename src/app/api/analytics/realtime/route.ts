import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// GET /api/analytics/realtime — Real-time active users (admin only)
export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin(request.headers.get('cookie'))
    if (error) return error

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)

    const recentVisits = await db.pageVisit.findMany({
      where: { createdAt: { gte: fiveMinAgo } },
      select: {
        page: true,
        sessionId: true,
      },
    })

    // Unique active users
    const uniqueSessions = new Set(recentVisits.map((v) => v.sessionId).filter(Boolean))

    // Current page visits
    const currentPageVisits: Record<string, number> = {}
    for (const v of recentVisits) {
      currentPageVisits[v.page] = (currentPageVisits[v.page] || 0) + 1
    }

    return NextResponse.json({
      activeUsers: uniqueSessions.size,
      currentPageVisits,
    })
  } catch (error) {
    console.error('Error fetching realtime analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch realtime data' }, { status: 500 })
  }
}
