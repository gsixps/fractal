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
 * - Production (Vercel): Uses Turso (LibSQL) via adapter when TURSO_DATABASE_URL + TURSO_AUTH_TOKEN are set
 * - Development (Turbopack): Uses local SQLite file — Turbopack has known issues with driver adapters
 *
 * In Vercel production, NEXTAUTH_URL is auto-set and NODE_ENV=production.
 * The Turso adapter only activates in production to avoid Turbopack env var timing issues.
 */
function createPrismaClient(): PrismaClient {
  // Only use Turso adapter in production — Turbopack has env var issues in dev
  if (process.env.NODE_ENV === 'production') {
    const tursoUrl = process.env.TURSO_DATABASE_URL
    const tursoToken = process.env.TURSO_AUTH_TOKEN

    if (tursoUrl && tursoToken) {
      const libsql = createClient({
        url: tursoUrl,
        authToken: tursoToken,
      })
      const adapter = new PrismaLibSQL(libsql)
      return new PrismaClient({ adapter })
    }

    console.warn('[DB] ⚠️ Production mode but no Turso credentials found. Using default Prisma client.')
  }

  // Dev / fallback: use local SQLite
  return new PrismaClient()
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

// Prevent multiple Prisma instances in dev (hot reload)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
