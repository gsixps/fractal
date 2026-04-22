import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const badge = searchParams.get('badge')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (type && type !== 'all') where.type = type
    if (status && status !== 'all') where.status = status
    if (badge) where.badge = badge
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
        { shortDescription: { contains: search } },
      ]
    }

    const assets = await db.asset.findMany({
      where,
      include: {
        images: { where: { isCover: true }, take: 1 },
        _count: { select: { investments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(assets)
  } catch (error) {
    console.error('Assets fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}
