# Task ID: 5 - Admin Panel Fixer

## Summary
Reviewed and applied 5 high-priority UX fixes for the admin panel.

## Findings
- **Fixes 1-4 were already completed** by previous agents (Task IDs 2b, 3b)
- **Fix 5 (TeamView)** was the only one requiring actual code changes

## Changes Made

### File Modified: `src/components/gsp/admin/sections/TeamView.tsx`

1. **Added imports**: `useRef` from React, `Upload` from lucide-react
2. **Added `fileInputRef`** for hidden file input management
3. **Added `handleImageUpload` function** - uploads via `/api/upload` POST, updates form.photoUrl on success
4. **Fixed `openEdit()` null safety** - all 6 fields now use `?? ''` or `?? '0'` fallbacks
5. **Added `?? ''` null safety** to all Input/Textarea value props (6 instances)
6. **Added Upload button** next to photo URL input with icon
7. **Added hidden file input** accepting image/jpeg, image/png, image/webp, image/gif
8. **Added image preview** - 80x80 rounded thumbnail shown when photoUrl has a value

### Files Verified (No Changes Needed)
- `PromotionsView.tsx` - CLP→USD done, null safety done
- `LegalView.tsx` - "Otro (especificar)" with customType done
- `EmailTemplatesView.tsx` - Create template + send test email working
- `BlogView.tsx` - Photo upload for coverImage working
- `api/admin/email-templates/route.ts` - POST handler functional
- `api/emails/send/route.ts` - Email sending endpoint functional

## Lint Status
- No lint errors introduced in modified file
- Pre-existing warnings in other files unchanged
