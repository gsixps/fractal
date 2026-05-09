'use client'

import { useEffect, useState, useCallback } from 'react'
import { useT } from '@/lib/i18n-utils'
import { useAppStore } from '@/lib/store'
import {
  ArrowLeft, TrendingUp, DollarSign, PieChart, Percent,
  BarChart3, Users, Briefcase, Calendar, RefreshCw, Clock,
  Shield, CheckCircle2, Loader2, ArrowUpRight, ArrowDownRight,
  Building2, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { useToast } from '@/hooks/use-toast'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FundHolding {
  id: string
  asset: { id: string; name: string; slug: string; type: string; status: string; city?: string; country?: string; annualYield?: number; pricePerFraction?: number; images: { id: string; url: string; alt?: string; sortOrder: number; isCover: boolean }[] }
  currentWeightPct: number
  currentValue: number
  unrealizedPL: number | null
  shares: number
  averageCost: number
}

interface NavHistoryEntry {
  id: string
  fundId: string
  date: string
  navPerShare: number
  totalAUM: number
  totalShares: number
}

interface FundDetail {
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
  initialNavPerShare: number
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
  navHistory: NavHistoryEntry[]
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

function parseHighlights(jsonString: string): string[] {
  try {
    const p = JSON.parse(jsonString)
    return Array.isArray(p) ? p : []
  } catch {
    return typeof jsonString === 'string' && jsonString.trim()
      ? jsonString.split('\n').filter(Boolean)
      : []
  }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('es-CL', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatDateShort(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('es-CL', {
      day: '2-digit', month: 'short',
    })
  } catch {
    return dateStr
  }
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

const RISK_CONFIG: Record<string, { label: string; class: string }> = {
  low: { label: 'Bajo Riesgo', class: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40' },
  medium: { label: 'Riesgo Medio', class: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/40' },
  high: { label: 'Alto Riesgo', class: 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/40' },
}

const REBALANCE_LABELS: Record<string, string> = {
  daily: 'Diario', weekly: 'Semanal', monthly: 'Mensual',
  quarterly: 'Trimestral', semi_annually: 'Semestral', annually: 'Anual',
}

const DIVIDEND_LABELS: Record<string, string> = {
  monthly: 'Mensual', quarterly: 'Trimestral', semi_annually: 'Semestral', annually: 'Anual',
}

const HOLDING_COLORS = [
  'bg-emerald-500', 'bg-sky-500', 'bg-amber-500', 'bg-purple-500',
  'bg-teal-500', 'bg-rose-500', 'bg-indigo-500', 'bg-orange-500',
]

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function FundDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border/40 gsp-glass">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 md:px-6">
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:py-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  )
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <Card className="mx-auto max-w-md border-border/40">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <BarChart3 className="h-7 w-7 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Error al cargar</h2>
            <p className="text-sm text-muted-foreground font-light">{message}</p>
            <Button variant="outline" onClick={onBack} className="mt-2 border-border/50 cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" /> {useT()('fund.detail.backToFunds')}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, sublabel, colorClass, valueColorClass }: {
  icon: React.ReactNode; label: string; value: string; sublabel: string; colorClass: string; valueColorClass: string
}) {
  return (
    <Card className="relative overflow-hidden border-border/40 gsp-card-hover">
      <CardContent className="p-4">
        <div className={cn('mb-2 inline-flex rounded-xl p-2', colorClass)}>{icon}</div>
        <p className="text-xs text-muted-foreground font-light">{label}</p>
        <p className={cn('text-lg font-bold tracking-tight', valueColorClass)}>{value}</p>
        <p className="text-xs text-muted-foreground font-light">{sublabel}</p>
      </CardContent>
      <div className="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-primary/4" />
    </Card>
  )
}

// ─── Investment Sheet ─────────────────────────────────────────────────────────

function InvestmentSheet({
  fund,
  open,
  onOpenChange,
}: {
  fund: FundDetail | null
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

  useEffect(() => { setShares(1) }, [fund?.id])

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
          <SheetDescription className="font-light">{fund.name}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
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

          <div className="space-y-3">
            <label className="text-sm font-medium">{t('fund.shares')}</label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 border-border/50 cursor-pointer"
                onClick={() => setShares((s) => Math.max(1, s - 1))}>
                <ArrowDownRight className="h-4 w-4" />
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
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 border-border/50 cursor-pointer"
                onClick={() => setShares((s) => Math.min(maxShares, s + 1))}>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground font-light">
              {t('fund.invest.available', { available: fund.availableShares })}
            </p>
          </div>

          <Separator />

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

          {!user && (
            <div className="rounded-xl border border-amber-200/60 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/30">
              <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                Debes iniciar sesión para invertir
              </p>
            </div>
          )}

          <Button
            size="lg"
            className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isValid || !user || loading}
            onClick={handleInvest}
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</>
            ) : (
              t('fund.invest.confirm') + ` — ${formatUSD(totalCost)}`
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground font-light">{label}</p>
      <p className="text-sm font-bold text-primary">{formatUSD(payload[0].value)}</p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FundDetailPage() {
  const t = useT()
  const selectedFundId = useAppStore((s) => s.selectedFundId)
  const navigate = useAppStore((s) => s.navigate)
  const user = useAppStore((s) => s.user)

  const [fund, setFund] = useState<FundDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [investOpen, setInvestOpen] = useState(false)

  const fetchFund = useCallback(async () => {
    if (!selectedFundId) {
      navigate('funds')
      return
    }
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/funds/${selectedFundId}`)
      if (!res.ok) {
        setError('No se pudo encontrar el fondo solicitado.')
        return
      }
      const data = await res.json()
      setFund(data)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [selectedFundId, navigate])

  useEffect(() => { fetchFund() }, [fetchFund])

  if (!selectedFundId) return null
  if (loading) return <FundDetailSkeleton />
  if (error) return <ErrorState message={error} onBack={() => navigate('funds')} />
  if (!fund) return <ErrorState message="Fondo no encontrado." onBack={() => navigate('funds')} />

  const typeBadge = FUND_TYPE_BADGES[fund.fundType] || FUND_TYPE_BADGES.mixed
  const riskBadge = RISK_CONFIG[fund.riskLevel] || RISK_CONFIG.medium
  const highlightsList = parseHighlights(fund.highlights || '[]')

  // NAV chart data
  const chartData = fund.navHistory.map((entry) => ({
    date: formatDateShort(entry.date),
    nav: entry.navPerShare,
  }))

  // Holdings totals
  const totalWeight = fund.holdings.reduce((sum, h) => sum + h.currentWeightPct, 0)
  const totalValue = fund.holdings.reduce((sum, h) => sum + h.currentValue, 0)
  const totalPL = fund.holdings.reduce((sum, h) => sum + (h.unrealizedPL || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Navigation Bar ── */}
      <div className="sticky top-0 z-40 border-b border-border/40 gsp-glass">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 overflow-x-auto px-4 md:px-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('funds')}
            className="shrink-0 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('fund.detail.backToFunds')}</span>
            <span className="sm:hidden">Volver</span>
          </Button>
          <Separator orientation="vertical" className="mx-1 h-5 shrink-0" />
          <Badge className={typeBadge.class}>{typeBadge.label}</Badge>
          <Badge className={riskBadge.class}>{riskBadge.label}</Badge>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:py-8 space-y-8">
        {/* 1. Hero Section */}
        <section>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <h1 className="gsp-serif text-2xl font-normal tracking-tight md:text-3xl">
                    {fund.name}
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground font-light max-w-2xl">
                  {fund.description}
                </p>
              </div>
              <Button
                size="lg"
                className="shrink-0 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 cursor-pointer"
                onClick={() => setInvestOpen(true)}
              >
                <TrendingUp className="h-4 w-4" />
                Invertir Ahora
              </Button>
            </div>
          </div>
        </section>

        {/* 2. Key Metrics */}
        <section>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <MetricCard
              icon={<DollarSign className="h-4 w-4" />}
              label={t('fund.nav')}
              value={formatUSD(fund.navPerShare)}
              sublabel={t('fund.perShare')}
              colorClass="bg-primary/8 text-primary"
              valueColorClass="text-primary"
            />
            <MetricCard
              icon={<PieChart className="h-4 w-4" />}
              label={t('fund.totalAUM')}
              value={formatUSDShort(fund.totalAUM)}
              sublabel="Under management"
              colorClass="bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400"
              valueColorClass="text-sky-600 dark:text-sky-400"
            />
            <MetricCard
              icon={<TrendingUp className="h-4 w-4" />}
              label={t('fund.dividendYield')}
              value={fund.dividendYield != null ? `${fund.dividendYield}%` : '—'}
              sublabel={t('fund.dividendFrequency')}
              colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
              valueColorClass="text-emerald-600 dark:text-emerald-400"
            />
            <MetricCard
              icon={<Percent className="h-4 w-4" />}
              label={t('fund.expenseRatio')}
              value={fund.expenseRatio != null ? `${fund.expenseRatio}%` : '—'}
              sublabel="Anual"
              colorClass="bg-secondary text-muted-foreground"
              valueColorClass="text-foreground"
            />
            <MetricCard
              icon={<ArrowUpRight className="h-4 w-4" />}
              label={t('fund.totalReturn')}
              value={fund.totalReturnSinceInception != null ? `${fund.totalReturnSinceInception}%` : '—'}
              sublabel="Desde inicio"
              colorClass="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
              valueColorClass="text-amber-600 dark:text-amber-400"
            />
            <MetricCard
              icon={<BarChart3 className="h-4 w-4" />}
              label="Shares Outstanding"
              value={fund.totalShares.toLocaleString()}
              sublabel={`${fund.availableShares.toLocaleString()} disponibles`}
              colorClass="bg-primary/8 text-primary"
              valueColorClass="text-primary"
            />
          </div>
        </section>

        {/* 3. NAV History Chart */}
        {chartData.length > 0 && (
          <section>
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {t('fund.navHistory')}
                </CardTitle>
                <CardDescription className="font-light">
                  Evolución del valor liquidativo por participación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={false}
                        tickFormatter={(v: number) => `$${v}`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="nav"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#navGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* 4. Holdings Breakdown */}
        {fund.holdings.length > 0 && (
          <section>
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5 text-primary" />
                  {t('fund.holdings')} — Composición del Fondo
                </CardTitle>
                <CardDescription className="font-light">
                  {fund.holdings.length} activos en el portafolio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Visual Progress Bars */}
                <div className="space-y-3">
                  {fund.holdings.map((holding, idx) => (
                    <div key={holding.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={cn('h-2.5 w-2.5 rounded-full shrink-0', HOLDING_COLORS[idx % HOLDING_COLORS.length])} />
                          <span className="font-medium truncate">{holding.asset.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          <span className="text-muted-foreground font-light text-xs">
                            {formatUSD(holding.currentValue)}
                          </span>
                          <span className="font-bold w-12 text-right">
                            {holding.currentWeightPct.toFixed(1)}%
                          </span>
                          {holding.unrealizedPL != null && (
                            <span className={cn(
                              'text-xs font-medium w-16 text-right',
                              holding.unrealizedPL >= 0 ? 'text-primary' : 'text-destructive'
                            )}>
                              {holding.unrealizedPL >= 0 ? '+' : ''}{formatUSD(holding.unrealizedPL)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="gsp-progress-bar" style={{ height: '6px' }}>
                        <div
                          className={cn('gsp-progress-bar-fill', holding.unrealizedPL != null && holding.unrealizedPL < 0 ? '!bg-destructive' : '')}
                          style={{ width: `${holding.currentWeightPct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Total row */}
                <div className="flex items-center justify-between text-sm font-semibold pt-1">
                  <span>Total</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground font-light">{formatUSD(totalValue)}</span>
                    <span className="w-12 text-right">{totalWeight.toFixed(1)}%</span>
                    <span className={cn(
                      'w-16 text-right text-xs',
                      totalPL >= 0 ? 'text-primary' : 'text-destructive'
                    )}>
                      {totalPL >= 0 ? '+' : ''}{formatUSD(totalPL)}
                    </span>
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block max-h-64 overflow-y-auto rounded-xl border border-border/30 custom-scrollbar">
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow className="border-border/30 hover:bg-transparent">
                        <TableHead>Activo</TableHead>
                        <TableHead className="text-right">{t('fund.weight')}</TableHead>
                        <TableHead className="text-right">{t('fund.currentValue')}</TableHead>
                        <TableHead className="text-right">P&L No Realizado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fund.holdings.map((holding) => (
                        <TableRow key={holding.id} className="border-border/20">
                          <TableCell className="font-medium text-sm">{holding.asset.name}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">{holding.currentWeightPct.toFixed(1)}%</TableCell>
                          <TableCell className="text-right text-sm">{formatUSD(holding.currentValue)}</TableCell>
                          <TableCell className={cn('text-right text-sm font-medium', (holding.unrealizedPL || 0) >= 0 ? 'text-primary' : 'text-destructive')}>
                            {holding.unrealizedPL != null ? `${(holding.unrealizedPL >= 0 ? '+' : '')}${formatUSD(holding.unrealizedPL)}` : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* 5. Fund Info Grid */}
        <section>
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                Información del Fondo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-light">Tipo de Fondo</span>
                  </div>
                  <p className="text-sm font-semibold">{typeBadge.label}</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-light">Nivel de Riesgo</span>
                  </div>
                  <p className="text-sm font-semibold">{riskBadge.label}</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-light">{t('fund.rebalanceFrequency')}</span>
                  </div>
                  <p className="text-sm font-semibold">{REBALANCE_LABELS[fund.rebalanceFrequency] || fund.rebalanceFrequency}</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-light">{t('fund.dividendFrequency')}</span>
                  </div>
                  <p className="text-sm font-semibold">{DIVIDEND_LABELS[fund.dividendFrequency] || fund.dividendFrequency}</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-light">{t('fund.inceptionDate')}</span>
                  </div>
                  <p className="text-sm font-semibold">
                    {fund.inceptionDate ? formatDate(fund.inceptionDate) : '—'}
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-light">{t('fund.fundManager')}</span>
                  </div>
                  <p className="text-sm font-semibold">{fund.fundManager || '3GSP Capital'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 6. Highlights */}
        {highlightsList.length > 0 && (
          <section>
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Destacados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {highlightsList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground font-light">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        )}

        {/* 7. Back Button */}
        <div className="flex justify-center pb-8">
          <Button variant="outline" size="lg" onClick={() => navigate('funds')}
            className="gap-2 border-border/50 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> {t('fund.detail.backToFunds')}
          </Button>
        </div>
      </div>

      {/* Investment Sheet */}
      <InvestmentSheet fund={fund} open={investOpen} onOpenChange={setInvestOpen} />
    </div>
  )
}
