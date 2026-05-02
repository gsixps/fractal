import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

const PLATFORM_FEE_RATE = 0.015 // 1.5%

// POST: Buy fractions from a listing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const { id } = await params
    const body = await request.json()
    const { fractionCount } = body
    const buyerId = session!.user!.id

    if (!fractionCount || fractionCount <= 0) {
      return NextResponse.json({ error: 'fractionCount must be positive' }, { status: 400 })
    }

    // Get the listing
    const listing = await db.secondaryMarketListing.findUnique({
      where: { id },
      include: {
        seller: true,
        asset: true,
        investment: true,
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing is not active' }, { status: 400 })
    }

    // Check expiration
    if (listing.expiresAt && new Date() > listing.expiresAt) {
      return NextResponse.json({ error: 'Listing has expired' }, { status: 400 })
    }

    // Buyer cannot be the seller
    if (listing.sellerId === buyerId) {
      return NextResponse.json({ error: 'You cannot buy your own listing' }, { status: 400 })
    }

    // Buyer must have KYC verified
    const buyer = await db.user.findUnique({ where: { id: buyerId } })
    if (!buyer || buyer.kycStatus !== 'verified') {
      return NextResponse.json({ error: 'KYC verification required to buy' }, { status: 400 })
    }

    const availableFractions = listing.fractionCount - listing.soldFractionCount

    if (fractionCount > availableFractions) {
      return NextResponse.json(
        { error: `Only ${availableFractions} fractions available` },
        { status: 400 }
      )
    }

    // Calculate amounts
    const gross = fractionCount * listing.pricePerFraction
    const platformFee = gross * PLATFORM_FEE_RATE
    const netAmount = gross - platformFee

    // Determine if this is a full or partial purchase
    const isFullPurchase = fractionCount === availableFractions

    // Update listing
    const updatedListing = await db.secondaryMarketListing.update({
      where: { id },
      data: {
        soldFractionCount: listing.soldFractionCount + fractionCount,
        platformFee: listing.platformFee + platformFee,
        ...(isFullPurchase
          ? {
              status: 'sold',
              buyerId,
              netAmount,
              soldAt: new Date(),
            }
          : {
              // Keep active for partial sales
              netAmount: (listing.netAmount || 0) + netAmount,
            }),
      },
    })

    // Create a new Investment for the buyer
    await db.investment.create({
      data: {
        userId: buyerId,
        assetId: listing.assetId,
        quantity: fractionCount,
        pricePerUnit: listing.pricePerFraction,
        totalAmount: gross,
        status: 'completed',
        completedAt: new Date(),
      },
    })

    // Create transaction for buyer
    await db.transaction.create({
      data: {
        userId: buyerId,
        investmentId: listing.investmentId,
        type: 'purchase',
        amount: gross,
        currency: 'USD',
        status: 'completed',
        feeAmount: platformFee,
        netAmount,
        description: `Compra de ${fractionCount} fracciones – ${listing.asset.name} (Mercado Secundario)`,
      },
    })

    // Create transaction for seller
    await db.transaction.create({
      data: {
        userId: listing.sellerId,
        investmentId: listing.investmentId,
        type: 'sale',
        amount: gross,
        currency: 'USD',
        status: 'completed',
        feeAmount: platformFee,
        netAmount,
        description: `Venta de ${fractionCount} fracciones – ${listing.asset.name} (Mercado Secundario)`,
      },
    })

    // If fully sold, update seller's investment quantity
    if (isFullPurchase) {
      await db.investment.update({
        where: { id: listing.investmentId },
        data: {
          quantity: listing.investment.quantity - listing.fractionCount,
        },
      })
    }

    return NextResponse.json(updatedListing)
  } catch (err) {
    console.error('[SecondaryMarket Buy POST]', err)
    return NextResponse.json({ error: 'Failed to buy fractions' }, { status: 500 })
  }
}
