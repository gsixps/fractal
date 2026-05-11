'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Brain,
  AlertTriangle,
  Loader2,
  Info,
  ShieldAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuarterlyPrediction {
  quarter: string
  expectedDividendPerFraction: number
  expectedYield: number
  confidence: number
  factors: string[]
}

interface PredictionData {
  assetId: string
  predictions: QuarterlyPrediction[]
  overallOutlook: 'bullish' | 'neutral' | 'bearish'
  riskFactors: string[]
}

// ─── Config ─────────────────────────────────────────────────────────────────

const OUTLOOK_CONFIG: Record<string, { label: string; className: string }> = {
  bullish: {
    label: 'Alcista',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40',
  },
  neutral: {
    label: 'Neutral',
    className: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/40',
  },
  bearish: {
    label: 'Bajista',
    className: 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/40',
  },
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100)
  const barColor =
    pct >= 75
      ? 'bg-emerald-500'
      : pct >= 50
        ? 'bg-amber-500'
        : 'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground font-medium w-8 text-right">
        {pct}%
      </span>
    </div>
  )
}

function PredictionsSkeleton() {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-48" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-2 w-24 rounded-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-border/40">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <p className="text-sm font-medium">No se pudieron generar las predicciones</p>
          <p className="text-xs text-muted-foreground font-light mt-1">
            Hubo un error al generar las predicciones de dividendos con IA.
          </p>
        </div>
        <Badge
          variant="outline"
          className="cursor-pointer border-border/50 text-xs hover:bg-accent"
          onClick={onRetry}
        >
          Reintentar
        </Badge>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface AIPredictionsCardProps {
  assetId: string
}

export default function AIPredictionsCard({ assetId }: AIPredictionsCardProps) {
  const [data, setData] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchPredictions = useCallback(async () => {
    if (!assetId) return
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/predictions?assetId=${encodeURIComponent(assetId)}`)
      if (!res.ok) {
        setError(true)
        return
      }
      const json = await res.json()
      if (json.predictions && Array.isArray(json.predictions)) {
        setData(json)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [assetId])

  useEffect(() => {
    fetchPredictions()
  }, [fetchPredictions])

  if (loading) {
    return <PredictionsSkeleton />
  }

  if (error) {
    return <ErrorState onRetry={fetchPredictions} />
  }

  if (!data) return null

  const outlook = OUTLOOK_CONFIG[data.overallOutlook] || OUTLOOK_CONFIG.neutral

  return (
    <Card className="border-2 border-primary/15 gsp-card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8 text-primary">
              <Brain className="h-4 w-4" />
            </div>
            Predicción IA de Dividendos
          </CardTitle>
          <Badge className={cn('border text-xs font-medium', outlook.className)}>
            {outlook.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Quarterly Predictions Table */}
        <div className="rounded-xl border border-border/30 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead>Trimestre</TableHead>
                <TableHead className="text-right">Dividendo Est.</TableHead>
                <TableHead className="text-right">Yield</TableHead>
                <TableHead className="min-w-[100px]">Confianza</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.predictions.map((pred, idx) => (
                <TableRow key={idx} className="border-border/20">
                  <TableCell className="text-sm font-medium">{pred.quarter}</TableCell>
                  <TableCell className="text-sm text-right font-semibold text-primary">
                    {formatUSD(pred.expectedDividendPerFraction)}
                  </TableCell>
                  <TableCell className="text-sm text-right">{pred.expectedYield}%</TableCell>
                  <TableCell>
                    <ConfidenceBar confidence={pred.confidence} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Risk Factors */}
        {data.riskFactors.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
              Factores de Riesgo
            </h4>
            <ul className="space-y-1.5">
              {data.riskFactors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                  <span className="font-light leading-relaxed">{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 border border-border/30 p-3">
          <Info className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Las predicciones son generadas por inteligencia artificial y se basan en datos históricos
            y proyecciones del activo. No constituyen asesoría financiera. Los dividendos reales pueden
            variar según condiciones de mercado, ocupación y otros factores.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
