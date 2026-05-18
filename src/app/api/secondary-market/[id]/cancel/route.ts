import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

// POST: Cancel a listing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAuth(request.headers.get('cookie'))
  if (error) return error

  try {
    const { id } = await params
    const userId = session!.user!.id

    const listing = await db.secondaryMarketListing.findUnique({
      where: { id },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.sellerId !== userId) {
      return NextResponse.json({ error: 'You are not the seller' }, { status: 403 })
    }

    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing is not active' }, { status: 400 })
    }

    const hasSales = listing.soldFractionCount > 0

    const updatedListing = await db.secondaryMarketListing.update({
      where: { id },
      data: {
        status: hasSales ? 'partial' : 'cancelled',
        cancelledAt: new Date(),
      },
    })

    return NextResponse.json(updatedListing)
  } catch (err) {
    console.error('[SecondaryMarket Cancel POST]', err)
    return NextResponse.json({ error: 'Failed to cancel listing' }, { status: 500 })
  }
}
