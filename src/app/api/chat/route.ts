import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

const SYSTEM_PROMPT = `You are GALAXY AI Assistant, a helpful chatbot for a fractional real estate investment platform called 3GSP by GALAXY LLC. Help users with questions about investing, the platform, assets, KYC, payments, and general real estate topics. Be professional but friendly. Respond in the same language the user writes in (Spanish or English). Keep responses concise.

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

export async function POST(request: Request) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    // Limit conversation history to last 10 messages for context
    const recentMessages = messages.slice(-10)

    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const completion = await zai.chat.completions.create({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
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
