'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  Settings,
  FileText,
  HelpCircle,
  Quote,
  Scale,
  Tag,
  UsersRound,
  Mail,
  Layers,
  Languages,
  Coins,
  Brain,
  Shield,
  Download,
  Bell,
  CircleDot,
  UserCircle,
  Eye,
  LogOut,
  CalendarDays,
  Globe,
} from 'lucide-react'
import { SettingsView } from './sections/SettingsView'
import { BlogView } from './sections/BlogView'
import { FAQView } from './sections/FAQView'
import { TestimonialsView } from './sections/TestimonialsView'
import { LegalView } from './sections/LegalView'
import { PromotionsView } from './sections/PromotionsView'
import { TeamView } from './sections/TeamView'
import { EmailTemplatesView } from './sections/EmailTemplatesView'
import { AssetTypesView } from './sections/AssetTypesView'
import { TranslationsView } from './sections/TranslationsView'
import { CurrenciesView } from './sections/CurrenciesView'
import { AnalyticsView } from './sections/AnalyticsView'
import { InvestmentAnalysisView } from './sections/InvestmentAnalysisView'
import { ComplianceView } from './sections/ComplianceView'
import { CmsPagesView } from './sections/CmsPagesView'
import { AssetValuationAI } from './sections/AssetValuationAI'
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

// ─── USD Formatter ───────────────────────────────────────────────────────────
function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatShortUSD(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount.toFixed(0)}`
}

// ─── CSV Export Utility ─────────────────────────────────────────────────────
function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = String(row[h] ?? '')
      return val.includes(',') || val.includes('"') || val.includes('\n') ? `"${val.replace(/"/g, '""')}"` : val
    }).join(','))
  ].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Admin Notification System ──────────────────────────────────────────────
interface AdminNotification {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  timestamp: Date
}

const MAX_NOTIFICATIONS = 20

// Module-level notification store (shared across components)
let _notifications: AdminNotification[] = []
let _listeners: Set<() => void> = new Set()

function addAdminNotification(message: string, type: AdminNotification['type'] = 'info') {
  const notification: AdminNotification = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    message,
    type,
    timestamp: new Date(),
  }
  _notifications = [notification, ..._notifications].slice(0, MAX_NOTIFICATIONS)
  _listeners.forEach(l => l())
}

function getAdminNotifications(): AdminNotification[] {
  return _notifications
}

function subscribeToNotifications(listener: () => void) {
  _listeners.add(listener)
  return () => { _listeners.delete(listener) }
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
  fullDescription: string
  status: string
}

const emptyAssetForm: AssetFormState = {
  name: '', type: 'real_estate', address: '', city: '', region: '',
  totalValue: '', pricePerFraction: '', totalFractions: '', availableFractions: '',
  minimumInvestment: '', annualYield: '', projectedAppreciation: '',
  totalProjectedReturn: '', shortDescription: '', fullDescription: '', status: 'draft',
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
  const dotColor: Record<string, string> = {
    active: 'bg-emerald-500',
    draft: 'bg-yellow-500',
    paused: 'bg-orange-500',
    pending: 'bg-yellow-500',
    completed: 'bg-emerald-500',
    cancelled: 'bg-red-500',
    processing: 'bg-blue-500',
    verified: 'bg-emerald-500',
    submitted: 'bg-blue-500',
    rejected: 'bg-red-500',
  }
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
    <Badge variant="outline" className={`${config[status] || 'bg-secondary text-muted-foreground border-border/50'} gap-1.5`}>
      <span className={`inline-block size-1.5 rounded-full ${dotColor[status] || 'bg-muted-foreground'}`} />
      {label[status] || status}
    </Badge>
  )
}

// ─── KPI Card Component ─────────────────────────────────────────────────────
function KpiCard({
  title, value, subtitle, icon: Icon, trend, gradient = 'emerald',
}: {
  title: string; value: string; subtitle: string
  icon: React.ElementType; trend?: { value: string; positive: boolean }
  gradient?: 'emerald' | 'amber' | 'blue' | 'rose'
}) {
  const gradientBg: Record<string, string> = {
    emerald: 'bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/20',
    amber: 'bg-gradient-to-br from-amber-50/80 to-orange-50/40 dark:from-amber-950/30 dark:to-orange-950/20',
    blue: 'bg-gradient-to-br from-sky-50/80 to-indigo-50/40 dark:from-sky-950/30 dark:to-indigo-950/20',
    rose: 'bg-gradient-to-br from-rose-50/80 to-pink-50/40 dark:from-rose-950/30 dark:to-pink-950/20',
  }
  const gradientIcon: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    blue: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
    rose: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
  }
  return (
    <Card className={`relative overflow-hidden border-border/40 gsp-card-hover ${gradientBg[gradient]}`}>
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
          <div className={`rounded-full p-2.5 ${gradientIcon[gradient]}`}>
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
const navItems: Array<{ id: string; label: string; icon: React.ElementType | null; isSeparator?: boolean; section?: string }> = [
  { id: 'overview', label: 'Panel General', icon: LayoutDashboard, section: 'Principal' },
  { id: 'assets', label: 'Activos', icon: Building2 },
  { id: 'asset-types', label: 'Tipos de Activo', icon: Layers },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'investments', label: 'Inversiones', icon: Wallet },
  { id: 'liquidity', label: 'Liquidez', icon: Droplets },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'investment-analysis', label: 'Análisis IA', icon: Brain },
  { id: 'compliance', label: 'Cumplimiento', icon: Shield },
  { id: '_sep_cms', label: '', icon: null, isSeparator: true, section: 'Contenido' },
  { id: 'pages', label: 'Páginas', icon: Globe },
  { id: 'settings', label: 'Configuración', icon: Settings },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'testimonials', label: 'Testimonios', icon: Quote },
  { id: '_sep_cms2', label: '', icon: null, isSeparator: true, section: 'Gestión' },
  { id: 'legal', label: 'Legal', icon: Scale },
  { id: 'promotions', label: 'Promociones', icon: Tag },
  { id: 'team', label: 'Equipo', icon: UsersRound },
  { id: 'email-templates', label: 'Emails', icon: Mail },
  { id: '_sep_i18n', label: '', icon: null, isSeparator: true, section: 'Global' },
  { id: 'translations', label: 'Traducciones', icon: Languages },
  { id: 'currencies', label: 'Monedas', icon: Coins },
]

function SidebarNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: string
  setActiveTab: (tab: string) => void
}) {
  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {navItems.map((item) => {
        if (item.isSeparator && item.section) {
          return (
            <div key={item.id} className="pt-4 pb-1.5 px-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{item.section}</p>
            </div>
          )
        }
        if (item.isSeparator) return <Separator key={item.id} className="my-2" />
        const Icon = item.icon!
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary/10 text-primary shadow-sm'
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
          <p className="text-muted-foreground">Resumen general de 3GSP by GALAXY LLC</p>
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
          gradient="emerald"
        />
        <KpiCard
          title="Total Inversores"
          value={stats.overview.totalInvestors.toLocaleString('en-US')}
          subtitle={`${stats.overview.verifiedUsers} verificados`}
          icon={Users}
          trend={{ value: `+${stats.overview.recentSignups} este mes`, positive: true }}
          gradient="blue"
        />
        <KpiCard
          title="Capital Invertido"
          value={formatShortUSD(stats.investments.totalInvested)}
          subtitle={`${stats.investments.total} inversiones`}
          icon={Wallet}
          trend={{ value: formatShortUSD(stats.investments.recentInvestmentVolume) + ' reciente', positive: true }}
          gradient="amber"
        />
        <KpiCard
          title="Dividendos Pagados"
          value={formatShortUSD(stats.dividends.totalPaid)}
          subtitle={`${stats.dividends.total} pagos realizados`}
          icon={TrendingUp}
          trend={{ value: `${stats.dividends.total} pagos`, positive: true }}
          gradient="rose"
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

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-4 text-primary" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>Últimas 5 inversiones registradas</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {stats.investments.recentInvestments > 0 ? (
              <div className="px-6 py-4 text-center">
                <p className="text-sm text-muted-foreground">{stats.investments.recentInvestments} inversiones recientes · {formatShortUSD(stats.investments.recentInvestmentVolume)} volumen</p>
              </div>
            ) : (
              <div className="px-6 py-4 text-center">
                <p className="text-sm text-muted-foreground">Sin inversiones recientes</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
              <p className="text-3xl font-bold">{formatShortUSD(stats.investments.avgInvestment)}</p>
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
      fullDescription: asset.fullDescription,
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
        fullDescription: form.fullDescription,
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => exportToCSV(
            assets.map(a => ({
              Nombre: a.name,
              Tipo: a.type,
              Ciudad: a.city,
              Region: a.region,
              Estado: a.status,
              'Valor Total (USD)': a.totalValue,
              'Precio/Fraccion (USD)': a.pricePerFraction,
              'Fracciones Disponibles': a.availableFractions,
              'Fracciones Totales': a.totalFractions,
              'Yield Anual (%)': a.annualYield,
              'Financiado (%)': a.fundedPercentage,
              'Inversores': a.investmentCount,
            })),
            `activos_${new Date().toISOString().slice(0, 10)}.csv`
          )}>
            <Download className="mr-2 size-4" /> Exportar CSV
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={openCreate}>
            <Plus className="mr-2 size-4" /> Nuevo Activo
          </Button>
        </div>
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
                      <TableHead className="text-right hidden lg:table-cell">Total Invertido</TableHead>
                      <TableHead className="text-right">Financiado</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="hidden sm:flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/30 dark:to-teal-950/20">
                              <Building2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="font-medium">{asset.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell"><Badge variant="secondary" className="capitalize">{asset.type}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{asset.city}</TableCell>
                        <TableCell className="text-right text-sm">{formatUSD(asset.pricePerFraction)}</TableCell>
                        <TableCell className="text-right hidden lg:table-cell font-medium">{formatUSD(asset.pricePerFraction * (asset.totalFractions - asset.availableFractions))}</TableCell>
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
                <Label htmlFor="a-total">Valor Total (USD)</Label>
                <Input id="a-total" type="number" value={form.totalValue} onChange={(e) => setForm({ ...form, totalValue: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-ppf">Precio por Fracción (USD)</Label>
                <Input id="a-ppf" type="number" value={form.pricePerFraction} onChange={(e) => setForm({ ...form, pricePerFraction: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-min">Inversión Mínima (USD)</Label>
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
            <div className="space-y-2">
              <Label htmlFor="a-fulldesc">Descripción Completa</Label>
              <Textarea id="a-fulldesc" value={form.fullDescription} onChange={(e) => setForm({ ...form, fullDescription: e.target.value })} rows={5} />
            </div>
            {editingAsset && (
              <>
                <Separator />
                <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Brain className="size-4 text-primary" />
                    Valoración Inteligente
                  </p>
                <AssetValuationAI assetId={editingAsset.id} assetName={editingAsset.name} />
              </>
            )}
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
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Usuarios</h2>
          <p className="text-muted-foreground">Gestiona los inversores de la plataforma</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => exportToCSV(
            users.map(u => ({
              Nombre: u.name || '',
              Email: u.email,
              Telefono: u.phone || '',
              Rol: u.role,
              'Estado KYC': u.kycStatus,
              'Balance (USD)': u.balance,
              'Total Invertido (USD)': u.totalInvested,
              'Total Ganancias (USD)': u.totalEarnings,
              Inversiones: u._count.investments,
              Transacciones: u._count.transactions,
              'Fecha Registro': u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US') : '',
            })),
            `usuarios_${new Date().toISOString().slice(0, 10)}.csv`
          )}>
            <Download className="mr-2 size-4" /> Exportar CSV
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer" onClick={openCreate}>
            <Plus className="mr-2 size-4" /> Nuevo Usuario
          </Button>
        </div>
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
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 text-xs font-bold text-emerald-700 dark:from-emerald-900/40 dark:to-teal-950/30 dark:text-emerald-400">
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
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={user.kycStatus} />
                            {user.kycStatus !== 'verified' && (
                              <Progress value={user.kycStatus === 'submitted' ? 66 : user.kycStatus === 'pending' ? 33 : 0} className="hidden sm:block w-10 h-1" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {user.totalInvested > 0 ? formatShortUSD(user.totalInvested) : '—'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-right text-muted-foreground">
                          {formatUSD(user.balance)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="size-8" onClick={() => openEdit(user)} title="Ver Perfil"><Eye className="size-4" /></Button>
                            <Button variant="ghost" size="sm" className="size-8" onClick={() => openEdit(user)} title="Editar"><Pencil className="size-4" /></Button>
                            <Button variant="ghost" size="sm" className="size-8 text-red-500 hover:text-red-600" onClick={() => setDeleteTarget(user)} title="Eliminar"><Trash2 className="size-4" /></Button>
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
              <Label htmlFor="u-balance">Balance (USD)</Label>
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
        <h2 className="gsp-serif text-2xl font-normal tracking-tight">Inversiones</h2>
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
                        <TableCell className="text-right font-medium">{formatUSD(inv.totalAmount)}</TableCell>
                        <TableCell><StatusBadge status={inv.status} /></TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {new Date(inv.createdAt).toLocaleDateString('en-US')}
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
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Pool de Liquidez</h2>
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
                <p className="text-xl font-bold">{formatUSD(data.pool.totalReserve)}</p>
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
              <Label htmlFor="liq-reserve">Reserva Total (USD)</Label>
              <Input id="liq-reserve" type="number" value={totalReserve} onChange={(e) => setTotalReserve(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="liq-monthly">Aporte Mensual (USD)</Label>
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
                <span className="font-medium">{formatUSD(data.stats.totalRequestedAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto Total Completado</span>
                <span className="font-medium">{formatUSD(data.stats.totalCompletedAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fees Recaudados</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatUSD(data.stats.totalFeesCollected)}</span>
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
                      <TableCell className="text-right font-medium">{formatUSD(req.totalAmount)}</TableCell>
                      <TableCell><StatusBadge status={req.status} /></TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {new Date(req.createdAt).toLocaleDateString('en-US')}
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

// ─── Notification Panel Component ────────────────────────────────────────────
function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AdminNotification[]>(getAdminNotifications)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return subscribeToNotifications(() => {
      setNotifications(getAdminNotifications())
    })
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const typeConfig: Record<string, { color: string; icon: React.ElementType }> = {
    success: { color: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
    error: { color: 'text-red-600 dark:text-red-400', icon: XCircle },
    info: { color: 'text-primary', icon: Activity },
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    if (diff < 60000) return 'Ahora'
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)}h`
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative size-9 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <Bell className="size-4" />
        {notifications.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border bg-card shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Actividad Reciente</h3>
            {notifications.length > 0 && (
              <span className="text-xs text-muted-foreground">{notifications.length} eventos</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <Bell className="mb-2 size-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Sin actividad reciente</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((n) => {
                  const cfg = typeConfig[n.type] || typeConfig.info
                  const Icon = cfg.icon
                  return (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                      <Icon className={`mt-0.5 size-4 shrink-0 ${cfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug">{n.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatTime(n.timestamp)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const adminTab = useAppStore((s) => s.adminTab)
  const setAdminTab = useAppStore((s) => s.setAdminTab)
  const user = useAppStore((s) => s.user)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const refreshTimestamp = useCallback(() => {
    setLastUpdated(new Date())
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const renderView = () => {
    switch (adminTab) {
      case 'overview': return <PanelGeneralView />
      case 'assets': return <ActivosView />
      case 'users': return <UsuariosView />
      case 'investments': return <InversionesView />
      case 'liquidity': return <LiquidezView />
      case 'analytics': return <AnalyticsView />
      case 'investment-analysis': return <InvestmentAnalysisView />
      case 'compliance': return <ComplianceView />
      case 'pages': return <CmsPagesView />
      case 'settings': return <SettingsView />
      case 'blog': return <BlogView />
      case 'faq': return <FAQView />
      case 'testimonials': return <TestimonialsView />
      case 'legal': return <LegalView />
      case 'promotions': return <PromotionsView />
      case 'team': return <TeamView />
      case 'email-templates': return <EmailTemplatesView />
      case 'asset-types': return <AssetTypesView />
      case 'translations': return <TranslationsView />
      case 'currencies': return <CurrenciesView />
      default: return <PanelGeneralView />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-card">
          <div className="sticky top-0 h-screen overflow-y-auto">
            {/* Sidebar Header */}
            <div className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl gsp-gradient">
                  <Building2 className="size-5 text-white" />
                </div>
                <div>
                  <h1 className="gsp-serif text-lg font-normal text-primary">3GSP Admin</h1>
                  <p className="text-[11px] text-muted-foreground">GALAXY LLC</p>
                </div>
              </div>
            </div>
            <Separator />
            <SidebarNav activeTab={adminTab} setActiveTab={setAdminTab} />
            {/* Sidebar Footer */}
            <div className="mt-auto border-t p-3">
              <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 text-xs font-bold text-emerald-700 dark:from-emerald-900/40 dark:to-teal-950/30 dark:text-emerald-400">
                  {(user?.name || 'A').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{user?.role || 'admin'}</p>
                </div>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                  {user?.role === 'superadmin' ? 'Super' : 'Admin'}
                </Badge>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Header + Sheet */}
        <div className="flex-1">
          {/* Mobile Top Bar */}
          <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-card px-4 py-3 lg:hidden">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="size-9">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <SheetHeader className="p-4">
                    <SheetTitle className="text-left text-lg font-bold text-emerald-700 dark:text-emerald-400">3GSP Admin</SheetTitle>
                  </SheetHeader>
                  <Separator />
                  <SidebarNav activeTab={adminTab} setActiveTab={(tab) => { setAdminTab(tab) }} />
                </SheetContent>
              </Sheet>
              <div>
                <h1 className="text-sm font-bold">3GSP Admin</h1>
                <p className="text-xs text-muted-foreground">{navItems.find((n) => n.id === adminTab)?.label || 'Panel'}</p>
              </div>
            </div>
            <NotificationPanel />
          </header>

          {/* Desktop Admin Header */}
          <header className="sticky top-0 z-40 hidden lg:flex items-center justify-between border-b bg-card/80 backdrop-blur-md px-6 py-3">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-semibold text-foreground">
                {navItems.find((n) => n.id === adminTab)?.label || 'Panel General'}
              </h2>
              <Separator orientation="vertical" className="h-4" />
              <p className="text-xs text-muted-foreground">
                <CalendarDays className="inline size-3 mr-1" />
                Última actualización: {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" onClick={refreshTimestamp}>
                <RefreshCw className="size-3.5" />
                <span className="text-xs">Actualizar</span>
              </Button>
              <NotificationPanel />
              <Separator orientation="vertical" className="h-5" />
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 text-[11px] font-bold text-emerald-700 dark:from-emerald-900/40 dark:to-teal-950/30 dark:text-emerald-400">
                  {(user?.name || 'A').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden xl:block">
                  <p className="text-xs font-medium">{user?.name || 'Admin'}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{user?.role || 'admin'}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-4 sm:p-6 lg:p-8">
            {/* Welcome Banner (only on overview) */}
            {adminTab === 'overview' && (
              <div className="mb-6 rounded-xl bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border border-primary/10 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {greeting()}, <span className="gsp-gradient-text">{user?.name || 'Administrador'}</span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Aquí tienes un resumen de la actividad actual de 3GSP by GALAXY LLC
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <CircleDot className="size-4 text-primary animate-pulse" />
                    <span className="text-xs text-muted-foreground">En vivo</span>
                  </div>
                </div>
              </div>
            )}
            {renderView()}
          </main>
        </div>
      </div>
    </div>
  )
}
