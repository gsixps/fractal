// Dev smoke test: servicio ERC-6551 en modo dry-run (sin RPC).
// Verifica creación de posición, idempotencia y persistencia en BD.
import { db } from '../src/lib/db'
import { setChainConfig } from '../src/lib/blockchain'
import { ensurePosition } from '../src/lib/erc-6551-service'

function assert(cond: boolean, label: string) {
  if (!cond) throw new Error(`FAIL: ${label}`)
  console.log(`ok - ${label}`)
}

async function main() {
  // Modo dry-run: pipeline completo, sin transacciones on-chain.
  setChainConfig({
    chainId: 11155111,
    rpcUrl: 'dry-run',
    registry: '0x02101dfB77FDE026414827Fdc604ddAF224F0921',
    nftContract: '0x0000000000000000000000000000000000000000',
    dryRun: true,
  })

  const email = `erc6551.test.${Date.now()}@gsp.cl`
  const user = await db.user.create({
    data: {
      email,
      role: 'investor',
      kycStatus: 'pending',
      isActive: true,
      name: 'ERC6551 Test',
      preferredLanguage: 'es',
    },
  })
  const asset = await db.asset.create({
    data: {
      name: 'Asset ERC6551 Test',
      slug: `erc6551-test-${Date.now()}`,
      type: 'office',
      status: 'active',
      address: 'Av Test 123',
      city: 'Santiago',
      region: 'RM',
      country: 'Chile',
      totalValue: 1000000,
      pricePerFraction: 100,
      totalFractions: 100,
      availableFractions: 90,
      minimumInvestment: 100,
      annualYield: 7,
      projectedAppreciation: 3,
      totalProjectedReturn: 10,
      shortDescription: 'test',
      fullDescription: 'test',
      highlights: 'test',
    },
  })
  const investment = await db.investment.create({
    data: {
      userId: user.id,
      assetId: asset.id,
      quantity: 10,
      pricePerUnit: 100,
      totalAmount: 1000,
      status: 'active',
    },
  })

  try {
    const r1 = await ensurePosition({ investmentId: investment.id })
    assert(r1.ok, 'ensurePosition #1 ok')
    assert(r1.created === true, 'creada en la primera llamada')
    assert(!!r1.tbaAddress?.startsWith('0x'), 'tbaAddress determinística seteada')
    assert(typeof r1.tokenId === 'number', 'tokenId seteado')

    const updated = await db.investment.findUnique({ where: { id: investment.id } })
    assert(updated?.tbaAddress === r1.tbaAddress, 'inversión actualizada en BD (tbaAddress)')
    assert(updated?.tokenId === r1.tokenId, 'tokenId persistido en BD')
    assert(updated?.tokenContract != null, 'tokenContract persistido')

    const r2 = await ensurePosition({ investmentId: investment.id })
    assert(r2.ok && r2.created === false, 'segunda llamada es no-op idempotente')

    const r3 = await ensurePosition({ investmentId: investment.id })
    assert(r3.ok && r3.inFlight !== true, 'sigue siendo no-op tras reintento')

    const receipts = await db.onChainAction.findMany({
      where: { investmentId: investment.id, action: 'ensure_position' },
    })
    assert(receipts.length === 1, `solo un receipt registrado (${receipts.length})`)
    assert(receipts[0].status === 'dry-run', 'receipt en modo dry-run')

    console.log(`\n✅ PASS: investment=${investment.id} tba=${r1.tbaAddress} tokenId=${r1.tokenId}`)
  } finally {
    await db.onChainAction.deleteMany({ where: { investmentId: investment.id } })
    await db.investment.delete({ where: { id: investment.id } })
    await db.asset.delete({ where: { id: asset.id } })
    await db.user.delete({ where: { id: user.id } })
  }
}

main().catch((err) => {
  console.error('\n' + err.message)
  process.exit(1)
})