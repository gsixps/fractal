import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const { error, session } = await requireAuth(request.headers.get('cookie'))
  if (error) return error

  try {
    const userId = session!.user.id
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    switch (period) {
      case '90':
        startDate.setDate(now.getDate() - 90)
        break
      case '365':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date(0)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Fetch investments
    const investments = await db.investment.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            annualYield: true,
            pricePerFraction: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Aggregate total invested in period
    const totalInvestedInPeriod = investments.reduce(
      (sum, inv) => sum + (inv.status === 'completed' ? inv.totalAmount : 0),
      0
    )

    // Active investments (all completed ones)
    const activeInvestments = investments.filter((inv) => inv.status === 'completed')

    // Dividends in period
    const dividendsInPeriod = await db.dividendPayment.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
        status: 'paid',
      },
    })

    const totalDividends = dividendsInPeriod.reduce((sum, d) => sum + d.amount, 0)

    // Withdrawals in period
    const withdrawalsInPeriod = await db.transaction.findMany({
      where: {
        userId,
        type: { in: ['withdrawal', 'payout'] },
        status: 'completed',
        createdAt: { gte: startDate },
      },
    })

    const totalWithdrawn = withdrawalsInPeriod.reduce((sum, w) => sum + w.amount, 0)

    // Net return
    const netReturn = totalDividends - totalWithdrawn

    // Top assets by total invested
    const assetMap = new Map<string, { name: string; type: string; invested: number; yield: number }>()
    for (const inv of activeInvestments) {
      const key = inv.asset.id
      const existing = assetMap.get(key)
      if (existing) {
        existing.invested += inv.totalAmount
      } else {
        assetMap.set(key, {
          name: inv.asset.name,
          type: inv.asset.type,
          invested: inv.totalAmount,
          yield: inv.asset.annualYield,
        })
      }
    }
    const topAssets = Array.from(assetMap.values())
      .sort((a, b) => b.invested - a.invested)
      .slice(0, 5)

    // Overall totals (all time for context)
    const allTimeInvested = await db.investment.aggregate({
      where: { userId, status: 'completed' },
      _sum: { totalAmount: true },
    })
    const allTimeDividends = await db.dividendPayment.aggregate({
      where: { userId, status: 'paid' },
      _sum: { amount: true },
    })

    const periodLabel =
      period === '30'
        ? 'Last 30 Days'
        : period === '90'
          ? 'Last 90 Days'
          : period === '365'
            ? 'Last Year'
            : 'All Time'

    return NextResponse.json({
      period: periodLabel,
      periodDays: period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      // Period-specific metrics
      totalInvested: totalInvestedInPeriod,
      totalDividends,
      totalWithdrawn,
      netReturn,
      activeInvestments: activeInvestments.length,
      topAssets,
      // All-time totals for comparison
      allTimeInvested: allTimeInvested._sum.totalAmount || 0,
      allTimeDividends: allTimeDividends._sum.amount || 0,
    })
  } catch (err) {
    console.error('Monthly report error:', err)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
