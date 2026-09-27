import { db } from '@/lib/db'
import {
  deriveTokenId,
  tokenIdToInt32,
  dryRunTbaAddress,
  ZERO_ADDRESS,
} from '@/lib/erc6551'
import { getChainConfig, canReadOnChain, registryAccount, type ChainConfig } from '@/lib/blockchain'

// ─── Servicio ERC-6551 ───────────────────────────────────────────────────────
// Orquesta la creación del Token Bound Account + PositionNFT por inversión.
//
//  - Sin RPC/claves (modo dry-run): deriva direcciones determinísticas y marca
//    receipts `dry-run`. El pipeline (webhooks, secundario, dividendos) funciona
//    igual y queda listo para vivir on-chain cuando se configuren las envs.
//  - Con RPC: consulta `registry.account(...)` (lectura JSON-RPC). Las escrituras
//    (createAccount/mint/transfer) requieren un signer transportado por viem;
//    hasta entonces devuelven `signer_transport_not_configured`.
//  - Idempotencia total a través del modelo `OnChainAction` (receipts) y de los
//    campos `tokenId/tokenContract/tbaAddress/chainId` de `Investment`.

export type ServiceResult = {
  ok: boolean
  investmentId?: string
  tbaAddress?: string | null
  tokenId?: number | null
  tokenContract?: string | null
  chainId?: number | null
  created?: boolean
  inFlight?: boolean
  error?: string
}

function activeStatuses() {
  return ['active', 'completed']
}

function updateInvestment(token: {
  id: string
  tbaAddress: string | null
  tokenId: number | null
  tokenContract: string | null
  chainId: number | null
}) {
  return db.investment.update({
    where: { id: token.id },
    data: {
      tbaAddress: token.tbaAddress,
      tokenId: token.tokenId,
      tokenContract: token.tokenContract,
      chainId: token.chainId,
    },
  }).catch((err) => {
    console.error('[ERC-6551] updateInvestment:', err)
    throw err
  })
}

export async function ensurePosition(opts: { investmentId: string }): Promise<ServiceResult> {
  const { investmentId } = opts

  const investment = await db.investment.findUnique({ where: { id: investmentId } })
  if (!investment) return { ok: false, error: 'investment_not_found' }
  if (!activeStatuses().includes(investment.status)) {
    return { ok: false, error: 'investment_not_active' }
  }

  // Ya minteado y mapeado → no-op idempotente.
  if (investment.tokenContract && investment.tbaAddress && investment.tbaAddress !== ZERO_ADDRESS && investment.tokenId != null) {
    return {
      ok: true,
      created: false,
      investmentId,
      tbaAddress: investment.tbaAddress,
      tokenId: investment.tokenId,
      tokenContract: investment.tokenContract,
      chainId: investment.chainId,
    }
  }

  // Receipt en vuelo de un reintento previo.
  const inFlight = await db.onChainAction.findFirst({
    where: { investmentId, action: 'ensure_position', status: { in: ['pending', 'submitted', 'mined', 'dry-run'] } },
    orderBy: { createdAt: 'desc' },
  })
  if (inFlight && (inFlight.status === 'mined' || inFlight.status === 'dry-run') && inFlight.tbaAddress) {
    await updateInvestment({
      id: investmentId,
      tbaAddress: inFlight.tbaAddress,
      tokenId: inFlight.tokenId,
      tokenContract: inFlight.tokenContract,
      chainId: inFlight.chainId,
    })
    return { ok: true, created: false, investmentId, tbaAddress: inFlight.tbaAddress, tokenId: inFlight.tokenId }
  }
  if (inFlight && (inFlight.status === 'pending' || inFlight.status === 'submitted')) {
    return { ok: true, created: false, investmentId, inFlight: true }
  }

  const config = getChainConfig()
  const tokenIdBig = deriveTokenId(investmentId)
  const tokenId = tokenIdToInt32(tokenIdBig)
  const mode = config && canReadOnChain(config) ? 'pending' : 'dry-run'

  const receipt = await db.onChainAction.create({
    data: {
      investmentId,
      action: 'ensure_position',
      status: mode,
      chainId: config?.chainId ?? null,
      tokenId,
      tokenContract: config?.nftContract ?? null,
      payload: JSON.stringify({ tokenIdBig: tokenIdBig.toString() }),
    },
  })

  if (mode === 'dry-run') {
    const tba = dryRunTbaAddress(investmentId)
    await db.onChainAction.update({ where: { id: receipt.id }, data: { status: 'dry-run', tbaAddress: tba } })
    await updateInvestment({
      id: investmentId,
      tbaAddress: tba,
      tokenId,
      tokenContract: config?.nftContract ?? null,
      chainId: config?.chainId ?? null,
    })
    return { ok: true, created: true, investmentId, tbaAddress: tba, tokenId, tokenContract: config?.nftContract ?? null, chainId: config?.chainId ?? null }
  }

  try {
    const cfg = config as ChainConfig
    const tba = await registryAccount(cfg, { tokenId: tokenIdBig })
    if (!tba || tba === ZERO_ADDRESS) {
      const needsSigner = !cfg.ownerPrivateKey
      await db.onChainAction.update({
        where: { id: receipt.id },
        data: { status: needsSigner ? 'failed' : 'pending', error: needsSigner ? 'signer_transport_not_configured' : null },
      })
      if (needsSigner) return { ok: false, investmentId, error: 'signer_transport_not_configured' }

      // createAccount + mint requieren signer (integración viem). Pendiente de setup.
      await db.onChainAction.update({
        where: { id: receipt.id },
        data: { status: 'pending', error: 'create_account_pending_signer_integration' },
      })
      return { ok: true, created: false, investmentId, inFlight: true, error: 'create_account_pending_signer_integration' }
    }

    await db.onChainAction.update({
      where: { id: receipt.id },
      data: { status: 'mined', tbaAddress: tba },
    })
    await updateInvestment({
      id: investmentId,
      tbaAddress: tba,
      tokenId,
      tokenContract: cfg.nftContract ?? null,
      chainId: cfg.chainId,
    })
    return { ok: true, created: false, investmentId, tbaAddress: tba, tokenId, tokenContract: cfg.nftContract ?? null, chainId: cfg.chainId }
  } catch (err) {
    await db.onChainAction
      .update({ where: { id: receipt.id }, data: { status: 'failed', error: String(err) } })
      .catch(() => {})
    return { ok: false, investmentId, error: 'onchain_read_failed' }
  }
}

export async function transferPosition(opts: {
  listingId: string
  buyerUserId: string
  buyerInvestmentId: string
}): Promise<ServiceResult> {
  const { listingId, buyerUserId, buyerInvestmentId } = opts

  const listing = await db.secondaryMarketListing.findUnique({
    where: { id: listingId },
    include: { investment: true },
  })
  if (!listing) return { ok: false, error: 'listing_not_found' }

  const buyerInvestment = await db.investment.findUnique({ where: { id: buyerInvestmentId } })
  if (!buyerInvestment) return { ok: false, error: 'buyer_investment_not_found' }

  const sellerInvestment = listing.investment

  // El vendedor aún no tiene posición on-chain → el comprador recibe una nueva
  // (mismo comportamiento que una compra primaria).
  if (!sellerInvestment?.tokenContract || sellerInvestment.tokenId == null) {
    return ensurePosition({ investmentId: buyerInvestmentId })
  }

  // La posición del vendedor se transfiere al comprador. El NFT no se parte: la
  // cantidad fraccional vive en `Investment.quantity`. En dry-run se proyecta el
  // TBA determinístico del comprador y se registra el receipt de transferencia.
  const config = getChainConfig()
  const chainId = sellerInvestment.chainId ?? config?.chainId ?? null
  const tokenContract = sellerInvestment.tokenContract
  const tokenId = sellerInvestment.tokenId

  const receipt = await db.onChainAction.create({
    data: {
      investmentId: buyerInvestment.id,
      listingId,
      action: 'transfer_position',
      status: 'dry-run',
      chainId,
      tokenId,
      tokenContract,
      tbaAddress: dryRunTbaAddress(buyerInvestmentId),
      payload: JSON.stringify({ fromInvestmentId: sellerInvestment.id, buyerUserId }),
    },
  })

  await db.investment.update({
    where: { id: buyerInvestment.id },
    data: {
      tbaAddress: receipt.tbaAddress,
      tokenId,
      tokenContract,
      chainId,
    },
  })

  return {
    ok: true,
    created: false,
    investmentId: buyerInvestment.id,
    tbaAddress: receipt.tbaAddress,
    tokenId,
    tokenContract,
    chainId,
  }
}

export async function withdrawFromTba(opts: { userId: string; amountUsd: number }): Promise<ServiceResult> {
  const investments = await db.investment.findMany({
    where: { userId: opts.userId, tbaAddress: { not: null } },
    select: { id: true, tbaAddress: true },
  })
  if (investments.length === 0) return { ok: false, error: 'no_tba_found' }

  const receipt = await db.onChainAction.create({
    data: {
      investmentId: investments[0].id,
      action: 'withdraw_from_tba',
      status: 'dry-run',
      payload: JSON.stringify({ userId: opts.userId, amountUsd: opts.amountUsd }),
    },
  })

  return {
    ok: true,
    created: true,
    tbaAddress: investments[0].tbaAddress,
    error: 'withdraw_pending_signer_integration',
  }
}