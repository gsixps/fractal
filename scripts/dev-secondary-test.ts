// Dev smoke test: settlement mercado secundario + transferPosition (dry-run).
// Verifica: activación de la inversión/transacción del comprador, acreditación
// del vendedor, NO-decremento de fracciones disponibles, y transferencia de la
// posición on-chain del vendedor al comprador.
import { db } from '../src/lib/db'
import { setChainConfig } from '../src/lib/blockchain'
import { settleSecondaryPurchase } from '../src/lib/secondary-settlement'
import { transferPosition } from '../src/lib/erc-6551-service'

function assert(cond: boolean, label: string) {
  if (!cond) throw new Error(`FAIL: ${label}`)
  console.log(`ok - ${label}`)
}

const PLATFORM_FEE_RATE = 0.015

async function main() {
  setChainConfig({
    chainId: 11155111,
    rpcUrl: 'dry-run',
    registry: '0x02101dfB77FDE026414827Fdc604ddAF224F0921',
    nftContract: '0x1111111111111111111111111111111111111111',
    dryRun: true,
  })

  const stamp = Date.now()
  const sessionId = `cs_test_secondary_${stamp}`
  const emailSeller = `seller.${stamp}@gsp.cl`
  const emailBuyer = `buyer.${stamp}@gsp.cl`

  const seller = await db.user.create({
    data: { email: emailSeller, role: 'investor', kycStatus: 'verified', isActive: true, name: 'Seller Test', preferredLanguage: 'es', balance: 0 },
  })
  const buyer = await db.user.create({
    data: { email: emailBuyer, role: 'investor', kycStatus: 'verified', isActive: true, name: 'Buyer Test', preferredLanguage: 'es', balance: 0 },
  })

  const asset = await db.asset.create({
    data: {
      name: 'Asset Secondary Test',
      slug: `secondary-test-${stamp}`,
      type: 'office',
      status: 'active',
      address: 'Av Test 123',
      city: 'Santiago',
      region: 'RM',
      country: 'Chile',
      totalValue: 1000000,
      pricePerFraction: 100,
      totalFractions: 100,
      availableFractions: 80,
      minimumInvestment: 100,
      annualYield: 7,
      projectedAppreciation: 3,
      totalProjectedReturn: 10,
      shortDescription: 'test',
      fullDescription: 'test',
      highlights: 'test',
    },
  })

  // Posición del vendedor ya minteada (simula Fase 3 en vivo).
  const sellerInvestment = await db.investment.create({
    data: {
      userId: seller.id,
      assetId: asset.id,
      quantity: 20,
      pricePerUnit: 100,
      totalAmount: 2000,
      status: 'active',
      tokenContract: '0x1111111111111111111111111111111111111111',
      tokenId: 424242,
      tbaAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      chainId: 11155111,
    },
  })

  const listing = await db.secondaryMarketListing.create({
    data: {
      sellerId: seller.id,
      investmentId: sellerInvestment.id,
      assetId: asset.id,
      fractionCount: 10,
      pricePerFraction: 100,
      totalPrice: 1000,
      status: 'active',
    },
  })

  const gross = 10 * listing.pricePerFraction
  const platformFee = gross * PLATFORM_FEE_RATE
  const net = gross - platformFee

  const buyerInvestment = await db.investment.create({
    data: {
      userId: buyer.id,
      assetId: asset.id,
      quantity: 10,
      pricePerUnit: 100,
      totalAmount: gross,
      status: 'pending',
      stripePaymentId: sessionId,
    },
  })

  await db.transaction.create({
    data: {
      userId: buyer.id,
      investmentId: buyerInvestment.id,
      type: 'purchase',
      amount: gross,
      currency: 'USD',
      status: 'pending',
      feeAmount: platformFee,
      netAmount: net,
      description: 'Compra mercado secundario',
      referenceId: sessionId,
    },
  })

  const saleTx = await db.transaction.create({
    data: {
      userId: seller.id,
      investmentId: sellerInvestment.id,
      type: 'sale',
      amount: gross,
      currency: 'USD',
      status: 'pending',
      feeAmount: platformFee,
      netAmount: net,
      description: 'Venta mercado secundario',
      referenceId: sessionId,
    },
  })

  const availableBefore = (await db.asset.findUniqueOrThrow({ where: { id: asset.id } })).availableFractions

  try {
    // ─── Settlement (dentro de la misma $transaction que usa el webhook) ───
    await db.$transaction(async (tx) => {
      await settleSecondaryPurchase(tx, {
        sessionId,
        assetId: asset.id,
        buyerUserId: buyer.id,
        sellerId: seller.id,
        listingId: listing.id,
        qty: 10,
        grossUsd: gross,
        assetName: asset.name,
        paymentIntentId: 'pi_test_secondary_1',
      })
    })

    const buyerInv = await db.investment.findUniqueOrThrow({ where: { id: buyerInvestment.id } })
    assert(buyerInv.status === 'active', 'inversión del comprador activada')

    const buyerTx = await db.transaction.findFirst({ where: { userId: buyer.id, referenceId: sessionId, type: 'purchase' } })
    assert(buyerTx?.status === 'completed', 'transaction del comprador completada')

    const sellerTx = await db.transaction.findUniqueOrThrow({ where: { id: saleTx.id } })
    assert(sellerTx.status === 'completed', 'transaction de venta del vendedor completada')

    const sellerAfter = await db.user.findUniqueOrThrow({ where: { id: seller.id } })
    assert(Math.abs((sellerAfter.balance ?? 0) - net) < 0.001, `vendedor acreditado con neto (${(sellerAfter.balance ?? 0).toFixed(2)} = ${net.toFixed(2)})`)
    assert(Math.round(sellerAfter.totalInvested ?? 0) === 0, 'totalInvested del vendedor intacto')

    const availableAfter = (await db.asset.findUniqueOrThrow({ where: { id: asset.id } })).availableFractions
    assert(availableAfter === availableBefore, 'availableFractions NO se decrementa en secundaria')

    const notifCount = await db.notification.count({
      where: { userId: { in: [seller.id, buyer.id] } },
    })
    assert(notifCount === 2, `dos notificaciones creadas (${notifCount})`)

    // ─── ERC-6551: transferencia de la posición al comprador ───
    const transfer = await transferPosition({
      listingId: listing.id,
      buyerUserId: buyer.id,
      buyerInvestmentId: buyerInvestment.id,
    })
    assert(transfer.ok, 'transferPosition ok')

    const buyerInvAfter = await db.investment.findUniqueOrThrow({ where: { id: buyerInvestment.id } })
    assert(buyerInvAfter.tokenId === 424242, 'comprador hereda tokenId del vendedor')
    assert(buyerInvAfter.tokenContract === '0x1111111111111111111111111111111111111111', 'comprador hereda tokenContract')
    assert(!!buyerInvAfter.tbaAddress?.startsWith('0x'), 'comprador tiene tbaAddress proyectada')

    const receipts = await db.onChainAction.findMany({
      where: { investmentId: buyerInvestment.id, action: 'transfer_position' },
    })
    assert(receipts.length === 1, `un solo receipt transfer_position (${receipts.length})`)
    assert(receipts[0].status === 'dry-run', 'receipt transfer_position en dry-run')

    console.log(`\n✅ PASS: net=${net.toFixed(2)} buyerInv=${buyerInvestment.id} tba=${buyerInvAfter.tbaAddress}`)
  } finally {
    await db.onChainAction.deleteMany({ where: { investmentId: buyerInvestment.id } })
    await db.transaction.deleteMany({ where: { referenceId: sessionId } })
    await db.notification.deleteMany({ where: { userId: { in: [seller.id, buyer.id] }, type: { in: ['payment_success', 'sale_completed'] } } })
    await db.auditLog.deleteMany({ where: { userId: { in: [seller.id, buyer.id] }, action: { startsWith: 'secondary_' } } })
    await db.secondaryMarketListing.delete({ where: { id: listing.id } })
    await db.investment.deleteMany({ where: { id: { in: [sellerInvestment.id, buyerInvestment.id] } } })
    await db.asset.delete({ where: { id: asset.id } })
    await db.user.deleteMany({ where: { id: { in: [seller.id, buyer.id] } } })
  }
}

main().catch((err) => {
  console.error('\n' + err.message)
  process.exit(1)
})