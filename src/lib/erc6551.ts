import { keccak_256 } from '@noble/hashes/sha3'

// ─── Helpers puros de ERC-6551 (Token Bound Accounts) ────────────────────────
// Direcciones y salts derivables 100% off-chain. Las lecturas on-chain van por
// JSON-RPC (`eth_call` al registry); las escrituras requieren un signer.

export const DEFAULT_ERC6551_REGISTRY = '0x02101dfB77FDE026414827Fdc604ddAF224F0921'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// ─── bytes/hex helpers ───────────────────────────────────────────────────────

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  return out
}

export function utf8ToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s)
}

/** palabra de 32 bytes con el valor alineado a la derecha (estándar ABI) */
export function padWord(bytes: Uint8Array): Uint8Array {
  const word = new Uint8Array(32)
  word.set(bytes, 32 - bytes.length)
  return word
}

export function bigintToWord(n: bigint): Uint8Array {
  let bytes = new Uint8Array(32)
  let value = n
  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(value & BigInt(0xff))
    value >>= BigInt(8)
  }
  return bytes
}

/** tokenId determinístico (32 bytes) a partir de un seed — keccak256 */
export function deriveTokenId(seed: string): bigint {
  const h = keccak_256(utf8ToBytes(`gsp:${seed}`))
  let acc = BigInt(0)
  for (const b of h) acc = (acc << BigInt(8)) | BigInt(b)
  return acc
}

/** colapsa un uint256 a un Int32 positivo (Prisma `Int`) — POC-safe */
export function tokenIdToInt32(n: bigint): number {
  return Number(n & BigInt(0x7fffffff))
}

// ─── ERC-6551 - account id (salt del CREATE2) ────────────────────────────────
// salt = keccak256(abi.encodePacked(implementation, chainId, tokenContract, tokenId, preSalt))
export interface AccountIdParams {
  implementation: string
  chainId: number
  tokenContract: string
  tokenId: bigint
  salt?: bigint
}

export function erc6551AccountId(params: AccountIdParams): string {
  const impl = fromHex(params.implementation)
  const tokenContract = fromHex(params.tokenContract)
  const tokenId = bigintToWord(params.tokenId)
  const chainId = bigintToWord(BigInt(params.chainId))
  const salt = bigintToWord(params.salt ?? BigInt(0))
  const payload = new Uint8Array(impl.length + chainId.length + tokenContract.length + tokenId.length + salt.length)
  payload.set(impl, 0)
  payload.set(chainId, impl.length)
  payload.set(tokenContract, impl.length + chainId.length)
  payload.set(tokenId, impl.length + chainId.length + tokenContract.length)
  payload.set(salt, impl.length + chainId.length + tokenContract.length + tokenId.length)
  return '0x' + toHex(keccak_256(payload))
}

/** dirección CREATE2: keccak(0xff || creator(20) || salt(32) || initCodeHash(32))[12..] */
export function create2Address(creator: string, saltBytes: Uint8Array, initCodeHash: Uint8Array): string {
  const creatorBytes = fromHex(creator)
  const payload = new Uint8Array(1 + creatorBytes.length + saltBytes.length + initCodeHash.length)
  payload[0] = 0xff
  payload.set(creatorBytes, 1)
  payload.set(saltBytes, 1 + creatorBytes.length)
  payload.set(initCodeHash, 1 + creatorBytes.length + saltBytes.length)
  return '0x' + toHex(keccak_256(payload).slice(12)).toLowerCase()
}

// ─── ABI selectors (registro canónico v0.3: account(address,uint256,address,uint256,uint256)) ──

export const REGISTRY_ACCOUNT_SELECTOR = keccak_256(utf8ToBytes('account(address,uint256,address,uint256,uint256)')).slice(0, 4)
export const REGISTRY_CREATE_ACCOUNT_SELECTOR = keccak_256(
  utf8ToBytes('createAccount(address,uint256,address,uint256,uint256)')
).slice(0, 4)

export function encodeRegistryAccountCall(args: AccountIdParams & { registry: string }): string {
  const impl = padWord(fromHex(args.implementation))
  const chainId = bigintToWord(BigInt(args.chainId))
  const tokenContract = padWord(fromHex(args.tokenContract))
  const tokenId = bigintToWord(args.tokenId)
  const salt = bigintToWord(args.salt ?? BigInt(0))
  const data = new Uint8Array(4 + impl.length + chainId.length + tokenContract.length + tokenId.length + salt.length)
  data.set(REGISTRY_ACCOUNT_SELECTOR, 0)
  data.set(impl, 4)
  data.set(chainId, 4 + impl.length)
  data.set(tokenContract, 4 + impl.length + chainId.length)
  data.set(tokenId, 4 + impl.length + chainId.length + tokenContract.length)
  data.set(salt, 4 + impl.length + chainId.length + tokenContract.length + tokenId.length)
  return '0x' + toHex(data)
}

/** extrae dirección de un word de 32 bytes de resultado ABI */
export function decodeAddressWord(resultHex: string): string {
  const bytes = fromHex(resultHex)
  if (bytes.length < 20) return ZERO_ADDRESS
  return '0x' + toHex(bytes.slice(bytes.length - 20)).toLowerCase()
}

/** dirección pseudo-deteminística para modo dry-run (dominio interno) */
export function dryRunTbaAddress(seed: string): string {
  const h = keccak_256(utf8ToBytes(`gsp-tba:${seed}`))
  return '0x' + toHex(h.slice(0, 20)).toLowerCase()
}