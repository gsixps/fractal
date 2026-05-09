'use client'

import { useState, useEffect, useCallback } from 'react'
import { useT } from '@/lib/i18n-utils'
import { useAppStore } from '@/lib/store'
import {
  BarChart3, TrendingUp, DollarSign, PieChart, Users,
  Plus, Minus, Loader2, ArrowRight, Building2, Briefcase,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FundHolding {
  id: string
  asset: { id: string; name: string; slug: string; type: string; status: string; images: { id: string; url: string; alt?: string; sortOrder: number; isCover: boolean }[] }
  currentWeightPct: number
  currentValue: number
  unrealizedPL: number | null
}

interface Fund {
  id: string
  name: string
  slug: string
  description: string
  status: string
  navPerShare: number
  pricePerShare: number
  totalShares: number
  availableShares: number
  totalAUM: number
  expenseRatio: number | null
  dividendYield: number | null
  totalReturn1Y: number | null
  totalReturnSinceInception: number | null
  fundType: string
  riskLevel: string
  rebalanceFrequency: string
  minInvestment: number
  maxInvestmentPerUser: number | null
  inceptionDate: string | null
  dividendFrequency: string
  fundManager: string | null
  badge: string | null
  highlights: string | null
  holdings: FundHolding[]
  _count: { fundInvestments: number }
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0,
})

function formatUSD(value: number): string {
  return usdFormatter.format(value)
}

function formatUSDShort(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  return `$${(value / 1_000_000).toFixed(1)}M`
}

const FUND_TYPE_BADGES: Record<string, { label: string; class: string }> = {
  mixed: {
    label: 'Diversificado',
    class: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40',
  },
  datacenter: {
    label: 'Tech Infra',
    class: 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800/40',
  },
  income: {
    label: 'Renta Mensual',
    class: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/40',
  },
  growth: {
    label: 'Crecimiento',
    class: 'bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800/40',
  },
  regional: {
    label: 'Regional',
    class: 'bg-teal-50 text-teal-700 border-teal-200/60 dark:bg-teal-950/50 dark:text-teal-400 dark:border-teal-800/40',
  },
}

const RISK_COLORS: Record<string, { label: string; class: string }> = {
  low: { label: 'Bajo', class: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40' },
  medium: { label: 'Medio', class: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/40' },
  high: { label: 'Alto', class: 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/40' },
}

// ─── Fund Card ────────────────────────────────────────────────────────────────

function FundCard({ fund, onInvest }: { fund: Fund; onInvest: (fund: Fund) => void }) {
  const t = useT()
  const selectFund = useAppStore((s) => s.selectFund)

  const typeBadge = FUND_TYPE_BADGES[fund.fundType] || FUND_TYPE_BADGES.mixed
  const riskBadge = RISK_COLORS[fund.riskLevel] || RISK_COLORS.medium

  return (
    <Card className="overflow-hidden rounded-xl border-border/50 shadow-sm gsp-card-hover group h-full flex flex-col">
      {/* Gradient header */}
      <div className="relative h-28 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/30 flex items-end p-4">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5" />
        <div className="absolute right-3 top-3 flex gap-1.5">
          <Badge className={typeBadge.class}>{typeBadge.label}</Badge>
          <Badge className={riskBadge.class}>{riskBadge.label}</Badge>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
          <BarChart3 className="h-5 w-5" />
        </div>
      </div>

      <CardContent className="p-4 md:p-6 flex flex-col gap-4 flex-1">
        {/* Name + Description */}
        <div>
          <h3 className="text-lg font-bold leading-snug">{fund.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground font-light line-clamp-2">
            {fund.description}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-light">{t('fund.nav')}</span>
            </div>
            <p className="text-base font-bold">{formatUSD(fund.navPerShare)}</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <PieChart className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-light">{t('fund.totalAUM')}</span>
            </div>
            <p className="text-base font-bold">{formatUSDShort(fund.totalAUM)}</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-light">{t('fund.dividendYield')}</span>
            </div>
            <p className="text-base font-bold text-primary">
              {fund.dividendYield != null ? `${fund.dividendYield}%` : '—'}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-light">{t('fund.totalReturn')}</span>
            </div>
            <p className="text-base font-bold text-primary">
              {fund.totalReturnSinceInception != null ? `${fund.totalReturnSinceInception}%` : '—'}
            </p>
          </div>
        </div>

        {/* Holdings + Investors */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            <span className="font-light">{fund.holdings.length} {t('fund.holdings')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span className="font-light">{fund._count.fundInvestments} {t('asset.investors')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 border-border/50 cursor-pointer"
            onClick={() => selectFund(fund.id)}
          >
            Ver Detalle
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
            onClick={() => onInvest(fund)}
          >
            Invertir
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Investment Sheet ─────────────────────────────────────────────────────────

function InvestmentSheet({
  fund,
  open,
  onOpenChange,
}: {
  fund: Fund | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useT()
  const { toast } = useToast()
  const user = useAppStore((s) => s.user)
  const [shares, setShares] = useState(1)
  const [loading, setLoading] = useState(false)

  const totalCost = fund ? shares * fund.pricePerShare : 0
  const minShares = fund ? Math.ceil(fund.minInvestment / fund.pricePerShare) : 1
  const isValid = fund ? totalCost >= fund.minInvestment && shares >= minShares : false
  const maxShares = fund ? Math.min(fund.availableShares, 1000) : 1

  // Reset shares when fund changes
  useEffect(() => {
    setShares(1)
  }, [fund?.id])

  const handleInvest = useCallback(async () => {
    if (!fund || !isValid || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/funds/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fundId: fund.id, shares }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({
          title: '¡Inversión exitosa!',
          description: `Has invertido ${formatUSD(totalCost)} en ${fund.name}`,
        })
        onOpenChange(false)
      } else {
        toast({
          title: 'Error en la inversión',
          description: data.error || 'Ocurrió un error inesperado',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error de conexión',
        description: 'No se pudo procesar la inversión. Intenta de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [fund, isValid, loading, shares, totalCost, toast, onOpenChange])

  if (!fund) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mt-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
            {t('fund.invest')}
          </SheetTitle>
          <SheetDescription className="font-light">
            {fund.name}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Fund Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground font-light">{t('fund.nav')}</p>
              <p className="text-lg font-bold">{formatUSD(fund.navPerShare)}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground font-light">Disponibles</p>
              <p className="text-lg font-bold">{fund.availableShares.toLocaleString()}</p>
            </div>
          </div>

          {/* Shares Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('fund.shares')}</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 border-border/50 cursor-pointer"
                onClick={() => setShares((s) => Math.max(1, s - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={1}
                max={maxShares}
                value={shares}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (!isNaN(v) && v >= 1 && v <= maxShares) setShares(v)
                }}
                className="text-center h-10 text-lg font-semibold"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 border-border/50 cursor-pointer"
                onClick={() => setShares((s) => Math.min(maxShares, s + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground font-light">
              {t('fund.invest.available', { available: fund.availableShares })}
            </p>
          </div>

          <Separator />

          {/* Cost Summary */}
          <div className="space-y-3 rounded-xl bg-primary/5 border border-primary/10 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-light">{t('fund.minInvestment')}</span>
              <span className="font-medium">{formatUSD(fund.minInvestment)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-light">{t('fund.invest.minShares', { min: minShares })}</span>
              <span className="font-medium">{shares >= minShares ? '✓' : `Necesitas ${minShares}`}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{t('fund.invest.totalCost')}</span>
              <span className="text-xl font-bold text-primary">{formatUSD(totalCost)}</span>
            </div>
          </div>

          {/* Not logged in warning */}
          {!user && (
            <div className="rounded-xl border border-amber-200/60 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/30">
              <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                Debes iniciar sesión para invertir
              </p>
            </div>
          )}

          {/* Confirm Button */}
          <Button
            size="lg"
            className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isValid || !user || loading}
            onClick={handleInvest}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              t('fund.invest.confirm') + ` — ${formatUSD(totalCost)}`
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function FundsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40 bg-gradient-to-b from-secondary/50 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-border/40">
              <Skeleton className="h-28 w-full" />
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-16 rounded-xl" />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FundsPage() {
  const t = useT()
  const user = useAppStore((s) => s.user)
  const [funds, setFunds] = useState<Fund[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const fetchFunds = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/funds')
      if (!res.ok) return
      const data = await res.json()
      setFunds(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFunds() }, [fetchFunds])

  const handleInvest = useCallback((fund: Fund) => {
    setSelectedFund(fund)
    setSheetOpen(true)
  }, [])

  if (loading) return <FundsPageSkeleton />

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-gradient-to-b from-secondary/50 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h1 className="gsp-serif text-3xl sm:text-4xl font-normal tracking-tight">
              {t('fund.marketplace.title')}
            </h1>
          </div>
          <p className="mt-2 text-muted-foreground text-lg font-light max-w-2xl">
            {t('fund.marketplace.subtitle')}
          </p>
        </div>
      </div>

      {/* Fund Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground font-light">
            {funds.length} {funds.length !== 1 ? 'fondos disponibles' : 'fondo disponible'}
          </p>
        </div>

        {funds.length === 0 ? (
          <div className="text-center py-20">
            <BarChart3 className="size-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">{t('fund.noFunds')}</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {funds.map((fund) => (
              <FundCard key={fund.id} fund={fund} onInvest={handleInvest} />
            ))}
          </div>
        )}
      </div>

      {/* Investment Sheet */}
      <InvestmentSheet
        fund={selectedFund}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}

export default FundsPage
