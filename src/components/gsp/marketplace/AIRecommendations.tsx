'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Sparkles,
  Building2,
  MapPin,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2 as BuildingIcon,
  FlaskConical,
  Truck,
  Sun,
  Pickaxe,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Recommendation {
  assetId: string
  assetName: string
  reason: string
  score: number
  matchType: string
}

// ─── Config ─────────────────────────────────────────────────────────────────

const MATCH_TYPE_LABELS: Record<string, string> = {
  diversification: 'Diversificación',
  yield: 'Alto Rendimiento',
  growth: 'Crecimiento',
  budget_fit: 'Ajuste Presupuesto',
  geographic: 'Expansión Geográfica',
}

const MATCH_TYPE_COLORS: Record<string, string> = {
  diversification: 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800/40',
  yield: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40',
  growth: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/40',
  budget_fit: 'bg-primary/8 text-primary border-primary/20',
  geographic: 'bg-violet-50 text-violet-700 border-violet-200/60 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800/40',
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  real_estate: <Building2 className="size-3.5" />,
  micro_datacenter: <FlaskConical className="size-3.5" />,
  last_mile_logistics: <Truck className="size-3.5" />,
  solar_energy: <Sun className="size-3.5" />,
  mining: <Pickaxe className="size-3.5" />,
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function RecommendationCard({ rec, onInvest }: { rec: Recommendation; onInvest: () => void }) {
  const scoreColor = rec.score >= 85
    ? 'text-emerald-600 dark:text-emerald-400'
    : rec.score >= 70
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-muted-foreground'

  return (
    <Card className="border-border/40 gsp-card-hover shrink-0 w-[280px] sm:w-[320px]">
      <CardContent className="p-4 sm:p-5 space-y-3">
        {/* Score badge */}
        <div className="flex items-center justify-between">
          <Badge className={cn('border text-[10px] px-1.5 py-0 font-medium', MATCH_TYPE_COLORS[rec.matchType] || MATCH_TYPE_COLORS.diversification)}>
            {MATCH_TYPE_LABELS[rec.matchType] || rec.matchType}
          </Badge>
          <div className="flex items-center gap-1">
            <Star className={cn('h-3.5 w-3.5 fill-current', scoreColor)} />
            <span className={cn('text-sm font-bold', scoreColor)}>{rec.score}%</span>
          </div>
        </div>

        {/* Asset name */}
        <div>
          <h4 className="text-sm font-semibold leading-snug line-clamp-1">{rec.assetName}</h4>
        </div>

        {/* Match reason */}
        <p className="text-xs text-muted-foreground leading-relaxed font-light line-clamp-3">
          {rec.reason}
        </p>

        {/* Invest button */}
        <Button size="sm" onClick={onInvest}
          className="w-full text-xs bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
          Invertir
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  )
}

function RecommendationsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-border/40 shrink-0 w-[280px] sm:w-[320px]">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function RecommendationsError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-border/40">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40">
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </div>
        <p className="text-xs text-muted-foreground font-light flex-1">
          No se pudieron cargar las recomendaciones de IA.
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}
          className="shrink-0 text-xs border-border/50 cursor-pointer">
          Reintentar
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AIRecommendations() {
  const user = useAppStore((s) => s.user)
  const selectAsset = useAppStore((s) => s.selectAsset)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const fetchRecommendations = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/recommendations')
      if (!res.ok) {
        setError(true)
        return
      }
      const data = await res.json()
      if (data.recommendations && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  // Only show when user is logged in
  if (!user) return null

  // Loading state
  if (loading) {
    return (
      <div className="mb-6">
        <RecommendationsSkeleton />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="mb-6">
        <RecommendationsError onRetry={fetchRecommendations} />
      </div>
    )
  }

  // Empty state — no recommendations available
  if (recommendations.length === 0) return null

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h2 className="gsp-serif text-xl font-normal tracking-tight">Recomendado por IA</h2>
          <p className="text-xs text-muted-foreground font-light">
            Activos sugeridos según tu portafolio y perfil
          </p>
        </div>
      </div>

      {/* Horizontal scrollable cards */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scroll-smooth">
        {recommendations.map((rec, idx) => (
          <RecommendationCard
            key={idx}
            rec={rec}
            onInvest={() => selectAsset(rec.assetId)}
          />
        ))}
      </div>
    </div>
  )
}
