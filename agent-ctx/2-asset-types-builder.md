# Task 2: Asset Types Builder - Work Record

## Summary
Implemented full CRUD management for asset types in the GSP admin panel. The superadmin can now add, edit, and delete asset types dynamically instead of relying on hardcoded values.

## Files Created
1. **`/src/app/api/admin/asset-types/route.ts`** - GET (list all, ordered by sortOrder) and POST (create with name/slug uniqueness validation, auto-slug normalization)
2. **`/src/app/api/admin/asset-types/[id]/route.ts`** - PUT (update with uniqueness checks) and DELETE endpoints
3. **`/src/components/gsp/admin/sections/AssetTypesView.tsx`** - Full CRUD admin view component

## Files Modified
1. **`/prisma/schema.prisma`** - Added `AssetType` model with fields: id, name, slug, icon, description, color, sortOrder, isActive, createdAt, updatedAt
2. **`/src/components/gsp/admin/AdminPage.tsx`** - Added import for `AssetTypesView`, added `Layers` icon import, added nav item `{ id: 'asset-types', label: 'Tipos de Activo', icon: Layers }` after 'assets', added case in renderView switch

## Implementation Details
- API routes follow existing patterns (e.g., FAQ routes) using `NextResponse` and `db` from `@/lib/db`
- AssetTypesView follows existing admin section patterns (StatusBadge, loading skeletons, Dialog/AlertDialog, toast notifications)
- Auto-slug generation from name on create (lowercased, spaces to underscores, special chars removed)
- Color picker with preset swatches + hex input
- Active/Inactive toggle via Switch component
- Delete confirmation with AlertDialog
- Responsive table with color swatch display, code-formatted slug
- All lint checks pass (no new errors introduced)
