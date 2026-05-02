'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Gift,
  Copy,
  Check,
  Users,
  DollarSign,
  Clock,
  Share2,
  RefreshCw,
  ChevronRight,
  Trophy,
  ArrowRight,
  Link2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { useT } from '@/lib/i18n-utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReferralCodeData {
  code: string
  usesCount: number
  isActive: boolean
  createdAt: string
}

interface ReferralStats {
  totalReferrals: number
  completedReferrals: number
  pendingBonuses: number
  paidBonuses: number
  totalEarned: number
}

interface ReferralEntry {
  id: string
  referredName: string
  referredEmail: string
  bonusAmount: number
  bonusCurrency: string
  status: string
  referredAt: string
  createdAt: string
}

interface ReferralStatsResponse {
  referralCode: ReferralCodeData | null
  stats: ReferralStats
  referrals: ReferralEntry[]
  wasReferred: { referrerName: string; codeUsed: string | null } | null
}

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

function statusBadge(status: string) {
  const configs: Record<string, { label: string; className: string }> = {
    completed: {
      label: 'Completado',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40',
    },
    pending: {
      label: 'Pendiente',
      className: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/40',
    },
    paid: {
      label: 'Pagado',
      className: 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800/40',
    },
  }
  const c = configs[status] || configs.pending
  return <Badge className={cn('border text-xs', c.className)}>{c.label}</Badge>
}

import { cn } from '@/lib/utils'

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReferralPage() {
  const t = useT()
  const [stats, setStats] = useState<ReferralStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [applyCode, setApplyCode] = useState('')
  const [applyDialogOpen, setApplyDialogOpen] = useState(false)
  const [applyMessage, setApplyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [applying, setApplying] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/referral/stats')
      if (!res.ok) return
      const data = await res.json()
      setStats(data)
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleCopyCode = async () => {
    if (!stats?.referralCode?.code) return
    try {
      await navigator.clipboard.writeText(stats.referralCode.code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleCopyLink = async () => {
    if (!stats?.referralCode?.code) return
    const link = `${window.location.origin}?ref=${stats.referralCode.code}`
    try {
      await navigator.clipboard.writeText(link)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleShare = async () => {
    if (!stats?.referralCode?.code) return
    const shareData = {
      title: 'Invita a un amigo a invertir en 3GSP',
      text: `Únete a 3GSP y obtén $10 de bono con mi código de invitación: ${stats.referralCode.code}`,
      url: `${window.location.origin}?ref=${stats.referralCode.code}`,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleGenerateNewCode = async () => {
    try {
      setGenerating(true)
      const res = await fetch('/api/referral/code', { method: 'POST' })
      if (!res.ok) return
      await fetchStats()
    } catch {
      // Silently fail
    } finally {
      setGenerating(false)
    }
  }

  const handleApplyCode = async () => {
    if (!applyCode.trim()) return
    try {
      setApplying(true)
      setApplyMessage(null)
      const res = await fetch('/api/referral/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: applyCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setApplyMessage({ type: 'error', text: data.error || 'Failed to apply code' })
      } else {
        setApplyMessage({ type: 'success', text: data.message || 'Referral code applied!' })
        setApplyCode('')
        setApplyDialogOpen(false)
        fetchStats()
      }
    } catch {
      setApplyMessage({ type: 'error', text: 'Network error' })
    } finally {
      setApplying(false)
    }
  }

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-80 mb-8" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl mb-8" />
          <Skeleton className="h-80 rounded-xl" />
        </main>
      </div>
    )
  }

  const hasCode = !!stats?.referralCode
  const code = stats?.referralCode?.code || '--------'
  const s = stats?.stats || { totalReferrals: 0, completedReferrals: 0, pendingBonuses: 0, paidBonuses: 0, totalEarned: 0 }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="gsp-serif text-2xl font-normal tracking-tight sm:text-3xl">
                Programa de Referidos
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-light">
                Invita amigos y gana bonificaciones por cada referido exitoso
              </p>
            </div>
            {!stats?.wasReferred && (
              <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-fit gap-2 border-border/50 cursor-pointer">
                    <Link2 className="h-4 w-4" />
                    Aplicar Código
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Aplicar Código de Referido</DialogTitle>
                    <DialogDescription>
                      Ingresa el código de un amigo para obtener tu bono de bienvenida
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    {applyMessage && (
                      <div className={cn(
                        'flex items-center gap-2 rounded-lg p-3 text-sm',
                        applyMessage.type === 'error'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                      )}>
                        {applyMessage.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                        {applyMessage.text}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ej: ABCD1234"
                        value={applyCode}
                        onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                        maxLength={10}
                        className="font-mono tracking-wider"
                      />
                      <Button
                        onClick={handleApplyCode}
                        disabled={applying || !applyCode.trim()}
                        className="shrink-0 cursor-pointer"
                      >
                        {applying ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Aplicar'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* ── Was Referred Banner ── */}
        {stats?.wasReferred && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Referido por {stats.wasReferred.referrerName}</p>
                <p className="text-xs text-muted-foreground">
                  Te uniste con el código {stats.wasReferred.codeUsed || 'de invitación'} — ¡Tu bono de $10 ha sido acreditado!
                </p>
              </div>
              <Badge className="shrink-0 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                Activo
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          <Card className="relative overflow-hidden border-border/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-sm font-medium text-muted-foreground">
                Total Referidos
              </CardDescription>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Users className="h-[18px] w-[18px]" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-2xl font-bold tracking-tight">{s.totalReferrals}</p>
            </CardContent>
            <div className="px-6 pb-4">
              <p className="text-xs text-muted-foreground font-light">
                {s.completedReferrals} completados exitosamente
              </p>
            </div>
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-emerald-500/4" />
          </Card>

          <Card className="relative overflow-hidden border-border/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-sm font-medium text-muted-foreground">
                Bonos Pendientes
              </CardDescription>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <Clock className="h-[18px] w-[18px]" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                {formatUSD(s.pendingBonuses)}
              </p>
            </CardContent>
            <div className="px-6 pb-4">
              <p className="text-xs text-muted-foreground font-light">En espera de verificación</p>
            </div>
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-amber-500/4" />
          </Card>

          <Card className="relative overflow-hidden border-border/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-sm font-medium text-muted-foreground">
                Total Ganado
              </CardDescription>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
                <Trophy className="h-[18px] w-[18px]" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-2xl font-bold tracking-tight text-primary">{formatUSD(s.totalEarned)}</p>
            </CardContent>
            <div className="px-6 pb-4">
              <p className="text-xs text-muted-foreground font-light">{formatUSD(s.paidBonuses)} pagados</p>
            </div>
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/4" />
          </Card>
        </div>

        {/* ── Your Referral Code ── */}
        <Card className="mb-8 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gift className="h-5 w-5 text-primary" />
              Tu Código de Referido
            </CardTitle>
            <CardDescription className="font-light">
              Comparte este código con amigos para que ambos obtengan bonificaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Code Display */}
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-lg bg-muted px-4 py-3 font-mono text-xl tracking-[0.3em] text-center font-bold text-foreground">
                  {code}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-11 w-11 cursor-pointer"
                  onClick={handleCopyCode}
                >
                  {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border/50 cursor-pointer"
                  onClick={handleCopyLink}
                >
                  {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
                  {copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border/50 cursor-pointer"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  Compartir
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground cursor-pointer"
                  onClick={handleGenerateNewCode}
                  disabled={generating}
                >
                  {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Generar nuevo código
                </Button>
              </div>

              <Separator />

              {/* Bonus Explanation */}
              <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  ¿Cómo funciona el programa?
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                      <Gift className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tú ganas $25 USD</p>
                      <p className="text-xs text-muted-foreground font-light">Por cada amigo que se registre e invierta con tu código</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                      <Gift className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tu amigo gana $10 USD</p>
                      <p className="text-xs text-muted-foreground font-light">Bono de bienvenida al registrarse con tu código</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground font-light">
                    El bono se acredita automáticamente cuando el referido completa su primera inversión.
                    No hay límite en la cantidad de referidos.
                  </p>
                </div>
              </div>

              {hasCode && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Tu código ha sido utilizado <span className="font-semibold text-foreground">{stats!.referralCode!.usesCount}</span> vez{stats!.referralCode!.usesCount !== 1 ? 'es' : ''}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Referral History ── */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Historial de Referidos
            </CardTitle>
            <CardDescription className="font-light">
              {s.totalReferrals > 0
                ? `${s.totalReferrals} referido${s.totalReferrals !== 1 ? 's' : ''} registrado${s.totalReferrals !== 1 ? 's' : ''}`
                : 'Aún no tienes referidos'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(stats?.referrals ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Users className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">Aún no tienes referidos</p>
                <p className="mt-1 text-xs text-muted-foreground font-light">
                  Comparte tu código para comenzar a ganar bonificaciones
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30">
                      <TableHead>Referido</TableHead>
                      <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                      <TableHead className="text-right">Bono</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(stats?.referrals ?? []).map((ref) => (
                      <TableRow key={ref.id} className="border-border/20">
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{ref.referredName}</p>
                            <p className="text-xs text-muted-foreground">{ref.referredEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(ref.referredAt)}
                        </TableCell>
                        <TableCell className="text-sm text-right font-medium text-primary whitespace-nowrap">
                          {formatUSD(ref.bonusAmount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {statusBadge(ref.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
