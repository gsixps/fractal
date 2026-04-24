# Task 3 — Real-time Analytics Dashboard

## Summary
Added a complete real-time analytics system to the GSP platform: PageVisit model, 3 API endpoints, client-side tracking hook, and a full analytics admin dashboard.

## Files Created
- `prisma/schema.prisma` — Added PageVisit model
- `src/app/api/analytics/visit/route.ts` — POST track visits (public)
- `src/app/api/analytics/stats/route.ts` — GET analytics summary (admin)
- `src/app/api/analytics/realtime/route.ts` — GET active users (admin)
- `src/hooks/use-analytics.ts` — Client-side page tracking hook
- `src/components/gsp/admin/sections/AnalyticsView.tsx` — Admin dashboard

## Files Modified
- `src/components/gsp/AppShell.tsx` — Integrated analytics hook
- `src/components/gsp/admin/AdminPage.tsx` — Added nav item + AnalyticsView

## Key Features
- Real-time active users with ping indicator
- CSS bar chart for visits over time
- Device breakdown (desktop/mobile/tablet)
- Top pages, referrer sources, country breakdown
- Time filters: today, 7d, 30d, 90d
- Auto-polling every 15 seconds
- Emerald/green color scheme matching app
- Mobile responsive
