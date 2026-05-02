import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

// GET: List current user's secondary market listings
export async function GET() {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const userId = session!.user!.id

    const listings = await db.secondaryMarketListing.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            type: true,
            city: true,
            images: { where: { isCover: true }, take: 1 },
          },
        },
        buyer: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(listings)
  } catch (err) {
    console.error('[SecondaryMarket MyListings GET]', err)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}
