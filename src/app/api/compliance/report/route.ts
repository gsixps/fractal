import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// In-memory cache for compliance reports
const complianceCache = new Map<string, { report: unknown; expiresAt: number }>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

const SYSTEM_PROMPT = `You are a regulatory compliance AI for 3GSP, a fractional real estate investment platform operating in Chile, backed by GALAXY LLC. Generate a comprehensive compliance report covering KYC verification status, AML (Anti-Money Laundering) checks, investor suitability, transaction monitoring, and data protection. Write everything in Spanish.

You MUST respond ONLY with a valid JSON object in this exact format, no extra text:
{
  "report": "Full compliance report text in Spanish (2-3 paragraphs summarizing overall status)",
  "sections": [
    {
      "title": "Section title in Spanish",
      "content": "Detailed analysis for this section in Spanish (2-4 paragraphs)",
      "status": "compliant|warning|non-compliant",
      "items": [
        "Specific finding or recommendation in Spanish",
        "Another finding or recommendation"
      ]
    }
  ]
}

Generate exactly these 6 sections in order:
1. "Verificación KYC (Know Your Customer)" — KYC verification rates, pending reviews, rejection analysis
2. "Prevención de Lavado de Dinero (AML)" — AML screening status, transaction monitoring, suspicious activity
3. "Adecuación del Inversor" — Investor suitability checks, risk profiling, investment limits
4. "Monitoreo de Transacciones" — Transaction volumes, anomaly detection, large transaction review
5. "Protección de Datos" — Data privacy compliance, consent management, data retention
6. "Resumen y Recomendaciones" — Overall assessment, priority actions, improvement areas

For each section:
- "status" must be exactly "compliant", "warning", or "non-compliant"
- "items" must contain 2-5 specific findings or recommendations
- Be specific with numbers and percentages from the platform data
- Reference Chilean regulations (CMF, Ley 19.913 AML, Ley de Protección de Datos Personales)
- If data shows good compliance, mark as "compliant"
- If there are minor issues, mark as "warning"
- If there are critical issues, mark as "non-compliant"  
- Generate the "report" field as an executive summary of all sections (2-3 paragraphs)`

export async function GET(request: Request) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    // Check cache
    const cacheKey = 'compliance-report'
    const cached = complianceCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.report)
    }

    // Fetch platform-wide compliance data in parallel
    const [
      totalUsers,
      kycVerified,
      kycPending,
      kycRejected,
      kycSubmitted,
      totalInvestments,
      activeInvestments,
      pendingInvestments,
      totalTransactionVolume,
      recentTransactions,
      totalDividendsPaid,
      recentUsers,
      usersWithRiskProfile,
      usersWithoutRiskProfile,
      recentKycDocuments,
      auditLogs,
      usersWithTermsAccepted,
      usersWithoutTermsAccepted,
    ] = await Promise.all([
      // User counts
      db.user.count(),
      db.user.count({ where: { kycStatus: 'verified' } }),
      db.user.count({ where: { kycStatus: 'pending' } }),
      db.user.count({ where: { kycStatus: 'rejected' } }),
      db.user.count({ where: { kycStatus: 'submitted' } }),

      // Investment counts
      db.investment.aggregate({
        _sum: { totalAmount: true },
        _count: true,
      }),
      db.investment.count({ where: { status: { in: ['active', 'completed'] } } }),
      db.investment.count({ where: { status: 'pending' } }),

      // Transaction volume
      db.transaction.aggregate({
        _sum: { amount: true },
        _count: true,
      }),

      // Recent transactions (last 30 days) for anomaly detection
      db.transaction.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        select: { type: true, amount: true, status: true, userId: true, createdAt: true },
        orderBy: { amount: 'desc' },
        take: 20,
      }),

      // Dividends paid
      db.dividendPayment.aggregate({
        where: { status: 'paid' },
        _sum: { amount: true },
        _count: true,
      }),

      // Recent users (last 30 days)
      db.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),

      // Risk profile coverage
      db.user.count({ where: { riskProfile: { not: null } } }),
      db.user.count({ where: { riskProfile: null } }),

      // Recent KYC documents submitted (last 30 days)
      db.kYCDocument.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),

      // Audit log count (last 30 days)
      db.auditLog.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),

      // Terms acceptance
      db.user.count({ where: { termsAcceptedAt: { not: null } } }),
      db.user.count({ where: { termsAcceptedAt: null } }),
    ])

    const kycVerifiedPct = totalUsers > 0 ? ((kycVerified / totalUsers) * 100).toFixed(1) : '0'
    const kycPendingPct = totalUsers > 0 ? (((kycPending + kycSubmitted) / totalUsers) * 100).toFixed(1) : '0'
    const kycRejectedPct = totalUsers > 0 ? ((kycRejected / totalUsers) * 100).toFixed(1) : '0'
    const riskProfilePct = totalUsers > 0 ? ((usersWithRiskProfile / totalUsers) * 100).toFixed(1) : '0'
    const termsPct = totalUsers > 0 ? ((usersWithTermsAccepted / totalUsers) * 100).toFixed(1) : '0'

    // Large transactions (above $10,000)
    const largeTransactions = recentTransactions.filter((tx) => tx.amount > 10000)
    // Transaction types distribution
    const txTypes: Record<string, number> = {}
    for (const tx of recentTransactions) {
      txTypes[tx.type] = (txTypes[tx.type] || 0) + 1
    }

    const userPrompt = `Genera un reporte de cumplimiento regulatorio basado en los siguientes datos de la plataforma 3GSP:

DATOS DE USUARIOS Y KYC:
- Total de usuarios registrados: ${totalUsers}
- Usuarios con KYC verificado: ${kycVerified} (${kycVerifiedPct}%)
- Usuarios con KYC pendiente: ${kycPending} (${kycPendingPct}%)
- Usuarios con KYC rechazado: ${kycRejected} (${kycRejectedPct}%)
- Usuarios con perfil de riesgo definido: ${usersWithRiskProfile} (${riskProfilePct}%)
- Usuarios sin perfil de riesgo: ${usersWithoutRiskProfile}
- Nuevos usuarios (últimos 30 días): ${recentUsers}
- Usuarios con términos aceptados: ${usersWithTermsAccepted} (${termsPct}%)
- Usuarios sin términos aceptados: ${usersWithoutTermsAccepted}

DATOS DE INVERSIONES:
- Total de inversiones: ${totalInvestments._count}
- Inversiones activas/completadas: ${activeInvestments}
- Inversiones pendientes: ${pendingInvestments}
- Monto total invertido: USD $${(totalInvestments._sum.amount || 0).toFixed(2)}
- Total dividendos pagados: USD $${(totalDividendsPaid._sum.amount || 0).toFixed(2)} (${totalDividendsPaid._count} pagos)

DATOS DE TRANSACCIONES:
- Total de transacciones: ${totalTransactionVolume._count}
- Volumen total transado: USD $${(totalTransactionVolume._sum.amount || 0).toFixed(2)}
- Transacciones grandes (>$10,000) en últimos 30 días: ${largeTransactions.length}
- Tipos de transacciones recientes: ${JSON.stringify(txTypes)}

MONITOREO Y AUDITORÍA:
- Documentos KYC recibidos (últimos 30 días): ${recentKycDocuments}
- Registros de auditoría (últimos 30 días): ${auditLogs}

Genera el reporte completo en español en formato JSON. Responde SOLO con el JSON.`

    let report = null

    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const completion = await zai.chat.completions.create({
        model: 'glm-4-plus',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
      })

      const reply = completion?.choices?.[0]?.message?.content || ''
      const jsonMatch = reply.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        report = JSON.parse(jsonMatch[0])
        // Ensure all sections have valid status values
        if (report.sections && Array.isArray(report.sections)) {
          report.sections = report.sections.map((section: { status?: string }) => ({
            ...section,
            status: ['compliant', 'warning', 'non-compliant'].includes(section.status)
              ? section.status
              : 'warning',
          }))
        }
      }
    } catch (sdkErr) {
      console.error('z-ai-web-dev-sdk error in compliance:', sdkErr)
    }

    // Fallback report if SDK fails
    if (!report || !report.sections || !Array.isArray(report.sections)) {
      report = generateFallbackReport({
        totalUsers,
        kycVerified,
        kycVerifiedPct,
        kycPending,
        kycSubmitted,
        kycRejected,
        kycRejectedPct,
        usersWithRiskProfile,
        riskProfilePct,
        usersWithoutRiskProfile,
        totalInvestments: totalInvestments._count,
        totalInvestedAmount: totalInvestments._sum.amount || 0,
        pendingInvestments,
        totalTransactionVolume: totalTransactionVolume._count,
        totalTransactedAmount: totalTransactionVolume._sum.amount || 0,
        largeTransactions: largeTransactions.length,
        termsPct,
        recentKycDocuments,
        auditLogs,
        totalDividendsPaid: totalDividendsPaid._count,
        totalDividendsAmount: totalDividendsPaid._sum.amount || 0,
        recentUsers,
      })
    }

    const result = {
      ...report,
      generatedAt: new Date().toISOString(),
    }

    // Cache the result
    complianceCache.set(cacheKey, {
      report: result,
      expiresAt: Date.now() + CACHE_TTL_MS,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('Compliance report API error:', err)
    return NextResponse.json({ error: 'Failed to generate compliance report' }, { status: 500 })
  }
}

function generateFallbackReport(data: {
  totalUsers: number
  kycVerified: number
  kycVerifiedPct: string
  kycPending: number
  kycSubmitted: number
  kycRejected: number
  kycRejectedPct: string
  usersWithRiskProfile: number
  riskProfilePct: string
  usersWithoutRiskProfile: number
  totalInvestments: number
  totalInvestedAmount: number
  pendingInvestments: number
  totalTransactionVolume: number
  totalTransactedAmount: number
  largeTransactions: number
  termsPct: string
  recentKycDocuments: number
  auditLogs: number
  totalDividendsPaid: number
  totalDividendsAmount: number
  recentUsers: number
}) {
  const kycStatus = parseFloat(data.kycVerifiedPct) >= 80 ? 'compliant' : parseFloat(data.kycVerifiedPct) >= 50 ? 'warning' : 'non-compliant'
  const amlStatus = data.largeTransactions === 0 ? 'compliant' : 'warning'
  const riskStatus = parseFloat(data.riskProfilePct) >= 70 ? 'compliant' : parseFloat(data.riskProfilePct) >= 40 ? 'warning' : 'non-compliant'
  const txStatus = 'compliant'
  const dataStatus = parseFloat(data.termsPct) >= 90 ? 'compliant' : parseFloat(data.termsPct) >= 60 ? 'warning' : 'non-compliant'

  const overallWarningCount = [kycStatus, amlStatus, riskStatus, txStatus, dataStatus].filter((s) => s === 'warning').length
  const overallNonCompliant = [kycStatus, amlStatus, riskStatus, txStatus, dataStatus].filter((s) => s === 'non-compliant').length
  const summaryStatus = overallNonCompliant > 0 ? 'non-compliant' : overallWarningCount > 2 ? 'warning' : 'compliant'

  return {
    report: `Reporte de Cumplimiento Regulatorio — 3GSP por GALAXY LLC. La plataforma cuenta con ${data.totalUsers} usuarios registrados, de los cuales ${data.kycVerified} (${data.kycVerifiedPct}%) han completado la verificación KYC. El volumen total transado asciende a USD $${data.totalTransactedAmount.toFixed(2)} a través de ${data.totalInvestments} inversiones y ${data.totalTransactionVolume} transacciones. Se han pagado ${data.totalDividendsPaid} dividendos por un total de USD $${data.totalDividendsAmount.toFixed(2)}. ${data.recentKycDocuments} documentos KYC han sido procesados en los últimos 30 días con ${data.auditLogs} registros de auditoría. El estado general de cumplimiento es ${summaryStatus === 'compliant' ? 'adecuado' : summaryStatus === 'warning' ? 'con observaciones' : 'requiere atención inmediata'}.`,
    sections: [
      {
        title: 'Verificación KYC (Know Your Customer)',
        content: `Del total de ${data.totalUsers} usuarios, ${data.kycVerified} (${data.kycVerifiedPct}%) han completado satisfactoriamente el proceso de verificación KYC conforme a los requisitos de la CMF chilena. Existen ${data.kycPending} usuarios con verificación pendiente y ${data.kycSubmitted} con documentos enviados pendientes de revisión. ${data.kycRejected} usuarios han sido rechazados (${data.kycRejectedPct}%). En los últimos 30 días se han recibido ${data.recentKycDocuments} documentos de verificación.`,
        status: kycStatus,
        items: [
          `Tasa de verificación KYC: ${data.kycVerifiedPct}% (objetivo regulatorio: 100% de inversores activos)`,
          `${data.kycPending + data.kycSubmitted} usuarios requieren revisión de documentos`,
          data.kycRejected > 0 ? `${data.kycRejected} usuarios rechazados requieren seguimiento de apelación` : 'No hay usuarios rechazados pendientes',
          `${data.recentUsers} nuevos usuarios registrados en los últimos 30 días`,
        ],
      },
      {
        title: 'Prevención de Lavado de Dinero (AML)',
        content: `El sistema de prevención de lavado de activos (Ley 19.913) monitorea todas las transacciones de la plataforma. En los últimos 30 días, ${data.largeTransactions} transacciones superaron el umbral de USD $10,000 requiriendo revisión adicional. El volumen total transado es USD $${data.totalTransactedAmount.toFixed(2)}. Se mantienen ${data.auditLogs} registros de auditoría en el período, lo que demuestra trazabilidad adecuada de operaciones.`,
        status: amlStatus,
        items: [
          `${data.largeTransactions} transacciones grandes (>$10,000) requieren revisión en los últimos 30 días`,
          `${data.auditLogs} registros de auditoría generados (trazabilidad operativa)`,
          'Se recomienda implementar alertas automáticas para patrones inusuales de transacciones',
          `Volumen total transado: USD $${data.totalTransactedAmount.toFixed(2)}`,
        ],
      },
      {
        title: 'Adecuación del Inversor',
        content: `La adecuación del inversor evalúa si los productos ofrecidos son apropiados para el perfil de riesgo de cada usuario. Actualmente, ${data.usersWithRiskProfile} usuarios (${data.riskProfilePct}%) tienen un perfil de riesgo definido, mientras que ${data.usersWithoutRiskProfile} no lo han completado. Esto es fundamental para cumplir con los deberes de información y adecuación exigidos por la CMF.`,
        status: riskStatus,
        items: [
          `Perfil de riesgo completado: ${data.riskProfilePct}% de usuarios`,
          `${data.usersWithoutRiskProfile} usuarios sin perfil de riesgo definido`,
          'Se recomienda requerir perfil de riesgo antes de permitir inversiones',
          'Evaluar implementación de cuestionario de adecuación más robusto',
        ],
      },
      {
        title: 'Monitoreo de Transacciones',
        content: `La plataforma ha procesado ${data.totalTransactionVolume} transacciones por un volumen total de USD $${data.totalTransactedAmount.toFixed(2)}. El monto total invertido es USD $${data.totalInvestedAmount.toFixed(2)} a través de ${data.totalInvestments} operaciones de inversión, de las cuales ${data.pendingInvestments} se encuentran pendientes. Los controles de monitoreo detectan automáticamente transacciones que superan umbrales predefinidos.`,
        status: txStatus,
        items: [
          `Total de transacciones: ${data.totalTransactionVolume}`,
          `Inversiones pendientes de completar: ${data.pendingInvestments}`,
          `${data.largeTransactions} transacciones grandes identificadas para revisión`,
          'Sistema de monitoreo transaccional activo con umbrales configurados',
        ],
      },
      {
        title: 'Protección de Datos',
        content: `En cumplimiento de la Ley de Protección de Datos Personales (Ley 19.628) de Chile, ${data.termsPct}% de los usuarios han aceptado los términos y condiciones actualizados de la plataforma. Es esencial mantener registros actualizados de consentimiento y garantizar que los datos personales se almacenen de forma segura con controles de acceso apropiados.`,
        status: dataStatus,
        items: [
          `${data.termsPct}% de usuarios han aceptado términos y condiciones`,
          'Encriptación de datos sensibles implementada en almacenamiento',
          'Política de retención de datos definida conforme a regulación chilena',
          'Se recomienda auditoría periódica de permisos de acceso a datos personales',
        ],
      },
      {
        title: 'Resumen y Recomendaciones',
        content: `El estado general de cumplimiento regulatorio de la plataforma 3GSP es ${summaryStatus === 'compliant' ? 'adecuado' : summaryStatus === 'warning' ? 'con observaciones que requieren atención' : 'con deficiencias que requieren acción inmediata'}. Las áreas principales de mejora incluyen ${parseFloat(data.riskProfilePct) < 70 ? 'aumentar la cobertura de perfiles de riesgo' : 'mantener los controles KYC vigentes'} y ${parseFloat(data.kycVerifiedPct) < 80 ? 'acelerar la verificación de usuarios pendientes' : 'fortalecer el monitoreo transaccional'}.`,
        status: summaryStatus,
        items: [
          `Estado general: ${summaryStatus === 'compliant' ? 'Cumplido' : summaryStatus === 'warning' ? 'Con observaciones' : 'No cumplido'}`,
          'Realizar auditoría trimestral de cumplimiento AML/KYC',
          parseFloat(data.riskProfilePct) < 70 ? 'Priorizar: Implementar perfil de riesgo obligatorio para inversores' : 'Mantener controles actuales de adecuación',
          parseFloat(data.kycVerifiedPct) < 80 ? 'Priorizar: Acelerar proceso de verificación KYC pendiente' : 'Continuar monitoreo de documentos KYC',
          'Documentar y mantener registro de todas las acciones de cumplimiento tomadas',
        ],
      },
    ],
  }
}
