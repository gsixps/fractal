// Dev smoke test: expiración de compra secundaria (checkout.session.expired).
//  - Escenario A: compra TOTAL expira → se revierte el estado 'sold' del
//    listing y se restaura la cantidad de la inversión del vendedor.
//  - Escenario B: compra PARCIAL expira → solo se libera la fracción reservada.
import { db } from '../src/lib/db'
import { expireSecondaryPurchase } from '../src/lib/secondary-settlement'

function assert(cond: boolean, label: string) {
  if (!cond) throw new Error(`FAIL: ${label}`)
  console.log(`ok - ${label}`)
}

async function mkUser(role: 'seller' | 'buyer', stamp: number, balance = 0) {
  return db.user.create({
    data: {
      email: `${role}.expire.${stamp}@gsp.cl`,
      role: 'investor',
      kycStatus: 'verified',
      isActive: true,
      name: `${role} Expire Test`,
      preferredLanguage: 'es',
      balance,
    },
  })
}

async function main() {
  const stamp = Date.now()
  const asset = await db.asset.create({
    data: {
      name: 'Asset Expire Test',
      slug: `expire-test-${stamp}`,
      type: 'office',
      status: 'active',
      address: 'Av Test 123',
      city: 'Santiago',
      region: 'RM',
      country: 'Chile',
      totalValue: 1000000,
      pricePerFraction: 100,
      totalFractions: 100,
      availableFractions: 70,
      minimumInvestment: 100,
      annualYield: 7,
      projectedAppreciation: 3,
      totalProjectedReturn: 10,
      shortDescription: 'test',
      fullDescription: 'test',
      highlights: 'test',
    },
  })

  // ─── Escenario A: compra total expira ───
  {
    const seller = await mkUser('seller', stamp)
    const buyer = await mkUser('buyer', stamp)
    const sessionId = `cs_test_expire_full_${stamp}`
    const FEE = 15
    const NET = 985

    // El vendedor vendió las 10 fracciones de su listing: booking ya restó la
    // cantidad (20 → 10) y marcó el listing como vendido.
    const sellerInv = await db.investment.create({
      data: { userId: seller.id, assetId: asset.id, quantity: 10, pricePerUnit: 100, totalAmount: 2000, status: 'active' },
    })
    const listing = await db.secondaryMarketListing.create({
      data: {
        sellerId: seller.id,
        investmentId: sellerInv.id,
        assetId: asset.id,
        fractionCount: 10,
        pricePerFraction: 100,
        totalPrice: 1000,
        status: 'sold',
        buyerId: buyer.id,
        soldFractionCount: 10,
        platformFee: FEE,
        netAmount: NET,
        soldAt: new Date(),
      },
    })
    await db.transaction.create({
      data: { userId: seller.id, investmentId: sellerInv.id, type: 'sale', amount: 1000, currency: 'USD', status: 'pending', feeAmount: FEE, netAmount: NET, referenceId: sessionId },
    })

    await db.$transaction((tx) =>
      expireSecondaryPurchase(tx, {
        sessionId,
        userId: buyer.id,
        listingId: listing.id,
        sellerId: seller.id,
        qty: 10,
      })
    )

    const saleCount = await db.transaction.count({ where: { referenceId: sessionId, status: 'pending' } })
    assert(saleCount === 0, 'A: transaction de venta cancelada')

    const l = await db.secondaryMarketListing.findUniqueOrThrow({ where: { id: listing.id } })
    assert(l.status === 'active', 'A: listing vuelve a active')
    assert(l.buyerId === null, 'A: buyerId liberado')
    assert(l.soldAt === null, 'A: soldAt liberado')
    assert(l.soldFractionCount === 0, 'A: soldFractionCount liberado')
    assert(l.platformFee === 0, 'A: platformFee devuelto')
    assert(l.netAmount === 0, 'A: netAmount reiniciado')

    const inv = await db.investment.findUniqueOrThrow({ where: { id: sellerInv.id } })
    assert(inv.quantity === 20, 'A: cantidad del vendedor restaurada')

    const audit = await db.auditLog.count({ where: { action: 'secondary_purchase_expired' } })
    assert(audit === 1, 'A: audit secondary_purchase_expired registrado')

    // Idempotencia: segundo evento (retry de Stripe) es no-op.
    await db.$transaction((tx) =>
      expireSecondaryPurchase(tx, { sessionId, userId: buyer.id, listingId: listing.id, sellerId: seller.id, qty: 10 })
    )
    const l2 = await db.secondaryMarketListing.findUniqueOrThrow({ where: { id: listing.id } })
    assert(l2.soldFractionCount === 0, 'A: retry no vuelve a liberar')

    await db.auditLog.deleteMany({ where: { action: 'secondary_purchase_expired' } })
    await db.transaction.deleteMany({ where: { referenceId: sessionId } })
    await db.secondaryMarketListing.delete({ where: { id: listing.id } })
    await db.investment.delete({ where: { id: sellerInv.id } })
    await db.user.deleteMany({ where: { id: { in: [seller.id, buyer.id] } } })
  }

  // ─── Escenario B: compra parcial expira (listing con reservas previas) ───
  {
    const seller = await mkUser('seller', stamp + 1)
    const buyer = await mkUser('buyer', stamp + 1)
    const sessionId = `cs_test_expire_partial_${stamp}`
    const FEE = 4.5
    const NET = 295.5

    const sellerInv = await db.investment.create({
      data: { userId: seller.id, assetId: asset.id, quantity: 15, pricePerUnit: 100, totalAmount: 1500, status: 'active' },
    })
    // soldFractionCount=8: 5 reservados en otra transacción + 3 de esta sesión.
    const listing = await db.secondaryMarketListing.create({
      data: {
        sellerId: seller.id,
        investmentId: sellerInv.id,
        assetId: asset.id,
        fractionCount: 10,
        pricePerFraction: 100,
        totalPrice: 1000,
        status: 'active',
        soldFractionCount: 8,
        platformFee: 12, // 7.5 previo + 4.5 de esta sesión
        netAmount: 492.5,
      },
    })
    await db.transaction.create({
      data: { userId: seller.id, investmentId: sellerInv.id, type: 'sale', amount: 300, currency: 'USD', status: 'pending', feeAmount: FEE, netAmount: NET, referenceId: sessionId },
    })

    await db.$transaction((tx) =>
      expireSecondaryPurchase(tx, {
        sessionId,
        userId: buyer.id,
        listingId: listing.id,
        sellerId: seller.id,
        qty: 3,
      })
    )

    const l = await db.secondaryMarketListing.findUniqueOrThrow({ where: { id: listing.id } })
    assert(l.status === 'active', 'B: listing sigue active')
    assert(l.buyerId === null, 'B: buyerId intacto')
    assert(l.soldFractionCount === 5, 'B: solo se liberan las 3 fracciones de esta sesión')
    assert(Math.abs((l.platformFee ?? 0) - 7.5) < 0.001, 'B: fee parcial devuelto')
    assert(Math.abs((l.netAmount ?? 0) - 197) < 0.001, 'B: neto parcial devuelto')

    const inv = await db.investment.findUniqueOrThrow({ where: { id: sellerInv.id } })
    assert(inv.quantity === 15, 'B: cantidad del vendedor intacta (compra parcial)')

    await db.auditLog.deleteMany({ where: { action: 'secondary_purchase_expired' } })
    await db.transaction.deleteMany({ where: { referenceId: sessionId } })
    await db.secondaryMarketListing.delete({ where: { id: listing.id } })
    await db.investment.delete({ where: { id: sellerInv.id } })
    await db.user.deleteMany({ where: { id: { in: [seller.id, buyer.id] } } })
  }

  await db.asset.delete({ where: { id: asset.id } })
  console.log('\n✅ PASS: expiración secundaria (total + parcial) correcta')
}

main().catch((err) => {
  console.error('\n' + err.message)
  process.exit(1)
})