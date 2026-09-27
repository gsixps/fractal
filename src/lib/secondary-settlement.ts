import type { Prisma } from '@prisma/client'

// ─── Settlement del mercado secundario ───────────────────────────────────────
// En una venta secundaria, el checkout NO consume fracciones del asset (ya
// fueron consumidas cuando el vendedor compró en primario). El settlement:
//   1. Activa la inversión del comprador y completa su transaction.
//   2. Completa la transaction de venta del vendedor y le acredita su saldo
//      con el neto (bruto − fee de la plataforma).
//   3. Notificaciones y audit log para ambas partes.
// Se ejecuta DENTRO de la misma transacción (tx) que el webhook ya abre, para
// que el guard de idempotencia + atomicidad sigan garantizados.

export interface SecondarySettleInput {
  sessionId: string
  assetId: string
  buyerUserId: string
  sellerId: string
  listingId: string
  qty: number
  grossUsd: number
  assetName?: string
  paymentIntentId?: string | null
}

export async function settleSecondaryPurchase(
  tx: Prisma.TransactionClient,
  input: SecondarySettleInput
): Promise<void> {
  const {
    sessionId,
    assetId,
    buyerUserId,
    sellerId,
    listingId,
    qty,
    grossUsd,
    assetName,
    paymentIntentId,
  } = input

  // Transaction de venta del vendedor, creada como 'pending' al reservar la compra.
  const saleTx = await tx.transaction.findFirst({
    where: { userId: sellerId, referenceId: sessionId, type: 'sale', status: 'pending' },
  })
  if (!saleTx) {
    throw new Error(`Seller sale transaction not found for session ${sessionId}`)
  }

  // Inversión del comprador: pending → active.
  const buyerInvestmentUpdated = await tx.investment.updateMany({
    where: { userId: buyerUserId, assetId, stripePaymentId: sessionId, status: 'pending' },
    data: { status: 'active', completedAt: new Date() },
  })
  if (buyerInvestmentUpdated.count === 0) {
    throw new Error('Buyer investment not found in pending state')
  }

  // Transaction del comprador: pending → completed (+ PI id para refunds).
  await tx.transaction.updateMany({
    where: { userId: buyerUserId, referenceId: sessionId, status: 'pending' },
    data: { status: 'completed', metadata: paymentIntentId ? JSON.stringify({ paymentIntentId }) : undefined },
  })

  // Venta del vendedor: completed + acreditación del neto.
  const payout = saleTx.netAmount ?? 0
  await tx.transaction.update({
    where: { id: saleTx.id },
    data: { status: 'completed' },
  })
  await tx.user.update({
    where: { id: sellerId },
    data: { balance: { increment: payout } },
  })

  // Stats del comprador.
  await tx.user.update({
    where: { id: buyerUserId },
    data: { totalInvested: { increment: grossUsd } },
  })

  // Notificaciones.
  await tx.notification.create({
    data: {
      userId: buyerUserId,
      type: 'payment_success',
      title: 'Compra en mercado secundario completada',
      message: `Tu compra de ${qty} fracción(es) de ${assetName || 'activos'} en mercado secundario ha sido procesada exitosamente.`,
    },
  })
  await tx.notification.create({
    data: {
      userId: sellerId,
      type: 'sale_completed',
      title: 'Venta realizada',
      message: `Tu venta de ${qty} fracción(es) fue completada. Se acreditaron $${payout.toFixed(2)} a tu saldo.`,
    },
  })

  await tx.auditLog.create({
    data: {
      userId: buyerUserId,
      action: 'secondary_purchase_completed',
      entity: 'investment',
      entityId: saleTx.investmentId || sessionId,
      details: JSON.stringify({ sessionId, listingId, fractionCount: qty, gross: grossUsd }),
    },
  })
  await tx.auditLog.create({
    data: {
      userId: sellerId,
      action: 'secondary_sale_settled',
      entity: 'investment',
      entityId: saleTx.investmentId || sessionId,
      details: JSON.stringify({ sessionId, listingId, fractionCount: qty, payout }),
    },
  })
}

export interface SecondaryExpireInput {
  sessionId: string
  userId: string // comprador cuya sesión expiró
  listingId: string
  sellerId: string
  qty: number
}

// Reversión de una compra secundaria cuyo checkout expiró:
//   1. Cancela la transaction de venta del vendedor (pendiente).
//   2. Libera la fracción reservada en el listing (soldFractionCount, fee, neto).
//   3. Si la sesión era una compra TOTAL, revierte el estado 'sold' y restaura
//      la cantidad de la inversión del vendedor.
// Idempotente: si la transaction de venta ya no está 'pending', es un no-op
// (el evento fue procesado antes — retry de Stripe).
export async function expireSecondaryPurchase(
  tx: Prisma.TransactionClient,
  input: SecondaryExpireInput
): Promise<void> {
  const { sessionId, userId, listingId, sellerId, qty } = input

  const saleTx = await tx.transaction.findFirst({
    where: { userId: sellerId, referenceId: sessionId, type: 'sale', status: 'pending' },
  })
  if (!saleTx) return // ya procesado o sin venta en vuelo

  const listing = await tx.secondaryMarketListing.findUnique({ where: { id: listingId } })
  if (!listing) throw new Error(`Listing not found: ${listingId}`)

  const fee = saleTx.feeAmount ?? 0
  const net = saleTx.netAmount ?? 0
  const wasFull = listing.status === 'sold' && listing.buyerId === userId

  await tx.transaction.update({
    where: { id: saleTx.id },
    data: { status: 'cancelled' },
  })

  await tx.secondaryMarketListing.update({
    where: { id: listingId },
    data: {
      soldFractionCount: Math.max(0, listing.soldFractionCount - qty),
      platformFee: Math.max(0, (listing.platformFee ?? 0) - fee),
      netAmount: Math.max(0, (listing.netAmount ?? 0) - net),
      ...(wasFull
        ? { status: 'active', buyerId: null, soldAt: null }
        : {}),
    },
  })

  if (wasFull) {
    await tx.investment.update({
      where: { id: listing.investmentId },
      data: { quantity: { increment: listing.fractionCount } },
    })
  }

  await tx.auditLog.create({
    data: {
      userId,
      action: 'secondary_purchase_expired',
      entity: 'listing',
      entityId: listingId,
      details: JSON.stringify({ sessionId, qty, fee, net, wasFull }),
    },
  })
}