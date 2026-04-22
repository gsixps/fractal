import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/stats — Aggregate statistics
export async function GET() {
  try {
    // Run all aggregation queries in parallel
    const [
      totalUsers,
      totalInvestors,
      verifiedUsers,
      totalAssets,
      activeAssets,
      draftAssets,
      allInvestments,
      activeInvestments,
      allTransactions,
      allDividends,
      assetsByType,
      recentUsers,
      recentInvestments,
      liquidityPool,
    ] = await Promise.all([
      // User counts
      db.user.count(),
      db.user.count({ where: { role: 'investor' } }),
      db.user.count({ where: { kycStatus: 'verified' } }),

      // Asset counts
      db.asset.count(),
      db.asset.count({ where: { status: 'active' } }),
      db.asset.count({ where: { status: 'draft' } }),

      // Investment sums
      db.investment.aggregate({
        _sum: { totalAmount: true, quantity: true },
        _count: true,
      }),
      db.investment.aggregate({
        where: { status: { in: ['active', 'completed'] } },
        _sum: { totalAmount: true },
        _count: true,
      }),

      // Transaction sums
      db.transaction.aggregate({
        _sum: { amount: true },
        _count: true,
      }),

      // Dividend sums
      db.dividendPayment.aggregate({
        _sum: { amount: true },
        where: { status: 'paid' },
        _count: true,
      }),

      // Asset distribution by type
      db.asset.groupBy({
        by: ['type'],
        _count: { id: true },
        _sum: { totalValue: true, fundedPercentage: true },
      }),

      // Recent signups (last 30 days)
      db.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),

      // Recent investments (last 30 days)
      db.investment.aggregate({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          status: 'completed',
        },
        _sum: { totalAmount: true },
        _count: true,
      }),

      // Liquidity pool
      db.liquidityPool.findFirst(),
    ]);

    // Calculate totals
    const totalInvested = allInvestments._sum.totalAmount || 0;
    const activeInvested = activeInvestments._sum.totalAmount || 0;
    const totalDividends = allDividends._sum.amount || 0;
    const totalTransactionVolume = allTransactions._sum.amount || 0;

    // Average investment
    const avgInvestment =
      allInvestments._count > 0
        ? totalInvested / allInvestments._count
        : 0;

    // Average yield across active assets
    const activeAssetsData = await db.asset.findMany({
      where: { status: 'active' },
      select: { annualYield: true, fundedPercentage: true },
    });
    const avgYield =
      activeAssetsData.length > 0
        ? activeAssetsData.reduce((sum, a) => sum + a.annualYield, 0) /
          activeAssetsData.length
        : 0;
    const avgFunded =
      activeAssetsData.length > 0
        ? activeAssetsData.reduce((sum, a) => sum + a.fundedPercentage, 0) /
          activeAssetsData.length
        : 0;

    // Asset distribution formatting
    const assetDistribution = assetsByType.map((item) => ({
      type: item.type,
      count: item._count.id,
      totalValue: item._sum.totalValue || 0,
      avgFundedPercentage: item._count.id > 0
        ? (item._sum.fundedPercentage || 0) / item._count.id
        : 0,
    }));

    // KYC stats
    const [kycPending, kycRejected] = await Promise.all([
      db.user.count({ where: { kycStatus: 'pending' } }),
      db.user.count({ where: { kycStatus: 'rejected' } }),
    ]);

    return NextResponse.json({
      overview: {
        totalUsers,
        totalInvestors,
        verifiedUsers,
        kycPending,
        kycRejected,
        recentSignups: recentUsers,
      },
      assets: {
        total: totalAssets,
        active: activeAssets,
        draft: draftAssets,
        avgYield: Math.round(avgYield * 100) / 100,
        avgFundedPercentage: Math.round(avgFunded * 100) / 100,
        distribution: assetDistribution,
      },
      investments: {
        total: allInvestments._count,
        active: activeInvestments._count,
        totalInvested,
        activeInvested,
        avgInvestment: Math.round(avgInvestment),
        recentInvestments: recentInvestments._count,
        recentInvestmentVolume: recentInvestments._sum.totalAmount || 0,
      },
      dividends: {
        total: allDividends._count,
        totalPaid: totalDividends,
      },
      transactions: {
        total: allTransactions._count,
        totalVolume: totalTransactionVolume,
      },
      liquidity: liquidityPool
        ? {
            totalReserve: liquidityPool.totalReserve,
            totalAssets: liquidityPool.totalAssets,
            activeRequests: liquidityPool.activeRequests,
            utilizationRate: liquidityPool.utilizationRate,
            autoReplenish: liquidityPool.autoReplenish,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
