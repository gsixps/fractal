---
Task ID: 4
Agent: KYC Gating + Global Markets
Task: Add KYC document gating and global country filter

Work Log:
- Modified AssetDetailPage.tsx with KYC gating for documents section
  - Added LogIn, ShieldCheck, Lock icon imports
  - Added user state extraction from useAppStore
  - Three-state gating: not logged in -> login prompt; logged in but unverified -> KYC prompt; verified -> show documents
  - Lock icon shown on section title when documents are gated
- Added country filter to MarketplacePage.tsx
  - Added Globe icon and Separator imports
  - Added COUNTRIES constant with flag emojis for Chile, Colombia, Venezuela, USA
  - Added COUNTRY_FLAGS lookup map for asset card display
  - Added countryFilter state with filtering logic in sorted useMemo
  - Added country filter pills in desktop filter bar with vertical separator
  - Added country filter section in mobile filter sheet
  - Added country flag emoji next to location on each asset card

Files Modified:
- src/components/gsp/asset/AssetDetailPage.tsx
- src/components/gsp/marketplace/MarketplacePage.tsx

Stage Summary:
- Documents only visible to verified KYC users (with login/KYC prompt UI for others)
- Country filter added: Chile, Colombia, Venezuela, USA with flag emojis
- No lint errors introduced by changes
