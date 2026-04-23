# Task 5: Update Frontend Components to Fetch from Database APIs

## Agent: Main Agent

## Work Log:
- Read worklog.md for context on previous tasks (NextAuth, i18n, currency conversion)
- Read all 6 source files that needed changes: store.tsx, HomePage.tsx, MarketplacePage.tsx, DashboardPage.tsx, AdminPage.tsx, AssetDetailPage.tsx
- Verified all API endpoints exist and work: `/api/assets`, `/api/assets/[id]`, `/api/dashboard`, `/api/admin/stats`
- Verified Prisma schema has all required fields

## Changes Made:

### 1. `src/lib/store.tsx` — Major Refactor
- Removed `import { SEED_ASSETS, SEED_DASHBOARD_DATA } from './seed-data'`
- Added `EMPTY_DASHBOARD_DATA` constant for default state
- Added `selectedAsset`, `assetsLoading`, `dashboardLoading`, `selectedAssetLoading` state
- Added `fetchAssets()` — calls `GET /api/assets`, sets assets state
- Added `fetchDashboard()` — calls `GET /api/dashboard`, sets dashboardData state  
- Added `fetchAssetById(id)` — calls `GET /api/assets/[id]`, sets selectedAsset state
- Updated `getAssetById` to use reactive `assets` state instead of SEED_ASSETS
- Updated `Asset` interface: made nullable Prisma fields (`monthlyRent`, `tenantName`, `totalArea`, `units`, `constructionYear`, `landUse`, `operationalCostsPct`) optional with `| null`
- Extended `AppState` interface with new properties and functions
- Added re-exports for external type usage

### 2. `src/components/gsp/home/HomePage.tsx`
- Added `useEffect` import
- Added `Skeleton` import from ui components
- `FeaturedAssetsSection`: Added `fetchAssets()` and `assetsLoading` from store
- Added `useEffect(() => { fetchAssets() }, [fetchAssets])` on mount
- Added loading skeleton (3 card placeholders) shown while assets fetch
- Moved `useMemo` for `typeLabels` before the conditional early return (hooks rule)
- Added empty state handling when no assets are returned
- Changed from `.filter().slice()` on `s.assets` to filtering after getting store assets

### 3. `src/components/gsp/marketplace/MarketplacePage.tsx`
- Added `useEffect` import
- Added `Skeleton` import from ui components
- Added `fetchAssets()` and `assetsLoading` from store
- Added `useEffect(() => { fetchAssets() }, [fetchAssets])` on mount
- Added loading skeleton (6 card placeholders) while assets fetch
- Updated count text to show "Cargando..." while loading

### 4. `src/components/gsp/dashboard/DashboardPage.tsx`
- Added `useEffect` import
- Added `Skeleton` import from ui components
- Changed from `useAppStore()` full destructure to selective store access
- Added `fetchDashboard()` and `dashboardLoading` from store
- Added `useEffect(() => { fetchDashboard() }, [fetchDashboard])` on mount
- Added full loading skeleton (stats cards, investment grid, table sections)
- Created local `data` alias after loading check to keep existing JSX references working

### 5. `src/components/gsp/asset/AssetDetailPage.tsx`
- Changed from `getAssetById` (which only had list data) to `fetchAssetById` (full API fetch)
- Added `selectedAsset`, `selectedAssetLoading`, `fetchAssetById` from store
- Added `useEffect` to call `fetchAssetById(selectedAssetId)` when selectedAssetId changes
- Shows `AssetDetailSkeleton` while loading
- Uses `selectedAsset` directly instead of looking up from assets list

### 6. `src/components/gsp/admin/AdminPage.tsx`
- No changes needed — already fetches from `/api/admin/stats` on its own

## Verification:
- `bun run lint` — No errors in src/ files (only pre-existing errors in keepalive.js, serve.js, mini-server.js)
- `/api/assets` — Returns 6 assets with 1 cover image each
- `/api/assets/[id]` — Returns full asset with 2 images, 3 documents, 5 cash flow projections
- `/api/dashboard` — Returns 401 when unauthenticated (correct behavior)
- Main page renders successfully with full HTML and RSC payload
- No remaining references to `seed-data` in src/ directory (only the file itself remains)

## Issues Encountered:
1. **Missing .map() in HomePage**: The refactoring edit accidentally removed the `assets.map((asset, i) => (` wrapper. Fixed by re-adding it.
2. **React hooks rule violation**: `useMemo` for `typeLabels` was placed after the early return for loading state, violating React's rules of hooks. Fixed by moving it before the conditional return.
3. **No other issues** — all components compile and the page loads correctly.
