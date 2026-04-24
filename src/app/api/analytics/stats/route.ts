import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// GET /api/analytics/stats — Analytics summary (admin only)
export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '7d':
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
    }

    // Today start
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    // This week start (Monday)
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    weekStart.setHours(0, 0, 0, 0)
    // This month start
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // 5 minutes ago for active users
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000)

    // Run queries in parallel
    const [
      totalToday,
      totalWeek,
      totalMonth,
      totalPeriod,
      uniqueSessionPeriod,
      activeNow,
      allVisitsPeriod,
    ] = await Promise.all([
      db.pageVisit.count({ where: { createdAt: { gte: todayStart } } }),
      db.pageVisit.count({ where: { createdAt: { gte: weekStart } } }),
      db.pageVisit.count({ where: { createdAt: { gte: monthStart } } }),
      db.pageVisit.count({ where: { createdAt: { gte: startDate } } }),
      // Unique visitors by sessionId
      (async () => {
        const result = await db.pageVisit.groupBy({
          by: ['sessionId'],
          where: { createdAt: { gte: startDate }, sessionId: { not: null } },
        })
        return result.length
      })(),
      // Active users in last 5 minutes
      (async () => {
        const result = await db.pageVisit.groupBy({
          by: ['sessionId'],
          where: { createdAt: { gte: fiveMinAgo }, sessionId: { not: null } },
        })
        return result.length
      })(),
      // All visits for period (for breakdowns)
      db.pageVisit.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          page: true,
          userAgent: true,
          country: true,
          referrer: true,
          sessionId: true,
          createdAt: true,
        },
      }),
    ])

    // ─── Top Pages ─────────────────────────────────────────────────────────
    const pageCounts: Record<string, number> = {}
    for (const v of allVisitsPeriod) {
      pageCounts[v.page] = (pageCounts[v.page] || 0) + 1
    }
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }))

    // ─── Visits Over Time ─────────────────────────────────────────────────
    const dailyVisits: Record<string, number> = {}
    for (const v of allVisitsPeriod) {
      const day = v.createdAt.toISOString().split('T')[0]
      dailyVisits[day] = (dailyVisits[day] || 0) + 1
    }
    // Fill in gaps
    const visitsOverTime: Array<{ date: string; visits: number }> = []
    const dayMs = 24 * 60 * 60 * 1000
    for (let d = new Date(startDate); d <= now; d = new Date(d.getTime() + dayMs)) {
      const key = d.toISOString().split('T')[0]
      visitsOverTime.push({ date: key, visits: dailyVisits[key] || 0 })
    }

    // ─── Device Breakdown ─────────────────────────────────────────────────
    const deviceBreakdown = { desktop: 0, mobile: 0, tablet: 0, unknown: 0 }
    for (const v of allVisitsPeriod) {
      const ua = v.userAgent || ''
      if (/tablet|ipad|playbook|silk/i.test(ua)) {
        deviceBreakdown.tablet++
      } else if (/mobile|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile/i.test(ua)) {
        deviceBreakdown.mobile++
      } else if (ua.length > 0) {
        deviceBreakdown.desktop++
      } else {
        deviceBreakdown.unknown++
      }
    }

    // ─── Country Breakdown ────────────────────────────────────────────────
    const countryCounts: Record<string, number> = {}
    for (const v of allVisitsPeriod) {
      const c = v.country || 'Desconocido'
      countryCounts[c] = (countryCounts[c] || 0) + 1
    }
    const countryBreakdown = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }))

    // ─── Referrer Breakdown ───────────────────────────────────────────────
    const referrerCounts: Record<string, number> = {}
    for (const v of allVisitsPeriod) {
      let ref = v.referrer || 'Directo'
      if (ref.length > 80) ref = ref.slice(0, 80) + '...'
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1
    }
    const referrerBreakdown = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count }))

    // ─── Active Pages (current visitors per page) ─────────────────────────
    const activePageVisits: Record<string, number> = {}
    const activeVisits = allVisitsPeriod.filter((v) => v.createdAt >= fiveMinAgo)
    for (const v of activeVisits) {
      activePageVisits[v.page] = (activePageVisits[v.page] || 0) + 1
    }

    // ─── Bounce Rate Proxy (single-page sessions in period) ───────────────
    const sessionPageCounts: Record<string, number> = {}
    for (const v of allVisitsPeriod) {
      const sid = v.sessionId || 'unknown'
      sessionPageCounts[sid] = (sessionPageCounts[sid] || 0) + 1
    }
    const totalSessions = Object.keys(sessionPageCounts).length || 1
    const singlePageSessions = Object.values(sessionPageCounts).filter((c) => c === 1).length
    const bounceRate = Math.round((singlePageSessions / totalSessions) * 100)

    // ─── Avg Pages per Session ────────────────────────────────────────────
    const totalPagesViews = allVisitsPeriod.length
    const avgPagesPerSession = totalSessions > 0 ? Math.round((totalPagesViews / totalSessions) * 10) / 10 : 0

    return NextResponse.json({
      summary: {
        totalToday,
        totalWeek,
        totalMonth,
        totalPeriod,
        uniqueVisitors: uniqueSessionPeriod,
        activeNow,
        bounceRate,
        avgPagesPerSession,
      },
      topPages,
      visitsOverTime,
      deviceBreakdown,
      countryBreakdown,
      referrerBreakdown,
      activePageVisits,
    })
  } catch (error) {
    console.error('Error fetching analytics stats:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
