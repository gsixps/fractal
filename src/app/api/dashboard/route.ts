import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET() {
  const { error, session } = await requireAuth()
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

    const totalDividends = await db.dividendPayment.aggregate({
      where: { userId, status: 'paid' },
      _sum: { amount: true },
    })

    const unreadNotifications = notifications.filter(n => !n.read).length

    return NextResponse.json({
      user,
      investments,
      transactions,
      dividendPayments,
      liquidityPool,
      notifications,
      totalDividends: totalDividends._sum.amount || 0,
      unreadNotifications,
    })
  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
