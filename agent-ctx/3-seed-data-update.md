---
Task ID: 3
Agent: Seed Data Update
Task: Update seed data to 1000 fractions model with USD values

Work Log:
- Changed all 6 existing assets to totalFractions: 1,000
- Converted all CLP monetary values to USD (÷926 CLP/USD rate)
- Recalculated pricePerFraction = totalValue / 1,000 for each asset
- Set minimumInvestment = pricePerFraction (buy 1 fraction minimum)
- Updated availableFractions to realistic 200-800 range (out of 1,000)
- Recalculated fundedPercentage based on new availableFractions
- Scaled down _count.investments proportionally (÷~8-10x)
- Converted monthlyRent from CLP to USD for all assets
- Converted all cashFlowProjection monetary values (grossIncome, operationalCost, netIncome) from CLP to USD
- Updated document fileSize values from CLP-scaled to realistic KB values
- Added Asset 7: Centro Logístico Bogotá Norte (Colombia) — last_mile_logistics, $1,500,000 USD, 14.5% yield
- Added Asset 8: Torre Residencial Margarita View (Venezuela) — real_estate, $800,000 USD, 18.2% yield
- Updated SEED_DASHBOARD_DATA: user balances, investments, transactions, dividends, liquidity pool all in USD
- Changed all transaction currency from 'CLP' to 'USD'
- Updated notification messages to reference USD amounts
- Updated liquidityPool totalAssets from 6 to 8

Files Modified:
- src/lib/seed-data.ts — Complete rewrite with 8 assets in USD 1000-fraction model
- worklog.md — Added Task ID 3 work log entry

Stage Summary:
- All 8 assets use the 1000-fraction model with pricePerFraction = totalValue / 1000
- All monetary values now in USD base currency
- 8 total assets: Chile (6), Colombia (1), Venezuela (1)
- Fraction price range: $800–$7,344 USD
- No lint errors introduced
