'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Building2,
  Calculator,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Info,
  Landmark,
  MapPin,
  Percent,
  Shield,
  TrendingUp,
  Trophy,
  FileCheck,
  FileSpreadsheet,
  FileSearch,
  HandshakeIcon,
  BarChart3,
  DollarSign,
  Zap,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

// ─── Demo Data ────────────────────────────────────────────────────────────────

const demoAsset = {
  id: 'demo_1',
  name: 'Centro Logístico Santiago Norte',
  type: 'last_mile_logistics',
  status: 'active',
  address: 'Av. Américo Vespucio 0450, Quilicura',
  city: 'Santiago',
  region: 'Metropolitana',
  latitude: -33.3872,
  longitude: -70.7401,
  totalValue: 2800000000,
  pricePerFraction: 250000,
  totalFractions: 11200,
  availableFractions: 3200,
  minimumInvestment: 250000,
  fundedPercentage: 71.4,
  annualYield: 11.2,
  projectedAppreciation: 5.8,
  totalProjectedReturn: 17.0,
  leaseStatus: 'leased',
  monthlyRent: 19800000,
  tenantName: 'LogiChile SpA',
  totalArea: 4500,
  units: 12,
  constructionYear: 2021,
  landUse: 'Industrial / Logístico',
  operationalCostsPct: 3.0,
  badge: 'En Arriendo',
  images: [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&h=600&fit=crop',
  ],
  cashFlow: [
    { period: 'Año 1', grossIncome: 237.6, netIncome: 230.5, cumulativeReturn: 392.9 },
    { period: 'Año 2', grossIncome: 244.9, netIncome: 237.6, cumulativeReturn: 802.3 },
    { period: 'Año 3', grossIncome: 252.3, netIncome: 244.7, cumulativeReturn: 1228.8 },
    { period: 'Año 4', grossIncome: 259.8, netIncome: 252.0, cumulativeReturn: 1673.1 },
    { period: 'Año 5', grossIncome: 267.6, netIncome: 259.6, cumulativeReturn: 2136.2 },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCLP(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-CL').replace(/,/g, '.')
}

function formatCLPMillions(value: number): string {
  return `$${(value / 1000000).toFixed(1).replace('.', ',')}M`
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

// ─── Custom Chart Tooltip ────────────────────────────────────────────────────

function CustomChartTooltip({
  active,
  payload,
  label,
  unit = 'M$',
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
  unit?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="mb-1 text-sm font-semibold text-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {unit}
          {entry.value.toFixed(1)}
        </p>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AssetDetailPage() {
  const [investmentAmount, setInvestmentAmount] = useState<number>(500000)

  const maxInvestment = demoAsset.availableFractions * demoAsset.pricePerFraction

  // Calculator calculations
  const calculator = useMemo(() => {
    const fractions = Math.floor(investmentAmount / demoAsset.pricePerFraction)
    const monthlyDividend =
      fractions > 0
        ? (fractions * demoAsset.monthlyRent) / demoAsset.totalFractions
        : 0
    const annualAppreciation =
      (investmentAmount * demoAsset.projectedAppreciation) / 100
    return { fractions, monthlyDividend, annualAppreciation }
  }, [investmentAmount])

  // Handle slider change with step snapping
  const handleSliderChange = (value: number[]) => {
    setInvestmentAmount(value[0])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/\./g, ''), 10)
    if (!isNaN(val)) {
      setInvestmentAmount(Math.min(Math.max(val, demoAsset.minimumInvestment), maxInvestment))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Navigation Bar ── */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 md:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Marketplace
          </Link>
          <Separator orientation="vertical" className="mx-4 h-5" />
          <span className="text-sm text-muted-foreground truncate">
            {demoAsset.type === 'last_mile_logistics' ? 'Logística de Última Milla' : 'Activo Inmobiliario'}
          </span>
          <Badge className="ml-3 bg-emerald-600 text-white hover:bg-emerald-700 border-0">
            {demoAsset.badge}
          </Badge>
        </div>
      </div>

      {/* ── Main Layout: 2-column ── */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* ── Left Column (60%) ── */}
          <div className="min-w-0 flex-1 lg:max-w-[60%]">
            {/* 1. Hero / Image Carousel */}
            <motion.section
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="mb-8"
            >
              <div className="relative">
                <Carousel
                  opts={{ loop: true }}
                  className="w-full"
                >
                  <CarouselContent>
                    {demoAsset.images.map((img, idx) => (
                      <CarouselItem key={idx}>
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                          <Image
                            src={img}
                            alt={`${demoAsset.name} - imagen ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 60vw"
                            priority={idx === 0}
                          />
                          {idx === 0 && (
                            <div className="absolute left-4 top-4 flex gap-2">
                              <Badge className="bg-emerald-600 text-white border-0 text-xs px-3 py-1 shadow-lg">
                                {demoAsset.badge}
                              </Badge>
                              <Badge className="bg-amber-500 text-white border-0 text-xs px-3 py-1 shadow-lg">
                                Últimos cupos
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2 bg-background/80 border-0 shadow-lg hover:bg-background" />
                  <CarouselNext className="right-3 top-1/2 -translate-y-1/2 bg-background/80 border-0 shadow-lg hover:bg-background" />
                </Carousel>

                {/* Image counter */}
                <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                  1 / {demoAsset.images.length}
                </div>
              </div>
            </motion.section>

            {/* Asset Title & Location */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="mb-8"
            >
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {demoAsset.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  {demoAsset.address}
                </span>
                <Badge variant="secondary" className="gap-1">
                  <Building2 className="h-3 w-3" />
                  {demoAsset.type === 'last_mile_logistics' ? 'Logística Última Milla' : 'Inmobiliario'}
                </Badge>
              </div>
            </motion.div>

            {/* 3. Key Metrics Section (4 cards) */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="mb-8"
            >
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                <MetricCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Rentabilidad Total"
                  value={`${demoAsset.totalProjectedReturn}%`}
                  sublabel="Estimada anual"
                  color="emerald"
                />
                <MetricCard
                  icon={<Percent className="h-5 w-5" />}
                  label="Yield de Arriendo"
                  value={`${demoAsset.annualYield}%`}
                  sublabel="Dividendo anual"
                  color="teal"
                />
                <MetricCard
                  icon={<ArrowUpRight className="h-5 w-5" />}
                  label="Plusvalía Proyectada"
                  value={`${demoAsset.projectedAppreciation}%`}
                  sublabel="Anual estimada"
                  color="amber"
                />
                <MetricCard
                  icon={<Zap className="h-5 w-5" />}
                  label="Plazo de Salida"
                  value="48 hrs"
                  sublabel="Express"
                  color="violet"
                />
              </div>
            </motion.section>

            {/* 4. Description Section */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    Descripción del Activo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Markdown-like description */}
                  <div className="prose prose-sm max-w-none text-muted-foreground space-y-3">
                    <p className="leading-relaxed">
                      El <strong className="text-foreground">Centro Logístico Santiago Norte</strong> es un
                      activo inmobiliario de clase A ubicado en una de las zonas con mayor crecimiento
                      logístico de la Región Metropolitana. Este centro de distribución de última milla
                      cuenta con infraestructura moderna y una ubicación estratégica sobre la autopista
                      Américo Vespucio.
                    </p>
                    <h3 className="text-base font-semibold text-foreground mt-4">Características Principales</h3>
                    <ul className="space-y-1.5 ml-1">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span><strong className="text-foreground">4.500 m²</strong> de área total construida distribuidos en 12 unidades</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>Construcción año <strong className="text-foreground">2021</strong>, estructura de hormigón y acero de primer nivel</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>Arrendado a <strong className="text-foreground">LogiChile SpA</strong>, contrato vigente por 5 años con ajuste anual IPC + 2%</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>Zonificación <strong className="text-foreground">Industrial / Logístico</strong> con uso de suelo consolidado</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>Acceso directo a autopista Américo Vespucio, alto flujo vehicular</span>
                      </li>
                    </ul>
                    <h3 className="text-base font-semibold text-foreground mt-4">Sobre el Arrendatario</h3>
                    <p className="leading-relaxed">
                      <strong className="text-foreground">LogiChile SpA</strong> es una empresa líder en soluciones de logística de
                      última milla con más de 15 años de operación en Chile. Cuenta con contratos activos
                      con las principales retaileras del país, asegurando un flujo de ingresos estable
                      y sostenible para el activo.
                    </p>
                  </div>

                  {/* Technical Specs Grid */}
                  <Separator className="my-4" />
                  <div>
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Ficha Técnica
                    </h4>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <SpecItem label="m² Totales" value={`${demoAsset.totalArea.toLocaleString('es-CL')} m²`} />
                      <SpecItem label="Unidades" value={`${demoAsset.units} unidades`} />
                      <SpecItem label="Año Construcción" value={`${demoAsset.constructionYear}`} />
                      <SpecItem label="Uso de Suelo" value={demoAsset.landUse} />
                      <SpecItem label="Arrendatario" value={demoAsset.tenantName} />
                      <SpecItem label="Renta Mensual" value={formatCLP(demoAsset.monthlyRent)} />
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>
                        GPS: {demoAsset.latitude}, {demoAsset.longitude}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* 5. Financial Transparency Section */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    Transparencia en Costos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Comparamos nuestros costos con los del mercado para que inviertas con total transparencia.
                  </p>

                  {/* Visual bar comparison */}
                  <div className="space-y-4">
                    <CostComparisonBar
                      label="GSP"
                      percentage={3}
                      color="bg-emerald-600"
                      highlight
                    />
                    <CostComparisonBar
                      label="Mercado Promedio"
                      percentage={15}
                      color="bg-red-500"
                    />
                  </div>

                  {/* Advantage callout */}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-emerald-600 p-1.5">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
                          Nuestra ventaja
                        </h4>
                        <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
                          Con solo un <strong>3% de costo operativo</strong>, GSP te permite retener más
                          de tus retornos. El mercado promedio cobra hasta un 15% en comisiones y costos
                          ocultos. Nuestra tecnología nos permite mantener costos al mínimo y pasar ese
                          ahorro directamente a ti.
                        </p>
                        <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                          Ahorro estimado por inversión: hasta 12% más de rentabilidad neta.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* 6. Legal Documents Section */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileCheck className="h-5 w-5 text-emerald-600" />
                    Documentos Legales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <DocumentCard
                      title="Escritura SpA"
                      description="Constitución legal de la Sociedad por Acciones"
                      fileType="PDF"
                      icon={<FileText className="h-5 w-5" />}
                    />
                    <DocumentCard
                      title="Informe de Tasación"
                      description="Avalúo profesional certificado del activo"
                      fileType="PDF"
                      icon={<FileSearch className="h-5 w-5" />}
                    />
                    <DocumentCard
                      title="Estudio de Títulos"
                      description="Verificación registral y legal del inmueble"
                      fileType="PDF"
                      icon={<FileSpreadsheet className="h-5 w-5" />}
                    />
                    <DocumentCard
                      title="Contrato de Administración"
                      description="Contrato de administración del activo con GSP"
                      fileType="PDF"
                      icon={<HandshakeIcon className="h-5 w-5" />}
                    />
                    <DocumentCard
                      title="Estado Financiero"
                      description="Balance y estado de resultados auditado"
                      fileType="XLSX"
                      icon={<BarChart3 className="h-5 w-5" />}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* 7. Cash Flow Charts Section */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                    Proyección de Flujo de Caja
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Bar Chart: Gross vs Net Income */}
                  <div>
                    <h4 className="mb-4 text-sm font-medium text-foreground">
                      Ingreso Bruto vs. Ingreso Neto (en MM$)
                    </h4>
                    <div className="h-64 w-full md:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={demoAsset.cashFlow} barGap={4}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="period"
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={{ stroke: 'hsl(var(--border))' }}
                          />
                          <YAxis
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={{ stroke: 'hsl(var(--border))' }}
                            tickFormatter={(v) => `${v}`}
                          />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Bar
                            dataKey="grossIncome"
                            name="Ingreso Bruto"
                            fill="#059669"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />
                          <Bar
                            dataKey="netIncome"
                            name="Ingreso Neto"
                            fill="#34d399"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <Separator />

                  {/* Area Chart: Cumulative Returns */}
                  <div>
                    <h4 className="mb-4 text-sm font-medium text-foreground">
                      Retorno Acumulado Proyectado (en MM$)
                    </h4>
                    <div className="h-64 w-full md:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={demoAsset.cashFlow}>
                          <defs>
                            <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="period"
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={{ stroke: 'hsl(var(--border))' }}
                          />
                          <YAxis
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={{ stroke: 'hsl(var(--border))' }}
                            tickFormatter={(v) => `${v}`}
                          />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="cumulativeReturn"
                            name="Retorno Acumulado"
                            stroke="#059669"
                            strokeWidth={2.5}
                            fill="url(#cumulativeGradient)"
                            dot={{ fill: '#059669', r: 4, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart legend note */}
                  <p className="text-xs text-muted-foreground text-center">
                    * Las proyecciones son estimaciones basadas en condiciones actuales del mercado. 
                    Los retornos reales pueden variar. Los valores están expresados en millones de pesos chilenos (MM$).
                  </p>
                </CardContent>
              </Card>
            </motion.section>
          </div>

          {/* ── Right Column (40%) — Sticky Sidebar ── */}
          <aside className="w-full lg:w-[40%] lg:min-w-[340px] lg:pl-4">
            <div className="lg:sticky lg:top-20">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
              >
                <Card className="border-2 border-emerald-100 shadow-lg dark:border-emerald-900/50">
                  <CardContent className="p-5 space-y-5">
                    {/* Header */}
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-foreground">Invertir Ahora</h2>
                      <p className="text-xs text-muted-foreground">
                        Inversión mínima desde {formatCLP(demoAsset.minimumInvestment)}
                      </p>
                    </div>

                    <Separator />

                    {/* Funding Progress */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          Financiamiento
                        </span>
                        <span className="text-sm font-bold text-emerald-600">
                          {demoAsset.fundedPercentage}%
                        </span>
                      </div>
                      <Progress value={demoAsset.fundedPercentage} className="h-3" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatCLPMillions(demoAsset.totalValue - (demoAsset.availableFractions * demoAsset.pricePerFraction))} recaudado</span>
                        <span>{formatCLPMillions(demoAsset.totalValue)} total</span>
                      </div>
                    </div>

                    {/* Available Fractions */}
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Fracciones disponibles</span>
                        <span className="text-lg font-bold text-foreground">
                          {demoAsset.availableFractions.toLocaleString('es-CL')}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        de {demoAsset.totalFractions.toLocaleString('es-CL')} totales a{' '}
                        {formatCLP(demoAsset.pricePerFraction)} c/u
                      </p>
                    </div>

                    <Separator />

                    {/* Dynamic Calculator */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-emerald-600" />
                        <h3 className="text-sm font-semibold text-foreground">
                          Calculadora de Inversión
                        </h3>
                      </div>

                      {/* Investment Input */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          ¿Cuánto deseas invertir?
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={investmentAmount.toLocaleString('es-CL')}
                            onChange={handleInputChange}
                            className="pl-7 text-base font-semibold pr-3 h-11"
                          />
                        </div>
                      </div>

                      {/* Slider */}
                      <Slider
                        value={[investmentAmount]}
                        onValueChange={handleSliderChange}
                        min={demoAsset.minimumInvestment}
                        max={Math.min(maxInvestment, 50000000)}
                        step={demoAsset.pricePerFraction}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCLP(demoAsset.minimumInvestment)}</span>
                        <span>{formatCLP(Math.min(maxInvestment, 50000000))}</span>
                      </div>

                      {/* Calculator Results */}
                      <div className="space-y-2.5 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-emerald-800 dark:text-emerald-300">
                            Fracciones que obtendrás:
                          </span>
                          <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                            {calculator.fractions}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-emerald-800 dark:text-emerald-300">
                            Dividendos mensuales estimados:
                          </span>
                          <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                            {formatCLP(calculator.monthlyDividend)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-emerald-800 dark:text-emerald-300">
                            Plusvalía anual estimada:
                          </span>
                          <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                            {formatCLP(calculator.annualAppreciation)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* CTA Button */}
                    <Button
                      size="lg"
                      className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <Trophy className="mr-2 h-5 w-5" />
                      Invertir Ahora
                    </Button>

                    {/* Express Exit Link */}
                    <div className="flex items-center justify-center gap-1.5 text-sm">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-muted-foreground">Salida Express</span>
                      <ShadcnTooltip>
                        <TooltipTrigger asChild>
                          <button className="inline-flex">
                            <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs text-xs leading-relaxed">
                          GSP ofrece liquidez express: puedes solicitar la venta de tus fracciones en
                          solo 48 horas hábiles. Sujeto a disponibilidad de compradores.
                        </TooltipContent>
                      </ShadcnTooltip>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap justify-center gap-3 pt-1">
                      <TrustBadge icon={<Shield className="h-3.5 w-3.5" />} text="Regulado CMF" />
                      <TrustBadge icon={<Landmark className="h-3.5 w-3.5" />} text="Garantía Notarial" />
                      <TrustBadge icon={<Clock className="h-3.5 w-3.5" />} text="Auditoría Anual" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sublabel: string
  color: 'emerald' | 'teal' | 'amber' | 'violet'
}) {
  const colorMap = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  }

  const valueColorMap = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    teal: 'text-teal-600 dark:text-teal-400',
    amber: 'text-amber-600 dark:text-amber-400',
    violet: 'text-violet-600 dark:text-violet-400',
  }

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className={cn('mb-2 inline-flex rounded-lg p-2', colorMap[color])}>
          {icon}
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn('text-xl font-bold', valueColorMap[color])}>{value}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </CardContent>
    </Card>
  )
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function CostComparisonBar({
  label,
  percentage,
  color,
  highlight,
}: {
  label: string
  percentage: number
  color: string
  highlight?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {highlight && (
            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-1.5 py-0 dark:bg-emerald-950 dark:text-emerald-300">
              Recomendado
            </Badge>
          )}
        </div>
        <span className={cn('text-sm font-bold', highlight ? 'text-emerald-600' : 'text-red-500')}>
          {percentage}%
        </span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn('h-full rounded-full', color)}
          initial={{ width: 0 }}
          whileInView={{ width: `${(percentage / 15) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  )
}

function DocumentCard({
  title,
  description,
  fileType,
  icon,
}: {
  title: string
  description: string
  fileType: string
  icon: React.ReactNode
}) {
  return (
    <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950 dark:text-emerald-400">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{description}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
              {fileType}
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 group-hover:underline">
              <Download className="h-3 w-3" />
              Descargar
            </span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0 transition-transform group-hover:translate-x-0.5" />
      </CardContent>
    </Card>
  )
}

function TrustBadge({
  icon,
  text,
}: {
  icon: React.ReactNode
  text: string
}) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      {icon}
      <span>{text}</span>
    </div>
  )
}
