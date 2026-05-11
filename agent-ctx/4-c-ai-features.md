---
Task ID: 4-c
Agent: AI Features Builder
Task: Build 3 AI-powered features (Enhanced Chatbot, Predictions, Valuation)

Work Log:

## 1. Enhanced AI Chatbot with Portfolio Context (/api/chat)
- Modified src/app/api/chat/route.ts to import db and fetch user portfolio data
- Added `fetchUserPortfolio()` function that queries Investment, DividendPayment, and User tables
- Added `buildPortfolioSummary()` that formats portfolio data into a readable string
- Injected portfolio context into system prompt when user has active investments
- Implemented 4 slash commands:
  - `/portafolio` → Returns formatted portfolio summary with all investments
  - `/recomendar` → Sends portfolio to LLM for personalized recommendations
  - `/mercado` → Generates market overview via LLM
  - `/ayuda` → Returns static help text with available commands
- Commands use separate LLM calls with specific prompts for focused responses
- Normal chat still works with portfolio context injected for personalized advice
- Fallback responses for all commands when SDK is unavailable
- Preserved existing multi-turn conversation, language detection, error handling

## 2. AI Dividend & Return Predictions (/api/predictions)
- Created src/app/api/predictions/route.ts as GET endpoint
- Requires auth via requireAuth()
- Accepts ?assetId=xxx query parameter
- Fetches asset with cashFlowProjections and investments from Prisma
- Calculates derived metrics: occupancyRate, totalInvestors, totalFractionsSold
- Uses z-ai-web-dev-sdk (glm-4-flash) for LLM predictions
- System prompt requests JSON response with: predictions array (4 quarters), overallOutlook, riskFactors
- Each prediction includes: quarter, expectedDividendPerFraction, expectedYield, confidence, factors
- Parses JSON from LLM response (handles markdown code blocks)
- Validates and sanitizes all numeric values (clamped ranges)
- In-memory cache with 24h TTL per assetId using Map
- Fallback generates baseline predictions from asset financial data when SDK unavailable
- Returns structured JSON: { assetId, predictions, overallOutlook, riskFactors }

## 3. AI Asset Valuation (/api/ai/valuation)
- Created src/app/api/ai/valuation/route.ts as GET endpoint
- Requires admin auth via requireAdmin()
- Accepts ?assetId=xxx query parameter
- Fetches asset with cashFlowProjections and investments
- Calculates derived metrics: occupancyRate, soldFractions, avgPricePerFraction, annualRent, pricePerSqm, capRate
- Uses z-ai-web-dev-sdk (glm-4-flash) for valuation analysis
- System prompt requests JSON response with: estimatedValue, valuationStatus, analysis, factors, comparableMetrics
- Parses JSON response (handles markdown code blocks)
- Validates valuationStatus against allowed values
- Calculates valuationGap as percentage difference from current totalValue
- Fallback returns baseline metrics when SDK unavailable
- Returns structured JSON: { assetId, estimatedValue, currentPrice, valuationGap, valuationStatus, analysis, factors, comparableMetrics }

Lint: bun run lint — 0 errors, 0 warnings

Stage Summary:
- Enhanced chat API with portfolio context injection and 4 slash commands
- New endpoint: GET /api/predictions?assetId=xxx (auth required, 24h cache)
- New endpoint: GET /api/ai/valuation?assetId=xxx (admin auth required)
- All endpoints use z-ai-web-dev-sdk with proper fallback handling
- All endpoints validate and sanitize LLM JSON responses
- ESLint passes with zero errors
