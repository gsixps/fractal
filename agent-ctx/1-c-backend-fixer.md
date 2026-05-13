---
Task ID: 1-c
Agent: Backend Fixer
Task: Fix fake/incomplete implementations across dashboard, investment analysis, referral, and portfolio calculations

Work Log:
- Added InvestmentAnalysis model to prisma/schema.prisma with fields: id, assetId, assetName, analysis, investorCountry, generatedAt
- Ran `bun run db:push` (via `npx prisma db push` with matching v6 CLI) — schema synced, Prisma Client regenerated
- Fixed /api/dashboard/route.ts: Added proper portfolio value calculation:
  - totalInvested: sum of totalAmount for active/completed investments
  - currentValue: sum of (quantity × asset.pricePerFraction) for active investments
  - totalReturn: currentValue + totalDividends - totalInvested
  - Returns all 4 new fields: totalInvested, currentValue, totalReturn, totalDividends
- Updated src/lib/store.tsx: Added totalInvested, currentValue, totalReturn to DashboardData interface and EMPTY_DASHBOARD_DATA defaults
- Updated DashboardPage.tsx:
  - Uses dashboardData.currentValue for portfolio value (instead of totalInvested + totalDividends)
  - Shows totalReturn in portfolio banner with color-coded positive/negative display
  - Stat cards use totalInvested from API calculation
  - Portfolio card description shows return amount
- Rewrote /api/admin/investment-analysis/route.ts: Replaced in-memory Map with database storage
  - POST: Stores analysis in InvestmentAnalysis table via db.investmentAnalysis.create()
  - GET: Queries from database with orderBy + take(20), maps fields to match expected interface
  - Removed analysisStore Map and MAX_STORED_PER_ASSET constant
- Fixed /api/referral/apply/route.ts: Changed referral status from 'completed' to 'pending'
- Fixed /api/payments/webhook/route.ts handleCheckoutCompleted:
  - After successful payment, checks for pending referral for the user
  - If found, marks referral as 'completed'
  - Credits bonusAmount ($25) to referrer's balance
  - Sends notification to referrer about completed bonus
- ESLint: 0 errors, 0 warnings

Stage Summary:
- Portfolio value now correctly calculated as quantity × current pricePerFraction (not invested + dividends)
- Dashboard shows real-time currentValue, totalInvested, totalReturn from API
- AI Investment Analysis persists to database (InvestmentAnalysis model) instead of in-memory Map
- Referral bonus now pending until referred user completes first investment (via Stripe webhook)
- Referrer gets $25 credited to balance + notification when bonus completes
