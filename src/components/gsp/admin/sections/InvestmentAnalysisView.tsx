'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Brain,
  Building2,
  TrendingUp,
  Scale,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Clock,
  FileText,
  Shield,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AssetOption {
  id: string
  name: string
  type: string
  status: string
  city: string
  country: string
  totalValue: number
  pricePerFraction: number
  fundedPercentage: number
  annualYield: number
}

interface AnalysisResult {
  analysis: string
  assetName: string
  generatedAt: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COUNTRY_OPTIONS = [
  { value: 'chile', label: 'Chile' },
  { value: 'usa', label: 'Estados Unidos' },
  { value: 'mexico', label: 'México' },
  { value: 'colombia', label: 'Colombia' },
  { value: 'argentina', label: 'Argentina' },
  { value: 'peru', label: 'Perú' },
  { value: 'brasil', label: 'Brasil' },
  { value: 'venezuela', label: 'Venezuela' },
  { value: 'spain', label: 'España (UE)' },
  { value: 'other', label: 'Otro' },
]

const RISK_PROFILES = [
  { value: 'conservative', label: 'Conservador' },
  { value: 'moderate', label: 'Moderado' },
  { value: 'aggressive', label: 'Agresivo' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    real_estate: 'Inmueble',
    micro_datacenter: 'Data Center',
    last_mile_logistics: 'Logística',
    solar_energy: 'Energía Solar',
    mining: 'Minería',
  }
  return map[type] || type
}

/**
 * Parse the AI-generated analysis into modules for structured display.
 * Falls back to rendering raw markdown if parsing fails.
 */
function parseAnalysisModules(raw: string) {
  const modules: Array<{ id: string; title: string; icon: React.ElementType; content: string }> = []

  // Try to detect module boundaries
  const modulePatterns = [
    { regex: /(?:M[oó]dulo\s*1|Estructura de la Fracci[oó]n)/i, id: 'modulo-1', title: 'Módulo 1: Estructura de la Fracción', icon: Building2 },
    { regex: /(?:M[oó]dulo\s*2|Proyecci[oó]n Financiera|ROI\s*Neto)/i, id: 'modulo-2', title: 'Módulo 2: Proyección Financiera (ROI Neto)', icon: TrendingUp },
    { regex: /(?:M[oó]dulo\s*3|Compliance\s*[&&]\s*Legal|Legal\s*Trail)/i, id: 'modulo-3', title: 'Módulo 3: Compliance & Legal Trail', icon: Scale },
    { regex: /(?:M[oó]dulo\s*4|Gesti[oó]n de Riesgos\s*FX|Divisas)/i, id: 'modulo-4', title: 'Módulo 4: Gestión de Riesgos FX (Divisas)', icon: AlertTriangle },
    { regex: /(?:Advertencias|Limitaciones|Disclaimer)/i, id: 'disclaimer', title: 'Advertencias & Limitaciones', icon: Shield },
  ]

  // Find module start indices
  const matches: Array<{ index: number; module: typeof modulePatterns[0] }> = []
  for (const mp of modulePatterns) {
    const match = raw.match(mp.regex)
    if (match && match.index !== undefined) {
      matches.push({ index: match.index, module: mp })
    }
  }

  matches.sort((a, b) => a.index - b.index)

  if (matches.length >= 3) {
    // We found enough modules to parse structurally
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index
      const end = i + 1 < matches.length ? matches[i + 1].index : raw.length
      modules.push({
        id: matches[i].module.id,
        title: matches[i].module.title,
        icon: matches[i].module.icon,
        content: raw.substring(start, end).trim(),
      })
    }
  } else {
    // Fallback: render the entire text as one block
    modules.push({
      id: 'full-analysis',
      title: 'Análisis Completo',
      icon: Brain,
      content: raw,
    })
  }

  return modules
}

/**
 * Simple markdown-to-HTML renderer for displaying AI analysis.
 * Handles: headings, bold, italic, tables, lists, paragraphs.
 */
function renderMarkdown(text: string): string {
  let html = text

  // Escape HTML entities first
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Tables
  html = html.replace(
    /(?:^|\n)(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/g,
    (_match, header: string, _sep: string, body: string) => {
      const headers = header.split('|').filter((c: string) => c.trim()).map((c: string) => `<th class="px-3 py-2 text-left text-sm font-medium border-b border-border">${c.trim()}</th>`).join('')
      const rows = body.trim().split('\n').map((row: string) => {
        const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td class="px-3 py-2 text-sm border-b border-border/50">${c.trim()}</td>`).join('')
        return `<tr>${cells}</tr>`
      }).join('')
      return `<div class="my-4 overflow-x-auto rounded-lg border"><table class="w-full"><thead class="bg-muted/50"><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`
    }
  )

  // Headings (## and ###)
  html = html.replace(/^### (.+)$/gm, '<h4 class="text-base font-semibold mt-4 mb-2">$1</h4>')
  html = html.replace(/^## (.+)$/gm, '<h3 class="text-lg font-semibold mt-5 mb-2 text-primary">$1</h3>')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm mb-1">$1</li>')
  html = html.replace(/((?:<li class="ml-4 list-disc text-sm mb-1">.+<\/li>\n?)+)/g, '<ul class="my-2 space-y-0.5">$1</ul>')

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal text-sm mb-1">$1</li>')
  html = html.replace(/((?:<li class="ml-4 list-decimal text-sm mb-1">.+<\/li>\n?)+)/g, '<ol class="my-2 space-y-0.5">$1</ol>')

  // Paragraphs (double newline)
  html = html.replace(/\n\n+/g, '</p><p class="mb-3 text-sm leading-relaxed">')

  // Single newlines to <br>
  html = html.replace(/\n/g, '<br/>')

  // Wrap in paragraph
  html = `<p class="mb-3 text-sm leading-relaxed">${html}</p>`

  return html
}

// ─── Component ───────────────────────────────────────────────────────────────

export function InvestmentAnalysisView() {
  const [assets, setAssets] = useState<AssetOption[]>([])
  const [assetsLoading, setAssetsLoading] = useState(true)
  const [selectedAssetId, setSelectedAssetId] = useState<string>('')
  const [investorCountry, setInvestorCountry] = useState<string>('')
  const [riskProfile, setRiskProfile] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [recentAnalyses, setRecentAnalyses] = useState<Array<{ id: string; assetName: string; generatedAt: string }>>([])
  const { toast } = useToast()

  // Fetch assets on mount
  const fetchAssets = useCallback(async () => {
    try {
      setAssetsLoading(true)
      const res = await fetch('/api/admin/assets?limit=100')
      if (!res.ok) throw new Error('Error al cargar activos')
      const data = await res.json()
      setAssets(
        data.assets.map((a: Record<string, unknown>) => ({
          id: a.id as string,
          name: a.name as string,
          type: a.type as string,
          status: a.status as string,
          city: a.city as string,
          country: a.country as string,
          totalValue: a.totalValue as number,
          pricePerFraction: a.pricePerFraction as number,
          fundedPercentage: a.fundedPercentage as number,
          annualYield: a.annualYield as number,
        }))
      )
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar los activos', variant: 'destructive' })
    } finally {
      setAssetsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchAssets()
    // Also fetch recent analyses
    fetch('/api/admin/investment-analysis')
      .then((r) => r.json())
      .then((d) => setRecentAnalyses(d.analyses || []))
      .catch(() => {})
  }, [fetchAssets])

  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === selectedAssetId),
    [assets, selectedAssetId]
  )

  const parsedModules = useMemo(
    () => (analysisResult ? parseAnalysisModules(analysisResult.analysis) : []),
    [analysisResult]
  )

  // Auto-expand all modules when analysis is generated
  useEffect(() => {
    if (parsedModules.length > 0) {
      setExpandedModules(new Set(parsedModules.map((m) => m.id)))
    }
  }, [parsedModules])

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleGenerate = async () => {
    if (!selectedAssetId) {
      toast({ title: 'Selecciona un activo', description: 'Debes seleccionar un activo para generar el análisis', variant: 'destructive' })
      return
    }

    try {
      setGenerating(true)
      setAnalysisResult(null)

      const body: Record<string, string> = { assetId: selectedAssetId }
      if (investorCountry) body.investorCountry = investorCountry
      if (riskProfile) body.riskProfile = riskProfile

      const res = await fetch('/api/admin/investment-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al generar análisis')
      }

      const data: AnalysisResult = await res.json()
      setAnalysisResult(data)
      toast({
        title: 'Análisis generado',
        description: `Análisis de "${data.assetName}" generado exitosamente`,
      })

      // Refresh recent analyses
      fetch('/api/admin/investment-analysis')
        .then((r) => r.json())
        .then((d) => setRecentAnalyses(d.analyses || []))
        .catch(() => {})
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error desconocido al generar análisis',
        variant: 'destructive',
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleCopyAnalysis = () => {
    if (!analysisResult) return
    navigator.clipboard.writeText(analysisResult.analysis).then(() => {
      toast({ title: 'Copiado', description: 'Análisis copiado al portapapeles' })
    }).catch(() => {
      toast({ title: 'Error', description: 'No se pudo copiar al portapapeles', variant: 'destructive' })
    })
  }

  const handleExportTxt = () => {
    if (!analysisResult) return
    const blob = new Blob([analysisResult.analysis], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analisis-${analysisResult.assetName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Exportado', description: 'Análisis exportado como TXT' })
  }

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (assetsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="gsp-serif text-2xl font-normal tracking-tight flex items-center gap-2">
            <Brain className="size-6 text-primary" />
            Análisis de Inversión IA
          </h2>
          <p className="text-muted-foreground">Motor de análisis Core Logic Engine de 3GSP</p>
        </div>
      </div>

      {/* Controls Card */}
      <Card className="border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            Configuración del Análisis
          </CardTitle>
          <CardDescription>
            Selecciona un activo y opcionalmente el perfil del inversor para generar un análisis completo de 4 módulos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Asset Selection */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <label className="text-sm font-medium">Activo *</label>
              <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar activo..." />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{asset.name}</span>
                        <Badge variant="secondary" className="text-[10px] ml-1">
                          {getTypeLabel(asset.type)}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {formatUSD(asset.pricePerFraction)}/frac
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">País del Inversor</label>
              <Select value={investorCountry} onValueChange={setInvestorCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Perfil de Riesgo</label>
              <Select value={riskProfile} onValueChange={setRiskProfile}>
                <SelectTrigger>
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  {RISK_PROFILES.map((rp) => (
                    <SelectItem key={rp.value} value={rp.value}>
                      {rp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Asset Summary */}
          {selectedAsset && (
            <div className="rounded-lg bg-muted/50 border border-border/40 p-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Ubicación:</span>
                  <span className="font-medium">{selectedAsset.city}, {selectedAsset.country}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Valor Total:</span>
                  <span className="font-medium">{formatUSD(selectedAsset.totalValue)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Yield:</span>
                  <span className="font-medium text-primary">{selectedAsset.annualYield}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Financiado:</span>
                  <span className="font-medium">{selectedAsset.fundedPercentage.toFixed(0)}%</span>
                </div>
                <Badge variant="outline" className="capitalize">{selectedAsset.status}</Badge>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
              onClick={handleGenerate}
              disabled={generating || !selectedAssetId}
              size="lg"
            >
              {generating ? (
                <>
                  <RefreshCw className="mr-2 size-4 animate-spin" />
                  Generando análisis...
                </>
              ) : (
                <>
                  <Brain className="mr-2 size-4" />
                  Generar Análisis
                </>
              )}
            </Button>
            {generating && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3 animate-pulse" />
                El análisis IA puede tardar entre 15-30 segundos...
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading Skeleton */}
      {generating && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-3" />
          </div>
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-60" />
              <Skeleton className="h-4 w-80 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-24 w-full rounded-lg mt-4" />
                <Skeleton className="h-4 w-full mt-4" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-4 w-72 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-32 w-full rounded-lg mt-2" />
                <Skeleton className="h-4 w-5/6 mt-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && !generating && (
        <div className="space-y-4">
          {/* Result Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                {analysisResult.assetName}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3" />
                Generado: {new Date(analysisResult.generatedAt).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyAnalysis}>
                <Copy className="mr-1.5 size-3.5" /> Copiar
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportTxt}>
                <Download className="mr-1.5 size-3.5" /> Exportar TXT
              </Button>
            </div>
          </div>

          {/* Module Cards */}
          {parsedModules.map((mod) => {
            const isExpanded = expandedModules.has(mod.id)
            const Icon = mod.icon
            const isDisclaimer = mod.id === 'disclaimer'

            return (
              <Card
                key={mod.id}
                className={`border-border/40 transition-all ${isDisclaimer ? 'border-amber-300/60 bg-amber-50/30 dark:bg-amber-950/10 dark:border-amber-700/30' : ''}`}
              >
                <CardHeader
                  className="pb-3 cursor-pointer select-none"
                  onClick={() => toggleModule(mod.id)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2.5 text-base">
                      <div className={`rounded-lg p-2 ${isDisclaimer ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-primary/8 text-primary'}`}>
                        <Icon className="size-4" />
                      </div>
                      <span>{mod.title}</span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {!isExpanded && (
                        <Badge variant="outline" className="text-[10px]">
                          Click para expandir
                        </Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <div
                      className="prose prose-sm max-w-none text-foreground"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(mod.content) }}
                    />
                  </CardContent>
                )}
              </Card>
            )
          })}

          {/* Disclaimer Banner */}
          <div className="rounded-xl border border-amber-300/60 bg-amber-50/50 p-4 sm:p-5 dark:bg-amber-950/10 dark:border-amber-700/30">
            <div className="flex gap-3">
              <Info className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                  Aviso Importante
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400/80 leading-relaxed">
                  Este análisis es generado por IA y no constituye asesoría financiera profesional. Los inversores deben consultar con profesionales antes de tomar decisiones de inversión. Las proyecciones financieras son estimadas y sujetas a condiciones de mercado. GALAXY LLC no garantiza retornos fijos ni ciertos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Analyses */}
      {!generating && !analysisResult && (
        <>
          <Separator />
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4 text-primary" />
                Análisis Recientes
              </CardTitle>
              <CardDescription>
                Historial de análisis generados durante esta sesión
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentAnalyses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Brain className="mb-3 size-10 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">Sin análisis generados</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selecciona un activo y haz clic en &quot;Generar Análisis&quot; para comenzar
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentAnalyses.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/8 p-2 text-primary">
                          <FileText className="size-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{a.assetName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(a.generatedAt).toLocaleString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Completado
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
