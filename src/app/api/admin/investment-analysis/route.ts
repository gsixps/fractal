import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// ─── Core Logic Engine System Prompt ─────────────────────────────────────────
const CORE_LOGIC_SYSTEM_PROMPT = `# Role
Eres el Core Logic Engine de una plataforma global de crowdfunding inmobiliario. Tu expertise es orquestar relaciones técnicas y financieras complejas entre entidades captadoras de capital, inversores validados internacionalmente, y activos inmobiliarios constituidos como vehículos legales locales.

# Task
Cuando recibas datos de un activo inmobiliario o una consulta de inversión, estructurar una respuesta completa que articule la viabilidad técnica, financiera, legal y operativa de la oportunidad de inversión. Tu respuesta debe permitir que un inversor global tome decisiones informadas dentro de un marco de cumplimiento regulatorio riguroso.

# Context
Operas en un ecosistema multi-jurisdicción donde:
- **Entidad Captadora**: GALAXY LLC (New Mexico) recibe capital en USD vía Stripe
- **Entidades Operativas**: SpA u vehículos legales equivalentes en cada país anfitrión poseen títulos de inmuebles
- **Flujo de Capital**: Conversión bidireccional de monedas (USD ↔ moneda local) para adquisición de activos y distribución de rentas
- **Jurisdicciones Cubiertas**: Chile (Ley Fintech), Venezuela, Colombia, Estados Unidos, México, Argentina, Perú, Brasil, Unión Europea (cada una con marcos regulatorios particulares)
- **Validación de Inversores**: KYC de Stripe Identity + cumplimiento con Regulación S (USA) y normativas fintech locales

# Instructions

## Estructura de Respuesta (4 Módulos Obligatorios)

**Módulo 1: Estructura de la Fracción**
- Calcular el valor unitario de la acción/participación en USD basado en el precio total del activo expresado en la unidad local
- Definir el número total de acciones/participaciones disponibles para el vehículo legal específico
- Desglosar el valor en USD (presentación principal) con referencia cruzada a la moneda local

**Módulo 2: Proyección Financiera (ROI Neto)**
- Calcular Cap Rate estimado: (Ingreso Anual por Arriendo / Valor Total de Propiedad)
- Deducir comisiones y retenciones en cascada:
  - Sourcing Fee (comisión de adquisición, entrada)
  - Management Fee (comisión operativa mensual)
  - Retenciones fiscales transfronterizas (WHT - Withholding Tax según jurisdicción del inversor y país del activo)
  - Comisiones de conversión de divisa USD ↔ moneda local
- Mostrar el retorno neto anualizado proyectado expresado en USD
- Incluir sensibilidad: retorno bajo, medio y alto escenarios

**Módulo 3: Compliance & Legal Trail**
- Confirmar estado del KYC vía Stripe Identity (válido/pendiente/rechazado)
- Validar elegibilidad del inversor bajo Regulación S (USA) o marcos equivalentes locales
- Generar resumen ejecutivo de la cláusula de adhesión: cómo GALAXY LLC (New Mexico) representa al inversor ante el vehículo legal local
- Citar marcos regulatorios aplicables por jurisdicción
- Identificar obligaciones de reporte fiscal binacional/multinacional del inversor

**Módulo 4: Gestión de Riesgos FX (Divisas)**
- Cuantificar el impacto de volatilidad USD/moneda local en rentabilidad proyectada de la fracción
- Advertir explícitamente sobre plazos de liquidación y remesas internacionales
- Identificar riesgos específicos por jurisdicción (controles de capital, restricciones de repatriación, etc.)
- Sugerir estrategias de cobertura disponibles (si aplica)

## Restricciones Críticas
- **Nunca garantices retornos fijos o ciertos**. Usa siempre lenguaje condicional: "proyectado", "estimado", "bajo condiciones de mercado normales", "sujeto a".
- Mantén un tono profesional, técnico, transparente y conservador. Antecipa objeciones.
- **Toda cifra financiera debe expresarse primero en USD** (moneda del inversor global). Desglose en moneda local como referencia de origen inmediatamente después entre paréntesis.
- Aplica lógica regulatoria particularizada por país: no generalices cumplimiento normativo. Chile ≠ México ≠ Brasil.
- Identifica explícitamente al país del activo y la jurisdicción del inversor en cada respuesta.
- Cuando hay ambigüedad regulatoria, exprésala y recomienda asesoría legal local.

## Salida
Estructura tu respuesta con separadores claros entre módulos. Usa tablas para comparativas financieras. Incluye una sección de "Advertencias & Limitaciones" al final.`

// ─── POST: Generate Investment Analysis ──────────────────────────────────────
export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const body = await request.json()
    const { assetId, investorCountry, investorEmail } = body

    if (!assetId) {
      return NextResponse.json({ error: 'assetId es obligatorio' }, { status: 400 })
    }

    // Fetch the asset from DB
    const asset = await db.asset.findUnique({
      where: { id: assetId },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        cashFlowProjections: { orderBy: { period: 'asc' } },
      },
    })

    if (!asset) {
      return NextResponse.json({ error: 'Activo no encontrado' }, { status: 404 })
    }

    // Build detailed prompt with all asset data
    const cashFlowData = asset.cashFlowProjections.length > 0
      ? asset.cashFlowProjections.map((cfp) => ({
          periodo: cfp.period,
          tipoPeriodo: cfp.periodType,
          ingresoBruto: cfp.grossIncome,
          costosOperativos: cfp.operationalCost,
          ingresoNeto: cfp.netIncome,
          apreciacion: cfp.appreciation,
          retornoTotal: cfp.totalReturn,
          retornoAcumulado: cfp.cumulativeReturn,
        }))
      : null

    const userPrompt = `Por favor, genera un análisis de inversión completo para el siguiente activo inmobiliario:

## Datos del Activo
- **Nombre**: ${asset.name}
- **Tipo**: ${asset.type}
- **Estado**: ${asset.status}
- **Ubicación**: ${asset.address}, ${asset.city}, ${asset.region}, ${asset.country}
- **Área Total**: ${asset.totalArea ? `${asset.totalArea} m²` : 'No especificada'}
- **Unidades**: ${asset.units || 'No especificadas'}
- **Año de Construcción**: ${asset.constructionYear || 'No especificado'}
- **Uso de Suelo**: ${asset.landUse || 'No especificado'}

## Datos Financieros (USD)
- **Valor Total del Activo**: $${asset.totalValue.toLocaleString('en-US')} USD
- **Precio por Fracción**: $${asset.pricePerFraction.toLocaleString('en-US')} USD
- **Total de Fracciones**: ${asset.totalFractions.toLocaleString()}
- **Fracciones Disponibles**: ${asset.availableFractions.toLocaleString()}
- **Inversión Mínima**: $${asset.minimumInvestment.toLocaleString('en-US')} USD
- **Financiado**: ${asset.fundedPercentage.toFixed(1)}%
- **Yield Anual**: ${asset.annualYield}%
- **Apreciación Proyectada**: ${asset.projectedAppreciation}%
- **Retorno Total Proyectado**: ${asset.totalProjectedReturn}%
- **Costos Operativos**: ${asset.operationalCosts ? `$${asset.operationalCosts.toLocaleString('en-US')} USD` : 'No especificados'}
- **Costos Operativos (%)**: ${asset.operationalCostsPct ? `${asset.operationalCostsPct}%` : 'No especificado'}

## Datos de Arriendo
- **Estado del Arriendo**: ${asset.leaseStatus}
${asset.monthlyRent ? `- **Renta Mensual**: $${asset.monthlyRent.toLocaleString('en-US')} USD` : ''}
${asset.monthlyRent ? `- **Renta Anual Estimada**: $${(asset.monthlyRent * 12).toLocaleString('en-US')} USD` : ''}
${asset.tenantName ? `- **Inquilino**: ${asset.tenantName}` : ''}
${asset.leaseStart ? `- **Inicio del Arriendo**: ${new Date(asset.leaseStart).toLocaleDateString('es-CL')}` : ''}
${asset.leaseEnd ? `- **Fin del Arriendo**: ${new Date(asset.leaseEnd).toLocaleDateString('es-CL')}` : ''}

## Proyecciones de Flujo de Caja
${cashFlowData ? JSON.stringify(cashFlowData, null, 2) : 'No hay proyecciones de flujo de caja disponibles para este activo.'}

## Descripción del Activo
${asset.shortDescription}

${asset.highlights ? `## Highlights\n${asset.highlights}` : ''}

## Perfil del Inversor (si proporcionado)
- **País del Inversor**: ${investorCountry || 'No especificado (asumir inversor global en USD)'}
- **Email del Inversor**: ${investorEmail || 'No proporcionado'}

## Nivel de Riesgo del Activo
- **Nivel**: ${asset.riskLevel || 'medium'}
${asset.riskDescription ? `- **Descripción**: ${asset.riskDescription}` : ''}

Genera el análisis completo con los 4 módulos obligigatorios. Sé específico con las cifras proporcionadas y menciona explícitamente el país del activo (${asset.country}) en cada módulo.`

    // Use z-ai-web-dev-sdk to generate analysis
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      model: 'glm-4-plus',
      messages: [
        { role: 'system', content: CORE_LOGIC_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    })

    const analysis = completion?.choices?.[0]?.message?.content || 'No se pudo generar el análisis. Por favor, intente nuevamente.'

    // Store in database
    const record = await db.investmentAnalysis.create({
      data: {
        assetId,
        assetName: asset.name,
        analysis,
        investorCountry: investorCountry || null,
      },
    })

    const generatedAt = record.generatedAt.toISOString()

    return NextResponse.json({
      analysis,
      assetName: asset.name,
      generatedAt,
    })
  } catch (err) {
    console.error('Error generating investment analysis:', err)
    return NextResponse.json(
      { error: 'Error al generar el análisis de inversión' },
      { status: 500 }
    )
  }
}

// ─── GET: List Recent Analyses ────────────────────────────────────────────────
export async function GET() {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const analyses = await db.investmentAnalysis.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      analyses: analyses.map((a) => ({
        id: a.id,
        assetId: a.assetId,
        assetName: a.assetName,
        analysis: a.analysis,
        generatedAt: a.generatedAt.toISOString(),
        investorCountry: a.investorCountry || undefined,
      })),
      total: await db.investmentAnalysis.count(),
    })
  } catch (err) {
    console.error('Error listing analyses:', err)
    return NextResponse.json(
      { error: 'Error al listar análisis' },
      { status: 500 }
    )
  }
}
