---
Task ID: 7-a
Agent: AI UI Components Builder
Task: Add UI components for new AI features in the frontend (Insights Panel, Recommendations, Predictions Card)

Work Log:
- Read worklog.md and existing components (DashboardPage, MarketplacePage, AssetDetailPage) to understand styling patterns
- Verified all 3 AI API endpoints already exist with their response schemas:
  - /api/insights: returns { insights: [{ type, title, message, metric?, metricValue?, priority }] }
  - /api/recommendations: returns { recommendations: [{ assetId, assetName, reason, score, matchType }] }
  - /api/predictions?assetId=xxx: returns { assetId, predictions: [{ quarter, expectedDividendPerFraction, expectedYield, confidence, factors }], overallOutlook, riskFactors }

Created 3 new components:

1. src/components/gsp/dashboard/AIInsightsPanel.tsx
   - 'use client' component that fetches from /api/insights on mount
   - Displays insights as cards in 2-column grid (stack on mobile)
   - Each card: icon based on type (TrendingUp, PieChart, DollarSign, Lightbulb, AlertTriangle), title, message, priority badge (high=red, medium=amber, low=green), optional metric display
   - Header with Sparkles icon and "IA Insights" title
   - "Refresh insights" button with RefreshCw icon
   - Loading skeleton state, error state with retry button
   - Responsive: 1 col mobile, 2 cols desktop

2. src/components/gsp/marketplace/AIRecommendations.tsx
   - 'use client' component that fetches from /api/recommendations when user is authenticated
   - Horizontal scrollable card row at top of marketplace (before regular grid)
   - Each recommendation card: asset name, match type badge, score with star icon, match reason text, "Invertir" button
   - "Recomendado por IA" header with Sparkles icon
   - Only visible when user is logged in (checks store user !== null)
   - Loading skeleton, error state with retry, empty state (returns null)

3. src/components/gsp/asset/AIPredictionsCard.tsx
   - 'use client' component accepting assetId prop, fetches from /api/predictions?assetId={assetId}
   - Card with Brain icon header "Predicción IA de Dividendos"
   - Overall outlook badge (bullish=green/Alcista, neutral=amber/Neutral, bearish=red/Bajista)
   - Table of quarterly predictions: quarter, expected dividend, yield, confidence bar (color-coded)
   - Risk factors list with amber bullet points
   - Disclaimer text in muted info box
   - Loading skeleton, error state with retry

Integrated into existing pages:
- DashboardPage.tsx: imported AIInsightsPanel, placed after stats section (line ~389)
- MarketplacePage.tsx: imported AIRecommendations, placed before results grid (line ~308)
- AssetDetailPage.tsx: imported AIPredictionsCard, placed in financials area after cash flow section (line ~286)

ESLint: bun run lint passes with 0 errors, 0 warnings

Stage Summary:
- 3 new AI UI components created with full loading/error/empty states
- All components use project design system (gsp-card-hover, emerald theme, shadcn/ui)
- Responsive design: mobile-first with appropriate breakpoints
- Consistent with existing component patterns (badge styles, card styles, typography)
- Zero lint errors
