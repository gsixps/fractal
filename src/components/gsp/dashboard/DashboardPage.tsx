'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Wallet,
  TrendingUp,
  DollarSign,
  PiggyBank,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Clock,
  Zap,
  Building2,
  Home,
  Store,
  Landmark,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatCLP(value: number): string {
  return '$' + value.toLocaleString('es-CL')
}

// ──────────────────────────────────────────────
// Demo Data
// ──────────────────────────────────────────────

const portfolioChartData = [
  { month: 'Jul', value: 18250000 },
  { month: 'Ago', value: 18560000 },
  { month: 'Sep', value: 18730000 },
  { month: 'Oct', value: 18980000 },
  { month: 'Nov', value: 19210000 },
  { month: 'Dic', value: 19935000 },
]

const statsData = [
  {
    title: 'Total Invertido',
    value: 18250000,
    change: 0,
    icon: Wallet,
    description: 'Capital invertido acumulado',
  },
  {
    title: 'Ganancias Totales',
    value: 1685000,
    change: 9.24,
    icon: TrendingUp,
    description: 'Retorno total sobre inversión',
  },
  {
    title: 'Dividendos Acumulados',
    value: 2340000,
    change: 12.82,
    icon: DollarSign,
    description: 'Dividendos recibidos (YTD)',
  },
  {
    title: 'Valor del Portafolio',
    value: 19935000,
    change: 9.24,
    icon: PiggyBank,
    description: 'Valor actual total',
  },
]

type InvestmentStatus = 'Activo' | 'Completado' | 'En Venta'

interface Investment {
  id: string
  name: string
  type: string
  typeIcon: React.ElementType
  fractions: number
  invested: number
  currentValue: number
  dividendYield: number
  status: InvestmentStatus
  progress: number
}

const investments: Investment[] = [
  {
    id: '1',
    name: 'Torre Costanera Oficina 1204',
    type: 'Oficina',
    typeIcon: Building2,
    fractions: 15,
    invested: 7500000,
    currentValue: 8250000,
    dividendYield: 8.2,
    status: 'Activo',
    progress: 78,
  },
  {
    id: '2',
    name: 'Residencial Los Dominicos A-301',
    type: 'Residencial',
    typeIcon: Home,
    fractions: 8,
    invested: 4000000,
    currentValue: 4320000,
    dividendYield: 6.5,
    status: 'Activo',
    progress: 65,
  },
  {
    id: '3',
    name: 'Local Comercial Av. Providencia',
    type: 'Comercial',
    typeIcon: Store,
    fractions: 5,
    invested: 3500000,
    currentValue: 3805000,
    dividendYield: 9.1,
    status: 'Activo',
    progress: 85,
  },
  {
    id: '4',
    name: 'Bodegas Logísticas San Bernardo',
    type: 'Industrial',
    typeIcon: Landmark,
    fractions: 10,
    invested: 3250000,
    currentValue: 3560000,
    dividendYield: 7.8,
    status: 'Completado',
    progress: 100,
  },
]

interface DividendRecord {
  id: string
  date: string
  asset: string
  amount: number
  status: 'Pagado' | 'Pendiente'
}

const dividendHistory: DividendRecord[] = [
  { id: 'd1', date: '15 Dic 2024', asset: 'Torre Costanera Of. 1204', amount: 153750, status: 'Pagado' },
  { id: 'd2', date: '15 Dic 2024', asset: 'Residencial Los Dominicos A-301', amount: 108000, status: 'Pagado' },
  { id: 'd3', date: '10 Dic 2024', asset: 'Local Comercial Av. Providencia', amount: 79688, status: 'Pendiente' },
  { id: 'd4', date: '15 Nov 2024', asset: 'Torre Costanera Of. 1204', amount: 153750, status: 'Pagado' },
  { id: 'd5', date: '15 Nov 2024', asset: 'Residencial Los Dominicos A-301', amount: 108000, status: 'Pagado' },
  { id: 'd6', date: '10 Nov 2024', asset: 'Local Comercial Av. Providencia', amount: 79688, status: 'Pagado' },
  { id: 'd7', date: '15 Oct 2024', asset: 'Bodegas Logísticas S.B.', amount: 126875, status: 'Pagado' },
  { id: 'd8', date: '15 Oct 2024', asset: 'Torre Costanera Of. 1204', amount: 153750, status: 'Pagado' },
]

type TransactionType = 'Compra' | 'Venta' | 'Dividendo'

interface Transaction {
  id: string
  date: string
  type: TransactionType
  amount: number
  description: string
  status: 'Completado' | 'Pendiente' | 'Procesando'
}

const transactionHistory: Transaction[] = [
  { id: 't1', date: '20 Nov 2024', type: 'Compra', amount: 1500000, description: 'Torre Costanera Of. 1204 - 3 fracciones', status: 'Completado' },
  { id: 't2', date: '15 Nov 2024', type: 'Dividendo', amount: 341438, description: 'Dividendos noviembre - 3 activos', status: 'Completado' },
  { id: 't3', date: '01 Nov 2024', type: 'Venta', amount: 500000, description: 'Bodegas Logísticas - 2 fracciones', status: 'Completado' },
  { id: 't4', date: '20 Oct 2024', type: 'Compra', amount: 500000, description: 'Residencial Los Dominicos - 1 fracción', status: 'Completado' },
  { id: 't5', date: '15 Oct 2024', type: 'Dividendo', amount: 280625, description: 'Dividendos octubre - 4 activos', status: 'Completado' },
  { id: 't6', date: '28 Sep 2024', type: 'Compra', amount: 700000, description: 'Local Comercial Av. Providencia - 1 fracción', status: 'Procesando' },
]

interface AssetDocument {
  name: string
  size: string
}

interface AssetDocumentGroup {
  assetName: string
  documents: AssetDocument[]
}

const documentRepository: AssetDocumentGroup[] = [
  {
    assetName: 'Torre Costanera Oficina 1204',
    documents: [
      { name: 'Contrato de Compra', size: '2.4 MB' },
      { name: 'Certificado de Fracción', size: '1.1 MB' },
      { name: 'Informe Anual 2024', size: '3.8 MB' },
      { name: 'Escritura Pública', size: '4.2 MB' },
    ],
  },
  {
    assetName: 'Residencial Los Dominicos A-301',
    documents: [
      { name: 'Contrato de Compra', size: '2.1 MB' },
      { name: 'Certificado de Fracción', size: '980 KB' },
      { name: 'Informe Anual 2024', size: '3.2 MB' },
    ],
  },
  {
    assetName: 'Local Comercial Av. Providencia',
    documents: [
      { name: 'Contrato de Compra', size: '2.6 MB' },
      { name: 'Certificado de Fracción', size: '1.3 MB' },
      { name: 'Informe Trimestral Q3', size: '2.9 MB' },
    ],
  },
  {
    assetName: 'Bodegas Logísticas San Bernardo',
    documents: [
      { name: 'Contrato de Compra', size: '2.3 MB' },
      { name: 'Certificado de Fracción', size: '1.0 MB' },
      { name: 'Informe Anual 2024', size: '3.5 MB' },
      { name: 'Acta de Liquidación', size: '1.8 MB' },
    ],
  },
]

// ──────────────────────────────────────────────
// Custom Tooltip for Chart
// ──────────────────────────────────────────────

function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-medium text-foreground">{label} 2024</p>
      <p className="text-sm font-semibold text-emerald-600">{formatCLP(payload[0].value)}</p>
    </div>
  )
}

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

function StatCard({ title, value, change, icon: Icon, description }: (typeof statsData)[number]) {
  const isPositive = change > 0
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-sm font-medium text-muted-foreground">
          {title}
        </CardDescription>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-2xl font-bold tracking-tight">{formatCLP(value)}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center gap-1.5 text-xs">
          {change > 0 ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
          ) : change < 0 ? (
            <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
          {change !== 0 && (
            <span className={isPositive ? 'font-medium text-emerald-600' : 'font-medium text-red-500'}>
              {isPositive ? '+' : ''}{change.toFixed(2)}%
            </span>
          )}
          <span className="text-muted-foreground">{description}</span>
        </div>
      </CardFooter>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-50 opacity-40 dark:bg-emerald-950" />
    </Card>
  )
}

function InvestmentCard({ investment }: { investment: Investment }) {
  const IconComponent = investment.typeIcon
  const appreciation = ((investment.currentValue - investment.invested) / investment.invested * 100).toFixed(1)
  const isPositive = investment.currentValue >= investment.invested

  const statusColor: Record<InvestmentStatus, string> = {
    'Activo': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
    'Completado': 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    'En Venta': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base leading-tight truncate">{investment.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{investment.type}</Badge>
                <Badge className={`text-xs border ${statusColor[investment.status]}`}>
                  {investment.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Fracciones</p>
            <p className="text-sm font-semibold">{investment.fractions}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Invertido</p>
            <p className="text-sm font-semibold">{formatCLP(investment.invested)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valor Actual</p>
            <p className="text-sm font-semibold text-emerald-600">{formatCLP(investment.currentValue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dividendos</p>
            <p className="text-sm font-semibold">{investment.dividendYield}% anual</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progreso</span>
            <span className={`font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{appreciation}% valorización
            </span>
          </div>
          <Progress value={investment.progress} className="h-2" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            Ver Activo
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
          {investment.status === 'Activo' && (
            <Button variant="outline" size="sm" className="flex-1 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950">
              Vender
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function DividendStatusBadge({ status }: { status: 'Pagado' | 'Pendiente' }) {
  if (status === 'Pagado') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
        Pagado
      </Badge>
    )
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
      <Clock className="mr-1 h-3 w-3" />
      Pendiente
    </Badge>
  )
}

function TransactionTypeBadge({ type }: { type: TransactionType }) {
  const config: Record<TransactionType, string> = {
    Compra: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
    Venta: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
    Dividendo: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  }
  return (
    <Badge className={`border ${config[type]}`}>
      {type}
    </Badge>
  )
}

function TransactionStatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    Completado: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
    Pendiente: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    Procesando: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800',
  }
  return (
    <Badge className={`border ${config[status] || config.Pendiente}`}>
      {status}
    </Badge>
  )
}

// ──────────────────────────────────────────────
// Main Dashboard Component
// ──────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('todos')

  const filteredInvestments = investments.filter((inv) => {
    if (activeTab === 'activos') return inv.status === 'Activo'
    if (activeTab === 'completados') return inv.status === 'Completado'
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Panel de Inversiones
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Resumen de tu portafolio de inversiones inmobiliarias fraccionadas
          </p>
        </div>

        {/* ── 1. Top Stats Row ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          {statsData.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* ── 2. Portfolio Performance Chart ── */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Rendimiento del Portafolio</CardTitle>
                <CardDescription>Evolución del valor de tu portafolio (últimos 6 meses)</CardDescription>
              </div>
              <Badge variant="outline" className="w-fit text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800">
                <TrendingUp className="mr-1 h-3.5 w-3.5" />
                +9.24% en 6 meses
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] sm:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioChartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`}
                    width={65}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#emeraldGradient)"
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ── 3. My Investments Section ── */}
        <section className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Mis Inversiones</h2>
              <p className="text-sm text-muted-foreground">Gestiona tus activos inmobiliarios fraccionados</p>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="activos">Activos</TabsTrigger>
                <TabsTrigger value="completados">Completados</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {filteredInvestments.length === 0 ? (
            <Card className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No se encontraron inversiones en esta categoría</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredInvestments.map((inv) => (
                <InvestmentCard key={inv.id} investment={inv} />
              ))}
            </div>
          )}
        </section>

        <Separator className="my-6" />

        {/* ── 4 & 5. Tables Section ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
          {/* Dividend History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Dividendos</CardTitle>
              <CardDescription>Últimos pagos de dividendos recibidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Activo</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dividendHistory.map((div) => (
                      <TableRow key={div.id}>
                        <TableCell className="text-sm whitespace-nowrap">{div.date}</TableCell>
                        <TableCell className="text-sm max-w-[140px] truncate">{div.asset}</TableCell>
                        <TableCell className="text-sm text-right font-medium whitespace-nowrap">
                          {formatCLP(div.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <DividendStatusBadge status={div.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Transacciones</CardTitle>
              <CardDescription>Movimientos recientes en tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="hidden lg:table-cell">Descripción</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionHistory.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm whitespace-nowrap">{tx.date}</TableCell>
                        <TableCell>
                          <TransactionTypeBadge type={tx.type} />
                        </TableCell>
                        <TableCell className="text-sm text-right font-medium whitespace-nowrap">
                          {tx.type === 'Venta' || tx.type === 'Dividendo' ? '+' : '-'}
                          {formatCLP(tx.amount)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                          {tx.description}
                        </TableCell>
                        <TableCell className="text-center">
                          <TransactionStatusBadge status={tx.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── 6. Quick Actions Section ── */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* CTA: Retiro de Ganancias */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 text-white lg:col-span-1">
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -right-2 -bottom-8 h-24 w-24 rounded-full bg-white/5" />
              <CardHeader className="relative pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <DollarSign className="h-5 w-5" />
                </div>
                <CardTitle className="text-white text-lg">Retiro de Ganancias</CardTitle>
                <CardDescription className="text-emerald-100">
                  Retira tus ganancias y dividendos acumulados directamente a tu cuenta bancaria.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Button className="w-full bg-white text-emerald-700 hover:bg-emerald-50 font-semibold">
                  Solicitar Retiro
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Salida Express */}
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <Zap className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Salida Express</CardTitle>
                <CardDescription>
                  Liquida tus fracciones en tiempo récord con nuestro programa de liquidez inmediata.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950">
                  <Zap className="mr-2 h-4 w-4" />
                  Acceder a Salida Express
                </Button>
              </CardContent>
            </Card>

            {/* Documentos Legales */}
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Documentos Legales</CardTitle>
                <CardDescription>
                  Accede a contratos, certificados y toda la documentación de tus inversiones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Documentos
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── 7. Document Repository ── */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Repositorio de Documentos</h2>
            <p className="text-sm text-muted-foreground">Documentación legal y financiera de tus activos</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {documentRepository.map((asset, idx) => (
                  <AccordionItem key={idx} value={`doc-asset-${idx}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <span className="font-medium text-sm">{asset.assetName}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{asset.documents.length} documentos disponibles</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-11">
                        {asset.documents.map((doc, docIdx) => (
                          <div
                            key={docIdx}
                            className="flex items-center justify-between rounded-lg border px-3 py-2.5 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">PDF · {doc.size}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="shrink-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950">
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Descargar {doc.name}</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
