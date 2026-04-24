# Task 3b — Fix Blog, Legal, and EmailTemplates views

## Agent: Views Fixer

## Work Log

### BlogView.tsx
- Added `?? ''` null safety to all 11 fields in `openEdit()` mapping
- Added `?? ''` to all 8 Input/Textarea value props in the form dialog
- Imported `Sparkles, Upload` from lucide-react
- Added `generating` state for AI generation loading
- Added `handleAIGenerate()` function: POSTs to `/api/admin/blog/generate` with `{ title, category, tags, excerpt, locale: 'es' }`, fills content/seoTitle/seoDescription/readingTime on success, shows toast on success/error
- Added "Generar con IA" button with Sparkles icon, loading spinner state, placed between excerpt and content fields
- Added `handleImageUpload()` function: POSTs file to `/api/upload` via FormData, sets coverImageUrl on success
- Added Upload button next to coverImageUrl input with hidden file input, supporting jpg/png/webp/gif
- Added image preview below coverImageUrl input when URL is present
- Replaced `toLocaleDateString('es-CL')` → `toLocaleDateString('en-US')`
- No CLP or GSP text references found (already clean)

### LegalView.tsx
- Added `?? ''`/`?? false`/`?? true` null safety to all 8 fields in `openEdit()` mapping
- Added `?? ''` to all 5 Input/Textarea value props in the form dialog
- Expanded `typeLabels` from 4 entries to 7: terms, privacy, risk_disclosure, investment_policy, cookies, compliance, other
- Added `customType: string` to `LegalFormState` interface and `emptyForm`
- When type "other" is selected in the create/edit dialog, an additional Input field appears for the custom type name
- `handleSubmit()` validates custom type is non-empty when "other" is selected, and sends `customType.trim()` as the actual type value
- `openEdit()` smart detection: if a DB type is not in typeLabels, maps it to 'other' and preserves the original value as customType
- Added `getDisplayType()` helper for table badge display
- Replaced `toLocaleDateString('es-CL')` → `toLocaleDateString('en-US')`
- No GSP text references found

### EmailTemplatesView.tsx
- Added `?? ''`/`?? true` null safety to all 7 fields in `openEdit()` mapping
- Added `variables: string` to `EmailTemplateFormState` interface and `emptyForm`
- Added `variables` Input to the create/edit dialog (next to category select)
- Added live variable badges preview showing `{{varname}}` for each comma-separated variable
- Added `variables` to the POST body in `handleSubmit()` for both create and update
- Changed test email endpoint from `/api/emails/test` to `/api/emails/send`
- Request body: `{ to, subject, templateName: testTarget.name, variables: {} }`
- Simplified test dialog to compact layout (removed renderedHtml/renderedText result display)
- Added Sparkles icon to test dialog title
- Imported `Sparkles` from lucide-react
- No GSP text references found

## Files Modified
- `src/components/gsp/admin/sections/BlogView.tsx`
- `src/components/gsp/admin/sections/LegalView.tsx`
- `src/components/gsp/admin/sections/EmailTemplatesView.tsx`
- `worklog.md` (appended work record)
