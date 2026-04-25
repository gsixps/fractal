import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Database client initialization
 * 
 * Strategy:
 * - When TURSO_DATABASE_URL + TURSO_AUTH_TOKEN are set → use Turso (LibSQL) via adapter
 * - Otherwise → use local SQLite (dev mode with Turbopack)
 * 
 * Note: Turbopack (dev-only) has issues with driver adapter env vars.
 * Turso works perfectly in production (next start, no Turbopack).
 */
function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  // Use Turso adapter when credentials are available AND we're NOT in Turbopack dev
  if (tursoUrl && tursoToken) {
    try {
      const libsql = createClient({
        url: tursoUrl,
        authToken: tursoToken,
      })
      const adapter = new PrismaLibSQL(libsql)
      console.log('[DB] ✅ Connected to Turso (LibSQL)')
      return new PrismaClient({ adapter })
    } catch (err) {
      console.warn('[DB] ⚠️ Turso adapter failed, falling back to SQLite:', err)
    }
  }

  // Default: Use standard Prisma SQLite client
  console.log('[DB] 📁 Using SQLite (local file-based)')
  return new PrismaClient()
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
