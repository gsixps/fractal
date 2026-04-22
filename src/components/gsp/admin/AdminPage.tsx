'use client'

import React, { useState } from 'react'
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  Droplets,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  Power,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  RefreshCw,
  Settings,
  ChevronLeft,
  Menu,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts'

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

// ─── Demo Data ───────────────────────────────────────────────────────────────

const kpiData = {
  totalActivos: 6,
  totalInversores: 340,
  capitalGestionado: 2_100_000_000,
  dividendosDistribuidos: 156_000_000,
}

const assetDistribution = [
  { name: 'Residencial', value: 42, fill: '#10b981' },
  { name: 'Comercial', value: 28, fill: '#059669' },
  { name: 'Industrial', value: 18, fill: '#34d399' },
  { name: 'Terreno', value: 12, fill: '#6ee7b7' },
]

const assetDistConfig = {
  value: { label: 'Distribución' },
  Residencial: { label: 'Residencial', color: '#10b981' },
  Comercial: { label: 'Comercial', color: '#059669' },
  Industrial: { label: 'Industrial', color: '#34d399' },
  Terreno: { label: 'Terreno', color: '#6ee7b7' },
} satisfies ChartConfig

const recentTransactions = [
  { id: 'TXN-001', usuario: 'María González', tipo: 'Inversión', activo: 'Torre Vitacura', monto: 5_000_000, fecha: '2024-01-15' },
  { id: 'TXN-002', usuario: 'Carlos Muñoz', tipo: 'Dividendo', activo: 'Centro Empresarial', monto: 185_000, fecha: '2024-01-14' },
  { id: 'TXN-003', usuario: 'Ana Rodríguez', tipo: 'Inversión', activo: 'Residencial Las Condes', monto: 3_200_000, fecha: '2024-01-14' },
  { id: 'TXN-004', usuario: 'Pedro Soto', tipo: 'Rescate', activo: 'Parque Industrial', monto: 1_500_000, fecha: '2024-01-13' },
  { id: 'TXN-005', usuario: 'Laura Díaz', tipo: 'Inversión', activo: 'Torre Vitacura', monto: 7_800_000, fecha: '2024-01-12' },
]

const fundingProgress = [
  { name: 'Torre Vitacura', progress: 87, target: 500_000_000, raised: 435_000_000 },
  { name: 'Centro Empresarial', progress: 100, target: 380_000_000, raised: 380_000_000 },
  { name: 'Residencial Las Condes', progress: 62, target: 280_000_000, raised: 173_600_000 },
  { name: 'Parque Industrial Maipú', progress: 45, target: 420_000_000, raised: 189_000_000 },
  { name: 'Terreno San Bernardo', progress: 28, target: 180_000_000, raised: 50_400_000 },
  { name: 'Oficinas Providencia', progress: 15, target: 340_000_000, raised: 51_000_000 },
]

const assets = [
  { id: 1, nombre: 'Torre Vitacura', tipo: 'Residencial', estado: 'Activo', financiamiento: 87, inversores: 82, yield: 9.2 },
  { id: 2, nombre: 'Centro Empresarial Sur', tipo: 'Comercial', estado: 'Completo', financiamiento: 100, inversores: 65, yield: 11.5 },
  { id: 3, nombre: 'Residencial Las Condes', tipo: 'Residencial', estado: 'Activo', financiamiento: 62, inversores: 54, yield: 8.8 },
  { id: 4, nombre: 'Parque Industrial Maipú', tipo: 'Industrial', estado: 'Activo', financiamiento: 45, inversores: 38, yield: 10.1 },
  { id: 5, nombre: 'Terreno San Bernardo', tipo: 'Terreno', estado: 'Activo', financiamiento: 28, inversores: 22, yield: 7.5 },
  { id: 6, nombre: 'Oficinas Providencia', tipo: 'Comercial', estado: 'Borrador', financiamiento: 15, inversores: 0, yield: 0 },
]

const users = [
  { id: 1, nombre: 'María González', email: 'maria.gonzalez@email.com', rut: '12.345.678-9', kyc: 'Verificado', invertido: 15_800_000 },
  { id: 2, nombre: 'Carlos Muñoz', email: 'carlos.munoz@email.com', rut: '13.456.789-0', kyc: 'Verificado', invertido: 22_500_000 },
  { id: 3, nombre: 'Ana Rodríguez', email: 'ana.rodriguez@email.com', rut: '14.567.890-1', kyc: 'Pendiente', invertido: 3_200_000 },
  { id: 4, nombre: 'Pedro Soto', email: 'pedro.soto@email.com', rut: '15.678.901-2', kyc: 'Verificado', invertido: 8_900_000 },
  { id: 5, nombre: 'Laura Díaz', email: 'laura.diaz@email.com', rut: '16.789.012-3', kyc: 'Rechazado', invertido: 0 },
  { id: 6, nombre: 'Fernando Pérez', email: 'fernando.p@email.com', rut: '17.890.123-4', kyc: 'Pendiente', invertido: 0 },
  { id: 7, nombre: 'Isabel Torres', email: 'isabel.t@email.com', rut: '18.901.234-5', kyc: 'Verificado', invertido: 41_200_000 },
  { id: 8, nombre: 'Roberto Silva', email: 'roberto.s@email.com', rut: '19.012.345-6', kyc: 'Verificado', invertido: 12_300_000 },
  { id: 9, nombre: 'Camila Vargas', email: 'camila.v@email.com', rut: '20.123.456-7', kyc: 'Pendiente', invertido: 5_600_000 },
  { id: 10, nombre: 'Diego Morales', email: 'diego.m@email.com', rut: '21.234.567-8', kyc: 'Verificado', invertido: 28_100_000 },
]

const monthlyRevenue = [
  { month: 'Jul', gsp: 5.2, mercado: 28.5 },
  { month: 'Ago', gsp: 6.1, mercado: 30.2 },
  { month: 'Sep', gsp: 7.4, mercado: 32.1 },
  { month: 'Oct', gsp: 8.0, mercado: 35.8 },
  { month: 'Nov', gsp: 9.2, mercado: 38.4 },
  { month: 'Dic', gsp: 10.5, mercado: 41.2 },
  { month: 'Ene', gsp: 11.8, mercado: 44.0 },
  { month: 'Feb', gsp: 13.1, mercado: 47.5 },
]

const revenueConfig = {
  gsp: { label: 'GSP (3%)', color: '#10b981' },
  mercado: { label: 'Mercado (15%)', color: '#f59e0b' },
} satisfies ChartConfig

const liquidityPool = {
  totalReserva: 850_000_000,
  utilizacion: 12.5,
  solicitudesActivas: 2,
  reservasMinimas: 500_000_000,
  autoReplenish: true,
  maxUtilization: 75,
}

const liquidityRequests = [
  { id: 'LIQ-001', usuario: 'María González', activo: 'Torre Vitacura', monto: 2_500_000, fecha: '2024-01-15', estado: 'En Proceso' },
  { id: 'LIQ-002', usuario: 'Roberto Silva', activo: 'Centro Empresarial', monto: 1_200_000, fecha: '2024-01-14', estado: 'En Proceso' },
  { id: 'LIQ-003', usuario: 'Pedro Soto', activo: 'Parque Industrial', monto: 1_500_000, fecha: '2024-01-13', estado: 'Completado' },
  { id: 'LIQ-004', usuario: 'Isabel Torres', activo: 'Torre Vitacura', monto: 3_800_000, fecha: '2024-01-10', estado: 'Completado' },
  { id: 'LIQ-005', usuario: 'Diego Morales', activo: 'Residencial Las Condes', monto: 900_000, fecha: '2024-01-08', estado: 'Completado' },
]

const replenishmentSchedule = [
  { fecha: '2024-01-20', monto: 120_000_000, origen: 'Dividendos Q1' },
  { fecha: '2024-02-15', monto: 85_000_000, origen: 'Nuevo Aporte' },
  { fecha: '2024-03-20', monto: 150_000_000, origen: 'Dividendos Q1+' },
]

// ─── Sidebar Navigation Config ───────────────────────────────────────────────
const navItems = [
  { id: 'panel', label: 'Panel General', icon: LayoutDashboard },
  { id: 'activos', label: 'Activos', icon: Building2 },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'finanzas', label: 'Finanzas', icon: DollarSign },
  { id: 'liquidez', label: 'Motor de Liquidez', icon: Droplets },
]

// ─── Status Helpers ──────────────────────────────────────────────────────────
function AssetBadge({ estado }: { estado: string }) {
  const variants: Record<string, { className: string }> = {
    Activo: { className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    Borrador: { className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
    Completo: { className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800' },
  }
  return (
    <Badge variant="outline" className={variants[estado]?.className || ''}>
      {estado}
    </Badge>
  )
}

function KycBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; icon: React.ElementType }> = {
    Verificado: { className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 },
    Pendiente: { className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800', icon: Clock },
    Rechazado: { className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: XCircle },
  }
  const c = config[status] || config.Pendiente
  const Icon = c.icon
  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${c.className}`}>
      <Icon className="size-3" />
      {status}
    </Badge>
  )
}

function LiquidityBadge({ estado }: { estado: string }) {
  const variants: Record<string, { className: string }> = {
    'En Proceso': { className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
    Completado: { className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  }
  return (
    <Badge variant="outline" className={variants[estado]?.className || ''}>
      {estado}
    </Badge>
  )
}

function TxTypeBadge({ tipo }: { tipo: string }) {
  const variants: Record<string, { className: string }> = {
    Inversión: { className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    Dividendo: { className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800' },
    Rescate: { className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  }
  return (
    <Badge variant="outline" className={variants[tipo]?.className || ''}>
      {tipo}
    </Badge>
  )
}

// ─── KPI Card Component ─────────────────────────────────────────────────────
function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  trend?: { value: string; positive: boolean }
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <div className="flex items-center gap-1.5">
              {trend && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {trend.positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {trend.value}
                </span>
              )}
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            </div>
          </div>
          <div className="rounded-xl bg-emerald-100 p-2.5 dark:bg-emerald-900/30">
            <Icon className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Sidebar Content (shared between desktop and mobile) ─────────────────────
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
                ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className={`size-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

// ─── Panel General View ─────────────────────────────────────────────────────
function PanelGeneralView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Panel General</h2>
        <p className="text-muted-foreground">Resumen general de la plataforma GSP</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Activos"
          value={kpiData.totalActivos.toString()}
          subtitle="activos en plataforma"
          icon={Building2}
          trend={{ value: '+2 este mes', positive: true }}
        />
        <KpiCard
          title="Total Inversores"
          value={kpiData.totalInversores.toLocaleString('es-CL')}
          subtitle="inversores activos"
          icon={Users}
          trend={{ value: '+18% vs mes anterior', positive: true }}
        />
        <KpiCard
          title="Capital Gestionado"
          value={formatShortCLP(kpiData.capitalGestionado)}
          subtitle="en activos inmobiliarios"
          icon={DollarSign}
          trend={{ value: '+$210M este mes', positive: true }}
        />
        <KpiCard
          title="Dividendos Distribuidos"
          value={formatShortCLP(kpiData.dividendosDistribuidos)}
          subtitle="últimos 12 meses"
          icon={TrendingUp}
          trend={{ value: '+12% vs año anterior', positive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Asset Distribution Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChartIcon className="size-4 text-emerald-600" />
              Distribución de Activos
            </CardTitle>
            <CardDescription>Por tipo de propiedad</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={assetDistConfig} className="mx-auto aspect-square max-h-[280px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={assetDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  strokeWidth={2}
                >
                  {assetDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-emerald-600" />
              Transacciones Recientes
            </CardTitle>
            <CardDescription>Últimas 5 transacciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      tx.tipo === 'Inversión' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                      tx.tipo === 'Dividendo' ? 'bg-teal-100 dark:bg-teal-900/30' :
                      'bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                      {tx.tipo === 'Inversión' ? <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-400" /> :
                       tx.tipo === 'Dividendo' ? <DollarSign className="size-4 text-teal-600 dark:text-teal-400" /> :
                       <ArrowDownRight className="size-4 text-orange-600 dark:text-orange-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.usuario}</p>
                      <p className="text-xs text-muted-foreground">{tx.activo} · {tx.fecha}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatShortCLP(tx.monto)}</p>
                    <TxTypeBadge tipo={tx.tipo} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funding Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-4 text-emerald-600" />
            Progreso de Financiamiento
          </CardTitle>
          <CardDescription>Estado de capitalización por activo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {fundingProgress.map((asset) => (
              <div key={asset.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{asset.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {formatShortCLP(asset.raised)} / {formatShortCLP(asset.target)}
                    </span>
                    <span className={`font-semibold ${asset.progress === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                      {asset.progress}%
                    </span>
                  </div>
                </div>
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      asset.progress === 100
                        ? 'bg-emerald-500'
                        : asset.progress >= 60
                        ? 'bg-emerald-400'
                        : asset.progress >= 30
                        ? 'bg-yellow-400'
                        : 'bg-orange-400'
                    }`}
                    style={{ width: `${Math.min(asset.progress, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Activos View ────────────────────────────────────────────────────────────
function ActivosView() {
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')

  const filteredAssets = assets.filter((a) => {
    const matchSearch = a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.tipo.toLowerCase().includes(search.toLowerCase())
    const matchEstado = filterEstado === 'todos' || a.estado === filterEstado
    return matchSearch && matchEstado
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Activos</h2>
          <p className="text-muted-foreground">Gestiona los activos inmobiliarios de la plataforma</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="mr-2 size-4" />
          Nuevo Activo
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar activos..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="Activo">Activo</SelectItem>
            <SelectItem value="Borrador">Borrador</SelectItem>
            <SelectItem value="Completo">Completo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assets Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Financiamiento</TableHead>
                  <TableHead className="text-right">Inversores</TableHead>
                  <TableHead className="text-right">Yield</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{asset.tipo}</Badge>
                    </TableCell>
                    <TableCell>
                      <AssetBadge estado={asset.estado} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="hidden sm:block w-16">
                          <Progress value={asset.financiamiento} className="h-1.5" />
                        </div>
                        <span className="text-sm font-medium">{asset.financiamiento}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{asset.inversores}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-medium ${asset.yield > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                        {asset.yield > 0 ? `${asset.yield}%` : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8">
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8">
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-600">
                          <Power className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredAssets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="mb-3 size-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No se encontraron activos</p>
              <p className="text-xs text-muted-foreground/70">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Usuarios View ───────────────────────────────────────────────────────────
function UsuariosView() {
  const [search, setSearch] = useState('')
  const [filterKyc, setFilterKyc] = useState('todos')

  const filteredUsers = users.filter((u) => {
    const matchSearch = u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.rut.includes(search)
    const matchKyc = filterKyc === 'todos' || u.kyc === filterKyc
    return matchSearch && matchKyc
  })

  const kycCounts = {
    Verificado: users.filter((u) => u.kyc === 'Verificado').length,
    Pendiente: users.filter((u) => u.kyc === 'Pendiente').length,
    Rechazado: users.filter((u) => u.kyc === 'Rechazado').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
        <p className="text-muted-foreground">Gestiona los inversores de la plataforma</p>
      </div>

      {/* KYC Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{kycCounts.Verificado}</p>
              <p className="text-xs text-muted-foreground">Verificados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
              <Clock className="size-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{kycCounts.Pendiente}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
              <XCircle className="size-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{kycCounts.Rechazado}</p>
              <p className="text-xs text-muted-foreground">Rechazados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o RUT..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterKyc} onValueChange={setFilterKyc}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Estado KYC" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="Verificado">Verificado</SelectItem>
            <SelectItem value="Pendiente">Pendiente</SelectItem>
            <SelectItem value="Rechazado">Rechazado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">RUT</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead className="text-right">Invertido</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {user.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium">{user.nombre}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="hidden sm:table-cell font-mono text-sm">{user.rut}</TableCell>
                    <TableCell>
                      <KycBadge status={user.kyc} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {user.invertido > 0 ? formatShortCLP(user.invertido) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8">
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-3 size-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No se encontraron usuarios</p>
              <p className="text-xs text-muted-foreground/70">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Finanzas View ───────────────────────────────────────────────────────────
function FinanzasView() {
  const feeBreakdown = [
    { concepto: 'Comisión por Administración', monto: 63_000_000, porcentaje: 60 },
    { concepto: 'Comisión por Originación', monto: 21_000_000, porcentaje: 20 },
    { concepto: 'Fee de Liquidez', monto: 12_600_000, porcentaje: 12 },
    { concepto: 'Suscripción Premium', monto: 8_400_000, porcentaje: 8 },
  ]

  const totalFeeIncome = feeBreakdown.reduce((s, f) => s + f.monto, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Finanzas</h2>
        <p className="text-muted-foreground">Resumen financiero y comparativa de costos</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Ingresos por Fees"
          value={formatShortCLP(totalFeeIncome)}
          subtitle="últimos 12 meses"
          icon={TrendingUp}
          trend={{ value: '+22% vs año anterior', positive: true }}
        />
        <KpiCard
          title="Margen Neto"
          value="68.5%"
          subtitle="después de costos operacionales"
          icon={DollarSign}
          trend={{ value: '+3.2pp vs Q anterior', positive: true }}
        />
        <KpiCard
          title="Ahorro Inversores"
          value="$405M"
          subtitle="vs comisiones de mercado"
          icon={Shield}
          trend={{ value: '-80% en comisiones', positive: true }}
        />
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-4 text-emerald-600" />
            Ingresos Mensuales por Fees
          </CardTitle>
          <CardDescription>GSP 3% vs Mercado 15% · Montos en millones CLP</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueConfig} className="h-[320px] w-full">
            <BarChart data={monthlyRevenue} barGap={4}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v}M`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend content={<ChartLegendContent />} />
              <Bar dataKey="gsp" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mercado" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fee Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="size-4 text-emerald-600" />
              Desglose de Ingresos
            </CardTitle>
            <CardDescription>Distribución por tipo de fee</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {feeBreakdown.map((fee, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{fee.concepto}</span>
                  <div className="text-right">
                    <span className="font-semibold">{formatShortCLP(fee.monto)}</span>
                    <span className="ml-2 text-muted-foreground">({fee.porcentaje}%)</span>
                  </div>
                </div>
                <Progress value={fee.porcentaje} className="h-2" />
              </div>
            ))}
            <Separator className="my-3" />
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>{formatCLP(totalFeeIncome)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Cost Comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-4 text-emerald-600" />
              Ventaja Competitiva
            </CardTitle>
            <CardDescription>Comparativa de costos GSP vs Mercado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-emerald-100 p-1 dark:bg-emerald-900/30">
                      <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium">GSP</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">3%</span>
                </div>
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '20%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-red-100 p-1 dark:bg-red-900/30">
                      <XCircle className="size-3.5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-sm font-medium">Promedio Mercado</span>
                  </div>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">15%</span>
                </div>
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-red-400" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
            <Separator />
            <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
              <div className="flex items-start gap-3">
                <TrendingUp className="mt-0.5 size-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-100">Ahorro del 80%</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Nuestros inversores ahorran en promedio {formatCLP(12_000_000)} al año en comisiones
                    comparado con el mercado tradicional.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Motor de Liquidez View ─────────────────────────────────────────────────
function LiquidezView() {
  const [autoReplenish, setAutoReplenish] = useState(liquidityPool.autoReplenish)
  const [maxUtil, setMaxUtil] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Motor de Liquidez</h2>
        <p className="text-muted-foreground">Gestión del pool de liquidez y solicitudes de rescate</p>
      </div>

      {/* Pool Status Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Reserva</p>
                <p className="text-2xl font-bold tracking-tight">{formatShortCLP(liquidityPool.totalReserva)}</p>
                <p className="text-xs text-muted-foreground">Disponible para rescates</p>
              </div>
              <div className="rounded-xl bg-emerald-100 p-2.5 dark:bg-emerald-900/30">
                <Wallet className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Utilización</p>
                <p className="text-2xl font-bold tracking-tight">{liquidityPool.utilizacion}%</p>
                <p className="text-xs text-muted-foreground">del pool en uso</p>
              </div>
              <div className="rounded-xl bg-teal-100 p-2.5 dark:bg-teal-900/30">
                <Activity className="size-5 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Solicitudes Activas</p>
                <p className="text-2xl font-bold tracking-tight">{liquidityPool.solicitudesActivas}</p>
                <p className="text-xs text-muted-foreground">en proceso</p>
              </div>
              <div className="rounded-xl bg-yellow-100 p-2.5 dark:bg-yellow-900/30">
                <Clock className="size-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Saldo Mínimo</p>
                <p className="text-2xl font-bold tracking-tight">{formatShortCLP(liquidityPool.reservasMinimas)}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Reserva OK</p>
              </div>
              <div className="rounded-xl bg-emerald-100 p-2.5 dark:bg-emerald-900/30">
                <Shield className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Liquidity Requests Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="size-4 text-emerald-600" />
              Solicitudes de Liquidez
            </CardTitle>
            <CardDescription>Historial de solicitudes de rescate</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[360px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="hidden sm:table-cell">Activo</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liquidityRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-xs">{req.id}</TableCell>
                      <TableCell className="font-medium">{req.usuario}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{req.activo}</TableCell>
                      <TableCell className="text-right font-medium">{formatShortCLP(req.monto)}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{req.fecha}</TableCell>
                      <TableCell>
                        <LiquidityBadge estado={req.estado} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Schedule + Config + Risk */}
        <div className="space-y-6">
          {/* Replenishment Schedule */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <RefreshCw className="size-4 text-emerald-600" />
                Calendario Reposición
              </CardTitle>
              <CardDescription>Próximos aportes al pool</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {replenishmentSchedule.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="rounded-full bg-emerald-100 p-1.5 dark:bg-emerald-900/30">
                    <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-medium">{formatShortCLP(item.monto)}</p>
                    <p className="text-xs text-muted-foreground">{item.origen} · {item.fecha}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Risk Indicators */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="size-4 text-yellow-500" />
                Indicadores de Riesgo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm">Nivel de Reserva</span>
                </div>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Saludable</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm">Concentración</span>
                </div>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Baja</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  <span className="text-sm">Velocidad Rescate</span>
                </div>
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Moderada</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm">Tasa de Default</span>
                </div>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">0%</span>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="size-4 text-emerald-600" />
                Configuración
              </CardTitle>
              <CardTitle className="text-xs font-normal text-muted-foreground">
                Ajustes del motor de liquidez
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Auto-Reposición</p>
                  <p className="text-xs text-muted-foreground">Reponer automáticamente cuando baje del mínimo</p>
                </div>
                <Switch checked={autoReplenish} onCheckedChange={setAutoReplenish} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Límite Utilización</p>
                  <p className="text-xs text-muted-foreground">Bloquear rescates al 75% del pool</p>
                </div>
                <Switch checked={maxUtil} onCheckedChange={setMaxUtil} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Fondo Contingencia</p>
                  <p className="text-xs text-muted-foreground">Mantener 10% de reserva extra</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Chart Legend Content helper (imported from chart.tsx pattern) ───────────
function ChartLegendContent({
  payload,
  nameKey,
}: {
  payload?: Array<{ value: string; color: string }>
  nameKey?: string
}) {
  if (!payload?.length) return null
  return (
    <div className="flex items-center justify-center gap-4 pt-3">
      {payload.map((item) => (
        <div key={item.value} className="flex items-center gap-1.5">
          <div className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
          <span className="text-sm text-muted-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Admin Page Component ───────────────────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('panel')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentNav = navItems.find((n) => n.id === activeTab)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b bg-white px-4 py-3 dark:bg-gray-950 lg:hidden">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="size-9">
              <Menu className="size-5" />
              <span className="sr-only">Menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
                  GSP
                </div>
                Admin CMS
              </SheetTitle>
            </SheetHeader>
            <SidebarNav activeTab={activeTab} setActiveTab={(tab) => {
              setActiveTab(tab)
              setSidebarOpen(false)
            }} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
            GSP
          </div>
          <span className="font-semibold">Admin</span>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r bg-white dark:bg-gray-950 lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            {/* Logo */}
            <div className="flex items-center gap-3 border-b p-4">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
                GSP
              </div>
              <div>
                <p className="text-sm font-semibold">GSP Fintech</p>
                <p className="text-xs text-muted-foreground">Admin CMS</p>
              </div>
            </div>
            {/* Nav */}
            <div className="flex-1 overflow-y-auto">
              <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            {/* Footer */}
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  AD
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">admin@gsp.cl</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {/* Page Header (desktop) */}
            <div className="mb-6 hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                {currentNav && <currentNav.icon className="size-4" />}
                {currentNav?.label}
              </span>
            </div>

            {/* View Content */}
            {activeTab === 'panel' && <PanelGeneralView />}
            {activeTab === 'activos' && <ActivosView />}
            {activeTab === 'usuarios' && <UsuariosView />}
            {activeTab === 'finanzas' && <FinanzasView />}
            {activeTab === 'liquidez' && <LiquidezView />}
          </div>
        </main>
      </div>
    </div>
  )
}
