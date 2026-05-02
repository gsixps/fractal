import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

// GET: List active secondary market listings
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const assetId = searchParams.get('assetId')
  const sort = searchParams.get('sort') || 'newest'
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const where: Record<string, unknown> = { status: 'active' }

    if (assetId) {
      where.assetId = assetId
    }

    // Filter out expired listings
    where.expiresAt = { gt: new Date() }

    const orderBy: Record<string, string> =
      sort === 'price_asc'
        ? { pricePerFraction: 'asc' }
        : sort === 'price_desc'
          ? { pricePerFraction: 'desc' }
          : { createdAt: 'desc' }

    const listings = await db.secondaryMarketListing.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        seller: {
          select: { id: true, name: true, avatarUrl: true },
        },
        asset: {
          select: {
            id: true,
            name: true,
            type: true,
            city: true,
            images: { where: { isCover: true }, take: 1 },
          },
        },
      },
    })

    return NextResponse.json(listings)
  } catch (err) {
    console.error('[SecondaryMarket GET]', err)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

// POST: Create a new secondary market listing
export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { investmentId, fractionCount, pricePerFraction } = body
    const userId = session!.user!.id

    // Validate inputs
    if (!investmentId || !fractionCount || !pricePerFraction) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (fractionCount <= 0 || pricePerFraction <= 0) {
      return NextResponse.json({ error: 'fractionCount and pricePerFraction must be positive' }, { status: 400 })
    }

    // Get the investment
    const investment = await db.investment.findUnique({
      where: { id: investmentId },
    })

    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 })
    }

    if (investment.userId !== userId) {
      return NextResponse.json({ error: 'You do not own this investment' }, { status: 403 })
    }

    if (investment.status !== 'completed' && investment.status !== 'active') {
      return NextResponse.json({ error: 'Investment must be completed or active to list' }, { status: 400 })
    }

    // Calculate already listed fractions
    const activeListings = await db.secondaryMarketListing.findMany({
      where: {
        investmentId,
        sellerId: userId,
        status: { in: ['active', 'partial'] },
      },
    })

    const alreadyListed = activeListings.reduce(
      (sum, l) => sum + l.fractionCount - l.soldFractionCount,
      0
    )

    const availableFractions = investment.quantity - alreadyListed

    if (fractionCount > availableFractions) {
      return NextResponse.json(
        { error: `Only ${availableFractions} fractions available to list` },
        { status: 400 }
      )
    }

    const totalPrice = fractionCount * pricePerFraction
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const listing = await db.secondaryMarketListing.create({
      data: {
        sellerId: userId,
        investmentId,
        assetId: investment.assetId,
        fractionCount,
        pricePerFraction,
        totalPrice,
        status: 'active',
        expiresAt,
      },
      include: {
        seller: {
          select: { id: true, name: true, avatarUrl: true },
        },
        asset: {
          select: {
            id: true,
            name: true,
            type: true,
            city: true,
            images: { where: { isCover: true }, take: 1 },
          },
        },
      },
    })

    return NextResponse.json(listing, { status: 201 })
  } catch (err) {
    console.error('[SecondaryMarket POST]', err)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
