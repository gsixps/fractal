---
Task ID: 1-b
Agent: Feature Builder
Task: Create/fix 4 missing features: upload API, newsletter, stats API, dynamic homepage stats

Work Log:
- Created `/api/upload/route.ts`: POST endpoint with requireAuth, file type validation (jpeg/png/webp/gif), max 5MB size, saves to `public/uploads/` with timestamp-prefixed unique filenames, creates directory if needed
- Added `Newsletter` model to Prisma schema (email unique, isActive, source fields), pushed to DB with `prisma db push`
- Created `/api/newsletter/subscribe/route.ts`: POST endpoint with Zod email validation, duplicate detection (reactivates if unsubscribed), public (no auth required)
- Fixed CTASection in HomePage.tsx: replaced fake toast with real `fetch('/api/newsletter/subscribe')` POST, added loading state and error handling
- Fixed Footer newsletter form: created `NewsletterForm` component with real API call, loading/disabled states, toast feedback
- Created `/api/stats/route.ts`: GET endpoint (public, no auth) returning real platform stats from DB: totalInvested (sum of completed investments), totalInvestors (users with investments), averageYield (avg of active assets), platformFee (from SiteSetting or 3%), totalAssets (active count), totalDividends (sum of paid dividends)
- Replaced hardcoded stats in HeroSection ($2.1M+, 340+, 12.8%, 3%) with `useEffect` fetching from `/api/stats`, skeleton loading fallback, dynamic formatting (supports K+/M+ suffixes)
- All changes pass `bun run lint` with 0 errors

Verified endpoints:
- `GET /api/stats` → 200 with real data: {totalInvested: 15540000, totalInvestors: 2, averageYield: 14.1, totalAssets: 6, ...}
- `POST /api/newsletter/subscribe` → 200 on success, handles duplicates
- `POST /api/upload` → 401 (requires auth) ✓

Stage Summary:
- 3 new API routes created: /api/upload, /api/newsletter/subscribe, /api/stats
- 1 new Prisma model: Newsletter
- 2 components fixed: HomePage CTASection (newsletter), Footer (newsletter form)
- 1 component refactored: HeroSection (dynamic stats from API with skeleton fallback)
- All endpoints verified working with curl tests
