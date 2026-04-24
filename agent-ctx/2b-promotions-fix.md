# Task 2b — Fix PromotionsView

## Agent: Promotions Fixer

## Work Log:
- Fixed `openEdit()` null safety: all field mappings now use `?? ''` or `!= null ? String(...) : ''` to prevent null from propagating to form state
- Added `?? ''` fallback to ALL 9 Input/Textarea value props: name, code, value, minInvestment, maxUses, validFrom, validTo, assetTypes, description
- Replaced "Inversión Mínima (CLP)" → "Inversión Mínima (USD)"
- Replaced `toLocaleDateString('es-CL')` → `toLocaleDateString('en-US')` for both validFrom and validTo display
- Updated subtitle "la plataforma" → "la plataforma 3GSP"
- `emptyForm` already initializes all fields as empty strings — no change needed
- Zero lint errors introduced in PromotionsView.tsx
- Dev server running normally (200 responses)

## Root Cause:
Line 304 error (`value prop on input should not be null`) was caused by `form.assetTypes` being null when editing a promotion whose `assetTypes` field was null from the database. The `openEdit` function passed `item.assetTypes` directly without null coalescing, and the Input component received null.

## Changes Made:
1. `openEdit()`: Added `?? ''` for string fields, `!= null ? String(...) : ''` for numeric fields
2. All Input/Textarea `value` props: Added `?? ''` as defensive fallback
3. Label: CLP → USD
4. Date locale: es-CL → en-US
5. Branding: "la plataforma" → "la plataforma 3GSP"
