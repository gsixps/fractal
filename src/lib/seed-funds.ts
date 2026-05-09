import { db } from '@/lib/db'

export const SEED_FUNDS = [
  {
    id: 'fund_core_reit',
    name: '3GSP Core REIT',
    slug: '3gsp-core-reit',
    description: 'Fondo diversificado de inversión inmobiliaria con exposición a múltiples sectores: logística, residencial, industrial y tecnológico. Ideal para inversores que buscan diversificación automática.',
    status: 'active',
    initialNavPerShare: 10.00,
    navPerShare: 12.47,
    totalShares: 100000,
    availableShares: 62500,
    pricePerShare: 12.47,
    totalAUM: 1247350,
    expenseRatio: 0.50,
    dividendYield: 8.2,
    totalReturn1Y: 14.8,
    totalReturnSinceInception: 24.7,
    fundType: 'mixed',
    riskLevel: 'medium',
    rebalanceFrequency: 'quarterly',
    minInvestment: 500,
    maxInvestmentPerUser: 100000,
    inceptionDate: new Date('2024-01-15'),
    dividendFrequency: 'quarterly',
    fundManager: '3GSP Capital Management',
    badge: 'Diversificado',
    highlights: JSON.stringify([
      'Diversificación automática en 6+ propiedades',
      'Rebalanceo trimestral para mantener pesos objetivo',
      'Yield de 8.2% con potencial de apreciación',
      'Gestión profesional del portafolio',
      'Expense ratio de solo 0.50% anual',
      'Liquidez disponible en 48 horas',
    ]),
  },
  {
    id: 'fund_datacenter',
    name: '3GSP Data Center Fund',
    slug: '3gsp-datacenter-fund',
    description: 'Fondo especializado en infraestructura de centros de datos y tecnología. Expone al inversor a la tendencia de crecimiento de la nube, IA y computación de alto rendimiento en Latinoamérica.',
    status: 'active',
    initialNavPerShare: 25.00,
    navPerShare: 29.85,
    totalShares: 40000,
    availableShares: 28000,
    pricePerShare: 29.85,
    totalAUM: 1194000,
    expenseRatio: 0.75,
    dividendYield: 11.4,
    totalReturn1Y: 19.4,
    totalReturnSinceInception: 19.4,
    fundType: 'datacenter',
    riskLevel: 'medium-high',
    rebalanceFrequency: 'quarterly',
    minInvestment: 1000,
    maxInvestmentPerUser: 200000,
    inceptionDate: new Date('2024-06-01'),
    dividendFrequency: 'quarterly',
    fundManager: '3GSP Tech Real Estate',
    badge: 'Tech Infra',
    highlights: JSON.stringify([
      '100% exposición a data centers e infraestructura tech',
      'Contratos de arriendo a largo plazo (5-10 años)',
      'Yield de 11.4% — el más alto de nuestros fondos',
      'Beneficio de la tendencia de IA y cloud computing',
      'Tier II+ certificado en todas las propiedades',
      'Rebalanceo trimestral con análisis de capacidad',
    ]),
  },
  {
    id: 'fund_income',
    name: '3GSP Income Fund',
    slug: '3gsp-income-fund',
    description: 'Fondo enfocado en generar renta mensual consistente a través de propiedades con arrendamiento activo y alto yield. Distribuye dividendos mensuales, ideal para inversores conservadores.',
    status: 'active',
    initialNavPerShare: 50.00,
    navPerShare: 53.20,
    totalShares: 20000,
    availableShares: 15000,
    pricePerShare: 53.20,
    totalAUM: 1064000,
    expenseRatio: 0.45,
    dividendYield: 10.8,
    totalReturn1Y: 8.6,
    totalReturnSinceInception: 6.4,
    fundType: 'income',
    riskLevel: 'low-medium',
    rebalanceFrequency: 'semiannual',
    minInvestment: 2500,
    maxInvestmentPerUser: 500000,
    inceptionDate: new Date('2024-03-01'),
    dividendFrequency: 'monthly',
    fundManager: '3GSP Income Management',
    badge: 'Renta Mensual',
    highlights: JSON.stringify([
      'Distribución mensual de dividendos',
      'Solo propiedades con arriendo activo verificado',
      'Yield de 10.8% anual — income predecible',
      'Risk level conservador — baja volatilidad',
      'Rebalanceo semestral para estabilidad',
      'Ideal para flujos de caja regulares',
    ]),
  },
]

// Holdings reference assets by name (resolved to DB IDs at seed time)
export const SEED_FUND_HOLDINGS_RAW = [
  // Core REIT holdings
  { fundId: 'fund_core_reit', assetName: 'Centro Logístico Santiago Norte', targetWeightPct: 25, currentWeightPct: 27.3, fractionCount: 116, valueUsd: 340824, averageBuyPrice: 2580, totalCostBasis: 299280, unrealizedPL: 41544 },
  { fundId: 'fund_core_reit', assetName: 'Micro Data Center Valparaíso', targetWeightPct: 15, currentWeightPct: 13.2, fractionCount: 44, valueUsd: 164756, averageBuyPrice: 3450, totalCostBasis: 151800, unrealizedPL: 12956 },
  { fundId: 'fund_core_reit', assetName: 'Residencial Providencia Sky', targetWeightPct: 20, currentWeightPct: 21.8, fractionCount: 74, valueUsd: 271872, averageBuyPrice: 3450, totalCostBasis: 255300, unrealizedPL: 16572 },
  { fundId: 'fund_core_reit', assetName: 'Parque Solar Atacama III', targetWeightPct: 15, currentWeightPct: 16.4, fractionCount: 14, valueUsd: 204504, averageBuyPrice: 13400, totalCostBasis: 187600, unrealizedPL: 16904 },
  { fundId: 'fund_core_reit', assetName: 'Bodega E-Commerce Maipú Hub', targetWeightPct: 15, currentWeightPct: 14.2, fractionCount: 56, valueUsd: 177096, averageBuyPrice: 3050, totalCostBasis: 170800, unrealizedPL: 6296 },
  { fundId: 'fund_core_reit', assetName: 'Centro Logístico Bogotá Norte', targetWeightPct: 10, currentWeightPct: 7.1, fractionCount: 18, valueUsd: 88298, averageBuyPrice: 4650, totalCostBasis: 83700, unrealizedPL: 4598 },

  // Data Center Fund holdings
  { fundId: 'fund_datacenter', assetName: 'Micro Data Center Valparaíso', targetWeightPct: 45, currentWeightPct: 48.6, fractionCount: 130, valueUsd: 486870, averageBuyPrice: 3550, totalCostBasis: 461500, unrealizedPL: 25370 },
  { fundId: 'fund_datacenter', assetName: 'Parque Solar Atacama III', targetWeightPct: 25, currentWeightPct: 24.8, fractionCount: 22, valueUsd: 307920, averageBuyPrice: 13200, totalCostBasis: 290400, unrealizedPL: 17520 },
  { fundId: 'fund_datacenter', assetName: 'Complejo Minero Atacama Norte', targetWeightPct: 30, currentWeightPct: 26.6, fractionCount: 12, valueUsd: 399210, averageBuyPrice: 31600, totalCostBasis: 379200, unrealizedPL: 20010 },

  // Income Fund holdings
  { fundId: 'fund_income', assetName: 'Centro Logístico Santiago Norte', targetWeightPct: 30, currentWeightPct: 31.5, fractionCount: 120, valueUsd: 352680, averageBuyPrice: 2720, totalCostBasis: 326400, unrealizedPL: 26280 },
  { fundId: 'fund_income', assetName: 'Residencial Providencia Sky', targetWeightPct: 25, currentWeightPct: 26.3, fractionCount: 82, valueUsd: 294432, averageBuyPrice: 3400, totalCostBasis: 278800, unrealizedPL: 15632 },
  { fundId: 'fund_income', assetName: 'Torre Residencial Margarita View', targetWeightPct: 25, currentWeightPct: 23.8, fractionCount: 108, valueUsd: 257256, averageBuyPrice: 2220, totalCostBasis: 239760, unrealizedPL: 17496 },
  { fundId: 'fund_income', assetName: 'Bodega E-Commerce Maipú Hub', targetWeightPct: 20, currentWeightPct: 18.4, fractionCount: 72, valueUsd: 199632, averageBuyPrice: 2650, totalCostBasis: 190800, unrealizedPL: 8832 },
]

export async function seedFunds() {
  console.log('[SEED] Seeding ETF funds...')
  
  // Seed funds (upsert by id)
  for (const fund of SEED_FUNDS) {
    await db.fund.upsert({
      where: { id: fund.id },
      update: fund,
      create: fund,
    })
  }
  
  // Resolve asset names to DB IDs
  const assets = await db.asset.findMany({ select: { id: true, name: true } })
  const nameToId = new Map(assets.map(a => [a.name, a.id]))
  
  // Seed holdings (delete and recreate)
  await db.fundHolding.deleteMany({})
  for (const raw of SEED_FUND_HOLDINGS_RAW) {
    const assetId = nameToId.get(raw.assetName)
    if (!assetId) {
      console.warn(`[SEED] Asset not found: ${raw.assetName}, skipping holding`)
      continue
    }
    const { assetName: _, ...holding } = raw
    await db.fundHolding.create({ data: { ...holding, assetId } })
  }
  
  // Create initial NAV history entries (last 30 days)
  const funds = await db.fund.findMany({ where: { status: 'active' } })
  for (const fund of funds) {
    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
      const date = new Date()
      date.setDate(date.getDate() - daysAgo)
      date.setHours(0, 0, 0, 0)
      
      // Generate slightly randomized NAV based on initial
      const randomFactor = 1 + (Math.random() - 0.48) * 0.008 * (30 - daysAgo) / 30
      const nav = Math.round(fund.initialNavPerShare * randomFactor * 100) / 100
      const aum = Math.round(nav * fund.totalShares * 100) / 100
      
      try {
        await db.nAVHistory.create({
          data: {
            fundId: fund.id,
            navPerShare: nav,
            totalAUM: aum,
            totalShares: fund.totalShares,
            date,
          },
        })
      } catch {
        // Ignore unique constraint violations
      }
    }
  }
  
  console.log(`[SEED] ✅ Seeded ${SEED_FUNDS.length} funds with holdings and NAV history`)
  return { fundsSeeded: SEED_FUNDS.length, holdingsSeeded: SEED_FUND_HOLDINGS_RAW.length }
}
