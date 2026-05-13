import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { db } from '@/lib/db'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ValuationResponse {
  assetId: string
  estimatedValue: number
  currentPrice: number
  valuationGap: number
  valuationStatus: 'undervalued' | 'fair' | 'overvalued'
  analysis: string
  factors: {
    positive: string[]
    negative: string[]
    neutral: string[]
  }
  comparableMetrics: {
    yieldVsMarket: string
    pricePerSqm: number
    capRate: number
  }
}

// ─── GET /api/ai/valuation?assetId=xxx ──────────────────────────────────────

export async function GET(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const assetId = searchParams.get('assetId')

  if (!assetId) {
    return NextResponse.json({ error: 'assetId query parameter is required' }, { status: 400 })
  }

  try {
    // Fetch full asset data with financials
    const asset = await db.asset.findUnique({
      where: { id: assetId },
      include: {
        cashFlowProjections: { orderBy: { period: 'asc' } },
        investments: {
          select: { id: true, quantity: true, totalAmount: true, pricePerUnit: true, status: true },
        },
      },
    })

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Calculate derived metrics
    const occupancyRate =
      asset.leaseStatus === 'occupied'
        ? 95
        : asset.leaseStatus === 'partially_occupied'
          ? 60
          : 0

    const soldFractions = asset.investments
      .filter((inv) => inv.status === 'active' || inv.status === 'completed')
      .reduce((sum, inv) => sum + inv.quantity, 0)

    const avgPricePerFraction = soldFractions > 0
      ? asset.investments
          .filter((inv) => inv.status === 'active' || inv.status === 'completed')
          .reduce((sum, inv) => sum + inv.pricePerUnit * inv.quantity, 0) / soldFractions
      : asset.pricePerFraction

    const annualRent = asset.monthlyRent ? asset.monthlyRent * 12 : 0
    const pricePerSqm = asset.totalArea && asset.totalArea > 0
      ? Math.round(asset.totalValue / asset.totalArea)
      : 0

    const capRate = asset.totalValue > 0 && annualRent > 0
      ? Math.round((annualRent / asset.totalValue) * 10000) / 100
      : 0

    // Build complete financial context for LLM
    const financialContext = {
      assetName: asset.name,
      type: asset.type,
      status: asset.status,
      address: asset.address,
      city: asset.city,
      region: asset.region,
      country: asset.country,
      totalValue: asset.totalValue,
      pricePerFraction: asset.pricePerFraction,
      avgActualPricePerFraction: Math.round(avgPricePerFraction * 100) / 100,
      totalFractions: asset.totalFractions,
      availableFractions: asset.availableFractions,
      soldFractions,
      fundedPercentage: asset.fundedPercentage,
      annualYield: asset.annualYield,
      projectedAppreciation: asset.projectedAppreciation,
      totalProjectedReturn: asset.totalProjectedReturn,
      leaseStatus: asset.leaseStatus,
      leaseStart: asset.leaseStart,
      leaseEnd: asset.leaseEnd,
      monthlyRent: asset.monthlyRent,
      annualRent,
      tenantName: asset.tenantName,
      totalArea: asset.totalArea,
      units: asset.units,
      constructionYear: asset.constructionYear,
      landUse: asset.landUse,
      operationalCosts: asset.operationalCosts,
      operationalCostsPct: asset.operationalCostsPct,
      riskLevel: asset.riskLevel,
      riskDescription: asset.riskDescription,
      occupancyRate,
      pricePerSqm,
      capRate,
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

    const systemPrompt = `You are a real estate valuation AI. Based on the asset's financial data, location, type, and market conditions, estimate the fair market value and provide a detailed valuation analysis. Respond ONLY in valid JSON format, no markdown or extra text.

Your response must be a JSON object with this exact structure:
{
  "estimatedValue": 500000,
  "valuationStatus": "undervalued",
  "analysis": "A detailed paragraph explaining the valuation rationale, considering location, market conditions, property condition, income potential, and comparable metrics.",
  "factors": {
    "positive": ["Strong rental yield", "Prime location"],
    "negative": ["High operational costs", "Building age"],
    "neutral": ["Market average vacancy rate"]
  },
  "comparableMetrics": {
    "yieldVsMarket": "The 8.5% yield is above the market average of 6.2% for this property type",
    "pricePerSqm": 3200,
    "capRate": 7.5
  }
}

Rules:
- estimatedValue: fair market value estimate in USD (must be realistic based on the asset's totalValue, monthlyRent, and location)
- valuationStatus: exactly "undervalued", "fair", or "overvalued" based on comparing estimatedValue to the current totalValue
- analysis: 2-4 sentences with detailed valuation rationale in Spanish
- factors: each array should have 2-4 items, written in Spanish
- comparableMetrics.yieldVsMarket: a short comparison string in Spanish
- comparableMetrics.pricePerSqm: price per square meter in USD
- comparableMetrics.capRate: capitalization rate as a percentage number (e.g. 7.5)
- Consider construction year, lease terms, occupancy, location prestige, and cash flow projections
- Be realistic and conservative with estimates`

    const userPrompt = `Perform a valuation analysis for the following real estate asset:

${JSON.stringify(financialContext, null, 2)}

The current listed total value is $${asset.totalValue.toLocaleString()} USD.
The price per fraction is $${asset.pricePerFraction} USD.

Provide a comprehensive valuation. Respond only with the JSON object.`

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
        estimatedValue: number
        valuationStatus: string
        analysis: string
        factors: {
          positive: string[]
          negative: string[]
          neutral: string[]
        }
        comparableMetrics: {
          yieldVsMarket: string
          pricePerSqm: number
          capRate: number
        }
      }

      // Validate and sanitize
      const validStatuses = ['undervalued', 'fair', 'overvalued']
      const valuationStatus = validStatuses.includes(parsed.valuationStatus)
        ? parsed.valuationStatus
        : 'fair'

      const estimatedValue = typeof parsed.estimatedValue === 'number' && parsed.estimatedValue > 0
        ? Math.round(parsed.estimatedValue)
        : asset.totalValue

      const currentPrice = asset.totalValue
      const valuationGap = Math.round(((estimatedValue - currentPrice) / currentPrice) * 10000) / 100

      const responseData: ValuationResponse = {
        assetId,
        estimatedValue,
        currentPrice,
        valuationGap,
        valuationStatus,
        analysis: typeof parsed.analysis === 'string'
          ? parsed.analysis
          : 'Análisis de valoración no disponible.',
        factors: {
          positive: Array.isArray(parsed.factors?.positive)
            ? parsed.factors.positive.slice(0, 4)
            : [],
          negative: Array.isArray(parsed.factors?.negative)
            ? parsed.factors.negative.slice(0, 4)
            : [],
          neutral: Array.isArray(parsed.factors?.neutral)
            ? parsed.factors.neutral.slice(0, 4)
            : [],
        },
        comparableMetrics: {
          yieldVsMarket: typeof parsed.comparableMetrics?.yieldVsMarket === 'string'
            ? parsed.comparableMetrics.yieldVsMarket
            : `${asset.annualYield}% yield vs mercado`,
          pricePerSqm: typeof parsed.comparableMetrics?.pricePerSqm === 'number'
            ? parsed.comparableMetrics.pricePerSqm
            : pricePerSqm,
          capRate: typeof parsed.comparableMetrics?.capRate === 'number'
            ? parsed.comparableMetrics.capRate
            : capRate,
        },
      }

      return NextResponse.json(responseData)
    } catch (sdkErr) {
      console.error('Valuation LLM error:', sdkErr)

      // Fallback: generate basic valuation from asset data
      const fallbackStatus: ValuationResponse['valuationStatus'] =
        asset.annualYield >= 8 ? 'undervalued' : asset.annualYield >= 5 ? 'fair' : 'overvalued'

      const fallbackResponse: ValuationResponse = {
        assetId,
        estimatedValue: asset.totalValue,
        currentPrice: asset.totalValue,
        valuationGap: 0,
        valuationStatus: fallbackStatus,
        analysis: 'No se pudo generar el análisis de valoración con IA en este momento. Se muestran métricas base del activo.',
        factors: {
          positive: [`Rendimiento anual: ${asset.annualYield}%`],
          negative: ['Análisis IA no disponible'],
          neutral: [`Estatus del arriendo: ${asset.leaseStatus}`],
        },
        comparableMetrics: {
          yieldVsMarket: `Rendimiento del ${asset.annualYield}% anual`,
          pricePerSqm,
          capRate,
        },
      }

      return NextResponse.json(fallbackResponse)
    }
  } catch (err) {
    console.error('Valuation API error:', err)
    return NextResponse.json({ error: 'Failed to generate valuation' }, { status: 500 })
  }
}
