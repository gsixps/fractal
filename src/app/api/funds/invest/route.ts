import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-api'

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request.headers.get('cookie'))
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json()
  const { fundId, shares } = body

  if (!fundId || !shares || shares <= 0) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const fund = await db.fund.findUnique({ where: { id: fundId } })
  if (!fund || fund.status !== 'active') {
    return NextResponse.json({ error: 'Fund not available' }, { status: 404 })
  }

  const totalCost = shares * fund.pricePerShare
  
  // Check minimum investment
  if (totalCost < fund.minInvestment) {
    return NextResponse.json({ error: `Minimum investment is $${fund.minInvestment}` }, { status: 400 })
  }

  // Check max investment
  if (fund.maxInvestmentPerUser) {
    const existing = await db.fundInvestment.aggregate({
      where: { userId: auth.userId!, fundId },
      _sum: { totalInvested: true },
    })
    if ((existing._sum.totalInvested || 0) + totalCost > fund.maxInvestmentPerUser) {
      return NextResponse.json({ error: `Maximum investment per user is $${fund.maxInvestmentPerUser}` }, { status: 400 })
    }
  }

  // Check available shares
  if (shares > fund.availableShares) {
    return NextResponse.json({ error: `Only ${fund.availableShares} shares available` }, { status: 400 })
  }

  // Check user balance
  const user = await db.user.findUnique({ where: { id: auth.userId! } })
  if (!user || (user.balance || 0) < totalCost) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
  }

  // Create/update investment
  const existingInvestment = await db.fundInvestment.findUnique({
    where: { userId_fundId: { userId: auth.userId!, fundId } },
  })

  if (existingInvestment) {
    // Add to existing position
    const newTotalShares = existingInvestment.shares + shares
    const newAvgPrice = (existingInvestment.averageBuyPrice * existingInvestment.shares + fund.pricePerShare * shares) / newTotalShares
    const newTotalInvested = existingInvestment.totalInvested + totalCost
    
    await db.fundInvestment.update({
      where: { id: existingInvestment.id },
      data: {
        shares: newTotalShares,
        averageBuyPrice: Math.round(newAvgPrice * 100) / 100,
        totalInvested: newTotalInvested,
        currentValue: newTotalShares * fund.navPerShare,
        unrealizedPL: (newTotalShares * fund.navPerShare) - newTotalInvested,
        status: 'active',
      },
    })
  } else {
    await db.fundInvestment.create({
      data: {
        userId: auth.userId!,
        fundId,
        shares,
        averageBuyPrice: fund.pricePerShare,
        totalInvested: totalCost,
        currentValue: shares * fund.navPerShare,
        unrealizedPL: 0,
        status: 'active',
      },
    })
  }

  // Update fund available shares
  await db.fund.update({
    where: { id: fundId },
    data: {
      availableShares: { decrement: shares },
      totalAUM: { increment: totalCost },
    },
  })

  // Deduct user balance
  await db.user.update({
    where: { id: auth.userId! },
    data: { balance: { decrement: totalCost }, totalInvested: { increment: totalCost } },
  })

  // Create transaction record
  await db.transaction.create({
    data: {
      userId: auth.userId!,
      type: 'investment',
      amount: totalCost,
      currency: 'USD',
      status: 'completed',
      description: `Invested in ${fund.name}: ${shares} shares @ $${fund.pricePerShare}/share`,
    },
  })

  // Audit log
  await db.auditLog.create({
    data: {
      action: 'fund.invest',
      entity: 'FundInvestment',
      entityId: fundId,
      details: `User ${auth.userId} invested in ${fund.name}: ${shares} shares ($${totalCost})`,
    },
  })

  return NextResponse.json({ success: true, shares, totalCost, fundName: fund.name })
}

export async function GET(request: Request) {
  const auth = await requireAuth(request.headers.get('cookie'))
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const investments = await db.fundInvestment.findMany({
    where: { userId: auth.userId!, status: 'active' },
    include: {
      fund: {
        include: {
          holdings: { include: { asset: { select: { name: true, type: true, images: { where: { isCover: true }, take: 1 } } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(investments)
}
