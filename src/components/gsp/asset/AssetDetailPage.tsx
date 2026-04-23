'use client'

import { useEffect, useState } from 'react'
import {
  ArrowLeft, Building2, Calculator, CheckCircle2, Download, FileText,
  MapPin, Percent, TrendingUp, ArrowUpRight, Zap, BarChart3, Info,
  Landmark, Shield, Clock, AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0,
})
function formatCLP(value: number): string { return clpFormatter.format(value) }
function formatCLPShort(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1).replace('.', ',')}MM`
  return `$${(value / 1_000_000).toFixed(1).replace('.', ',')}M`
}
function parseHighlights(jsonString: string): string[] {
  try { const p = JSON.parse(jsonString); return Array.isArray(p) ? p : [] }
  catch { return typeof jsonString === 'string' && jsonString.trim() ? jsonString.split('\n').filter(Boolean) : [] }
}
function formatAssetType(type: string): string {
  const map: Record<string, string> = { office: 'Oficina', residential: 'Residencial', retail: 'Comercial', industrial: 'Industrial', last_mile_logistics: 'Logística Última Milla', mixed_use: 'Uso Mixto', micro_datacenter: 'Data Center', solar_energy: 'Energía Solar', mining: 'Minería', real_estate: 'Inmueble' }
  return map[type] || type
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function AssetDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border/40 gsp-glass">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 md:px-6">
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:py-8 space-y-8">
        <Skeleton className="aspect-[16/7] w-full rounded-2xl" />
        <div className="space-y-2"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
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
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10"><AlertTriangle className="h-7 w-7 text-destructive" /></div>
            <h2 className="text-xl font-semibold">Error al cargar</h2>
            <p className="text-sm text-muted-foreground font-light">{message}</p>
            <Button variant="outline" onClick={onBack} className="mt-2 border-border/50 cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Marketplace
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, sublabel, colorClass, valueColorClass }: {
  icon: React.ReactNode; label: string; value: string; sublabel: string; colorClass: string; valueColorClass: string
}) {
  return (
    <Card className="relative overflow-hidden border-border/40 gsp-card-hover">
      <CardContent className="p-4">
        <div className={cn('mb-2 inline-flex rounded-xl p-2', colorClass)}>{icon}</div>
        <p className="text-xs text-muted-foreground font-light">{label}</p>
        <p className={cn('text-xl font-bold tracking-tight', valueColorClass)}>{value}</p>
        <p className="text-xs text-muted-foreground font-light">{sublabel}</p>
      </CardContent>
      <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-primary/4" />
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40',
    funded: 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800/40',
    draft: 'bg-secondary text-muted-foreground border-border/50 dark:bg-secondary dark:text-muted-foreground dark:border-border/30',
    closed: 'bg-red-50 text-red-600 border-red-200/60 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/40',
  }
  return <Badge className={cn('border', config[status] || config.draft)}>
    {status === 'active' ? 'Activo' : status === 'funded' ? 'Financiado' : status === 'closed' ? 'Cerrado' : 'Borrador'}
  </Badge>
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AssetDetailPage() {
  const { selectedAssetId, selectedAsset, selectedAssetLoading, fetchAssetById, navigate } = useAppStore()
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!selectedAssetId) { navigate('marketplace'); return }
    fetchAssetById(selectedAssetId)
  }, [selectedAssetId, fetchAssetById, navigate])

  if (!selectedAssetId) return null
  if (selectedAssetLoading) return <AssetDetailSkeleton />
  if (!selectedAsset) return <ErrorState message='No se pudo encontrar el activo solicitado.' onBack={() => navigate('marketplace')} />

  const asset = selectedAsset

  const coverImage = asset.images[0]?.url
  const highlightsList = parseHighlights(asset.highlights)
  const totalInvestment = quantity * asset.pricePerFraction
  const annualDividend = (quantity * (asset.annualYield / 100) * asset.pricePerFraction)
  const maxQuantity = Math.min(asset.availableFractions, 100)

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Navigation Bar ── */}
      <div className="sticky top-0 z-40 border-b border-border/40 gsp-glass">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 md:px-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('marketplace')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver al Marketplace</span>
            <span className="sm:hidden">Volver</span>
          </Button>
          <Separator orientation="vertical" className="mx-3 h-5" />
          <span className="text-sm text-muted-foreground font-light">{formatAssetType(asset.type)}</span>
          <StatusBadge status={asset.status} />
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:py-8 space-y-8">
        {/* 1. Hero */}
        <section>
          {coverImage ? (
            <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl">
              <img src={coverImage} alt={asset.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                {asset.badge && <Badge className="bg-primary text-primary-foreground border-0 text-xs px-3 py-1 shadow-lg">{asset.badge}</Badge>}
                <Badge className="bg-white/90 text-foreground border-0 text-xs px-3 py-1 shadow-lg backdrop-blur-md">
                  {asset.availableFractions < 100 ? 'Últimos cupos' : 'Disponible'}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex aspect-[16/7] w-full items-center justify-center rounded-2xl bg-muted">
              <Building2 className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          <div className="mt-5 space-y-2">
            <h1 className="gsp-serif text-2xl font-normal tracking-tight md:text-3xl">{asset.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-light">
                <MapPin className="h-4 w-4 text-primary" />{asset.city}, {asset.region}
              </span>
              <Badge variant="secondary" className="gap-1">{formatAssetType(asset.type)}</Badge>
              {asset.badge && <Badge className="bg-primary/10 text-primary border-0 text-xs">{asset.badge}</Badge>}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="font-semibold">{formatCLP(asset.pricePerFraction)} <span className="text-muted-foreground font-light">/ fracción</span></span>
            <span className="font-semibold text-primary">{asset.annualYield}% <span className="text-muted-foreground font-light">yield anual</span></span>
            <span className="font-semibold">{asset.fundedPercentage}% <span className="text-muted-foreground font-light">financiado</span></span>
          </div>
        </section>

        {/* 2. Key Metrics */}
        <section>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <MetricCard icon={<TrendingUp className="h-5 w-5" />} label="Precio por Fracción" value={formatCLP(asset.pricePerFraction)} sublabel={`${asset.totalFractions.toLocaleString('es-CL')} fracciones totales`} colorClass="bg-primary/8 text-primary" valueColorClass="text-primary" />
            <MetricCard icon={<Percent className="h-5 w-5" />} label="Yield Anual" value={`${asset.annualYield}%`} sublabel="Dividendo anual estimado" colorClass="bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400" valueColorClass="text-teal-600 dark:text-teal-400" />
            <MetricCard icon={<ArrowUpRight className="h-5 w-5" />} label="Retorno Total Proy." value={`${asset.totalProjectedReturn}%`} sublabel="Plusvalía + yield" colorClass="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" valueColorClass="text-amber-600 dark:text-amber-400" />
            <MetricCard icon={<Zap className="h-5 w-5" />} label="Financiamiento" value={`${asset.fundedPercentage}%`} sublabel={`${asset.availableFractions.toLocaleString('es-CL')} disponibles`} colorClass="bg-primary/8 text-primary" valueColorClass="text-primary" />
          </div>
          <div className="mt-3">
            <div className="gsp-progress-bar" style={{ height: '8px' }}>
              <div className="gsp-progress-bar-fill" style={{ width: `${asset.fundedPercentage}%` }} />
            </div>
          </div>
        </section>

        {/* 3. Description */}
        <section>
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5 text-primary" /> Descripción del Activo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground font-light">{asset.fullDescription}</div>
            </CardContent>
          </Card>
        </section>

        {/* 4. Highlights */}
        {highlightsList.length > 0 && (
          <section>
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><CheckCircle2 className="h-5 w-5 text-primary" /> Destacados</CardTitle>
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

        {/* 5. Cash Flow */}
        {asset.cashFlowProjections.length > 0 && (
          <section>
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><BarChart3 className="h-5 w-5 text-primary" /> Proyección de Flujo de Caja</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto rounded-xl border border-border/30 custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30 hover:bg-transparent">
                        <TableHead>Período</TableHead>
                        <TableHead className="text-right">Ingreso Bruto</TableHead>
                        <TableHead className="text-right">Costo Op.</TableHead>
                        <TableHead className="text-right">Ingreso Neto</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Plusvalía</TableHead>
                        <TableHead className="text-right">Retorno Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {asset.cashFlowProjections.map((cf) => (
                        <TableRow key={cf.id} className="border-border/20">
                          <TableCell className="font-medium text-sm">{cf.period}</TableCell>
                          <TableCell className="text-right text-sm">{formatCLPShort(cf.grossIncome)}</TableCell>
                          <TableCell className="text-right text-sm text-destructive">-{formatCLPShort(cf.operationalCost)}</TableCell>
                          <TableCell className="text-right text-sm font-medium text-primary">{formatCLPShort(cf.netIncome)}</TableCell>
                          <TableCell className="text-right text-sm hidden sm:table-cell text-amber-600 dark:text-amber-400">{cf.appreciation != null ? `${cf.appreciation.toFixed(1)}%` : '—'}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">{cf.totalReturn != null ? `${cf.totalReturn.toFixed(1)}%` : '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="mt-3 text-xs text-muted-foreground text-center font-light">
                  * Las proyecciones son estimaciones. Los valores están expresados en millones de pesos chilenos.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* 6. Documents */}
        {asset.documents.length > 0 && (
          <section>
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5 text-primary" /> Documentos del Activo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {asset.documents.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-3 rounded-xl border border-border/40 p-4 transition-all duration-200 hover:border-primary/25 hover:shadow-sm cursor-pointer">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary"><FileText className="h-4 w-4" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.title}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium border-border/40">{doc.documentType}</Badge>
                          <span className="inline-flex items-center gap-1 text-xs text-primary"><Download className="h-3 w-3" /> Descargar</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* 7. Investment Calculator */}
        <section>
          <Card className="border-2 border-primary/20 dark:border-primary/15 gsp-card-hover">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Calculadora de Inversión</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-light">Financiamiento</span>
                  <span className="font-bold text-primary">{asset.fundedPercentage}%</span>
                </div>
                <div className="gsp-progress-bar" style={{ height: '10px' }}>
                  <div className="gsp-progress-bar-fill" style={{ width: `${asset.fundedPercentage}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground font-light">
                  <span>{formatCLPShort((asset.totalFractions - asset.availableFractions) * asset.pricePerFraction)} recaudado</span>
                  <span>{formatCLPShort(asset.totalValue)} total</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Cantidad de fracciones</label>
                  <span className="text-2xl font-bold text-primary">{quantity}</span>
                </div>
                <Slider value={[quantity]} onValueChange={(val) => setQuantity(val[0])} min={1} max={maxQuantity} step={1} className="py-2" />
                <div className="flex justify-between text-xs text-muted-foreground font-light">
                  <span>1 fracción</span><span>{maxQuantity} fracciones</span>
                </div>
              </div>

              <div className="space-y-3 rounded-xl bg-primary/5 border border-primary/10 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary">Inversión total:</span>
                  <span className="text-lg font-bold text-foreground">{formatCLP(totalInvestment)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary">Dividendo anual estimado ({asset.annualYield}%):</span>
                  <span className="text-lg font-bold text-foreground">{formatCLP(annualDividend)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary">Dividendo mensual estimado:</span>
                  <span className="text-sm font-medium text-primary">{formatCLP(annualDividend / 12)}</span>
                </div>
              </div>

              <Button size="lg" className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 cursor-pointer">
                Invertir Ahora — {formatCLP(totalInvestment)}
              </Button>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
                {[
                  { icon: Shield, text: 'Regulado CMF' },
                  { icon: Landmark, text: 'Garantía Notarial' },
                  { icon: Clock, text: 'Auditoría Anual' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground font-light"><Icon className="h-3.5 w-3.5" />{text}</div>
                ))}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex items-center gap-1 text-xs text-amber-600 cursor-pointer">
                      <Zap className="h-3.5 w-3.5" /> Salida Express <Info className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-xs leading-relaxed">
                    Liquidez express: puedes solicitar la venta de tus fracciones en 48 horas hábiles.
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 8. Back */}
        <div className="flex justify-center pb-8">
          <Button variant="outline" size="lg" onClick={() => navigate('marketplace')} className="gap-2 border-border/50 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Volver al Marketplace
          </Button>
        </div>
      </div>
    </div>
  )
}
