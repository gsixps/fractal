import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

// GET: List current user's investments available for secondary market listing
export async function GET(request: Request) {
  const { error, session } = await requireAuth(request.headers.get('cookie'))
  if (error) return error

  try {
    const userId = session!.user!.id

    // Get completed/active investments
    const investments = await db.investment.findMany({
      where: {
        userId,
        status: { in: ['completed', 'active'] },
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            type: true,
            city: true,
            pricePerFraction: true,
            images: { where: { isCover: true }, take: 1 },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    })

    // For each investment, calculate available fractions (not yet listed)
    const investmentsWithAvailability = await Promise.all(
      investments.map(async (inv) => {
        const activeListings = await db.secondaryMarketListing.findMany({
          where: {
            investmentId: inv.id,
            sellerId: userId,
            status: { in: ['active', 'partial'] },
          },
        })

        const alreadyListed = activeListings.reduce(
          (sum, l) => sum + l.fractionCount - l.soldFractionCount,
          0
        )

        const availableFractions = inv.quantity - alreadyListed

        return {
          ...inv,
          availableFractions,
          alreadyListed,
        }
      })
    )

    // Filter out investments with no available fractions
    const available = investmentsWithAvailability.filter((inv) => inv.availableFractions > 0)

    return NextResponse.json(available)
  } catch (err) {
    console.error('[SecondaryMarket MyInvestments GET]', err)
    return NextResponse.json({ error: 'Failed to fetch investments' }, { status: 500 })
  }
}
