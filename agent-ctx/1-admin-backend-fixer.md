---
Task ID: 1
Agent: Admin Backend Fixer
Task: Fix all broken admin backend sections

Work Log:
- Diagnosed root causes: missing API routes, missing auth checks, query param mismatch
- Created missing `/api/admin/currencies/[id]/route.ts` with GET/PUT/DELETE + requireAdmin auth
- Added `requireAdmin()` to `/api/admin/email-templates/[id]/route.ts` (PUT/DELETE)
- Added `requireAdmin()` to `/api/admin/blog/[id]/route.ts` (GET/PUT/DELETE)
- Added `requireAdmin()` to `/api/admin/legal/[id]/route.ts` (PUT/DELETE)
- Added `requireAdmin()` to `/api/admin/promotions/[id]/route.ts` (PUT/DELETE)
- Added `requireAdmin()` to `/api/admin/team/route.ts` (GET/POST)
- Added `requireAdmin()` to `/api/admin/team/[id]/route.ts` (PUT/DELETE)
- Added `requireAdmin()` to `/api/admin/asset-types/[id]/route.ts` (PUT/DELETE)
- Added `requireAdmin()` to `/api/admin/investments/[id]/route.ts` (GET/PUT/DELETE)
- Added `requireAdmin()` to `/api/admin/liquidity/route.ts` (GET/PUT)
- Fixed TranslationsView search query param mismatch: `key` → `search`
- Verified no new lint errors introduced

Stage Summary:
- All admin API routes now have consistent auth via `requireAdmin()`
- Currencies CRUD fully functional (was broken: 404 on edit/delete/toggle)
- Translations search filtering now works correctly
- 11 API route files fixed/created
- All pre-existing code patterns preserved (null safety, toast notifications)
