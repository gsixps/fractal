import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'

export async function POST(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { title, category, tags, excerpt, locale } = body

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const tagsStr = tags ? (Array.isArray(tags) ? tags.join(', ') : tags) : ''
    const localeStr = locale === 'en' ? 'inglés' : 'español'
    const categoryStr = category || 'educación financiera'

    const systemPrompt = `Eres un redactor profesional experto en finanzas, inversiones inmobiliarias y mercados latinoamericanos. 
Escribes contenido natural, humano y profesional para un blog de una plataforma de inversión llamada 3GSP.
Tus textos son claros, informativos y están diseñados para educar inversores hispanohablantes.
NUNCA uses formato markdown (no #, **, -, etc.). Escribe en prosa natural con párrafos bien estructurados.
Usa un tono profesional pero accesible. Incluye datos útiles y consejos prácticos cuando sea relevante.`

    const userPrompt = `Escribe un artículo de blog completo en ${localeStr} sobre el siguiente tema:

Título: ${title}
Categoría: ${categoryStr}
${tagsStr ? `Etiquetas: ${tagsStr}` : ''}
${excerpt ? `Resumen/Enfoque sugerido: ${excerpt}` : ''}

Requisitos:
- Escribe entre 800 y 1500 palabras de contenido natural en prosa
- NO uses formato markdown, asteriscos, guiones de lista, ni símbolos de encabezado
- Usa párrafos bien estructurados con ideas claras
- El contenido debe ser profesional sobre finanzas/inversiones
- Si el locale es español, escribe completamente en español
- Incluye una introducción atractiva y una conclusión con llamado a la acción

Responde SOLO con el artículo, sin comentarios adicionales.`

    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      model: 'glm-4-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const content = completion?.choices?.[0]?.message?.content || ''

    // Generate SEO metadata
    const seoPrompt = `Basándote en el siguiente artículo, genera:
1. Un título SEO optimizado (máximo 60 caracteres)
2. Una meta descripción SEO (máximo 155 caracteres)

Artículo:
${content.substring(0, 500)}

Responde SOLO en formato JSON:
{"seoTitle": "...", "seoDescription": "..."}`

    const seoCompletion = await zai.chat.completions.create({
      model: 'glm-4-flash',
      messages: [
        { role: 'system', content: 'Eres un especialista en SEO que genera metadatos en formato JSON válido.' },
        { role: 'user', content: seoPrompt },
      ],
    })

    let seoTitle = title
    let seoDescription = ''

    try {
      const seoText = seoCompletion?.choices?.[0]?.message?.content || ''
      const jsonMatch = seoText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        seoTitle = parsed.seoTitle || title
        seoDescription = parsed.seoDescription || ''
      }
    } catch {
      seoDescription = excerpt || ''
    }

    // Estimate reading time (200 words per minute average)
    const wordCount = content.split(/\s+/).filter(Boolean).length
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    return NextResponse.json({
      content,
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
