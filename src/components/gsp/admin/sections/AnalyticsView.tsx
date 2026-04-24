'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  BarChart3,
  Eye,
  Users,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  ArrowUpRight,
  RefreshCw,
  Activity,
  TrendingUp,
  MousePointerClick,
  AlertTriangle,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AnalyticsStats {
  summary: {
    totalToday: number
    totalWeek: number
    totalMonth: number
    totalPeriod: number
    uniqueVisitors: number
    activeNow: number
    bounceRate: number
    avgPagesPerSession: number
  }
  topPages: Array<{ page: string; count: number }>
  visitsOverTime: Array<{ date: string; visits: number }>
  deviceBreakdown: { desktop: number; mobile: number; tablet: number; unknown: number }
  countryBreakdown: Array<{ country: string; count: number }>
  referrerBreakdown: Array<{ referrer: string; count: number }>
  activePageVisits: Record<string, number>
}

interface RealtimeData {
  activeUsers: number
  currentPageVisits: Record<string, number>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-CL').format(n)
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

const PAGE_LABELS: Record<string, string> = {
  home: 'Inicio',
  marketplace: 'Marketplace',
  'asset-detail': 'Detalle de Activo',
  dashboard: 'Dashboard',
  admin: 'Panel Admin',
  login: 'Login',
}

function getPageLabel(page: string): string {
  return PAGE_LABELS[page] || page
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AnalyticsView() {
  const [period, setPeriod] = useState('7d')
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [realtime, setRealtime] = useState<RealtimeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [statsRes, realtimeRes] = await Promise.all([
        fetch(`/api/analytics/stats?period=${period}`),
        fetch('/api/analytics/realtime'),
      ])
      if (!statsRes.ok || !realtimeRes.ok) throw new Error('Error al cargar analytics')
      const statsData = await statsRes.json()
      const realtimeData = await realtimeRes.json()
      setStats(statsData)
      setRealtime(realtimeData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchStats() }, [fetchStats])

  // Poll realtime every 15 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/analytics/realtime')
        if (res.ok) {
          const data = await res.json()
          setRealtime(data)
        }
      } catch {
        // Silent fail
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="mb-4 size-12 text-muted-foreground" />
        <p className="mb-4 text-lg font-medium">Error al cargar analytics</p>
        <Button variant="outline" onClick={fetchStats}>
          <RefreshCw className="mr-2 size-4" /> Reintentar
        </Button>
      </div>
    )
  }

  if (!stats) return null

  const maxVisit = Math.max(...stats.visitsOverTime.map((d) => d.visits), 1)
  const maxPageCount = Math.max(...stats.topPages.map((p) => p.count), 1)
  const totalDevices = stats.deviceBreakdown.desktop + stats.deviceBreakdown.mobile + stats.deviceBreakdown.tablet + stats.deviceBreakdown.unknown || 1
  const activeNow = realtime?.activeUsers || stats.summary.activeNow
  const activePages = realtime?.currentPageVisits || stats.activePageVisits

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Metricas de visitas en tiempo real y analisis de trafico</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="7d">Ultimos 7 dias</SelectItem>
              <SelectItem value="30d">Ultimos 30 dias</SelectItem>
              <SelectItem value="90d">Ultimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchStats}>
            <RefreshCw className="mr-2 size-3" /> Actualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Active Users Now */}
        <Card className="relative overflow-hidden border-border/40 gsp-card-hover">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Usuarios Activos</p>
                <p className="text-2xl font-bold tracking-tight">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="relative flex size-2.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                    </span>
                    {activeNow}
                  </span>
                </p>
                <span className="text-xs text-muted-foreground">ahora mismo</span>
              </div>
              <div className="rounded-xl bg-primary/8 p-2.5 text-primary">
                <Activity className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Visits Period */}
        <Card className="relative overflow-hidden border-border/40 gsp-card-hover">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Visitas</p>
                <p className="text-2xl font-bold tracking-tight">{formatNumber(stats.summary.totalPeriod)}</p>
                <span className="text-xs text-muted-foreground">
                  {formatNumber(stats.summary.totalToday)} hoy · {formatNumber(stats.summary.totalWeek)} esta semana
                </span>
              </div>
              <div className="rounded-xl bg-primary/8 p-2.5 text-primary">
                <Eye className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unique Visitors */}
        <Card className="relative overflow-hidden border-border/40 gsp-card-hover">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Visitantes Unicos</p>
                <p className="text-2xl font-bold tracking-tight">{formatNumber(stats.summary.uniqueVisitors)}</p>
                <span className="text-xs text-muted-foreground">sesiones en el periodo</span>
              </div>
              <div className="rounded-xl bg-primary/8 p-2.5 text-primary">
                <Users className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bounce Rate */}
        <Card className="relative overflow-hidden border-border/40 gsp-card-hover">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tasa de Rebote</p>
                <p className="text-2xl font-bold tracking-tight">{stats.summary.bounceRate}%</p>
                <span className="text-xs text-muted-foreground">
                  {stats.summary.avgPagesPerSession} pag/sesion promedio
                </span>
              </div>
              <div className="rounded-xl bg-primary/8 p-2.5 text-primary">
                <TrendingUp className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Visits Over Time (Bar Chart) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-4 text-primary" />
              Visitas en el Tiempo
            </CardTitle>
            <CardDescription>Vistas de pagina diarias</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.visitsOverTime.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin datos en este periodo</p>
            ) : (
              <div className="flex items-end gap-1.5 h-48">
                {stats.visitsOverTime.map((d) => {
                  const height = Math.max((d.visits / maxVisit) * 100, 2)
                  return (
                    <div key={d.date} className="flex flex-1 flex-col items-center gap-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-8 hidden group-hover:block z-10 rounded bg-popover px-2 py-1 text-xs shadow-md border">
                        {formatNumber(d.visits)} visitas
                      </div>
                      <div
                        className="w-full min-w-[4px] rounded-t-sm gsp-gradient transition-all cursor-pointer hover:opacity-80"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground hidden sm:block">
                        {getDayLabel(d.date).replace(' ', '\n')}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Monitor className="size-4 text-primary" />
              Dispositivos
            </CardTitle>
            <CardDescription>Distribucion por tipo de dispositivo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {/* Desktop */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Monitor className="size-4 text-primary" />
                    <span className="font-medium">Desktop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{formatNumber(stats.deviceBreakdown.desktop)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round((stats.deviceBreakdown.desktop / totalDevices) * 100)}%
                    </Badge>
                  </div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full gsp-gradient transition-all"
                    style={{ width: `${(stats.deviceBreakdown.desktop / totalDevices) * 100}%` }}
                  />
                </div>
              </div>
              {/* Mobile */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Smartphone className="size-4 text-emerald-500" />
                    <span className="font-medium">Movil</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{formatNumber(stats.deviceBreakdown.mobile)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round((stats.deviceBreakdown.mobile / totalDevices) * 100)}%
                    </Badge>
                  </div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{ width: `${(stats.deviceBreakdown.mobile / totalDevices) * 100}%` }}
                  />
                </div>
              </div>
              {/* Tablet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Tablet className="size-4 text-amber-500" />
                    <span className="font-medium">Tablet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{formatNumber(stats.deviceBreakdown.tablet)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round((stats.deviceBreakdown.tablet / totalDevices) * 100)}%
                    </Badge>
                  </div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${(stats.deviceBreakdown.tablet / totalDevices) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Active pages right now */}
            <Separator className="my-5" />
            <div>
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                Paginas activas ahora
              </p>
              {Object.keys(activePages).length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin actividad</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(activePages)
                    .sort((a, b) => b[1] - a[1])
                    .map(([page, count]) => (
                      <Badge key={page} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400">
                        {getPageLabel(page)} ({count})
                      </Badge>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Pages */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MousePointerClick className="size-4 text-primary" />
              Paginas Mas Visitadas
            </CardTitle>
            <CardDescription>Top 10 paginas por visitas</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topPages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {stats.topPages.map((p, i) => (
                  <div key={p.page} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span className="font-medium">{getPageLabel(p.page)}</span>
                      </div>
                      <span className="text-muted-foreground">{formatNumber(p.count)} visitas</span>
                    </div>
                    <div className="ml-7 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full gsp-gradient transition-all"
                        style={{ width: `${Math.max((p.count / maxPageCount) * 100, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referrer Sources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ExternalLink className="size-4 text-primary" />
              Fuentes de Trafico
            </CardTitle>
            <CardDescription>De donde llegan los visitantes</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {stats.referrerBreakdown.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Sin datos</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fuente</TableHead>
                      <TableHead className="text-right">Visitas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.referrerBreakdown.map((r) => (
                      <TableRow key={r.referrer}>
                        <TableCell className="font-medium text-sm max-w-[200px] truncate">
                          {r.referrer === 'Directo' ? (
                            <span className="flex items-center gap-1.5">
                              <Globe className="size-3.5 text-muted-foreground" />
                              Directo
                            </span>
                          ) : (
                            <span className="truncate">{r.referrer}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {formatNumber(r.count)}
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

      {/* Country Breakdown */}
      {stats.countryBreakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="size-4 text-primary" />
              Distribucion por Pais
            </CardTitle>
            <CardDescription>Origen geografico de los visitantes</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pais</TableHead>
                    <TableHead className="text-right">Visitas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.countryBreakdown.map((c) => (
                    <TableRow key={c.country}>
                      <TableCell className="font-medium text-sm">{c.country}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{formatNumber(c.count)}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Summary */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Clock className="size-3" />
        <span>Datos actualizados cada 15 segundos · Los datos se muestran en tiempo real</span>
      </div>
    </div>
  )
}
