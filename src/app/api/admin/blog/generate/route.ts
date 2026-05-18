import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'

export async function POST(request: Request) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const body = await request.json()
    const { topic, title, category, tags, excerpt, locale, tone } = body

    const articleTopic = topic || title
    if (!articleTopic) {
      return NextResponse.json({ error: 'topic or title is required' }, { status: 400 })
    }

    const tagsStr = tags ? (Array.isArray(tags) ? tags.join(', ') : tags) : ''
    const localeStr = locale === 'en' ? 'inglés' : 'español'
    const categoryStr = category || 'educación financiera'
    const toneStr = tone || 'professional'
    const toneMap: Record<string, string> = {
      professional: 'profesional y confiable',
      casual: 'casual y amigable',
      educational: 'educativo e informativo',
    }
    const toneDescription = toneMap[toneStr] || toneMap.professional

    const systemPrompt = `Eres un redactor profesional experto en finanzas, inversiones inmobiliarias y mercados latinoamericanos. 
Escribes contenido natural, humano y profesional para un blog de una plataforma de inversión llamada 3GSP.
Tus textos son claros, informativos y están diseñados para educar inversores hispanohablantes.
NUNCA uses formato markdown (no #, **, -, etc.). Escribe en prosa natural con párrafos bien estructurados.
Usa un tono ${toneDescription}. Incluye datos útiles y consejos prácticos cuando sea relevante.`

    const userPrompt = `Escribe un artículo de blog completo en ${localeStr} sobre el siguiente tema:

Título: ${articleTopic}
Categoría: ${categoryStr}
${tagsStr ? `Etiquetas: ${tagsStr}` : ''}
${excerpt ? `Resumen/Enfoque sugerido: ${excerpt}` : ''}

Requisitos:
- Escribe entre 800 y 1500 palabras de contenido natural en prosa
- NO uses formato markdown, asteriscos, guiones de lista, ni símbolos de encabezado
- Usa párrafos bien estructurados con ideas claras
- El contenido debe ser profesional sobre finanzas/inversiones
- Si el locale es español, escribe completamente en español
- Si el locale es inglés, escribe completamente en inglés
- Incluye una introducción atractiva y una conclusión con llamado a la acción

Responde SOLO con el artículo, sin comentarios adicionales.`

    let content = ''
    let useFallback = false

    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const completion = await zai.chat.completions.create({
        model: 'glm-4-plus',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      })

      content = completion?.choices?.[0]?.message?.content || ''
      if (!content.trim()) useFallback = true
    } catch (sdkErr) {
      console.error('z-ai-web-dev-sdk error, using fallback:', sdkErr)
      useFallback = true
    }

    if (useFallback || !content.trim()) {
      content = generateFallbackContent(articleTopic, localeStr, categoryStr)
    }

    // Generate SEO metadata
    let seoTitle = articleTopic
    let seoDescription = ''

    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const seoPrompt = `Basándote en el siguiente artículo, genera:
1. Un título SEO optimizado (máximo 60 caracteres)
2. Una meta descripción SEO (máximo 155 caracteres)

Artículo:
${content.substring(0, 500)}

Responde SOLO en formato JSON:
{"seoTitle": "...", "seoDescription": "...", "excerpt": "...", "tags": "...", "title": "..."}`

      const seoCompletion = await zai.chat.completions.create({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: 'Eres un especialista en SEO que genera metadatos en formato JSON válido.' },
          { role: 'user', content: seoPrompt },
        ],
      })

      const seoText = seoCompletion?.choices?.[0]?.message?.content || ''
      const jsonMatch = seoText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.title) seoTitle = parsed.title
        if (parsed.seoTitle) seoTitle = parsed.seoTitle
        if (parsed.seoDescription) seoDescription = parsed.seoDescription
      }
    } catch {
      seoTitle = articleTopic
      seoDescription = excerpt || `Artículo sobre ${articleTopic} en ${categoryStr}`
    }

    // Estimate reading time (200 words per minute average)
    const wordCount = content.split(/\s+/).filter(Boolean).length
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    return NextResponse.json({
      title: seoTitle,
      content,
      excerpt: seoDescription || excerpt || '',
      tags: tagsStr,
      seoTitle,
      seoDescription,
      readingTime,
    })
  } catch (err) {
    console.error('Error generating blog content:', err)
    return NextResponse.json(
      { error: 'Failed to generate blog content' },
      { status: 500 }
    )
  }
}

// Fallback content generator when SDK is not available
function generateFallbackContent(topic: string, locale: string, category: string): string {
  const isEnglish = locale === 'inglés'
  
  if (isEnglish) {
    return `Understanding ${topic}: A Comprehensive Guide for Smart Investors

The world of real estate investment continues to evolve, and understanding the key principles behind ${topic} has become essential for both new and experienced investors looking to diversify their portfolios effectively.

In today's dynamic market, ${category} represents one of the most promising sectors for fractional investment. Platforms like 3GSP have made it possible for investors to participate in premium real estate assets with lower capital requirements, opening doors that were previously available only to institutional investors.

What Makes ${topic} Unique

The investment landscape has shifted dramatically over the past decade. Traditional barriers to entry have been lowered through innovative fractional ownership models, allowing everyday investors to build diversified real estate portfolios without needing hundreds of thousands of dollars in capital.

When considering ${topic}, it is important to evaluate several key factors: the location and growth potential of the underlying asset, the historical performance of similar investments, the projected rental yields, and the overall risk profile of the investment.

Key Benefits of Fractional Real Estate Investment

First, fractional ownership provides unparalleled diversification. Instead of putting all your capital into a single property, you can spread your investment across multiple assets, geographies, and property types. This diversification helps mitigate risk while potentially enhancing returns.

Second, the entry point is significantly lower. With platforms like 3GSP, you can start investing with as little as a few hundred dollars, making real estate investment accessible to a much broader audience.

Third, passive income generation is one of the most attractive features. Rental income from the underlying properties is distributed proportionally to investors, providing a steady stream of passive income that can complement other investment returns.

How to Get Started

Getting started with ${topic} is straightforward. First, research the available investment opportunities on the platform. Pay attention to key metrics such as projected annual yield, property location, and the track record of the asset manager.

Next, consider your investment timeline. Real estate investments typically perform best over medium to long-term horizons. Plan your investment strategy accordingly and avoid making hasty decisions based on short-term market fluctuations.

Finally, diversify your portfolio across different asset types and locations. This approach helps reduce concentration risk and provides exposure to various segments of the real estate market.

The Future of Investment

Looking ahead, ${topic} is poised for continued growth. As technology improves transparency and accessibility in real estate markets, more investors will discover the benefits of fractional ownership. The key is to stay informed, make data-driven decisions, and maintain a long-term perspective.

Whether you are a seasoned investor or just beginning your journey, ${topic} offers compelling opportunities for wealth creation through real estate. Take the time to educate yourself, start small, and gradually build your investment portfolio over time.`
  }

  return `Comprendiendo ${topic}: Una Guía Completa para Inversores Inteligentes

El mundo de la inversión inmobiliaria continúa evolucionando, y comprender los principios clave detrás de ${topic} se ha vuelto esencial tanto para inversores nuevos como experimentados que buscan diversificar sus portafolios de manera efectiva.

En el mercado dinámico actual, ${category} representa uno de los sectores más prometedores para la inversión fraccionaria. Plataformas como 3GSP han hecho posible que los inversores participen en activos inmobiliarios premium con menores requerimientos de capital, abriendo puertas que antes estaban disponibles solo para inversores institucionales.

Qué Hace Único a ${topic}

El panorama de inversión ha cambiado drásticamente durante la última década. Las barreras tradicionales de entrada se han reducido a través de modelos innovadores de propiedad fraccionada, permitiendo a inversores cotidianos construir portafolios inmobiliarios diversificados sin necesidad de cientos de miles de dólares en capital.

Al considerar ${topic}, es importante evaluar varios factores clave: la ubicación y el potencial de crecimiento del activo subyacente, el rendimiento histórico de inversiones similares, los rendimientos por arriendo proyectados, y el perfil de riesgo general de la inversión.

Beneficios Clave de la Inversión Inmobiliaria Fraccionada

En primer lugar, la propiedad fraccionada proporciona una diversificación sin precedentes. En lugar de concentrar todo su capital en una sola propiedad, puede distribuir su inversión entre múltiples activos, geografías y tipos de propiedades. Esta diversificación ayuda a mitigar el riesgo mientras potencialmente mejora los rendimientos.

En segundo lugar, el punto de entrada es significativamente menor. Con plataformas como 3GSP, puede comenzar a invertir con tan solo unos pocos cientos de dólares, haciendo la inversión inmobiliaria accesible a un público mucho más amplio.

En tercer lugar, la generación de ingresos pasivos es una de las características más atractivas. Los ingresos por arriendo de las propiedades subyacentes se distribuyen proporcionalmente a los inversores, proporcionando un flujo constante de ingresos pasivos que puede complementar otros rendimientos de inversión.

Cómo Comenzar

Comenzar con ${topic} es sencillo. Primero, investigue las oportunidades de inversión disponibles en la plataforma. Preste atención a métricas clave como el yield anual proyectado, la ubicación de la propiedad y el historial del gestor del activo.

Luego, considere su horizonte de inversión. Las inversiones inmobiliarias típicamente tienen un mejor desempeño a mediano y largo plazo. Planifique su estrategia de inversión en consecuencia y evite tomar decisiones apresuradas basadas en fluctuaciones de corto plazo del mercado.

Finalmente, diversifique su portafolio entre diferentes tipos de activos y ubicaciones. Este enfoque ayuda a reducir el riesgo de concentración y proporciona exposición a diversos segmentos del mercado inmobiliario.

El Futuro de la Inversión

Mirando hacia adelante, ${topic} está posicionado para un crecimiento continuo. A medida que la tecnología mejora la transparencia y accesibilidad en los mercados inmobiliarios, más inversores descubrirán los beneficios de la propiedad fraccionada. La clave es mantenerse informado, tomar decisiones basadas en datos y mantener una perspectiva a largo plazo.

Ya sea un inversor experimentado o esté comenzando su journey, ${topic} ofrece oportunidades convincentes para la creación de riqueza a través del sector inmobiliario. Tómese el tiempo para educarse, comience con poco y construya gradualmente su portafolio de inversiones con el tiempo.`
}
