'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  Droplets,
  Search,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  ArrowUpRight,
  Activity,
  RefreshCw,
  Menu,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart3,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/lib/store'

// ─── CLP Formatter ───────────────────────────────────────────────────────────
function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatShortCLP(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}MM`
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(0)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount.toLocaleString('es-CL')}`
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface Stats {
  overview: {
    totalUsers: number
    totalInvestors: number
    verifiedUsers: number
    kycPending: number
    kycRejected: number
    recentSignups: number
  }
  assets: {
    total: number
    active: number
    draft: number
    avgYield: number
    avgFundedPercentage: number
    distribution: { type: string; count: number; totalValue: number; avgFundedPercentage: number }[]
  }
  investments: {
    total: number
    active: number
    totalInvested: number
    activeInvested: number
    avgInvestment: number
    recentInvestments: number
    recentInvestmentVolume: number
  }
  dividends: { total: number; totalPaid: number }
  transactions: { total: number; totalVolume: number }
  liquidity: { totalReserve: number; totalAssets: number; activeRequests: number; utilizationRate: number; autoReplenish: boolean } | null
}

interface AssetRow {
  id: string
  name: string
  type: string
  status: string
  city: string
  region: string
  address: string
  totalValue: number
  pricePerFraction: number
  totalFractions: number
  availableFractions: number
  minimumInvestment: number
  annualYield: number
  projectedAppreciation: number
  totalProjectedReturn: number
  shortDescription: string
  fullDescription: string
  fundedPercentage: number
  investmentCount: number
}

interface UserRow {
  id: string
  email: string
  name: string | null
  phone: string | null
  rut: string | null
  role: string
  kycStatus: string
  balance: number
  totalInvested: number
  totalEarnings: number
  createdAt: string
  _count: { investments: number; transactions: number; dividendPayments: number; kycDocuments: number }
}

interface InvestmentRow {
  id: string
  userId: string
  assetId: string
  quantity: number
  pricePerUnit: number
  totalAmount: number
  status: string
  createdAt: string
  user: { id: string; name: string | null; email: string }
  asset: { id: string; name: string; type: string; pricePerFraction: number }
}

interface LiquidityData {
  pool: {
    id: string
    totalReserve: number
    totalAssets: number
    activeRequests: number
    utilizationRate: number
    monthlyContribution: number | null
    autoReplenish: boolean
  }
  stats: {
    totalRequestedAmount: number
    totalCompletedAmount: number
    totalFeesCollected: number
    pendingCount: number
    processingCount: number
    completedCount: number
    rejectedCount: number
  }
  activeRequests: Array<{
    id: string
    userId: string
    investmentId: string
    fractionCount: number
    totalAmount: number
    status: string
    createdAt: string
    user: { id: string; name: string | null; email: string }
  }>
  recentRequests: Array<{
    id: string
    userId: string
    investmentId: string
    fractionCount: number
    totalAmount: number
    status: string
    createdAt: string
    user: { id: string; name: string | null; email: string }
  }>
}

// ─── Asset Form State ───────────────────────────────────────────────────────
interface AssetFormState {
  name: string
  type: string
  address: string
  city: string
  region: string
  totalValue: string
  pricePerFraction: string
  totalFractions: string
  availableFractions: string
  minimumInvestment: string
  annualYield: string
  projectedAppreciation: string
  totalProjectedReturn: string
  shortDescription: string
  status: string
}

const emptyAssetForm: AssetFormState = {
  name: '', type: 'real_estate', address: '', city: '', region: '',
  totalValue: '', pricePerFraction: '', totalFractions: '', availableFractions: '',
  minimumInvestment: '', annualYield: '', projectedAppreciation: '',
  totalProjectedReturn: '', shortDescription: '', status: 'draft',
}

// ─── User Form State ────────────────────────────────────────────────────────
interface UserFormState {
  name: string
  email: string
  phone: string
  rut: string
  role: string
  kycStatus: string
  balance: string
}

const emptyUserForm: UserFormState = {
  name: '', email: '', phone: '', rut: '', role: 'investor',
  kycStatus: 'pending', balance: '0',
}

// ─── Status Badge Components ─────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40',
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200/60 dark:border-yellow-800/40',
    paused: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200/60 dark:border-orange-800/40',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200/60 dark:border-yellow-800/40',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200/60 dark:border-red-800/40',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40',
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40',
    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200/60 dark:border-red-800/40',
  }
  const label: Record<string, string> = {
    active: 'Activo', draft: 'Borrador', paused: 'Pausado',
    pending: 'Pendiente', completed: 'Completado', cancelled: 'Cancelado',
    processing: 'Procesando', verified: 'Verificado', submitted: 'Enviado',
    rejected: 'Rechazado',
  }
  return (
    <Badge variant="outline" className={config[status] || 'bg-secondary text-muted-foreground border-border/50'}>
      {label[status] || status}
    </Badge>
  )
}

// ─── KPI Card Component ─────────────────────────────────────────────────────
function KpiCard({
  title, value, subtitle, icon: Icon, trend,
}: {
  title: string; value: string; subtitle: string
  icon: React.ElementType; trend?: { value: string; positive: boolean }
}) {
  return (
    <Card className="relative overflow-hidden border-border/40 gsp-card-hover">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <div className="flex items-center gap-1.5">
              {trend && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${trend.positive ? 'text-primary' : 'text-red-600 dark:text-red-400'}`}>
                  {trend.positive ? <ArrowUpRight className="size-3" /> : <XCircle className="size-3" />}
                  {trend.value}
                </span>
              )}
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            </div>
          </div>
          <div className="rounded-xl bg-primary/8 p-2.5 text-primary">
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

function CardSkeleton() {
  return <Skeleton className="h-32 w-full rounded-xl" />
}

// ─── Sidebar Navigation ─────────────────────────────────────────────────────
const navItems = [
  { id: 'overview', label: 'Panel General', icon: LayoutDashboard },
  { id: 'assets', label: 'Activos', icon: Building2 },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'investments', label: 'Inversiones', icon: Wallet },
  { id: 'liquidity', label: 'Liquidez', icon: Droplets },
]

function SidebarNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: string
  setActiveTab: (tab: string) => void
}) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary/8 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className={`size-4 ${isActive ? 'text-primary' : ''}`} />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

// ─── Panel General View ─────────────────────────────────────────────────────
function PanelGeneralView() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Error al cargar estadísticas')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      toast({ title: 'Error', description: 'No se pudieron cargar las estadísticas', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchStats() }, [fetchStats])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="mb-4 size-12 text-muted-foreground" />
        <p className="mb-4 text-lg font-medium">Error al cargar estadísticas</p>
        <Button variant="outline" onClick={fetchStats}>
          <RefreshCw className="mr-2 size-4" /> Reintentar
        </Button>
      </div>
    )
  }

  const maxDistCount = Math.max(...stats.assets.distribution.map((d) => d.count), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Panel General</h2>
          <p className="text-muted-foreground">Resumen general de la plataforma GSP</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats}>
          <RefreshCw className="mr-2 size-3" /> Actualizar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Activos"
          value={stats.assets.total.toString()}
          subtitle={`${stats.assets.active} activos`}
          icon={Building2}
          trend={{ value: `${stats.assets.active} activos`, positive: true }}
        />
        <KpiCard
          title="Total Inversores"
          value={stats.overview.totalInvestors.toLocaleString('es-CL')}
          subtitle={`${stats.overview.verifiedUsers} verificados`}
          icon={Users}
          trend={{ value: `+${stats.overview.recentSignups} este mes`, positive: true }}
        />
        <KpiCard
          title="Capital Invertido"
          value={formatShortCLP(stats.investments.totalInvested)}
          subtitle={`${stats.investments.total} inversiones`}
          icon={Wallet}
          trend={{ value: formatShortCLP(stats.investments.recentInvestmentVolume) + ' reciente', positive: true }}
        />
        <KpiCard
          title="Dividendos Pagados"
          value={formatShortCLP(stats.dividends.totalPaid)}
          subtitle={`${stats.dividends.total} pagos realizados`}
          icon={TrendingUp}
          trend={{ value: `${stats.dividends.total} pagos`, positive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Asset Distribution Bar Chart (CSS-based) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-4 text-primary" />
              Distribución de Activos
            </CardTitle>
            <CardDescription>Por tipo de propiedad</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.assets.distribution.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin activos registrados</p>
            ) : (
              <div className="space-y-4">
                {stats.assets.distribution.map((d) => (
                  <div key={d.type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{d.type}</span>
                      <span className="text-muted-foreground">{d.count} activos</span>
                    </div>
                    <div className="relative h-6 w-full overflow-hidden rounded-md bg-muted">
                      <div
                        className="flex h-full items-center rounded-md gsp-gradient px-2 transition-all"
                        style={{ width: `${Math.max((d.count / maxDistCount) * 100, 8)}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{d.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* KYC Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-primary" />
              Estado KYC de Usuarios
            </CardTitle>
            <CardDescription>Verificación de identidad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/8 p-1.5">
                    <CheckCircle2 className="size-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Verificados</span>
                </div>
                <span className="text-lg font-bold text-primary">{stats.overview.verifiedUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-amber-50 p-1.5">
                    <Clock className="size-3.5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="text-sm font-medium">Pendientes</span>
                </div>
                <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.overview.kycPending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-red-50 p-1.5">
                    <XCircle className="size-3.5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-sm font-medium">Rechazados</span>
                </div>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">{stats.overview.kycRejected}</span>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">{stats.investments.total}</p>
                  <p className="text-xs text-muted-foreground">Total Inversiones</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">{stats.transactions.total}</p>
                  <p className="text-xs text-muted-foreground">Total Transacciones</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-primary" />
            Resumen de Inversiones
          </CardTitle>
          <CardDescription>Rendimiento promedio de activos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Rendimiento Promedio</p>
              <p className="text-3xl font-bold text-primary">{stats.assets.avgYield}%</p>
              <p className="text-xs text-muted-foreground">yield anual promedio</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Financiamiento Promedio</p>
              <p className="text-3xl font-bold">{stats.assets.avgFundedPercentage}%</p>
              <p className="text-xs text-muted-foreground">capitalización promedio</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Inversión Promedio</p>
              <p className="text-3xl font-bold">{formatShortCLP(stats.investments.avgInvestment)}</p>
              <p className="text-xs text-muted-foreground">por inversión</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Activos View (Full CRUD) ───────────────────────────────────────────────
function ActivosView() {
  const [assets, setAssets] = useState<AssetRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Dialog states
  const [formOpen, setFormOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<AssetRow | null>(null)
  const [form, setForm] = useState<AssetFormState>(emptyAssetForm)
  const [submitting, setSubmitting] = useState(false)

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<AssetRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToast()

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterType !== 'all') params.set('type', filterType)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      params.set('page', page.toString())
      params.set('limit', '20')

      const res = await fetch(`/api/admin/assets?${params}`)
      if (!res.ok) throw new Error('Error al cargar activos')
      const data = await res.json()
      setAssets(data.assets)
      setTotalPages(data.pagination.totalPages)
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar los activos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [search, filterType, filterStatus, page, toast])

  useEffect(() => { fetchAssets() }, [fetchAssets])

  const openCreate = () => {
    setEditingAsset(null)
    setForm(emptyAssetForm)
    setFormOpen(true)
  }

  const openEdit = (asset: AssetRow) => {
    setEditingAsset(asset)
    setForm({
      name: asset.name,
      type: asset.type,
      address: asset.address,
      city: asset.city,
      region: asset.region,
      totalValue: asset.totalValue.toString(),
      pricePerFraction: asset.pricePerFraction.toString(),
      totalFractions: asset.totalFractions.toString(),
      availableFractions: asset.availableFractions.toString(),
      minimumInvestment: asset.minimumInvestment.toString(),
      annualYield: asset.annualYield.toString(),
      projectedAppreciation: asset.projectedAppreciation.toString(),
      totalProjectedReturn: asset.totalProjectedReturn.toString(),
      shortDescription: asset.shortDescription,
      status: asset.status,
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Error', description: 'El nombre es obligatorio', variant: 'destructive' })
      return
    }
    try {
      setSubmitting(true)
      const body = {
        name: form.name,
        type: form.type,
        address: form.address,
        city: form.city,
        region: form.region,
        totalValue: parseFloat(form.totalValue) || 0,
        pricePerFraction: parseFloat(form.pricePerFraction) || 0,
        totalFractions: parseInt(form.totalFractions) || 0,
        availableFractions: parseInt(form.availableFractions) || 0,
        minimumInvestment: parseFloat(form.minimumInvestment) || 0,
        annualYield: parseFloat(form.annualYield) || 0,
        projectedAppreciation: parseFloat(form.projectedAppreciation) || 0,
        totalProjectedReturn: parseFloat(form.totalProjectedReturn) || 0,
        shortDescription: form.shortDescription,
        fullDescription: form.shortDescription,
        status: form.status,
      }

      let res: Response
      if (editingAsset) {
        res = await fetch(`/api/admin/assets/${editingAsset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }

      toast({ title: editingAsset ? 'Activo actualizado' : 'Activo creado', description: editingAsset ? 'Los cambios se guardaron correctamente' : 'El nuevo activo fue creado' })
      setFormOpen(false)
      fetchAssets()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/admin/assets/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al eliminar')
      }
      toast({ title: 'Activo eliminado', description: 'El activo fue eliminado correctamente' })
      setDeleteTarget(null)
      fetchAssets()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Activos</h2>
          <p className="text-muted-foreground">Gestiona los activos inmobiliarios de la plataforma</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={openCreate}>
          <Plus className="mr-2 size-4" /> Nuevo Activo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar activos..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="real_estate">Inmuebles</SelectItem>
            <SelectItem value="micro_datacenter">Data Centers</SelectItem>
            <SelectItem value="last_mile_logistics">Logística</SelectItem>
            <SelectItem value="solar_energy">Energía Solar</SelectItem>
            <SelectItem value="mining">Minería</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="paused">Pausado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <>
              <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                      <TableHead className="hidden md:table-cell">Ciudad</TableHead>
                      <TableHead className="text-right">Precio/Frac.</TableHead>
                      <TableHead className="text-right">Financiado</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell className="hidden sm:table-cell"><Badge variant="secondary" className="capitalize">{asset.type}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{asset.city}</TableCell>
                        <TableCell className="text-right text-sm">{formatCLP(asset.pricePerFraction)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="hidden sm:block w-16"><Progress value={asset.fundedPercentage} className="h-1.5" /></div>
                            <span className="text-sm font-medium">{asset.fundedPercentage.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={asset.status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => openEdit(asset)}><Pencil className="size-4" /></Button>
                            <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-600 cursor-pointer" onClick={() => setDeleteTarget(asset)}><Trash2 className="size-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {assets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">No se encontraron activos</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editingAsset ? 'Editar Activo' : 'Nuevo Activo'}</DialogTitle>
            <DialogDescription>
              {editingAsset ? 'Modifica los datos del activo' : 'Completa los datos para crear un nuevo activo'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="a-name">Nombre *</Label>
                <Input id="a-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-type">Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real_estate">Inmueble</SelectItem>
                    <SelectItem value="micro_datacenter">Data Center</SelectItem>
                    <SelectItem value="last_mile_logistics">Logística</SelectItem>
                    <SelectItem value="solar_energy">Energía Solar</SelectItem>
                    <SelectItem value="mining">Minería</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="a-city">Ciudad</Label>
                <Input id="a-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-region">Región</Label>
                <Input id="a-region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-status">Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-address">Dirección</Label>
              <Input id="a-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <Separator />
            <p className="text-sm font-semibold text-muted-foreground">Datos Financieros</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="a-total">Valor Total (CLP)</Label>
                <Input id="a-total" type="number" value={form.totalValue} onChange={(e) => setForm({ ...form, totalValue: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-ppf">Precio por Fracción (CLP)</Label>
                <Input id="a-ppf" type="number" value={form.pricePerFraction} onChange={(e) => setForm({ ...form, pricePerFraction: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-min">Inversión Mínima (CLP)</Label>
                <Input id="a-min" type="number" value={form.minimumInvestment} onChange={(e) => setForm({ ...form, minimumInvestment: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="a-tf">Total Fracciones</Label>
                <Input id="a-tf" type="number" value={form.totalFractions} onChange={(e) => setForm({ ...form, totalFractions: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-af">Fracciones Disponibles</Label>
                <Input id="a-af" type="number" value={form.availableFractions} onChange={(e) => setForm({ ...form, availableFractions: e.target.value })} />
              </div>
            </div>
            <Separator />
            <p className="text-sm font-semibold text-muted-foreground">Rendimiento</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="a-yield">Yield Anual (%)</Label>
                <Input id="a-yield" type="number" step="0.01" value={form.annualYield} onChange={(e) => setForm({ ...form, annualYield: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-appreciation">Apreciación Proyectada (%)</Label>
                <Input id="a-appreciation" type="number" step="0.01" value={form.projectedAppreciation} onChange={(e) => setForm({ ...form, projectedAppreciation: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-return">Retorno Total Proyectado (%)</Label>
                <Input id="a-return" type="number" step="0.01" value={form.totalProjectedReturn} onChange={(e) => setForm({ ...form, totalProjectedReturn: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-desc">Descripción Corta</Label>
              <Textarea id="a-desc" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editingAsset ? 'Guardar Cambios' : 'Crear Activo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar activo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el activo &quot;{deleteTarget?.name}&quot;. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Usuarios View (Full CRUD) ──────────────────────────────────────────────
function UsuariosView() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterKyc, setFilterKyc] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Dialog states
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)
  const [form, setForm] = useState<UserFormState>(emptyUserForm)
  const [submitting, setSubmitting] = useState(false)

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToast()

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterRole !== 'all') params.set('role', filterRole)
      if (filterKyc !== 'all') params.set('kycStatus', filterKyc)
      params.set('page', page.toString())
      params.set('limit', '20')

      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error('Error al cargar usuarios')
      const data = await res.json()
      setUsers(data.users)
      setTotalPages(data.pagination.totalPages)
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar los usuarios', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [search, filterRole, filterKyc, page, toast])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const openCreate = () => {
    setEditingUser(null)
    setForm(emptyUserForm)
    setFormOpen(true)
  }

  const openEdit = (user: UserRow) => {
    setEditingUser(user)
    setForm({
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      rut: user.rut || '',
      role: user.role,
      kycStatus: user.kycStatus,
      balance: user.balance.toString(),
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.email.trim()) {
      toast({ title: 'Error', description: 'El email es obligatorio', variant: 'destructive' })
      return
    }
    try {
      setSubmitting(true)
      const body = {
        name: form.name || null,
        email: form.email,
        phone: form.phone || null,
        rut: form.rut || null,
        role: form.role,
        kycStatus: form.kycStatus,
        balance: parseFloat(form.balance) || 0,
      }

      let res: Response
      if (editingUser) {
        res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }

      toast({ title: editingUser ? 'Usuario actualizado' : 'Usuario creado', description: editingUser ? 'Los cambios se guardaron correctamente' : 'El nuevo usuario fue creado' })
      setFormOpen(false)
      fetchUsers()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al eliminar')
      }
      toast({ title: 'Usuario eliminado', description: 'El usuario fue eliminado correctamente' })
      setDeleteTarget(null)
      fetchUsers()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
          <p className="text-muted-foreground">Gestiona los inversores de la plataforma</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={openCreate}>
          <Plus className="mr-2 size-4" /> Nuevo Usuario
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, email o RUT..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={filterRole} onValueChange={(v) => { setFilterRole(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Rol" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="investor">Inversor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterKyc} onValueChange={(v) => { setFilterKyc(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="KYC" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="submitted">Enviado</SelectItem>
            <SelectItem value="verified">Verificado</SelectItem>
            <SelectItem value="rejected">Rechazado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <>
              <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden sm:table-cell">Rol</TableHead>
                      <TableHead>KYC</TableHead>
                      <TableHead className="text-right">Invertido</TableHead>
                      <TableHead className="hidden sm:table-cell text-right">Balance</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              {(user.name || user.email).split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{user.name || 'Sin nombre'}</p>
                              <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{user.email}</TableCell>
                        <TableCell className="hidden sm:table-cell"><Badge variant="secondary" className="capitalize">{user.role}</Badge></TableCell>
                        <TableCell><StatusBadge status={user.kycStatus} /></TableCell>
                        <TableCell className="text-right font-medium">
                          {user.totalInvested > 0 ? formatShortCLP(user.totalInvested) : '—'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-right text-muted-foreground">
                          {formatCLP(user.balance)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(user)}><Pencil className="size-4" /></Button>
                            <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-600" onClick={() => setDeleteTarget(user)}><Trash2 className="size-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {users.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">No se encontraron usuarios</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Modifica los datos del usuario' : 'Completa los datos para crear un nuevo usuario'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="u-name">Nombre</Label>
                <Input id="u-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="u-email">Email *</Label>
                <Input id="u-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="u-phone">Teléfono</Label>
                <Input id="u-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="u-rut">RUT</Label>
                <Input id="u-rut" value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="u-role">Rol</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investor">Inversor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="u-kyc">Estado KYC</Label>
                <Select value={form.kycStatus} onValueChange={(v) => setForm({ ...form, kycStatus: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="submitted">Enviado</SelectItem>
                    <SelectItem value="verified">Verificado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-balance">Balance (CLP)</Label>
              <Input id="u-balance" type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al usuario &quot;{deleteTarget?.name || deleteTarget?.email}&quot;. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Inversiones View ────────────────────────────────────────────────────────
function InversionesView() {
  const [investments, setInvestments] = useState<InvestmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Status change dialog
  const [statusTarget, setStatusTarget] = useState<InvestmentRow | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()

  const fetchInvestments = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.set('status', filterStatus)
      params.set('page', page.toString())
      params.set('limit', '20')

      const res = await fetch(`/api/admin/investments?${params}`)
      if (!res.ok) throw new Error('Error al cargar inversiones')
      const data = await res.json()
      setInvestments(data.investments)
      setTotalPages(data.pagination.totalPages)
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las inversiones', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [filterStatus, page, toast])

  useEffect(() => { fetchInvestments() }, [fetchInvestments])

  const openStatusChange = (inv: InvestmentRow) => {
    setStatusTarget(inv)
    setNewStatus(inv.status)
  }

  const handleStatusChange = async () => {
    if (!statusTarget || !newStatus) return
    try {
      setSubmitting(true)
      const res = await fetch(`/api/admin/investments/${statusTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al actualizar estado')
      }
      toast({ title: 'Estado actualizado', description: `La inversión pasó a "${newStatus}"` })
      setStatusTarget(null)
      fetchInvestments()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Inversiones</h2>
        <p className="text-muted-foreground">Gestiona las inversiones de la plataforma</p>
      </div>

      {/* Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <>
              <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Inversor</TableHead>
                      <TableHead className="hidden sm:table-cell">Activo</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="hidden md:table-cell">Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investments.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.user.name || inv.user.email}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground">{inv.asset.name}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{inv.quantity} fracc.</TableCell>
                        <TableCell className="text-right font-medium">{formatCLP(inv.totalAmount)}</TableCell>
                        <TableCell><StatusBadge status={inv.status} /></TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {new Date(inv.createdAt).toLocaleDateString('es-CL')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openStatusChange(inv)}>
                            <Pencil className="mr-1 size-3" /> Estado
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {investments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Wallet className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">No se encontraron inversiones</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      {/* Status Change Dialog */}
      <Dialog open={!!statusTarget} onOpenChange={() => setStatusTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Inversión</DialogTitle>
            <DialogDescription>
              {statusTarget?.user.name} — {statusTarget?.asset.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label>Estado actual</Label>
              <div className="flex items-center gap-2">
                <StatusBadge status={statusTarget?.status || 'pending'} />
                <span className="text-sm text-muted-foreground">→</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="inv-status">Nuevo estado</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="inv-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {statusTarget && newStatus !== statusTarget.status && (
              <div className="mt-4 rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">
                  {newStatus === 'completed' && statusTarget.status === 'pending' && 'Completar la inversión: se descontarán fracciones del activo y se actualizará el balance del usuario.'}
                  {newStatus === 'cancelled' && statusTarget.status === 'completed' && 'Cancelar la inversión: se devolverán las fracciones al activo y se reembolsará al usuario.'}
                  {newStatus === 'pending' && statusTarget.status === 'completed' && 'Volver a pendiente: esta transición no tiene efectos secundarios.'}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusTarget(null)}>Cancelar</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleStatusChange}
              disabled={submitting || !newStatus || newStatus === statusTarget?.status}
            >
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Actualizar Estado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Liquidez View ──────────────────────────────────────────────────────────
function LiquidezView() {
  const [data, setData] = useState<LiquidityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [totalReserve, setTotalReserve] = useState('')
  const [monthlyContribution, setMonthlyContribution] = useState('')
  const [autoReplenish, setAutoReplenish] = useState(true)

  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/liquidity')
      if (!res.ok) throw new Error('Error al cargar datos de liquidez')
      const json = await res.json()
      setData(json)
      setTotalReserve(json.pool.totalReserve.toString())
      setMonthlyContribution(json.pool.monthlyContribution?.toString() || '')
      setAutoReplenish(json.pool.autoReplenish)
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar los datos de liquidez', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    if (!data) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/liquidity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalReserve: parseFloat(totalReserve) || 0,
          monthlyContribution: parseFloat(monthlyContribution) || null,
          autoReplenish,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al actualizar')
      }
      toast({ title: 'Pool actualizado', description: 'La configuración del pool de liquidez se actualizó correctamente' })
      fetchData()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pool de Liquidez</h2>
          <p className="text-muted-foreground">Gestiona el fondo de liquidez de la plataforma</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="mr-2 size-3" /> Actualizar
        </Button>
      </div>

      {/* Pool Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2.5 dark:bg-emerald-900/30">
                <Droplets className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reserva Total</p>
                <p className="text-xl font-bold">{formatCLP(data.pool.totalReserve)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2.5 dark:bg-blue-900/30">
                <Activity className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Uso</p>
                <p className="text-xl font-bold">{data.pool.utilizationRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-yellow-100 p-2.5 dark:bg-yellow-900/30">
                <Clock className="size-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Solicitudes Activas</p>
                <p className="text-xl font-bold">{data.pool.activeRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2.5 dark:bg-emerald-900/30">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Auto-Reposición</p>
                <p className="text-xl font-bold">{data.pool.autoReplenish ? 'Activado' : 'Desactivado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pool Settings + Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuración del Pool</CardTitle>
            <CardDescription>Ajusta los parámetros del fondo de liquidez</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="liq-reserve">Reserva Total (CLP)</Label>
              <Input id="liq-reserve" type="number" value={totalReserve} onChange={(e) => setTotalReserve(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="liq-monthly">Aporte Mensual (CLP)</Label>
              <Input id="liq-monthly" type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} placeholder="0" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Auto-Reposición</p>
                <p className="text-xs text-muted-foreground">Reponer automáticamente el fondo</p>
              </div>
              <Switch checked={autoReplenish} onCheckedChange={setAutoReplenish} />
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Guardar Configuración
            </Button>
          </CardContent>
        </Card>

        {/* Request Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estadísticas de Solicitudes</CardTitle>
            <CardDescription>Resumen de solicitudes de liquidez</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-2xl font-bold">{data.stats.pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-2xl font-bold">{data.stats.processingCount}</p>
                <p className="text-xs text-muted-foreground">Procesando</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-2xl font-bold">{data.stats.completedCount}</p>
                <p className="text-xs text-muted-foreground">Completadas</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-2xl font-bold">{data.stats.rejectedCount}</p>
                <p className="text-xs text-muted-foreground">Rechazadas</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto Total Solicitado</span>
                <span className="font-medium">{formatCLP(data.stats.totalRequestedAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto Total Completado</span>
                <span className="font-medium">{formatCLP(data.stats.totalCompletedAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fees Recaudados</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCLP(data.stats.totalFeesCollected)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Solicitudes Recientes</CardTitle>
          <CardDescription>Últimas solicitudes de liquidez</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {data.recentRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Droplets className="mb-3 size-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">Sin solicitudes de liquidez</p>
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="hidden sm:table-cell">Fracciones</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.user.name || req.user.email}</TableCell>
                      <TableCell className="hidden sm:table-cell font-mono text-sm">{req.fractionCount}</TableCell>
                      <TableCell className="text-right font-medium">{formatCLP(req.totalAmount)}</TableCell>
                      <TableCell><StatusBadge status={req.status} /></TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {new Date(req.createdAt).toLocaleDateString('es-CL')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const adminTab = useAppStore((s) => s.adminTab)
  const setAdminTab = useAppStore((s) => s.setAdminTab)

  const renderView = () => {
    switch (adminTab) {
      case 'overview': return <PanelGeneralView />
      case 'assets': return <ActivosView />
      case 'users': return <UsuariosView />
      case 'investments': return <InversionesView />
      case 'liquidity': return <LiquidezView />
      default: return <PanelGeneralView />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r bg-card">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <div className="p-4">
              <h1 className="gsp-serif text-2xl font-normal text-primary">GSP Admin</h1>
              <p className="text-xs text-muted-foreground">Superadmin Panel</p>
            </div>
            <Separator />
            <SidebarNav activeTab={adminTab} setActiveTab={setAdminTab} />
          </div>
        </aside>

        {/* Mobile Header + Sheet */}
        <div className="flex-1">
          {/* Mobile Top Bar */}
          <header className="sticky top-0 z-40 flex items-center gap-3 border-b bg-card px-4 py-3 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="size-9">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="p-4">
                  <SheetTitle className="text-left text-lg font-bold text-emerald-700 dark:text-emerald-400">GSP Admin</SheetTitle>
                </SheetHeader>
                <Separator />
                <SidebarNav activeTab={adminTab} setActiveTab={(tab) => { setAdminTab(tab) }} />
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="text-sm font-bold">GSP Admin</h1>
              <p className="text-xs text-muted-foreground">{navItems.find((n) => n.id === adminTab)?.label || 'Panel'}</p>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-4 sm:p-6 lg:p-8">
            {renderView()}
          </main>
        </div>
      </div>
    </div>
  )
}
