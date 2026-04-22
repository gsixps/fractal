import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const asset = await db.asset.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        documents: { orderBy: { createdAt: 'asc' } },
        cashFlowProjections: { orderBy: { createdAt: 'asc' } },
        _count: { select: { investments: true } },
      },
    })

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Asset fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 })
  }
}
