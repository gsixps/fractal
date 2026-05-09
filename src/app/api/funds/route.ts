import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'
    const type = searchParams.get('type')
    
    const funds = await db.fund.findMany({
      where: {
        status,
        ...(type && type !== 'all' ? { fundType: type } : {}),
      },
      include: {
        holdings: {
          include: {
            asset: {
              select: { id: true, name: true, slug: true, type: true, status: true, images: { where: { isCover: true }, take: 1 } },
            },
          },
          orderBy: { currentWeightPct: 'desc' },
        },
        _count: { select: { fundInvestments: true } },
      },
      orderBy: { totalAUM: 'desc' },
    })

    return NextResponse.json(funds)
  } catch (error) {
    console.error('[API] Error fetching funds:', error)
    return NextResponse.json({ error: 'Failed to fetch funds' }, { status: 500 })
  }
}
