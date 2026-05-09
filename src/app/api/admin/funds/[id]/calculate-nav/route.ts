import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-api'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const fund = await db.fund.findUnique({
    where: { id },
    include: { holdings: { include: { asset: true } } },
  })

  if (!fund) return NextResponse.json({ error: 'Fund not found' }, { status: 404 })

  // Calculate total AUM from holdings
  let totalAUM = 0
  for (const holding of fund.holdings) {
    const currentValue = (holding.asset.pricePerFraction || 0) * holding.fractionCount
    await db.fundHolding.update({
      where: { id: holding.id },
      data: {
        valueUsd: currentValue,
        unrealizedPL: currentValue - holding.totalCostBasis,
      },
    })
    totalAUM += currentValue
  }

  // Recalculate NAV
  const outstandingShares = fund.totalShares - fund.availableShares
  const navPerShare = outstandingShares > 0 ? Math.round((totalAUM / outstandingShares) * 100) / 100 : fund.navPerShare

  // Update fund
  await db.fund.update({
    where: { id },
    data: { totalAUM, navPerShare: Math.max(navPerShare, 0.01) },
  })

  // Save NAV history
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  try {
    await db.nAVHistory.create({
      data: {
        fundId: id,
        navPerShare: Math.max(navPerShare, 0.01),
        totalAUM,
        totalShares: fund.totalShares,
        date: today,
      },
    })
  } catch {
    // Already exists for today
  }

  return NextResponse.json({ success: true, navPerShare, totalAUM, outstandingShares })
}
