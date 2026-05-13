import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { db } from '@/lib/db'

// ─── In-memory prediction cache (24h TTL) ───────────────────────────────────

interface CachedPrediction {
  data: PredictionResponse
  expiresAt: number
}

const predictionCache = new Map<string, CachedPrediction>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// ─── Types ───────────────────────────────────────────────────────────────────

interface PredictionResponse {
  assetId: string
  predictions: {
    quarter: string
    expectedDividendPerFraction: number
    expectedYield: number
    confidence: number
    factors: string[]
  }[]
  overallOutlook: 'bullish' | 'neutral' | 'bearish'
  riskFactors: string[]
}

// ─── Generate quarter labels for next 4 quarters ────────────────────────────

function getNextQuarters(): string[] {
  const quarters: string[] = []
  const now = new Date()
  const currentQ = Math.floor(now.getMonth() / 3) + 1
  const currentYear = now.getFullYear()

  for (let i = 0; i < 4; i++) {
    const q = ((currentQ - 1 + i) % 4) + 1
    const year = currentYear + Math.floor((currentQ - 1 + i) / 4)
    quarters.push(`Q${q} ${year}`)
  }
  return quarters
}

// ─── GET /api/predictions?assetId=xxx ──────────────────────────────────────

export async function GET(request: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const assetId = searchParams.get('assetId')

  if (!assetId) {
    return NextResponse.json({ error: 'assetId query parameter is required' }, { status: 400 })
  }

  // Check cache
  const cached = predictionCache.get(assetId)
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data)
  }

  try {
    // Fetch asset with all relevant financial data
    const asset = await db.asset.findUnique({
      where: { id: assetId },
      include: {
        cashFlowProjections: { orderBy: { period: 'asc' } },
        investments: { select: { id: true, quantity: true, totalAmount: true, status: true } },
      },
    })

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Calculate occupancy proxy from lease status
    const occupancyRate =
      asset.leaseStatus === 'occupied' ? 95 : asset.leaseStatus === 'partially_occupied' ? 60 : 0

    // Build financial context for LLM
    const financialContext = {
      assetName: asset.name,
      type: asset.type,
      status: asset.status,
      city: asset.city,
      region: asset.region,
      country: asset.country,
      totalValue: asset.totalValue,
      pricePerFraction: asset.pricePerFraction,
      totalFractions: asset.totalFractions,
      availableFractions: asset.availableFractions,
      fundedPercentage: asset.fundedPercentage,
      annualYield: asset.annualYield,
      projectedAppreciation: asset.projectedAppreciation,
      totalProjectedReturn: asset.totalProjectedReturn,
      leaseStatus: asset.leaseStatus,
      leaseStart: asset.leaseStart,
      leaseEnd: asset.leaseEnd,
      monthlyRent: asset.monthlyRent,
      tenantName: asset.tenantName,
      totalArea: asset.totalArea,
      constructionYear: asset.constructionYear,
      operationalCosts: asset.operationalCosts,
      operationalCostsPct: asset.operationalCostsPct,
      riskLevel: asset.riskLevel,
      dividendFrequency: asset.dividendFrequency,
      occupancyRate,
      totalInvestors: asset.investments.filter((inv) => inv.status === 'active' || inv.status === 'completed').length,
      totalFractionsSold: asset.investments
        .filter((inv) => inv.status === 'active' || inv.status === 'completed')
        .reduce((sum, inv) => sum + inv.quantity, 0),
      cashFlowProjections: asset.cashFlowProjections.map((cf) => ({
        period: cf.period,
        periodType: cf.periodType,
        grossIncome: cf.grossIncome,
        operationalCost: cf.operationalCost,
        netIncome: cf.netIncome,
        appreciation: cf.appreciation,
        totalReturn: cf.totalReturn,
        cumulativeReturn: cf.cumulativeReturn,
      })),
    }

    const quarters = getNextQuarters()

    const systemPrompt = `You are a financial prediction AI for 3GSP, a fractional real estate platform. Based on the asset's historical data and projections, generate dividend predictions and return forecasts for the next 4 quarters. Include confidence levels. Respond ONLY in valid JSON format, no markdown or extra text.

Your response must be a JSON object with this exact structure:
{
  "predictions": [
    {
      "quarter": "Q1 2025",
      "expectedDividendPerFraction": 1.25,
      "expectedYield": 0.85,
      "confidence": 0.75,
      "factors": ["Strong lease agreement", "High occupancy rate"]
    }
  ],
  "overallOutlook": "bullish",
  "riskFactors": ["Market volatility", "Interest rate changes"]
}

Rules:
- expectedDividendPerFraction: estimated dividend per fraction in USD for that quarter (realistic based on monthlyRent / totalFractions / 3)
- expectedYield: quarterly yield as a decimal (e.g. 0.85 means 0.85% per quarter)
- confidence: 0 to 1 scale for prediction certainty
- overallOutlook: must be exactly "bullish", "neutral", or "bearish"
- factors: 2-4 bullet points explaining the prediction
- riskFactors: 2-4 items that could affect predictions
- Use the cash flow projections data as the primary input for your forecasts
- Consider lease status, occupancy, and market conditions`

    const userPrompt = `Generate dividend and return predictions for the next 4 quarters (${quarters.join(', ')}) for the following asset:

${JSON.stringify(financialContext, null, 2)}

Provide realistic predictions based on the financial data. Respond only with the JSON object.`

    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const completion = await zai.chat.completions.create({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      })

      const rawReply = completion?.choices?.[0]?.message?.content?.trim() || ''

      // Parse JSON from the response (handle potential markdown code blocks)
      let jsonStr = rawReply
      const jsonMatch = rawReply.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim()
      }

      const parsed = JSON.parse(jsonStr) as {
        predictions: PredictionResponse['predictions']
        overallOutlook: PredictionResponse['overallOutlook']
        riskFactors: string[]
      }

      // Validate and sanitize
      const validOutlooks = ['bullish', 'neutral', 'bearish']
      const overallOutlook = validOutlooks.includes(parsed.overallOutlook)
        ? parsed.overallOutlook
        : 'neutral'

      const predictions = (parsed.predictions || []).slice(0, 4).map((p, i) => ({
        quarter: p.quarter || quarters[i],
        expectedDividendPerFraction: typeof p.expectedDividendPerFraction === 'number'
          ? Math.round(p.expectedDividendPerFraction * 100) / 100
          : 0,
        expectedYield: typeof p.expectedYield === 'number'
          ? Math.round(p.expectedYield * 100) / 100
          : 0,
        confidence: typeof p.confidence === 'number'
          ? Math.min(1, Math.max(0, p.confidence))
          : 0.5,
        factors: Array.isArray(p.factors) ? p.factors.slice(0, 4) : [],
      }))

      const riskFactors = Array.isArray(parsed.riskFactors)
        ? parsed.riskFactors.slice(0, 4)
        : ['Market conditions may vary']

      const responseData: PredictionResponse = {
        assetId,
        predictions,
        overallOutlook,
        riskFactors,
      }

      // Cache the result
      predictionCache.set(assetId, {
        data: responseData,
        expiresAt: Date.now() + CACHE_TTL_MS,
      })

      return NextResponse.json(responseData)
    } catch (sdkErr) {
      console.error('Prediction LLM error:', sdkErr)

      // Fallback: generate basic predictions from asset data
      const dividendPerFraction = asset.monthlyRent
        ? (asset.monthlyRent * 3) / asset.totalFractions
        : (asset.annualYield / 100 * asset.pricePerFraction) / 4

      const fallbackResponse: PredictionResponse = {
        assetId,
        predictions: quarters.map((q) => ({
          quarter: q,
          expectedDividendPerFraction: Math.round(dividendPerFraction * 100) / 100,
          expectedYield: Math.round((asset.annualYield / 4) * 100) / 100,
          confidence: 0.4,
          factors: ['Based on current asset data', 'AI prediction unavailable — using baseline estimates'],
        })),
        overallOutlook: asset.annualYield >= 8 ? 'bullish' : asset.annualYield >= 5 ? 'neutral' : 'bearish',
        riskFactors: ['AI analysis temporarily unavailable', 'Market conditions subject to change'],
      }

      // Cache fallback too
      predictionCache.set(assetId, {
        data: fallbackResponse,
        expiresAt: Date.now() + CACHE_TTL_MS,
      })

      return NextResponse.json(fallbackResponse)
    }
  } catch (err) {
    console.error('Predictions API error:', err)
    return NextResponse.json({ error: 'Failed to generate predictions' }, { status: 500 })
  }
}
