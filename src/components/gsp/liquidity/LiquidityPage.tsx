'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Droplets,
  Zap,
  Clock,
  TrendingUp,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  Info,
  DollarSign,
  Building2,
  Check,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useT } from '@/lib/i18n-utils'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function formatUSD(value: number): string {
  return usdFormatter.format(value)
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface LiquidityPoolData {
  totalReserve: number
  totalAssets: number
  activeRequests: number
  utilizationRate: number
  monthlyContribution?: number
  autoReplenish: boolean
}

interface WithdrawalHistoryItem {
  id: string
  investmentId: string
  assetName: string
  amount: number
  fee: number
  netAmount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LiquidityPage() {
  const t = useT()
  const navigate = useAppStore((s) => s.navigate)
  const fetchDashboard = useAppStore((s) => s.fetchDashboard)
  const dashboardData = useAppStore((s) => s.dashboardData)
  const investments = useAppStore((s) => s.dashboardData.investments)
  const { toast } = useToast()

  const [selectedInvestment, setSelectedInvestment] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingPool, setLoadingPool] = useState(false)
  const [poolData, setPoolData] = useState<LiquidityPoolData | null>(null)

  // Fetch liquidity pool data
  useEffect(() => {
    const fetchPool = async () => {
      setLoadingPool(true)
      try {
        const res = await fetch('/api/liquidity')
        if (res.ok) {
          const data = await res.json()
          setPoolData(data)
        }
      } catch {
        // fallback to dashboard data
      } finally {
        setLoadingPool(false)
      }
    }
    fetchPool()
  }, [])

  // Fetch dashboard for pool data as fallback
  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  // Merge pool data: API first, fallback to dashboard
  const liquidityPool = useMemo(() => {
    if (poolData) return poolData
    return dashboardData.liquidityPool
  }, [poolData, dashboardData.liquidityPool])

  // Fetch withdrawal history
  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true)
      try {
        const res = await fetch('/api/liquidity/history')
        if (res.ok) {
          const data = await res.json()
          setWithdrawalHistory(Array.isArray(data) ? data : [])
        }
      } catch {
        // empty history
      } finally {
        setLoadingHistory(false)
      }
    }
    fetchHistory()
  }, [])

  // Available investments for withdrawal
  const availableInvestments = investments.filter(
    (inv) => inv.status === 'active'
  )

  const selectedInv = availableInvestments.find(
    (inv) => inv.id === selectedInvestment
  )

  // Max withdrawal amount (based on selected investment)
  const maxAmount = selectedInv ? selectedInv.totalAmount : 0

  // Fee calculation (0.5%)
  const feeRate = 0.005
  const amountNum = parseFloat(withdrawAmount) || 0
  const feeAmount = amountNum * feeRate
  const netAmount = amountNum - feeAmount

  const handleMaxAmount = () => {
    setWithdrawAmount(String(maxAmount))
  }

  const handleConfirm = async () => {
    if (!selectedInvestment || !amountNum || amountNum <= 0) return
    if (amountNum > maxAmount) {
      toast({
        title: t('common.error'),
        description: 'El monto excede el máximo disponible.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/liquidity/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investmentId: selectedInvestment,
          amount: amountNum,
        }),
      })

      if (res.ok) {
        toast({
          title: t('common.success'),
          description: `Solicitud de retiro por ${formatUSD(amountNum)} enviada correctamente. Recibirás ${formatUSD(netAmount)} en 24-48 horas.`,
        })
        setWithdrawAmount('')
        setSelectedInvestment('')
        // Refresh history
        const histRes = await fetch('/api/liquidity/history')
        if (histRes.ok) {
          const data = await histRes.json()
          setWithdrawalHistory(Array.isArray(data) ? data : [])
        }
        fetchDashboard()
      } else {
        const data = await res.json()
        toast({
          title: t('common.error'),
          description: data.error || 'No se pudo procesar la solicitud.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: t('common.error'),
        description: 'Ocurrió un error inesperado.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="gsp-serif text-2xl font-normal tracking-tight sm:text-3xl">
            {t('liquidity.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-light">
            {t('liquidity.subtitle')}
          </p>
        </div>

        {/* Pool Overview */}
        <Card className="border-0 gsp-gradient-hero text-white overflow-hidden relative mb-6">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5" />
          <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-white/5" />
          <CardHeader className="relative">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <Droplets className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg">{t('liquidity.availablePool')}</CardTitle>
                  <CardDescription className="text-white/70 font-light">
                    Pool de liquidez inmediata
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            {loadingPool && !liquidityPool ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-white/60" />
              </div>
            ) : liquidityPool ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs text-white/70 font-light">{t('admin.liquidity.reserve')}</p>
                  <p className="text-xl font-bold mt-1">{formatUSD(liquidityPool.totalReserve)}</p>
                  <p className="text-xs text-white/50 mt-1">{liquidityPool.totalAssets} activos</p>
                </div>
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs text-white/70 font-light">{t('admin.liquidity.utilization')}</p>
                  <p className="text-xl font-bold mt-1">{liquidityPool.utilizationRate.toFixed(1)}%</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white/80 transition-all duration-700"
                      style={{ width: `${Math.min(liquidityPool.utilizationRate, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs text-white/70 font-light">{t('admin.liquidity.requests')}</p>
                  <p className="text-xl font-bold mt-1">{liquidityPool.activeRequests}</p>
                  <p className="text-xs text-white/50 mt-1">{t('liquidity.processingTimeValue')}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-white/60 text-sm">
                No hay datos del pool disponibles
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Withdrawal Request Form */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="size-5 text-primary" />
                {t('liquidity.requestWithdrawal')}
              </CardTitle>
              <CardDescription className="font-light">
                Selecciona una inversión y el monto que deseas retirar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {availableInvestments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Building2 className="mb-3 size-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No tienes inversiones activas</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-2 border-border/50 cursor-pointer"
                    onClick={() => navigate('marketplace')}
                  >
                    Explorar Activos
                    <TrendingUp className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <>
                  {/* Investment Selector */}
                  <div className="space-y-2">
                    <Label>{t('liquidity.selectInvestment')}</Label>
                    <Select value={selectedInvestment} onValueChange={(v) => { setSelectedInvestment(v); setWithdrawAmount('') }}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('liquidity.selectInvestment')} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableInvestments.map((inv) => (
                          <SelectItem key={inv.id} value={inv.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{inv.asset.name}</span>
                              <span className="text-muted-foreground text-xs">
                                — {formatUSD(inv.totalAmount)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount Input */}
                  {selectedInv && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>{t('liquidity.amount')}</Label>
                          <button
                            type="button"
                            onClick={handleMaxAmount}
                            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
                          >
                            {t('liquidity.maxAmount')}: {formatUSD(maxAmount)}
                          </button>
                        </div>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="0"
                            min="1"
                            max={maxAmount}
                            className="pl-10"
                          />
                        </div>
                        {amountNum > maxAmount && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            El monto no puede exceder {formatUSD(maxAmount)}
                          </p>
                        )}
                      </div>

                      {/* Fee Breakdown */}
                      {amountNum > 0 && amountNum <= maxAmount && (
                        <div className="rounded-xl bg-muted/50 p-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Monto solicitado</span>
                            <span className="font-medium">{formatUSD(amountNum)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              {t('liquidity.fee')}
                              <span className="text-xs">({t('liquidity.feeValue')})</span>
                            </span>
                            <span className="font-medium text-red-500">-{formatUSD(feeAmount)}</span>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{t('liquidity.estimatedReceive')}</span>
                            <span className="font-bold text-primary text-lg">{formatUSD(netAmount)}</span>
                          </div>
                        </div>
                      )}

                      {/* Processing Info */}
                      <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
                        <Info className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-light">
                          <strong>Tiempo de procesamiento:</strong> {t('liquidity.processingTimeValue')}.
                          La comisión de {t('liquidity.feeValue')} se deduce del monto solicitado.
                        </p>
                      </div>

                      <Button
                        className="w-full gap-2 gsp-gradient text-white hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
                        onClick={handleConfirm}
                        disabled={
                          !selectedInvestment ||
                          !amountNum ||
                          amountNum <= 0 ||
                          amountNum > maxAmount ||
                          isSubmitting
                        }
                      >
                        {isSubmitting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <>
                            <ArrowDownRight className="size-4" />
                            {t('liquidity.confirm')}
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Withdrawal History */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="size-5 text-primary" />
                {t('liquidity.history')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : withdrawalHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Clock className="mb-3 size-10 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground font-light">{t('liquidity.noHistory')}</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30">
                        <TableHead>Activo</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-right">Neto</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                        <TableHead className="text-right">Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawalHistory.map((w) => (
                        <TableRow key={w.id} className="border-border/20">
                          <TableCell className="text-sm font-medium max-w-[100px] truncate">
                            {w.assetName}
                          </TableCell>
                          <TableCell className="text-sm text-right">{formatUSD(w.amount)}</TableCell>
                          <TableCell className="text-sm text-right font-medium text-primary">
                            {formatUSD(w.netAmount)}
                          </TableCell>
                          <TableCell className="text-center">
                            <WithdrawalStatusBadge status={w.status} />
                          </TableCell>
                          <TableCell className="text-xs text-right text-muted-foreground whitespace-nowrap">
                            {formatDate(w.createdAt)}
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
      </main>
    </div>
  )
}

// ─── Withdrawal Status Badge ───────────────────────────────────────────────────

function WithdrawalStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    completed: {
      label: 'Completado',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40',
    },
    processing: {
      label: 'Procesando',
      className: 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800/40',
    },
    pending: {
      label: 'Pendiente',
      className: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/40',
    },
    failed: {
      label: 'Fallido',
      className: 'bg-red-50 text-red-600 border-red-200/60 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/40',
    },
  }
  const c = config[status] || config.pending
  return <Badge className={cn('border text-xs', c.className)}>{c.label}</Badge>
}
