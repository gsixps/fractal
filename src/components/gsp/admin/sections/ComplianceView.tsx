'use client'

import { useState, useEffect, useCallback } from 'react'
import { Shield, RefreshCw, AlertTriangle, CheckCircle2, Clock, XCircle, Loader2, CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ComplianceSection {
  title: string
  content: string
  status: 'compliant' | 'warning' | 'non-compliant'
  items: string[]
}

interface ComplianceReport {
  report: string
  sections: ComplianceSection[]
  generatedAt: string
}

// ─── Status Config ──────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; dot: string; badge: string; card: string }> = {
  compliant: {
    label: 'Cumplido',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40',
    card: 'border-l-4 border-l-emerald-500',
  },
  warning: {
    label: 'Observación',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40',
    card: 'border-l-4 border-l-amber-500',
  },
  'non-compliant': {
    label: 'No Cumplido',
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40',
    card: 'border-l-4 border-l-red-500',
  },
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'compliant':
      return <CheckCircle2 className="size-5 text-emerald-500" />
    case 'warning':
      return <Clock className="size-5 text-amber-500" />
    case 'non-compliant':
      return <XCircle className="size-5 text-red-500" />
    default:
      return <AlertTriangle className="size-5 text-muted-foreground" />
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ComplianceView() {
  const [report, setReport] = useState<ComplianceReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchReport = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)
      const res = await fetch('/api/compliance/report')
      if (!res.ok) throw new Error('Error al generar el reporte')
      const data = await res.json()
      setReport(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      toast({ title: 'Error', description: 'No se pudo generar el reporte de cumplimiento', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchReport() }, [fetchReport])

  // Calculate overall score
  const getOverallScore = () => {
    if (!report?.sections) return { score: 0, label: '', status: 'warning' as const }
    const total = report.sections.length
    const compliant = report.sections.filter(s => s.status === 'compliant').length
    const score = Math.round((compliant / total) * 100)
    const status = score >= 80 ? 'compliant' as const : score >= 50 ? 'warning' as const : 'non-compliant' as const
    return { score, label: `${compliant}/${total}`, status }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-2 h-4 w-80" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="mb-4 size-12 text-muted-foreground" />
        <p className="mb-4 text-lg font-medium">Error al generar el reporte</p>
        <Button variant="outline" onClick={() => fetchReport()}>
          <RefreshCw className="mr-2 size-4" /> Reintentar
        </Button>
      </div>
    )
  }

  const overall = getOverallScore()
  const overallConfig = statusConfig[overall.status] || statusConfig.warning

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Cumplimiento Regulatorio</h2>
          <p className="text-muted-foreground">Reporte de cumplimiento generado por IA</p>
        </div>
        <div className="flex items-center gap-2">
          {report.generatedAt && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              {new Date(report.generatedAt).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          )}
          <Button variant="outline" size="sm" className="gap-2 cursor-pointer" onClick={() => fetchReport()} disabled={loading}>
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            Generar Reporte
          </Button>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card className={`relative overflow-hidden border-border/40 ${overallConfig.card}`}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className={`rounded-full p-3 ${overallConfig.badge}`}>
                <Shield className="size-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Puntuación General</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold tracking-tight">{overall.score}%</p>
                  <Badge variant="outline" className={overallConfig.badge}>
                    <span className={`inline-block size-1.5 rounded-full mr-1 ${overallConfig.dot}`} />
                    {overallConfig.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{overall.label} secciones cumplidas</p>
              </div>
            </div>
            <div className="flex-1 hidden sm:block">
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overall.status === 'compliant' ? 'bg-emerald-500' : overall.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${overall.score}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      {report.report && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-4 text-primary" />
              Resumen Ejecutivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{report.report}</p>
          </CardContent>
        </Card>
      )}

      {/* Section Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {report.sections.map((section, idx) => {
          const config = statusConfig[section.status] || statusConfig.warning
          return (
            <Card key={idx} className={`overflow-hidden border-border/40 ${config.card} transition-all`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{section.title}</CardTitle>
                  <Badge variant="outline" className={`${config.badge} shrink-0`}>
                    <span className={`inline-block size-1.5 rounded-full mr-1 ${config.dot}`} />
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Analysis text */}
                <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>

                {/* Checklist items */}
                {section.items && section.items.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hallazgos</p>
                    <ul className="space-y-1.5">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2 text-sm">
                          <StatusIcon status={section.status} />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* AI Disclaimer */}
      <div className="rounded-lg bg-muted/50 border border-border/30 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Disclaimer</p>
            <p className="text-xs text-muted-foreground mt-1">
              Este reporte es generado por inteligencia artificial y no reemplaza una auditoría de cumplimiento profesional.
              Los datos se basan en la información disponible en la plataforma al momento de la generación.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
