import crypto from 'crypto'

const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_TOKEN_COOKIE = 'csrf_token'
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-me'

// Generate a CSRF token
export function generateCsrfToken(): string {
  const timestamp = Date.now().toString(36)
  const random = crypto.randomBytes(32).toString('hex')
  const payload = `${timestamp}.${random}`
  
  // Create HMAC signature
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex')
  
  return `${payload}.${signature}`
}

// Verify a CSRF token
export function verifyCsrfToken(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    const [timestamp, random, signature] = parts
    const payload = `${timestamp}.${random}`
    
    const expectedSignature = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(payload)
      .digest('hex')
    
    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )) return false
    
    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp, 36)
    return tokenAge < 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

export { CSRF_TOKEN_HEADER, CSRF_TOKEN_COOKIE }
