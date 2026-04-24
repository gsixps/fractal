# Task 3 — Real-time Analytics Dashboard with Page Visit Metrics

## Summary
Added a comprehensive real-time analytics system to the GSP fintech platform, including page visit tracking, analytics API endpoints, a client-side tracking hook, and a full admin dashboard with KPI cards, charts, and breakdowns.

## Changes Made

### 1. Added `PageVisit` model to Prisma Schema
- **File**: `prisma/schema.prisma`
- New model with fields: id, page, path, referrer, userAgent, country, sessionId, userId, createdAt
- Indexes on `[page, createdAt]` and `[createdAt]` for fast queries
- Ran `bun run db:push` to apply migration

### 2. Created Analytics API Endpoints

#### `POST /api/analytics/visit` — Track page visits (public)
- **File**: `src/app/api/analytics/visit/route.ts`
- Accepts `{ page, path, referrer, userAgent, sessionId }`
- Creates PageVisit record; returns 200 even on failure (non-blocking)

#### `GET /api/analytics/stats` — Analytics summary (admin only)
- **File**: `src/app/api/analytics/stats/route.ts`
- Query param: `period` (today, 7d, 30d, 90d)
- Returns: total visits (today/week/month/period), unique visitors, active users now, bounce rate, avg pages/session, top pages, visits over time, device breakdown, country breakdown, referrer breakdown, active page visits
- Uses `requireAdmin()` auth check
- userAgent parsing for device categorization (desktop/mobile/tablet)

#### `GET /api/analytics/realtime` — Real-time active users (admin only)
- **File**: `src/app/api/analytics/realtime/route.ts`
- Returns: activeUsers count, currentPageVisits breakdown
- Queries visits from last 5 minutes

### 3. Created Client-Side Analytics Hook
- **File**: `src/hooks/use-analytics.ts`
- `useAnalytics()` hook: tracks page visits via `navigator.sendBeacon` (with fetch fallback)
- Session ID persisted in `sessionStorage`
- Debounced: max once per page per 5 minutes
- Tracks page, path, referrer, userAgent

### 4. Integrated Analytics in AppShell
- **File**: `src/components/gsp/AppShell.tsx`
- Imported `useAnalytics` and called in `AppShell` component
- Every page change triggers an analytics visit

### 5. Created AnalyticsView Admin Section
- **File**: `src/components/gsp/admin/sections/AnalyticsView.tsx`
- KPI cards: Active Users (with live ping indicator), Total Visits, Unique Visitors, Bounce Rate
- CSS bar chart: Visits over time with hover tooltips
- Device breakdown: Desktop/Mobile/Tablet with progress bars
- Active pages now: Badge list with live polling (every 15s)
- Top 10 most visited pages with bar visualization
- Referrer sources table
- Country breakdown table
- Time filter: Today, Last 7 days, Last 30 days, Last 90 days
- Consistent emerald/green color scheme matching admin panel
- Mobile responsive design

### 6. Added Analytics to Admin Navigation
- **File**: `src/components/gsp/admin/AdminPage.tsx`
- Added `AnalyticsView` import
- Added `{ id: 'analytics', label: 'Analytics', icon: BarChart3 }` before the CMS separator
- Added `case 'analytics': return <AnalyticsView />` in section renderer

## Files Created
- `prisma/schema.prisma` (modified — added PageVisit model)
- `src/app/api/analytics/visit/route.ts` (new)
- `src/app/api/analytics/stats/route.ts` (new)
- `src/app/api/analytics/realtime/route.ts` (new)
- `src/hooks/use-analytics.ts` (new)
- `src/components/gsp/admin/sections/AnalyticsView.tsx` (new)

## Files Modified
- `src/components/gsp/AppShell.tsx` (added analytics hook)
- `src/components/gsp/admin/AdminPage.tsx` (added nav item + section)

## Testing
- ESLint passes with 0 errors on all new/modified files
- Dev server running successfully (port 3000, HTTP 200)
---
Task ID: 2
Agent: Main Agent
Task: Fix all admin panel loading errors + seed translations and currencies

Work Log:
- Diagnosed root cause: translations table was empty (hardcoded in i18n.tsx, not seeded to DB)
- Sub-agent created src/lib/i18n-data.ts extracting ~387 translation keys from i18n.tsx
- Modified seed.ts to upsert translations and currencies (9 currencies) into DB
- Added ?force=true support to /api/seed endpoint for re-seeding
- Created /api/admin/translations/[id]/route.ts for individual translation CRUD
- Fixed SettingsView to handle grouped API response format
- Added "seed needed" warning banner to TranslationsView with one-click seed button
- Force-seeded: 774 translations (387 es + 387 en), 9 currencies

Stage Summary:
- Translations API now returns 387 keys per locale from DB
- Currencies API returns 9 currencies (USD, EUR, CLP, MXN, COP, ARS, PEN, BRL, VES)
- All admin sections (Settings, FAQ, Testimonials, Translations) now load data correctly
- Zero source code lint errors

---
Task ID: 3
Agent: Sub-agent
Task: Add real-time analytics dashboard with page visit metrics

Work Log:
- Added PageVisit model to Prisma schema with indexes
- Created POST /api/analytics/visit (public, tracks page visits)
- Created GET /api/analytics/stats (admin, comprehensive analytics summary)
- Created GET /api/analytics/realtime (admin, active users + page distribution)
- Created useAnalytics hook with sendBeacon, sessionStorage session ID, 5-min debounce
- Integrated analytics tracking in AppShell.tsx on page navigation
- Created AnalyticsView admin component with KPI cards, bar charts, device/referrer/country breakdowns
- Added Analytics nav item to AdminPage sidebar with BarChart3 icon

Stage Summary:
- Full analytics pipeline: client tracking → API → DB → admin dashboard
- Real-time active users counter with 15s polling
- Time filters: Today, 7 days, 30 days, 90 days
- CSS-based charts (no heavy dependencies)
- Mobile responsive, emerald/green color scheme
