'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Sparkles,
  TrendingUp,
  PieChart,
  DollarSign,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Insight {
  type: 'performance' | 'diversification' | 'dividend' | 'recommendation' | 'alert'
  title: string
  message: string
  metric?: string
  metricValue?: string
  priority: 'high' | 'medium' | 'low'
}

// ─── Config ─────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, React.ElementType> = {
  performance: TrendingUp,
  diversification: PieChart,
  dividend: DollarSign,
  recommendation: Lightbulb,
  alert: AlertTriangle,
}

const TYPE_COLORS: Record<string, string> = {
  performance: 'bg-primary/8 text-primary',
  diversification: 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
  dividend: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  recommendation: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  alert: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
}

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/40',
  medium: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/40',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40',
}

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: Insight }) {
  const Icon = TYPE_ICONS[insight.type] || Lightbulb
  const colorClass = TYPE_COLORS[insight.type] || TYPE_COLORS.recommendation

  return (
    <Card className="border-border/40 gsp-card-hover relative overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', colorClass)}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold leading-snug">{insight.title}</h4>
              <Badge className={cn('border text-[10px] shrink-0 px-1.5 py-0', PRIORITY_STYLES[insight.priority])}>
                {PRIORITY_LABELS[insight.priority]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-light">
              {insight.message}
            </p>
            {insight.metric && insight.metricValue && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {insight.metric}
                </span>
                <span className={cn(
                  'text-sm font-bold',
                  insight.priority === 'high' ? 'text-red-600 dark:text-red-400'
                    : insight.priority === 'medium' ? 'text-amber-600 dark:text-amber-400'
                    : 'text-primary'
                )}>
                  {insight.metricValue}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InsightsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/40">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-border/40">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <p className="text-sm font-medium">No se pudieron cargar los insights</p>
          <p className="text-xs text-muted-foreground font-light mt-1">
            Hubo un error al generar las recomendaciones de IA.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry}
          className="gap-2 border-border/50 cursor-pointer">
          <RefreshCw className="h-3.5 w-3.5" />
          Reintentar
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AIInsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/insights')
      if (!res.ok) {
        setError(true)
        return
      }
      const data = await res.json()
      if (data.insights && Array.isArray(data.insights)) {
        setInsights(data.insights)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  if (loading) {
    return (
      <section className="mb-8">
        <InsightsSkeleton />
      </section>
    )
  }

  if (error) {
    return (
      <section className="mb-8">
        <ErrorState onRetry={fetchInsights} />
      </section>
    )
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="gsp-serif text-xl font-normal tracking-tight">IA Insights</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchInsights}
          disabled={loading}
          className="gap-2 border-border/50 text-xs cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Refresh insights
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {insights.map((insight, idx) => (
          <InsightCard key={idx} insight={insight} />
        ))}
      </div>
    </section>
  )
}
