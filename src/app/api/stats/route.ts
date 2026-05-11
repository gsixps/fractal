import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Run all queries in parallel for speed
    const [
      totalInvestedResult,
      totalInvestorsResult,
      averageYieldResult,
      totalAssetsResult,
      totalDividendsResult,
      platformFeeSetting,
    ] = await Promise.all([
      // Sum of all completed investments
      db.investment.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'completed' },
      }),
      // Count of users with at least 1 investment
      db.user.count({
        where: {
          investments: { some: { status: { in: ['completed', 'active'] } } },
        },
      }),
      // Average annual yield of active assets
      db.asset.aggregate({
        _avg: { annualYield: true },
        where: { status: 'active' },
      }),
      // Count of active assets
      db.asset.count({
        where: { status: 'active' },
      }),
      // Sum of paid dividends
      db.dividendPayment.aggregate({
        _sum: { amount: true },
        where: { status: 'paid' },
      }),
      // Platform fee from settings
      db.siteSetting.findUnique({
        where: { key: 'platform_fee' },
      }),
    ])

    const totalInvested = totalInvestedResult._sum.totalAmount ?? 0
    const totalInvestors = totalInvestorsResult
    const averageYield = averageYieldResult._avg.annualYield ?? 0
    const totalAssets = totalAssetsResult
    const totalDividends = totalDividendsResult._sum.amount ?? 0
    const platformFee = platformFeeSetting?.value ? parseFloat(platformFeeSetting.value) : 3

    return NextResponse.json({
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalInvestors,
      averageYield: Math.round(averageYield * 10) / 10,
      platformFee,
      totalAssets,
      totalDividends: Math.round(totalDividends * 100) / 100,
    })
  } catch (err) {
    console.error('[Stats] Error fetching public stats:', err)
    return NextResponse.json(
      {
        totalInvested: 0,
        totalInvestors: 0,
        averageYield: 0,
        platformFee: 3,
        totalAssets: 0,
        totalDividends: 0,
      },
      { status: 200 } // Return zeros instead of error so the UI still renders
    )
  }
}
