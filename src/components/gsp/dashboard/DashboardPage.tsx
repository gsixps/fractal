'use client'

import { useEffect } from 'react'

import {
  Wallet,
  TrendingUp,
  DollarSign,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Clock,
  Zap,
  Droplets,
  ChevronRight,
  Activity,
  Eye,
} from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function formatCLP(value: number): string {
  return clpFormatter.format(value)
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatPeriod(start: string, end: string): string {
  try {
    const s = new Date(start)
    const e = new Date(end)
    return `${s.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })} - ${e.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })}`
  } catch {
    return `${start} - ${end}`
  }
}

function formatAssetType(type: string): string {
  const map: Record<string, string> = {
    office: 'Oficina', residential: 'Residencial', retail: 'Comercial',
    industrial: 'Industrial', last_mile_logistics: 'Logística Última Milla',
    mixed_use: 'Uso Mixto', micro_datacenter: 'Data Center',
    solar_energy: 'Energía Solar', mining: 'Minería', real_estate: 'Inmueble',
  }
  return map[type] || type
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

/* Impeccable: Stat cards with subtle gradient accent */
function StatCard({
  title,
  value,
  icon: Icon,
  valueColorClass,
  description,
  accentColor = 'bg-primary/8 text-primary',
}: {
  title: string
  value: string
  icon: React.ElementType
  valueColorClass?: string
  description: string
  accentColor?: string
}) {
  return (
    <Card className="relative overflow-hidden border-border/40 gsp-card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-sm font-medium text-muted-foreground">
          {title}
        </CardDescription>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', accentColor)}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className={cn('text-2xl font-bold tracking-tight', valueColorClass)}>
          {value}
        </p>
      </CardContent>
      <div className="px-6 pb-4">
        <p className="text-xs text-muted-foreground font-light">{description}</p>
      </div>
      {/* Subtle corner accent — no harsh colors */}
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/4" />
    </Card>
  )
}

function InvestmentCard({
  investment,
  onViewAsset,
}: {
  investment: {
    id: string; userId: string; assetId: string; quantity: number;
    pricePerUnit: number; totalAmount: number; status: string; completedAt?: string;
    createdAt: string; updatedAt: string;
    asset: {
      id: string; name: string; type: string; status: string;
      pricePerFraction: number; annualYield: number;
      images: { id: string; url: string; alt?: string; sortOrder: number; isCover: boolean }[]
    }
  }
  onViewAsset: (assetId: string) => void
}) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: 'Activo', className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40' },
    completed: { label: 'Completado', className: 'bg-secondary text-muted-foreground border-border/50 dark:bg-secondary dark:text-muted-foreground dark:border-border/30' },
    pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/40' },
    cancelled: { label: 'Cancelado', className: 'bg-red-50 text-red-600 border-red-200/60 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/40' },
  }

  const status = statusConfig[investment.status] || statusConfig.pending
  const coverUrl = investment.asset.images[0]?.url

  return (
    <Card className="gsp-card-interactive border-border/40">
      <CardContent className="p-4 sm:p-5">
        <div className="flex gap-4">
          <div className="hidden sm:block h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
            {coverUrl ? (
              <img src={coverUrl} alt={investment.asset.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold truncate">{investment.asset.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-light">
                  {formatAssetType(investment.asset.type)}
                </p>
              </div>
              <Badge className={cn('border text-xs', status.className)}>{status.label}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground font-light">Fracciones</p>
                <p className="font-semibold">{investment.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-light">Total</p>
                <p className="font-semibold">{formatCLP(investment.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-light">Fecha</p>
                <p className="font-semibold text-xs">{formatDate(investment.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-light">Yield anual</span>
                  <span className="font-medium text-primary">{investment.asset.annualYield}%</span>
                </div>
                <div className="gsp-progress-bar" style={{ height: '4px' }}>
                  <div className="gsp-progress-bar-fill" style={{ width: `${investment.asset.annualYield}%` }} />
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs border-border/50 hover:border-primary/30 cursor-pointer"
              onClick={() => onViewAsset(investment.assetId)}
            >
              Ver Activo
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DividendStatusBadge({ status }: { status: string }) {
  if (status === 'paid') {
    return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40">Pagado</Badge>
  }
  return (
    <Badge className="bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/40">
      <Clock className="mr-1 h-3 w-3" /> Pendiente
    </Badge>
  )
}

function TransactionTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; className: string }> = {
    purchase: { label: 'Compra', className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40' },
    sale: { label: 'Venta', className: 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/40' },
    dividend: { label: 'Dividendo', className: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/40' },
    deposit: { label: 'Depósito', className: 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800/40' },
    withdrawal: { label: 'Retiro', className: 'bg-secondary text-muted-foreground border-border/50 dark:bg-secondary dark:text-muted-foreground dark:border-border/30' },
  }
  const c = config[type] || config.deposit
  return <Badge className={cn('border', c.className)}>{c.label}</Badge>
}

function TransactionStatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40',
    pending: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/40',
    processing: 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800/40',
    failed: 'bg-red-50 text-red-600 border-red-200/60 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/40',
  }
  const statusLabels: Record<string, string> = {
    completed: 'Completado', pending: 'Pendiente', processing: 'Procesando', failed: 'Fallido',
  }
  return <Badge className={cn('border', config[status] || config.pending)}>{statusLabels[status] || status}</Badge>
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { navigate, selectAsset, fetchDashboard, dashboardLoading } = useAppStore()
  const dashboardData = useAppStore((s) => s.dashboardData)

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  const user = dashboardData.user
  const portfolioValue = (user?.totalInvested || 0) + dashboardData.totalDividends
  const recentDividends = dashboardData.dividendPayments.slice(0, 10)
  const recentTransactions = dashboardData.transactions.slice(0, 10)

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72 mb-8" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl mb-8" />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-8">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </main>
      </div>
    )
  }

  const data = dashboardData

  function handleViewAsset(assetId: string) {
    selectAsset(assetId)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="gsp-serif text-2xl font-normal tracking-tight sm:text-3xl">
                Panel de Inversiones
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-light">
                Bienvenido, {user?.name || 'Inversor'} — Resumen de tu portafolio
              </p>
            </div>
            {data.unreadNotifications > 0 && (
              <Button variant="outline" size="sm" className="w-fit gap-2 border-border/50 cursor-pointer">
                <Eye className="h-4 w-4" />
                {data.unreadNotifications} notificacion{data.unreadNotifications > 1 ? 'es' : ''} nueva{data.unreadNotifications > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>

        {/* ── 1. Stats Row ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
          <StatCard
            title="Saldo Disponible"
            value={formatCLP(user?.balance || 0)}
            icon={Wallet}
            description="Fondos disponibles para invertir"
          />
          <StatCard
            title="Total Invertido"
            value={formatCLP(user?.totalInvested || 0)}
            icon={TrendingUp}
            description="Capital invertido acumulado"
          />
          <StatCard
            title="Dividendos Totales"
            value={formatCLP(data.totalDividends)}
            icon={DollarSign}
            valueColorClass="text-primary"
            description="Dividendos recibidos (historial)"
          />
          <StatCard
            title="Valor del Portafolio"
            value={formatCLP(portfolioValue)}
            icon={PiggyBank}
            valueColorClass="text-primary"
            description="Invertido + dividendos"
          />
        </div>

        {/* ── 2. Investments Grid ── */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Mis Inversiones</h2>
              <p className="text-sm text-muted-foreground font-light">
                {data.investments.length} activo{data.investments.length !== 1 ? 's' : ''} en tu portafolio
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 border-border/50 cursor-pointer"
              onClick={() => navigate('marketplace')}>
              Explorar Activos
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {data.investments.length === 0 ? (
            <Card className="border-border/40">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Building2 className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">Aún no tienes inversiones</p>
                <p className="mt-1 text-xs text-muted-foreground font-light">Explora el marketplace y comienza a invertir</p>
                <Button className="mt-4 bg-primary hover:bg-primary/90 cursor-pointer" onClick={() => navigate('marketplace')}>
                  Ir al Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.investments.map((inv) => (
                <InvestmentCard key={inv.id} investment={inv} onViewAsset={handleViewAsset} />
              ))}
            </div>
          )}
        </section>

        {/* ── 3 & 4. Tables ── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-8">
          {/* Recent Dividends */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-primary" />
                Dividendos Recientes
              </CardTitle>
              <CardDescription className="font-light">Últimos pagos de dividendos recibidos</CardDescription>
            </CardHeader>
            <CardContent>
              {recentDividends.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-muted-foreground font-light">Sin dividendos registrados</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30">
                        <TableHead>Período</TableHead>
                        <TableHead>Activo</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentDividends.map((div) => (
                        <TableRow key={div.id} className="border-border/20">
                          <TableCell className="text-xs whitespace-nowrap">{formatPeriod(div.periodStart, div.periodEnd)}</TableCell>
                          <TableCell className="text-sm max-w-[120px] truncate" title={div.investment.asset.name}>{div.investment.asset.name}</TableCell>
                          <TableCell className="text-sm text-right font-medium whitespace-nowrap text-primary">{formatCLP(div.amount)}</TableCell>
                          <TableCell className="text-center"><DividendStatusBadge status={div.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Transacciones Recientes
              </CardTitle>
              <CardDescription className="font-light">Últimos movimientos en tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-muted-foreground font-light">Sin transacciones registradas</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30">
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="hidden sm:table-cell">Descripción</TableHead>
                        <TableHead className="text-right">Fecha</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((tx) => {
                        const isCredit = tx.type === 'dividend' || tx.type === 'sale' || tx.type === 'deposit'
                        return (
                          <TableRow key={tx.id} className="border-border/20">
                            <TableCell><TransactionTypeBadge type={tx.type} /></TableCell>
                            <TableCell className="text-sm text-right font-medium whitespace-nowrap">
                              <span className={isCredit ? 'text-primary' : ''}>
                                {isCredit ? '+' : '-'}{formatCLP(tx.amount)}
                              </span>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-xs text-muted-foreground max-w-[180px] truncate font-light" title={tx.description}>
                              {tx.description || '—'}
                            </TableCell>
                            <TableCell className="text-xs text-right text-muted-foreground whitespace-nowrap">{formatDate(tx.createdAt)}</TableCell>
                            <TableCell className="text-center"><TransactionStatusBadge status={tx.status} /></TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── 5. Liquidity Pool Card ── */}
        {data.liquidityPool && (
          <section className="mb-8">
            <Card className="border-0 gsp-gradient-hero text-white overflow-hidden relative">
              {/* Decorative shapes */}
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5" />
              <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-white/5" />

              <CardHeader className="relative">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                      <Droplets className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">Pool de Liquidez</CardTitle>
                      <CardDescription className="text-white/70 font-light">
                        Fondo de liquidez inmediata para inversiones
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="w-fit border border-white/20 bg-white/10 text-white/90 hover:bg-white/15 font-medium">
                    {data.liquidityPool.autoReplenish ? 'Auto-reposición activa' : 'Reposición manual'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-xs text-white/70 font-light">Reserva Total</p>
                    <p className="text-xl font-bold mt-1">{formatCLP(data.liquidityPool.totalReserve)}</p>
                    <p className="text-xs text-white/50 mt-1">{data.liquidityPool.totalAssets} activos respaldados</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-xs text-white/70 font-light">Tasa de Utilización</p>
                    <p className="text-xl font-bold mt-1">{data.liquidityPool.utilizationRate.toFixed(1)}%</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
                      <div className="h-full rounded-full bg-white/80 transition-all duration-700"
                        style={{ width: `${Math.min(data.liquidityPool.utilizationRate, 100)}%` }} />
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-xs text-white/70 font-light">Solicitudes Activas</p>
                    <p className="text-xl font-bold mt-1">{data.liquidityPool.activeRequests}</p>
                    <p className="text-xs text-white/50 mt-1">
                      {data.liquidityPool.monthlyContribution
                        ? `Aporte mensual: ${formatCLP(data.liquidityPool.monthlyContribution)}`
                        : 'Sin aporte mensual'}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3 sm:justify-end">
                  <Button variant="outline" size="sm"
                    className="border-white/25 text-white hover:bg-white/15 hover:text-white transition-colors duration-200 cursor-pointer"
                    onClick={() => navigate('liquidity')}>
                    <Zap className="mr-2 h-4 w-4" /> Solicitar Salida Express
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* ── 6. Quick Actions ── */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="gsp-card-interactive border-border/40">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Invertir</p>
                  <p className="text-xs text-muted-foreground font-light">Explora activos disponibles</p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 text-xs border-border/50 cursor-pointer"
                  onClick={() => navigate('marketplace')}>Ir</Button>
              </CardContent>
            </Card>
            <Card className="gsp-card-interactive border-border/40">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Salida Express</p>
                  <p className="text-xs text-muted-foreground font-light">Vende fracciones en 48 hrs</p>
                </div>
                <Button variant="outline" size="sm"
                  className="shrink-0 text-xs border-amber-200/50 text-amber-700 hover:bg-amber-50 cursor-pointer dark:border-amber-800/30 dark:text-amber-400 dark:hover:bg-amber-950/50"
                  onClick={() => navigate('liquidity')}>Ir</Button>
              </CardContent>
            </Card>
            <Card className="gsp-card-interactive border-border/40">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                  <ArrowDownRight className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Retirar Ganancias</p>
                  <p className="text-xs text-muted-foreground font-light">Disponible: {formatCLP(user?.totalEarnings || 0)}</p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 text-xs border-border/50 cursor-pointer">Ir</Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
