import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const fund = await db.fund.findUnique({
      where: { id },
      include: {
        holdings: {
          include: {
            asset: {
              select: { id: true, name: true, slug: true, type: true, status: true, city: true, country: true, annualYield: true, pricePerFraction: true, images: { where: { isCover: true }, take: 1 } },
            },
          },
          orderBy: { currentWeightPct: 'desc' },
        },
        navHistory: {
          orderBy: { date: 'asc' },
          take: 90,
        },
        _count: { select: { fundInvestments: true } },
      },
    })

    if (!fund) {
      return NextResponse.json({ error: 'Fund not found' }, { status: 404 })
    }

    return NextResponse.json(fund)
  } catch (error) {
    console.error('[API] Error fetching fund:', error)
    return NextResponse.json({ error: 'Failed to fetch fund' }, { status: 500 })
  }
}
