import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { stripe } from '@/lib/stripe'

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

    // ─── Wrap entire buy operation in an interactive transaction to prevent race conditions ───
    const result = await db.$transaction(async (tx) => {
      // Lock the listing row for update (Prisma interactive tx serializes access)
      const listing = await tx.secondaryMarketListing.findUnique({
        where: { id },
        include: {
          seller: true,
          asset: true,
          investment: true,
        },
      })

      if (!listing) {
        throw new Error('Listing not found')
      }

      if (listing.status !== 'active') {
        throw new Error('Listing is not active')
      }

      // Check expiration
      if (listing.expiresAt && new Date() > listing.expiresAt) {
        throw new Error('Listing has expired')
      }

      // Buyer cannot be the seller
      if (listing.sellerId === buyerId) {
        throw new Error('You cannot buy your own listing')
      }

      // Buyer must have KYC verified
      const buyer = await tx.user.findUnique({ where: { id: buyerId } })
      if (!buyer || buyer.kycStatus !== 'verified') {
        throw new Error('KYC verification required to buy')
      }

      const availableFractions = listing.fractionCount - listing.soldFractionCount

      if (fractionCount > availableFractions) {
        throw new Error(`Only ${availableFractions} fractions available`)
      }

      // Calculate amounts
      const gross = fractionCount * listing.pricePerFraction
      const platformFee = gross * PLATFORM_FEE_RATE
      const netAmount = gross - platformFee

      // Determine if this is a full or partial purchase
      const isFullPurchase = fractionCount === availableFractions

      // Create a Stripe Checkout Session for payment
      const amountPerFractionCents = Math.round(listing.pricePerFraction * 100) // Stripe needs cents
      const totalAmountCents = amountPerFractionCents * fractionCount

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${listing.asset.name} - Mercado Secundario`,
                description: `${fractionCount} fracción(es) de ${listing.asset.name} (Mercado Secundario)`,
              },
              unit_amount: amountPerFractionCents,
            },
            quantity: fractionCount,
          },
        ],
        metadata: {
          assetId: listing.assetId,
          userId: buyerId,
          fractionCount: fractionCount.toString(),
          assetName: listing.asset.name,
          pricePerFraction: listing.pricePerFraction.toString(),
          listingId: id,
          sellerId: listing.sellerId,
          type: 'secondary_market',
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?payment=cancelled`,
      })

      if (!checkoutSession.url) {
        throw new Error('Failed to create Stripe checkout session')
      }

      // Update listing (reserve fractions)
      const updatedListing = await tx.secondaryMarketListing.update({
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

      // Create a new Investment for the buyer (pending until payment completes)
      const investment = await tx.investment.create({
        data: {
          userId: buyerId,
          assetId: listing.assetId,
          quantity: fractionCount,
          pricePerUnit: listing.pricePerFraction,
          totalAmount: gross,
          status: 'pending',
          stripePaymentId: checkoutSession.id,
        },
      })

      // Create transaction for buyer (pending)
      await tx.transaction.create({
        data: {
          userId: buyerId,
          investmentId: investment.id,
          type: 'purchase',
          amount: gross,
          currency: 'USD',
          status: 'pending',
          feeAmount: platformFee,
          netAmount,
          description: `Compra de ${fractionCount} fracciones – ${listing.asset.name} (Mercado Secundario)`,
          referenceId: checkoutSession.id,
        },
      })

      // Create transaction for seller (pending)
      await tx.transaction.create({
        data: {
          userId: listing.sellerId,
          investmentId: listing.investmentId,
          type: 'sale',
          amount: gross,
          currency: 'USD',
          status: 'pending',
          feeAmount: platformFee,
          netAmount,
          description: `Venta de ${fractionCount} fracciones – ${listing.asset.name} (Mercado Secundario)`,
          referenceId: checkoutSession.id,
        },
      })

      // If fully sold, update seller's investment quantity
      if (isFullPurchase) {
        await tx.investment.update({
          where: { id: listing.investmentId },
          data: {
            quantity: listing.investment.quantity - listing.fractionCount,
          },
        })
      }

      return {
        updatedListing,
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id,
        investmentId: investment.id,
      }
    })

    return NextResponse.json({
      ...result.updatedListing,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
      investmentId: result.investmentId,
      message: 'Purchase created. Redirect to checkout URL to complete payment.',
    })
  } catch (err) {
    console.error('[SecondaryMarket Buy POST]', err)

    // Return appropriate status for known validation errors
    const message = err instanceof Error ? err.message : 'Failed to buy fractions'
    if (
      message.includes('not found') ||
      message.includes('not active') ||
      message.includes('expired') ||
      message.includes('own listing') ||
      message.includes('KYC') ||
      message.includes('fractions available')
    ) {
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
