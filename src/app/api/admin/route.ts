import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error


  try {
    const [totalAssets, totalUsers, totalInvested, totalDividends, liquidityPool, recentTransactions] =
      await Promise.all([
        db.asset.count({ where: { status: 'active' } }),
        db.user.count(),
        db.investment.aggregate({
          where: { status: 'completed' },
          _sum: { totalAmount: true },
        }),
        db.dividendPayment.aggregate({
          where: { status: 'paid' },
          _sum: { amount: true },
        }),
        db.liquidityPool.findFirst(),
        db.transaction.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: { select: { name: true, email: true } } },
        }),
      ])

    const assets = await db.asset.findMany({
      include: { _count: { select: { investments: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      stats: {
        totalAssets,
        totalUsers,
        totalInvested: totalInvested._sum.totalAmount || 0,
        totalDividends: totalDividends._sum.amount || 0,
      },
      assets,
      users,
      liquidityPool,
      recentTransactions,
    })
  } catch (error) {
    console.error('Admin fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 })
  }
}
