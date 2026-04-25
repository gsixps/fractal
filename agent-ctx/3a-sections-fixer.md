# Task 3a — Sections Fixer

## Task
Fix FAQ, Testimonials, and Analytics views

## Changes Made

### FAQView.tsx
- Null-safe `openEdit()`: all fields use `?? ''`, `?? 'general'`, `?? true` fallbacks
- Added `?? ''` to all Input/Textarea value props (question, answer, sortOrder)
- Already fetches from `/api/admin/faq` ✅
- No CLP references found ✅
- No GSP references found ✅
- No avatarUrl/image field — no upload button needed ✅

### TestimonialsView.tsx
- Null-safe `openEdit()`: all fields use `?? ''` / `?? 0` / `?? false` / `?? 'pending'` fallbacks
- Added `?? ''` to all Input/Textarea value props (name, role, avatarUrl, quote, investmentAmount, assetName)
- Replaced "Monto Invertido (CLP)" → "Monto Invertido (USD)"
- Added `Upload` icon import from `lucide-react`
- Added `handleImageUpload()` function calling `/api/upload` POST with FormData
- Added upload button next to avatarUrl input with hidden file input
- Added avatar preview image when URL is set
- Already fetches from `/api/admin/testimonials` ✅
- No GSP references found ✅

### AnalyticsView.tsx
- Changed auto-refresh interval from 15s to 30s
- Auto-refresh now fetches BOTH stats AND realtime data (previously only realtime)
- Changed `Intl.NumberFormat('es-CL')` → `Intl.NumberFormat('en-US')` in `formatNumber`
- Changed `toLocaleDateString('es-CL')` → `toLocaleDateString('en-US')` in `getDayLabel`
- Updated footer text "15 segundos" → "30 segundos"
- Already fetches from `/api/analytics/stats` and `/api/analytics/realtime` ✅
- Already shows all required metrics (page visits, active users, top pages, device breakdown, visits chart, country breakdown) ✅
- No GSP references found ✅
