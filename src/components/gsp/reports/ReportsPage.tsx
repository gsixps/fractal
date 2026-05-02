'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  TrendingUp,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileBarChart,
  Building2,
  CalendarDays,
  BarChart3,
  PieChart,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useT } from '@/lib/i18n-utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Types ──────────────────────────────────────────────────────────────────

interface TopAsset {
  name: string
  type: string
  invested: number
  yield: number
}

interface MonthlyReport {
  period: string
  periodDays: string
  startDate: string
  endDate: string
  totalInvested: number
  totalDividends: number
  totalWithdrawn: number
  netReturn: number
  activeInvestments: number
  topAssets: TopAsset[]
  allTimeInvested: number
  allTimeDividends: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const usdFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function fmtUSD(v: number): string {
  return usdFmt.format(v)
}

function fmtPercent(v: number): string {
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toFixed(1)}%`
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const t = useT()
  const [report, setReport] = useState<MonthlyReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  const fetchReport = useCallback(async (p: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports/monthly?period=${p}`)
      if (res.ok) {
        const data = await res.json()
        setReport(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReport(period)
  }, [period, fetchReport])

  // CSV Export
  const handleDownloadCSV = useCallback(() => {
    if (!report) return
    const rows = [
      ['3GSP Financial Report', report.period, '', ''],
      ['Start Date', report.startDate, 'End Date', report.endDate],
      ['', '', '', ''],
      ['Metric', 'Value', '', ''],
      ['Total Invested', report.totalInvested.toFixed(2), '', ''],
      ['Total Dividends', report.totalDividends.toFixed(2), '', ''],
      ['Total Withdrawn', report.totalWithdrawn.toFixed(2), '', ''],
      ['Net Return', report.netReturn.toFixed(2), '', ''],
      ['Active Investments', String(report.activeInvestments), '', ''],
      ['All-Time Invested', report.allTimeInvested.toFixed(2), '', ''],
      ['All-Time Dividends', report.allTimeDividends.toFixed(2), '', ''],
      ['', '', '', ''],
      ['Top Assets', 'Invested (USD)', 'Annual Yield (%)', ''],
      ...report.topAssets.map((a) => [
        a.name,
        a.invested.toFixed(2),
        a.yield.toFixed(1),
      ]),
    ]

    const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `3gsp-report-${report.periodDays}-days.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [report])

  // Bar chart max for scaling
  const maxInvested = report?.topAssets?.[0]?.invested || 1

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-xl mb-8" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="gsp-serif text-2xl font-normal tracking-tight sm:text-3xl">
              Financial Reports
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-light">
              Track your investment performance and financial overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[170px] border-border/50">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border/50 cursor-pointer"
              onClick={handleDownloadCSV}
              disabled={!report}
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
          <ReportCard
            title="Total Invested"
            value={fmtUSD(report?.totalInvested || 0)}
            icon={Wallet}
            description={`All-time: ${fmtUSD(report?.allTimeInvested || 0)}`}
          />
          <ReportCard
            title="Dividends Received"
            value={fmtUSD(report?.totalDividends || 0)}
            icon={DollarSign}
            valueColorClass="text-primary"
            description={`All-time: ${fmtUSD(report?.allTimeDividends || 0)}`}
          />
          <ReportCard
            title="Net Return"
            value={fmtUSD(report?.netReturn || 0)}
            icon={report && report.netReturn >= 0 ? TrendingUp : ArrowDownRight}
            valueColorClass={report && report.netReturn >= 0 ? 'text-primary' : 'text-red-600 dark:text-red-400'}
            description={report && report.netReturn >= 0 ? 'Positive returns' : 'Negative returns'}
          />
          <ReportCard
            title="Active Investments"
            value={String(report?.activeInvestments || 0)}
            icon={BarChart3}
            description={report ? `${report.period} period` : ''}
          />
        </div>

        {/* Performance Breakdown */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-8">
          {/* Top Assets Chart */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChart className="h-5 w-5 text-primary" />
                Top Assets by Investment
              </CardTitle>
              <CardDescription className="font-light">
                Your highest allocation assets in this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!report?.topAssets?.length ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No investments in this period</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {report.topAssets.map((asset, idx) => {
                    const pct = maxInvested > 0 ? (asset.invested / maxInvested) * 100 : 0
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-medium text-muted-foreground w-5 text-right">
                              #{idx + 1}
                            </span>
                            <span className="text-sm font-medium truncate">{asset.name}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <Badge variant="secondary" className="text-xs font-light">
                              {asset.yield}% yield
                            </Badge>
                            <span className="text-sm font-semibold whitespace-nowrap">
                              {fmtUSD(asset.invested)}
                            </span>
                          </div>
                        </div>
                        {/* Bar */}
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Breakdown */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileBarChart className="h-5 w-5 text-primary" />
                Period Summary
              </CardTitle>
              <CardDescription className="font-light">
                {report?.period || '—'} financial overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Visual breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <BreakdownItem
                    label="Invested"
                    value={report?.totalInvested || 0}
                    total={report?.totalInvested || 1}
                    color="bg-emerald-500"
                    icon={<ArrowUpRight className="h-4 w-4" />}
                  />
                  <BreakdownItem
                    label="Dividends"
                    value={report?.totalDividends || 0}
                    total={report?.totalInvested || 1}
                    color="bg-amber-500"
                    icon={<DollarSign className="h-4 w-4" />}
                  />
                  <BreakdownItem
                    label="Withdrawn"
                    value={report?.totalWithdrawn || 0}
                    total={report?.totalInvested || 1}
                    color="bg-sky-500"
                    icon={<ArrowDownRight className="h-4 w-4" />}
                  />
                  <BreakdownItem
                    label="Net Return"
                    value={Math.abs(report?.netReturn || 0)}
                    total={report?.totalInvested || 1}
                    color={report && report.netReturn >= 0 ? 'bg-primary' : 'bg-red-500'}
                    icon={report && report.netReturn >= 0 ? <TrendingUp className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  />
                </div>

                {/* Key insight */}
                {report && (
                  <div className="mt-4 rounded-xl bg-muted/50 p-4 border border-border/30">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Key Insight
                    </p>
                    <p className="text-sm font-light text-foreground/80">
                      {report.totalInvested > 0
                        ? `Your dividend yield this period is ${((report.totalDividends / report.totalInvested) * 100).toFixed(1)}% on ${fmtUSD(report.totalInvested)} invested across ${report.activeInvestments} active investment${report.activeInvestments !== 1 ? 's' : ''}.`
                        : 'Start investing to see your financial performance insights here.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All-Time Comparison */}
        {report && (
          <Card className="border-0 gsp-gradient-hero text-white overflow-hidden relative mb-8">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5" />
            <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-white/5" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg">All-Time Portfolio</CardTitle>
                  <CardDescription className="text-white/70 font-light">
                    Your complete investment history at a glance
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs text-white/70 font-light">All-Time Invested</p>
                  <p className="text-xl font-bold mt-1">{fmtUSD(report.allTimeInvested)}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs text-white/70 font-light">All-Time Dividends</p>
                  <p className="text-xl font-bold mt-1">{fmtUSD(report.allTimeDividends)}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs text-white/70 font-light">Overall Return</p>
                  <p className="text-xl font-bold mt-1">
                    {fmtPercent(
                      report.allTimeInvested > 0
                        ? ((report.allTimeDividends - report.allTimeInvested) / report.allTimeInvested) * 100
                        : 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ReportCard({
  title,
  value,
  icon: Icon,
  valueColorClass,
  description,
}: {
  title: string
  value: string
  icon: React.ElementType
  valueColorClass?: string
  description: string
}) {
  return (
    <Card className="relative overflow-hidden border-border/40 gsp-card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-sm font-medium text-muted-foreground">
          {title}
        </CardDescription>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
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
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/4" />
    </Card>
  )
}

function BreakdownItem({
  label,
  value,
  total,
  color,
  icon,
}: {
  label: string
  value: number
  total: number
  color: string
  icon: React.ReactNode
}) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0
  return (
    <div className="rounded-lg border border-border/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <span className="text-sm font-semibold">{fmtUSD(value)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
