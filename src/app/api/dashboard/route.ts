import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request: Request) {
  const { error, session } = await requireAuth(request.headers.get('cookie'))
  if (error) return error

  try {
    const userId = session!.user.id

    const [user, investments, transactions, dividendPayments, liquidityPool, notifications] =
      await Promise.all([
        db.user.findUnique({ where: { id: userId } }),
        db.investment.findMany({
          where: { userId },
          include: { asset: { include: { images: { where: { isCover: true }, take: 1 } } } },
          orderBy: { createdAt: 'desc' },
        }),
        db.transaction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
        db.dividendPayment.findMany({
          where: { userId },
          include: { investment: { include: { asset: true } } },
          orderBy: { paymentDate: 'desc' },
          take: 20,
        }),
        db.liquidityPool.findFirst(),
        db.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ])

    const totalDividendsResult = await db.dividendPayment.aggregate({
      where: { userId, status: 'paid' },
      _sum: { amount: true },
    })
    const totalDividends = totalDividendsResult._sum.amount || 0

    // Calculate total invested from completed/active investments
    const totalInvested = investments
      .filter((inv) => inv.status === 'active' || inv.status === 'completed')
      .reduce((sum, inv) => sum + inv.totalAmount, 0)

    // Calculate current value of held fractions: quantity × current pricePerFraction per asset
    const currentValue = investments
      .filter((inv) => inv.status === 'active')
      .reduce((sum, inv) => sum + inv.quantity * inv.asset.pricePerFraction, 0)

    // Total return = current value + dividends - total invested
    const totalReturn = currentValue + totalDividends - totalInvested

    const unreadNotifications = notifications.filter((n) => !n.read).length

    return NextResponse.json({
      user,
      investments,
      transactions,
      dividendPayments,
      liquidityPool,
      notifications,
      totalDividends,
      totalInvested,
      currentValue,
      totalReturn,
      unreadNotifications,
    })
  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
