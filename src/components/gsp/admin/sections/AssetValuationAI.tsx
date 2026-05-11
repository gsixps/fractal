'use client'

import { useState, useEffect, useCallback } from 'react'
import { Brain, TrendingUp, TrendingDown, Minus, Loader2, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ValuationData {
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

// ─── Formatters ─────────────────────────────────────────────────────────────

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Status Config ──────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; color: string; badge: string; icon: React.ElementType; trend: React.ElementType }> = {
  undervalued: {
    label: 'Subvalorado',
    color: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40',
    icon: TrendingUp,
    trend: TrendingUp,
  },
  fair: {
    label: 'Valor Justo',
    color: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40',
    icon: Minus,
    trend: Minus,
  },
  overvalued: {
    label: 'Sobrevalorado',
    color: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40',
    icon: TrendingDown,
    trend: TrendingDown,
  },
}

// ─── Component ──────────────────────────────────────────────────────────────

interface AssetValuationAIProps {
  assetId: string
  assetName?: string
}

export function AssetValuationAI({ assetId, assetName }: AssetValuationAIProps) {
  const [valuation, setValuation] = useState<ValuationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchValuation = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)
      const res = await fetch(`/api/ai/valuation?assetId=${encodeURIComponent(assetId)}`)
      if (!res.ok) throw new Error('Error al generar la valoración')
      const data = await res.json()
      setValuation(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      toast({ title: 'Error', description: 'No se pudo generar la valoración IA', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [assetId, toast])

  useEffect(() => { fetchValuation() }, [fetchValuation])

  if (loading) {
    return (
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-5 w-28" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (error || !valuation) {
    return (
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="size-5 text-primary" />
            Valoración IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6">
            <AlertTriangle className="size-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No se pudo generar la valoración</p>
            <Button variant="outline" size="sm" className="mt-3 cursor-pointer" onClick={() => fetchValuation()}>
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const config = statusConfig[valuation.valuationStatus] || statusConfig.fair
  const StatusIcon = config.icon
  const gapIsPositive = valuation.valuationGap >= 0
  const gapColor = valuation.valuationStatus === 'undervalued'
    ? 'text-emerald-600 dark:text-emerald-400'
    : valuation.valuationStatus === 'overvalued'
      ? 'text-red-600 dark:text-red-400'
      : 'text-amber-600 dark:text-amber-400'

  return (
    <Card className="border-border/40 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="size-4 text-primary" />
            </div>
            Valoración IA
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={config.badge}>
              <StatusIcon className="size-3 mr-1" />
              {config.label}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => fetchValuation(false)}>
              <Loader2 className={`size-3.5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        {assetName && (
          <p className="text-sm text-muted-foreground mt-1">{assetName}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Value Comparison */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground font-medium">Valor Actual</p>
            <p className="text-lg font-bold tracking-tight mt-1">{formatUSD(valuation.currentPrice)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground font-medium">Valor Estimado</p>
            <p className={`text-lg font-bold tracking-tight mt-1 ${config.color}`}>{formatUSD(valuation.estimatedValue)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground font-medium">Brecha</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <StatusIcon className={`size-4 ${gapColor}`} />
              <p className={`text-lg font-bold tracking-tight ${gapColor}`}>
                {gapIsPositive ? '+' : ''}{valuation.valuationGap}%
              </p>
            </div>
          </div>
        </div>

        {/* Analysis */}
        {valuation.analysis && (
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{valuation.analysis}</p>
          </div>
        )}

        <Separator />

        {/* Factors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Positive */}
          {valuation.factors.positive.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Positivos
                </p>
              </div>
              <ul className="space-y-1">
                {valuation.factors.positive.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Negative */}
          {valuation.factors.negative.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <XCircle className="size-3.5 text-red-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Negativos
                </p>
              </div>
              <ul className="space-y-1">
                {valuation.factors.negative.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Neutral */}
          {valuation.factors.neutral.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Info className="size-3.5 text-amber-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Neutrales
                </p>
              </div>
              <ul className="space-y-1">
                {valuation.factors.neutral.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Separator />

        {/* Comparable Metrics */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Métricas Comparables</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Yield vs Mercado</p>
              <p className="text-sm font-semibold mt-1 truncate">{valuation.comparableMetrics.yieldVsMarket}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Precio/m²</p>
              <p className="text-sm font-semibold mt-1">{formatUSD(valuation.comparableMetrics.pricePerSqm)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Cap Rate</p>
              <p className="text-sm font-semibold mt-1">{valuation.comparableMetrics.capRate}%</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg bg-muted/50 border border-border/30 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-3.5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Esta valoración es generada por IA y no constituye una tasación profesional. Consulte a un tasador certificado para fines legales o financieros.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
