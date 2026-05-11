import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

// In-memory cache: userId -> { insights, expiresAt }
const insightsCache = new Map<string, { insights: unknown; expiresAt: number }>()
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

const SYSTEM_PROMPT = `You are a financial insights AI for 3GSP, a fractional real estate platform. Analyze the user's portfolio data and generate 4-5 actionable insights in Spanish. Include performance summary, diversification analysis, upcoming dividends, and recommendations. Be specific with numbers.

You MUST respond ONLY with a valid JSON object in this exact format, no extra text:
{
  "insights": [
    {
      "type": "performance|diversification|dividend|recommendation|alert",
      "title": "Short title in Spanish",
      "message": "Detailed insight message in Spanish with specific numbers",
      "metric": "Optional metric label like 'Rendimiento Total'",
      "metricValue": "Optional metric display value like '+12.5%'",
      "priority": "high|medium|low"
    }
  ]
}

Generate exactly 4-5 insights covering these aspects:
1. Portfolio performance (current value vs invested, returns)
2. Diversification analysis (asset types, concentration)
3. Dividend/revenue insights (dividends received, projections)
4. Recommendations (what to do next, opportunities)
5. Alerts (any risks, underperforming assets, or important notices)

Types must be exactly: "performance", "diversification", "dividend", "recommendation", or "alert"
Priority must be exactly: "high", "medium", or "low"`

export async function GET() {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const userId = session!.user.id

    // Check cache first
    const cached = insightsCache.get(userId)
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.insights)
    }

    // Fetch user's portfolio data in parallel
    const [user, investments, dividendPayments, transactions] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { name: true, totalInvested: true, totalEarnings: true, riskProfile: true, createdAt: true },
      }),
      db.investment.findMany({
        where: { userId, status: { in: ['active', 'completed'] } },
        include: {
          asset: {
            select: {
              name: true,
              type: true,
              city: true,
              country: true,
              annualYield: true,
              pricePerFraction: true,
              status: true,
              fundedPercentage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.dividendPayment.findMany({
        where: { userId },
        select: { amount: true, status: true, paymentDate: true, periodStart: true, periodEnd: true, fractions: true, perFraction: true },
        orderBy: { paymentDate: 'desc' },
        take: 20,
      }),
      db.transaction.findMany({
        where: { userId },
        select: { type: true, amount: true, status: true, createdAt: true, description: true },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
    ])

    // Aggregate totals
    const activeInvestments = investments.filter((inv) => inv.status === 'active')
    const totalInvested = investments.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const currentValue = activeInvestments.reduce(
      (sum, inv) => sum + inv.quantity * inv.asset.pricePerFraction,
      0
    )
    const paidDividends = dividendPayments
      .filter((d) => d.status === 'paid')
      .reduce((sum, d) => sum + d.amount, 0)
    const pendingDividends = dividendPayments
      .filter((d) => d.status === 'pending')
      .reduce((sum, d) => sum + d.amount, 0)
    const totalReturn = currentValue + paidDividends - totalInvested
    const roiPercent = totalInvested > 0 ? ((totalReturn / totalInvested) * 100).toFixed(2) : '0'

    // Build investment list for prompt
    const investmentList = investments.map((inv) => ({
      assetName: inv.asset.name,
      assetType: inv.asset.type,
      city: inv.asset.city,
      country: inv.asset.country,
      annualYield: inv.asset.annualYield,
      fractions: inv.quantity,
      investedAmount: inv.totalAmount,
      currentValue: inv.quantity * inv.asset.pricePerFraction,
      gainLoss: inv.quantity * inv.asset.pricePerFraction - inv.totalAmount,
      status: inv.status,
    }))

    // Portfolio composition by asset type
    const compositionByType: Record<string, { count: number; invested: number; value: number }> = {}
    for (const inv of investments) {
      const t = inv.asset.type
      if (!compositionByType[t]) compositionByType[t] = { count: 0, invested: 0, value: 0 }
      compositionByType[t].count++
      compositionByType[t].invested += inv.totalAmount
      compositionByType[t].value += inv.quantity * inv.asset.pricePerFraction
    }

    // Recent transaction summary
    const recentTxSummary = transactions.slice(0, 10).map((tx) => ({
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      date: tx.createdAt.toISOString().split('T')[0],
      description: tx.description,
    }))

    const userPrompt = `Analiza el portafolio del usuario y genera insights en español.

Datos del usuario:
- Nombre: ${user?.name || 'Inversor'}
- Perfil de riesgo: ${user?.riskProfile || 'no definido'}
- Miembro desde: ${user?.createdAt?.toISOString().split('T')[0] || 'N/A'}

Resumen del portafolio:
- Total invertido: USD $${totalInvested.toFixed(2)}
- Valor actual: USD $${currentValue.toFixed(2)}
- Dividendos cobrados: USD $${paidDividends.toFixed(2)}
- Dividendos pendientes: USD $${pendingDividends.toFixed(2)}
- Retorno total: USD $${totalReturn.toFixed(2)}
- ROI: ${roiPercent}%
- Inversiones activas: ${activeInvestments.length}
- Total de inversiones: ${investments.length}

Inversiones detalladas:
${JSON.stringify(investmentList, null, 2)}

Composición por tipo de activo:
${JSON.stringify(compositionByType, null, 2)}

Historial de dividendos (últimos 20):
${JSON.stringify(
  dividendPayments.map((d) => ({
    amount: d.amount,
    status: d.status,
    date: d.paymentDate?.toISOString().split('T')[0] || 'pendiente',
    fractions: d.fractions,
    perFraction: d.perFraction,
  })),
  null,
  2
)}

Transacciones recientes:
${JSON.stringify(recentTxSummary, null, 2)}

Genera exactamente 4-5 insights en español. Sé específico con los números del portafolio. Responde SOLO con el JSON, sin texto adicional.`

    let insights = null

    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const completion = await zai.chat.completions.create({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      })

      const reply = completion?.choices?.[0]?.message?.content || ''

      // Parse JSON from response - handle potential markdown wrapping
      const jsonMatch = reply.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0])
      }
    } catch (sdkErr) {
      console.error('z-ai-web-dev-sdk error in insights:', sdkErr)
    }

    // Fallback insights if SDK fails or parsing fails
    if (!insights || !insights.insights || !Array.isArray(insights.insights)) {
      insights = generateFallbackInsights({
        totalInvested,
        currentValue,
        paidDividends,
        totalReturn,
        roiPercent,
        activeInvestments: activeInvestments.length,
        compositionByType,
      })
    }

    // Cache the result
    insightsCache.set(userId, {
      insights,
      expiresAt: Date.now() + CACHE_TTL_MS,
    })

    return NextResponse.json(insights)
  } catch (err) {
    console.error('Insights API error:', err)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}

function generateFallbackInsights(data: {
  totalInvested: number
  currentValue: number
  paidDividends: number
  totalReturn: number
  roiPercent: string
  activeInvestments: number
  compositionByType: Record<string, { count: number; invested: number; value: number }>
}) {
  const isPositive = data.totalReturn >= 0
  const types = Object.keys(data.compositionByType)
  const isDiversified = types.length >= 3

  return {
    insights: [
      {
        type: 'performance',
        title: 'Rendimiento del Portafolio',
        message: `Tu portafolio tiene un valor actual de USD $${data.currentValue.toFixed(2)} sobre una inversión total de USD $${data.totalInvested.toFixed(2)}, representando un retorno ${isPositive ? 'positivo' : 'negativo'} de USD $${data.totalReturn.toFixed(2)} (${data.roiPercent}% ROI).`,
        metric: 'ROI Total',
        metricValue: `${isPositive ? '+' : ''}${data.roiPercent}%`,
        priority: isPositive ? 'medium' : 'high',
      },
      {
        type: 'diversification',
        title: isDiversified ? 'Buena Diversificación' : 'Oportunidad de Diversificación',
        message: isDiversified
          ? `Tu portafolio está diversificado en ${types.length} tipos de activo: ${types.join(', ')}. Esto reduce el riesgo de concentración.`
          : `Tu portafolio se concentra en ${types.length > 0 ? types[0] : 'un solo tipo'} de activo. Considera diversificar en ${types.length === 0 ? 'departamentos, oficinas o retail' : 'otros tipos de activos'} para reducir el riesgo.`,
        metric: 'Tipos de Activo',
        metricValue: `${types.length}`,
        priority: isDiversified ? 'low' : 'medium',
      },
      {
        type: 'dividend',
        title: 'Ingresos por Dividendos',
        message: `Has recibido USD $${data.paidDividends.toFixed(2)} en dividendos de tus ${data.activeInvestments} inversiones activas. ${data.activeInvestments > 0 ? 'Los dividendos se distribuyen según el rendimiento de cada activo.' : 'Activa inversiones para empezar a recibir dividendos.'}`,
        metric: 'Dividendos Cobrados',
        metricValue: `$${data.paidDividends.toFixed(2)}`,
        priority: 'medium',
      },
      {
        type: 'recommendation',
        title: 'Próximo Paso',
        message: data.activeInvestments === 0
          ? 'Aún no tienes inversiones activas. Explora el marketplace para encontrar activos que se alineen con tu perfil de riesgo y objetivos financieros.'
          : 'Revisa las nuevas oportunidades en el marketplace. Activos con alto porcentaje de financiamiento pueden ofrecer rendimiento próximo, mientras que nuevos activos pueden ofrecer entrada a precios más bajos.',
        priority: 'medium',
      },
      {
        type: 'alert',
        title: 'Recordatorio de Portafolio',
        message: 'Revisa periódicamente el rendimiento de tus inversiones y considera rebalancear tu portafolio si la concentración en un solo activo supera el 40% de tu inversión total.',
        priority: 'low',
      },
    ],
  }
}
