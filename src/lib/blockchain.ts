import { encodeRegistryAccountCall, decodeAddressWord, DEFAULT_ERC6551_REGISTRY } from '@/lib/erc6551'

// ─── Configuración on-chain (perezosa y sin side effects al importar) ────────
// Sin RPC ni claves → el sistema opera en modo dry-run (los flujos y receipts
// se registran igual, pero no se envían transacciones).

export interface ChainConfig {
  chainId: number
  rpcUrl: string
  ownerPrivateKey?: string
  implementation?: string // ERC-6551 account implementation
  nftContract?: string // contrato PositionNFT
  usdcContract?: string
  registry: string
  dryRun: boolean
}

let overridden: ChainConfig | null | undefined

export function setChainConfig(config: ChainConfig | null): void {
  overridden = config
}

export function getChainConfig(): ChainConfig | null {
  if (overridden !== undefined) return overridden

  const rpcUrl = process.env.RPC_URL || process.env.ETH_RPC_URL
  const chainIdRaw = process.env.CHAIN_ID || process.env.ETH_CHAIN_ID
  if (!rpcUrl || !chainIdRaw) return null

  const chainId = Number(chainIdRaw)
  if (!Number.isInteger(chainId) || chainId <= 0) return null

  return {
    chainId,
    rpcUrl,
    ownerPrivateKey: process.env.OWNER_PRIVATE_KEY || process.env.PRIVATE_KEY,
    implementation: process.env.ERC6551_IMPLEMENTATION || undefined,
    nftContract: process.env.NFT_CONTRACT || undefined,
    usdcContract: process.env.USDC_CONTRACT || undefined,
    registry: process.env.ERC6551_REGISTRY || DEFAULT_ERC6551_REGISTRY,
    dryRun: false,
  }
}

// ─── Transporte JSON-RPC read-only (fetch nativo, sin dependencias) ──────────

async function jsonRpc(rpcUrl: string, method: string, params: unknown[]): Promise<any> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`)
  const json = await res.json()
  if (json.error) throw new Error(json.error.message || 'RPC error')
  return json.result
}

export function canReadOnChain(config: ChainConfig): boolean {
  return !config.dryRun && !!config.rpcUrl && !!config.implementation && !!config.nftContract
}

/** dirección del Token Bound Account vía registry.account(...) — lectura */
export async function registryAccount(config: ChainConfig, params: { tokenId: bigint }): Promise<string> {
  const implementation = config.implementation
  const tokenContract = config.nftContract
  if (!implementation || !tokenContract) throw new Error('ERC6551_IMPLEMENTATION / NFT_CONTRACT no configurado')

  const data = encodeRegistryAccountCall({
    registry: config.registry,
    implementation,
    chainId: config.chainId,
    tokenContract,
    tokenId: params.tokenId,
  })
  const result = await jsonRpc(config.rpcUrl, 'eth_call', [{ to: config.registry, data }, 'latest'])
  return decodeAddressWord(result as string)
}