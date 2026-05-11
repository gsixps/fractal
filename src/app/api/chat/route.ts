import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { db } from '@/lib/db'

const BASE_SYSTEM_PROMPT = `You are GALAXY AI Assistant, a helpful chatbot for a fractional real estate investment platform called 3GSP by GALAXY LLC. Help users with questions about investing, the platform, assets, KYC, payments, and general real estate topics. Be professional but friendly. Respond in the same language the user writes in (Spanish or English). Keep responses concise.

Key platform information:
- 3GSP allows fractional real estate investment starting from small amounts
- Users can buy fractions of premium properties
- Returns come from rental income (dividends) and property appreciation
- KYC verification is required before investing
- Payments are processed securely via Stripe
- Users can view their portfolio, track dividends, and request withdrawals on the dashboard
- The platform supports both Spanish and English
- GALAXY LLC is the company behind 3GSP

If asked about specific investment advice, always remind the user that this is informational only and not financial advice.`

const COMMANDS_HELP = `🤖 **Comandos disponibles:**

• **/portafolio** — Resumen de tu portafolio de inversiones actual
• **/recomendar** — Sugerencias de activos basadas en tu portafolio
• **/mercado** — Resumen general del mercado inmobiliario
• **/ayuda** — Muestra esta lista de comandos

También puedes escribir cualquier pregunta sobre la plataforma, inversiones, activos, pagos, etc. y te ayudaré con gusto.`

async function fetchUserPortfolio(userId: string) {
  try {
    const [investments, dividendPayments, user] = await Promise.all([
      db.investment.findMany({
        where: { userId },
        include: { asset: true },
        orderBy: { createdAt: 'desc' },
      }),
      db.dividendPayment.findMany({
        where: { userId, status: 'paid' },
        orderBy: { paymentDate: 'desc' },
      }),
      db.user.findUnique({ where: { id: userId } }),
    ])

    if (!user) return null

    const activeInvestments = investments.filter(
      (inv) => inv.status === 'active' || inv.status === 'completed'
    )

    const totalInvested = activeInvestments.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const totalDividends = dividendPayments.reduce((sum, div) => sum + div.amount, 0)
    const totalFractions = activeInvestments.reduce((sum, inv) => sum + inv.quantity, 0)

    const investmentList = activeInvestments.map((inv) => ({
      assetName: inv.asset.name,
      assetType: inv.asset.type,
      city: inv.asset.city,
      country: inv.asset.country,
      fractions: inv.quantity,
      pricePerFraction: inv.pricePerUnit,
      totalAmount: inv.totalAmount,
      annualYield: inv.asset.annualYield,
      status: inv.status,
      monthlyRent: inv.asset.monthlyRent,
      leaseStatus: inv.asset.leaseStatus,
    }))

    return {
      userName: user.name,
      balance: user.balance,
      totalInvested: user.totalInvested,
      totalEarnings: user.totalEarnings,
      riskProfile: user.riskProfile || 'not set',
      kycStatus: user.kycStatus,
      investmentCount: activeInvestments.length,
      totalFractions,
      totalDividends,
      investments: investmentList,
    }
  } catch (err) {
    console.error('Error fetching portfolio:', err)
    return null
  }
}

function buildPortfolioSummary(portfolio: NonNullable<Awaited<ReturnType<typeof fetchUserPortfolio>>>): string {
  const lines: string[] = []
  lines.push(`Portfolio Summary for ${portfolio.userName || 'User'}:`)
  lines.push(`- Balance: $${portfolio.balance.toFixed(2)} USD`)
  lines.push(`- Total Invested: $${portfolio.totalInvested.toFixed(2)} USD`)
  lines.push(`- Total Earnings: $${portfolio.totalEarnings.toFixed(2)} USD`)
  lines.push(`- Total Dividends Received: $${portfolio.totalDividends.toFixed(2)} USD`)
  lines.push(`- Active Investments: ${portfolio.investmentCount}`)
  lines.push(`- Total Fractions Owned: ${portfolio.totalFractions}`)
  lines.push(`- Risk Profile: ${portfolio.riskProfile}`)
  lines.push(`- KYC Status: ${portfolio.kycStatus}`)
  lines.push('')
  lines.push('Investments:')
  if (portfolio.investments.length === 0) {
    lines.push('- No active investments')
  } else {
    portfolio.investments.forEach((inv, i) => {
      lines.push(
        `  ${i + 1}. ${inv.assetName} (${inv.assetType}) — ${inv.city}, ${inv.country}`
      )
      lines.push(`     Fractions: ${inv.fractions} | Total: $${inv.totalAmount.toFixed(2)} USD | Yield: ${inv.annualYield}%`)
      lines.push(`     Lease: ${inv.leaseStatus}${inv.monthlyRent ? ` | Rent: $${inv.monthlyRent}/mo` : ''}`)
    })
  }
  return lines.join('\n')
}

export async function POST(request: Request) {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    // Limit conversation history to last 10 messages for context
    const recentMessages = messages.slice(-10)
    const lastUserMessage = [...recentMessages].reverse().find((m: { role: string }) => m.role === 'user')
    const userText = lastUserMessage?.content?.trim() || ''

    // Handle slash commands
    const command = userText.toLowerCase().split(' ')[0]
    const portfolio = await fetchUserPortfolio(session!.user!.id)

    if (command === '/ayuda') {
      return NextResponse.json({ message: COMMANDS_HELP })
    }

    if (command === '/portafolio') {
      if (!portfolio || portfolio.investments.length === 0) {
        return NextResponse.json({
          message:
            "📦 **Tu Portafolio**\n\nNo tienes inversiones activas en este momento. ¡Visita nuestro marketplace para explorar las oportunidades disponibles!",
        })
      }
      const summary = buildPortfolioSummary(portfolio)
      return NextResponse.json({
        message: `📦 **Tu Portafolio**\n\n${summary}`,
      })
    }

    if (command === '/recomendar') {
      const portfolioContext = portfolio
        ? buildPortfolioSummary(portfolio)
        : 'No portfolio data available.'
      const recommendPrompt = `Based on the user's current portfolio, suggest 2-3 suitable real estate assets or investment strategies they should consider. Consider diversification, their risk profile, and current investments. Be specific and actionable. Respond in the same language the user has been using (likely Spanish).\n\nUser Portfolio:\n${portfolioContext}`

      try {
        const ZAI = (await import('z-ai-web-dev-sdk')).default
        const zai = await ZAI.create()

        const completion = await zai.chat.completions.create({
          model: 'glm-4-flash',
          messages: [
            { role: 'system', content: BASE_SYSTEM_PROMPT },
            { role: 'user', content: recommendPrompt },
          ],
        })

        const reply = completion?.choices?.[0]?.message?.content
        if (reply?.trim()) {
          return NextResponse.json({ message: `🎯 **Recomendaciones para ti**\n\n${reply}` })
        }
      } catch {
        // fallback below
      }

      return NextResponse.json({
        message:
          '🎯 **Recomendaciones**\n\nLo siento, no pude generar recomendaciones en este momento. Por favor intenta de nuevo o explora nuestro marketplace para ver activos disponibles.',
      })
    }

    if (command === '/mercado') {
      const marketPrompt = `Give a concise market overview for fractional real estate investment in Latin America and the US. Cover: current interest rate environment, real estate trends in key markets (Chile, USA, Mexico, Colombia), rental yield expectations, and any notable risks or opportunities. Keep it to 3-4 short paragraphs. Respond in Spanish.`

      try {
        const ZAI = (await import('z-ai-web-dev-sdk')).default
        const zai = await ZAI.create()

        const completion = await zai.chat.completions.create({
          model: 'glm-4-flash',
          messages: [
            { role: 'system', content: BASE_SYSTEM_PROMPT },
            { role: 'user', content: marketPrompt },
          ],
        })

        const reply = completion?.choices?.[0]?.message?.content
        if (reply?.trim()) {
          return NextResponse.json({ message: `📊 **Resumen del Mercado**\n\n${reply}` })
        }
      } catch {
        // fallback below
      }

      return NextResponse.json({
        message:
          '📊 **Resumen del Mercado**\n\nNo pude obtener datos del mercado en este momento. Te recomiendo revisar nuestras publicaciones del blog para análisis actualizados.',
      })
    }

    // Normal chat: inject portfolio context into system prompt
    let systemPrompt = BASE_SYSTEM_PROMPT
    if (portfolio && portfolio.investments.length > 0) {
      const portfolioContext = buildPortfolioSummary(portfolio)
      systemPrompt += `\n\nThe user's portfolio data:\n${portfolioContext}\n\nUse this to provide personalized investment advice when asked. Reference their actual holdings by name when relevant.`
    }

    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const completion = await zai.chat.completions.create({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...recentMessages.map((m: { role: string; content: string }) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        ],
      })

      const reply = completion?.choices?.[0]?.message?.content

      if (!reply || !reply.trim()) {
        return NextResponse.json({ message: 'Lo siento, no pude generar una respuesta. Por favor intenta de nuevo.' })
      }

      return NextResponse.json({ message: reply })
    } catch (sdkErr) {
      console.error('z-ai-web-dev-sdk error:', sdkErr)
      // Fallback response
      return NextResponse.json({
        message:
          '¡Hola! Soy el asistente de GALAXY. En este momento estoy experimentando una alta demanda. Puedes revisar nuestro FAQ en la sección de ayuda, o contactar a soporte@3gsp.com para asistencia personalizada. ¡Gracias por tu paciencia!',
      })
    }
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 })
  }
}
