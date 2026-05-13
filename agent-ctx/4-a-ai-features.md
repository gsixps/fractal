---
Task ID: 4-a
Agent: AI Features Builder
Task: Build 3 AI-powered features using z-ai-web-dev-sdk

Work Log:
- Read worklog.md to understand full project history and architecture
- Studied existing chat endpoint (src/app/api/chat/route.ts) for SDK import pattern: `const ZAI = (await import('z-ai-web-dev-sdk')).default; const zai = await ZAI.create()`
- Studied existing investment-analysis endpoint for glm-4-plus model usage
- Learned VLM API from skill documentation: `zai.chat.completions.createVision()` with `image_url` content blocks
- Reviewed Prisma schema for all relevant models (User, Investment, Asset, KYCDocument, AuditLog, Referral)

**Feature 1: AI Investment Recommendation Engine** (`/api/recommendations`, GET)
- Auth-protected endpoint using requireAuth()
- Fetches user's current investments with asset details from Prisma
- Fetches all published assets with available fractions
- Filters out assets user already owns
- Builds rich user prompt with: portfolio summary, current investments (name, type, city, yield, risk), available assets (full details with slugs), budget context
- Uses glm-4-flash model with temperature 0.3 for consistent recommendations
- Parses JSON array response with assetId/slug, assetName, reason, score (0-100), matchType
- Validates recommendations against candidate assets, enriches with matching data
- 1-hour in-memory cache per user (Map with timestamp, auto-cleanup of expired entries)
- Robust fallback: rule-based scoring engine considering diversification, yield, growth, budget fit, geographic spread

**Feature 2: AI Fraud Detection System** (`/api/fraud/check`, POST)
- Auth-protected endpoint accepting { type: 'investment'|'referral'|'login', data: any }
- Fetches comprehensive user context: investments (last 10), referrals (last 10), account age, KYC status, balance
- Builds type-specific prompts:
  - Investment: amount vs average, recent frequency (7-day window), amount vs balance ratio
  - Referral: email pattern analysis, referral velocity (1-hour window), recent referral history
  - Login: IP/country/city, account age, last login timing
- Uses glm-4-flash with temperature 0.1 for deterministic analysis
- Parses JSON response: riskScore (0-100), riskLevel (low/medium/high/critical), factors, recommendation
- Auto-logs high-risk events (score >= 50) to AuditLog with sanitized request data
- Robust fallback: rule-based engine checking new account risk, investment frequency, email patterns, rapid referrals

**Feature 3: AI KYC Document Analysis** (`/api/kyc/analyze`, POST)
- Auth-protected endpoint accepting { documentType: 'id_front'|'id_back'|'selfie'|'address', imageUrl, documentData? }
- Uses z-ai-web-dev-sdk VLM (createVision) with image_url content blocks
- Type-specific analysis prompts with detailed criteria for each document type
- Parses JSON response: verified, confidence (0-100), extractedData, issues, recommendation (approve/review/reject)
- Automatically updates KYCDocument status in database (pending → verified/rejected)
- Creates AuditLog entry for every analysis
- Input validation: documentType whitelist, imageUrl string check
- Sensitive data redaction in audit logs (password, token, secret patterns)

**Lint Status:** `bun run lint` — 0 errors, 0 warnings

Stage Summary:
- 3 new API endpoints created, all using z-ai-web-dev-sdk
- All endpoints protected with requireAuth()
- All endpoints have both AI-powered analysis and rule-based fallbacks
- Recommendation engine includes 1-hour in-memory cache with auto-cleanup
- Fraud detection includes audit logging for high-risk events
- KYC analysis auto-updates document status in database
- Zero ESLint errors
