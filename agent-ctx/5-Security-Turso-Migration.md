---
Task ID: 5
Agent: Security + Turso DB Migration
Task: Implement security middleware, Turso DB migration, auth helpers, CSRF, Stripe utility

Work Log:
- Migrated Prisma from SQLite to Turso (LibSQL adapter) — kept `provider = "sqlite"` in schema since Prisma 6 uses adapter pattern
- Updated `/src/lib/db.ts` to use `@prisma/adapter-libsql` with `@libsql/client` for Turso/LibSQL connection
- Created `/src/middleware.ts` with rate limiting (10/min auth, 20/min payments, 100/min general) and security headers (CSP, HSTS, X-Frame-Options, etc.)
- Created `/src/lib/auth-api.ts` with `authenticate()`, `requireAdmin()`, `requireSuperAdmin()` helpers for API route auth
- Created `/src/lib/csrf.ts` with HMAC-SHA256 CSRF token generation and verification with timing-safe comparison
- Updated `/src/lib/stripe.ts` — added `calculateStripeFee()`, `calculatePlatformFee()`, `PLATFORM_FEE_PERCENT`, direct `stripe` export, `STRIPE_PUBLISHABLE_KEY` while preserving existing helper functions
- Ran `bun run db:push` — schema already in sync, Prisma Client generated successfully
- Ran `bun run lint` — no errors in our new/modified files

Stage Summary:
- Turso connection configured with LibSQL adapter (works with both `file:` local and `libsql://` remote URLs)
- DATABASE_URL can be switched to `libsql://your-db.turso.io` for remote Turso without code changes
- Security middleware active: rate limiting, CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- Admin API routes can use `requireAdmin()`/`requireSuperAdmin()` from auth-api.ts
- CSRF tokens generated with HMAC-SHA256, 24h expiry, constant-time comparison
- Stripe client initialized with fee calculators (2.9% + $0.30) and platform fee (2.5%)
