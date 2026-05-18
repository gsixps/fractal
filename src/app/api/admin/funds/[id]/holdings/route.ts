import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-api'

// POST: Add a holding to a fund
// DELETE: Remove a holding from a fund
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request.headers.get('cookie'))
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const body = await request.json()

  // Check fund exists
  const fund = await db.fund.findUnique({ where: { id } })
  if (!fund) return NextResponse.json({ error: 'Fund not found' }, { status: 404 })

  // Check asset exists
  if (!body.assetId) {
    return NextResponse.json({ error: 'assetId is required' }, { status: 400 })
  }
  const asset = await db.asset.findUnique({ where: { id: body.assetId } })
  if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 })

  try {
    const holding = await db.fundHolding.create({
      data: {
        fundId: id,
        assetId: body.assetId,
        targetWeightPct: body.targetWeightPct || 0,
        currentWeightPct: body.currentWeightPct || 0,
        fractionCount: body.fractionCount || 0,
        valueUsd: body.valueUsd || 0,
        averageBuyPrice: body.averageBuyPrice || 0,
        totalCostBasis: body.totalCostBasis || 0,
        unrealizedPL: body.unrealizedPL || 0,
      },
      include: { asset: true },
    })
    return NextResponse.json(holding, { status: 201 })
  } catch (err) {
    // Unique constraint violation (fundId + assetId already exists)
    if (err instanceof Error && err.message.includes('Unique')) {
      return NextResponse.json({ error: 'This asset is already in the fund' }, { status: 409 })
    }
    throw err
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request.headers.get('cookie'))
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const body = await request.json()

  if (!body.holdingId) {
    return NextResponse.json({ error: 'holdingId is required' }, { status: 400 })
  }

  // Verify the holding belongs to this fund
  const holding = await db.fundHolding.findFirst({
    where: { id: body.holdingId, fundId: id },
  })

  if (!holding) {
    return NextResponse.json({ error: 'Holding not found in this fund' }, { status: 404 })
  }

  await db.fundHolding.delete({ where: { id: body.holdingId } })
  return NextResponse.json({ success: true })
}
