import { secp256k1 } from '@noble/curves/secp256k1'
import { keccak_256 } from '@noble/hashes/sha3'

// ─── Minimal EIP-4361 / SIWE (Sign-In With Ethereum) ─────────────────────
// Parseo y verificación ligera del mensaje y la firma (eth_personalSign,
// EIP-191). Suficiente para enlazar una wallet a la cuenta; sin dependencias
// pesadas (ethers/wagmi). El mensaje se verifica contra el string EXACTO que
// firmó el cliente, y los campos se parsean por separado para validarlos.

export interface SiweFields {
  domain: string
  address: string
  uri: string
  version: string
  chainId: string
  nonce: string
  issuedAt: string
  statement?: string
  expirationTime?: string
  notBefore?: string
  requestId?: string
  resources?: string[]
}

const PREFIX = ' wants you to sign in with your Ethereum account:'
const KNOWN_FIELDS = new Set([
  'URI',
  'Version',
  'Chain ID',
  'Nonce',
  'Issued At',
  'Expiration Time',
  'Not Before',
  'Request ID',
  'Resources',
])

export function parseSiweMessage(message: string): { fields: SiweFields } | { error: string } {
  if (typeof message !== 'string' || message.length === 0 || message.length > 4096) {
    return { error: 'Mensaje ausente o demasiado largo' }
  }

  const lines = message.split('\n')
  const first = lines[0]
  if (!first?.endsWith(PREFIX)) {
    return { error: 'Formato de mensaje SIWE inválido (prefijo no encontrado)' }
  }

  const domain = first.slice(0, -PREFIX.length).trim()
  if (!/^[a-zA-Z0-9.-]+(?::\d{1,5})?$/.test(domain) || domain.length > 253) {
    return { error: 'Dominio SIWE inválido' }
  }

  if (lines.length < 6) return { error: 'Mensaje SIWE incompleto' }

  const address = lines[1].trim()
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return { error: 'Dirección Ethereum inválida en el mensaje' }
  }

  // Recolectar statement (párrafo entre la dirección y el primer campo conocido)
  let firstFieldIdx = -1
  for (let i = 2; i < lines.length; i++) {
    const idx = lines[i].indexOf(':')
    const key = idx === -1 ? '' : lines[i].slice(0, idx)
    if (KNOWN_FIELDS.has(key)) {
      firstFieldIdx = i
      break
    }
  }
  const statement = firstFieldIdx === -1
    ? undefined
    : lines
        .slice(2, firstFieldIdx)
        .join('\n')
        .replace(/^\n+/, '')
        .replace(/\n+$/, '') || undefined

  const fields: SiweFields = {
    domain,
    address,
    uri: '',
    version: '',
    chainId: '',
    nonce: '',
    issuedAt: '',
    statement,
  }

  let resourcesMode = false
  for (const raw of lines) {
    const line = raw.trimEnd()
    if (resourcesMode) {
      if (line.startsWith('- ')) {
        fields.resources = fields.resources || []
        fields.resources.push(line.slice(2).trim())
        continue
      }
      resourcesMode = false
    }
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx)
    const value = line.slice(idx + 1).trim()
    switch (key) {
      case 'URI': fields.uri = value; break
      case 'Version': fields.version = value; break
      case 'Chain ID': fields.chainId = value; break
      case 'Nonce': fields.nonce = value; break
      case 'Issued At': fields.issuedAt = value; break
      case 'Expiration Time': fields.expirationTime = value; break
      case 'Not Before': fields.notBefore = value; break
      case 'Request ID': fields.requestId = value; break
      case 'Resources': fields.resources = [value]; resourcesMode = true; break
      default: break
    }
  }

  if (
    !fields.uri ||
    fields.version !== '1' ||
    !fields.chainId ||
    !/^[a-zA-Z0-9]{8,}$/.test(fields.nonce) ||
    !fields.issuedAt
  ) {
    return { error: 'Campos requeridos SIWE incompletos' }
  }

  return { fields }
}

// ─── Firma ────────────────────────────────────────────────────────────────

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex
  if (!/^[0-9a-fA-F]+$/.test(clean) || clean.length % 2 !== 0) throw new Error('Invalid hex')
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

function eip191Digest(message: string): Uint8Array {
  const msgBytes = new TextEncoder().encode(message)
  const prefix = new TextEncoder().encode(`\x19Ethereum Signed Message:\n${msgBytes.length}`)
  const out = new Uint8Array(prefix.length + msgBytes.length)
  out.set(prefix, 0)
  out.set(msgBytes, prefix.length)
  return keccak_256(out)
}

// Recupera la dirección desde la firma (65 bytes: r || s || v) o null si inválida
export function recoverAddressFromSignature(message: string, signature: string): string | null {
  let sig: Uint8Array
  try {
    sig = hexToBytes(signature)
  } catch {
    return null
  }
  if (sig.length !== 65) return null

  const s = sig.slice(32, 64)
  const halfOrder = secp256k1.CURVE.n >> BigInt(1)
  let sBig = BigInt(0)
  for (const byte of s) sBig = (sBig << BigInt(8)) | BigInt(byte)
  if (sBig > halfOrder) return null // low-s únicamente (compat ethers)

  let v = sig[64]
  if (v >= 27) v -= 27
  if (v > 1) return null

  try {
    const signature = secp256k1.Signature.fromCompact(sig.slice(0, 64)).addRecoveryBit(v)
    const point = signature.recoverPublicKey(eip191Digest(message))
    const pub = point.toBytes(false) // 65 bytes, uncompressed
    const hash = keccak_256(pub.slice(1))
    return '0x' + toHex(hash.slice(-20)).toLowerCase()
  } catch {
    return null
  }
}