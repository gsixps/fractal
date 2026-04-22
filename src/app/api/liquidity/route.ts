import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const pool = await db.liquidityPool.findFirst({
      include: {
        requests: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!pool) {
      return NextResponse.json({
        id: 'pool_main_001',
        totalReserve: 0,
        totalAssets: 0,
        activeRequests: 0,
        utilizationRate: 0,
        monthlyContribution: 0,
        autoReplenish: true,
        requests: [],
      })
    }

    return NextResponse.json(pool)
  } catch (error) {
    console.error('Liquidity fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch liquidity pool' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { investmentId, fractionCount, userId } = body

    const investment = await db.investment.findUnique({
      where: { id: investmentId },
      include: { asset: true },
    })

    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 })
    }

    const bookValuePerFraction = investment.pricePerUnit
    const totalAmount = bookValuePerFraction * fractionCount
    const expressFee = 0.015 // 1.5% fee for express exit
    const netAmount = totalAmount * (1 - expressFee)

    const liquidityRequest = await db.liquidityRequest.create({
      data: {
        userId: userId || investment.userId,
        investmentId,
        poolId: 'pool_main_001',
        fractionCount,
        bookValuePerFraction,
        totalAmount,
        expressFee,
        netAmount,
        status: 'approved',
        approvedAt: new Date(),
        processingDays: 3,
      },
    })

    // Create transaction
    await db.transaction.create({
      data: {
        userId: userId || investment.userId,
        investmentId,
        type: 'sell',
        amount: netAmount,
        bookValue: totalAmount,
        salePrice: netAmount,
        status: 'processing',
        description: `Salida Express - ${fractionCount} fracciones - Fee ${expressFee * 100}%`,
      },
    })

    return NextResponse.json({
      request: liquidityRequest,
      message: 'Salida Express solicitada exitosamente',
    })
  } catch (error) {
    console.error('Liquidity request error:', error)
    return NextResponse.json({ error: 'Failed to process liquidity request' }, { status: 500 })
  }
}
