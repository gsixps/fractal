'use client'

import { useState, useEffect } from 'react'
import {
  User,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Edit3,
  Check,
  TrendingUp,
  DollarSign,
  PieChart,
  ChevronRight,
  Phone,
  Loader2,
  ArrowRight,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useT } from '@/lib/i18n-utils'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { WalletConnectCard } from '@/components/gsp/shared/WalletConnectCard'

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

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ─── KYC Status Badge ─────────────────────────────────────────────────────────

function KYCBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    verified: {
      label: 'Verificado',
      icon: ShieldCheck,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40',
    },
    submitted: {
      label: 'En revisión',
      icon: Clock,
      className: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/40',
    },
    rejected: {
      label: 'Rechazado',
      icon: ShieldAlert,
      className: 'bg-red-50 text-red-600 border-red-200/60 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/40',
    },
    pending: {
      label: 'No verificado',
      icon: Clock,
      className: 'bg-secondary text-muted-foreground border-border/50 dark:bg-secondary dark:text-muted-foreground dark:border-border/30',
    },
  }
  const c = config[status] || config.pending
  const Icon = c.icon
  return (
    <Badge className={cn('border gap-1.5 text-xs', c.className)}>
      <Icon className="size-3" />
      {c.label}
    </Badge>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const t = useT()
  const user = useAppStore((s) => s.user)
  const setUser = useAppStore((s) => s.setUser)
  const navigate = useAppStore((s) => s.navigate)
  const dashboardData = useAppStore((s) => s.dashboardData)
  const fetchDashboard = useAppStore((s) => s.fetchDashboard)
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setEditName(user.name || '')
      setEditPhone((user?.phone as string) || '')
    }
  }, [user])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          phone: editPhone || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al actualizar perfil')
      }
      // Update local user state
      if (user) {
        setUser({ ...user, name: editName })
      }
      toast({
        title: t('common.success'),
        description: 'Tu perfil ha sido actualizado correctamente.',
      })
      setIsEditing(false)
    } catch (err) {
      toast({
        title: t('common.error'),
        description: err instanceof Error ? err.message : 'No se pudo actualizar el perfil.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditName(user?.name || '')
    setEditPhone((user?.phone as string) || '')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-16">
            <User className="mb-4 size-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Inicia sesión para ver tu perfil</p>
            <Button
              className="mt-4 gsp-gradient text-white hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
              onClick={() => navigate('login')}
            >
              {t('nav.login')}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const dashboardUser = dashboardData.user
  const investments = dashboardData.investments

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="gsp-serif text-2xl font-normal tracking-tight sm:text-3xl">
            {t('nav.profile')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-light">
            Gestiona tu información personal y preferencias.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="border-border/40 mb-6">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 ring-2 ring-primary/10">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                    {user.name ? getInitials(user.name) : 'US'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">{user.name}</h2>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                    <Mail className="size-3.5" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <KYCBadge status={user.kycStatus} />
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium border-primary/15 text-primary bg-primary/5"
                    >
                      {user.role === 'admin' || user.role === 'superadmin' ? t('nav.admin') : 'Inversor'}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border/50 cursor-pointer shrink-0"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <Check className="size-3.5" />
                    {t('common.save')}
                  </>
                ) : (
                  <>
                    <Edit3 className="size-3.5" />
                    {t('common.edit')}
                  </>
                )}
              </Button>
            </div>

            {/* Edit Form */}
            {isEditing && (
              <>
                <Separator className="my-5" />
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="profile-name">{t('kyc.firstName')}</Label>
                      <Input
                        id="profile-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-phone">{t('settings.phone')}</Label>
                      <Input
                        id="profile-phone"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+56 9 1234 5678"
                        type="tel"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      className="gap-2 gsp-gradient text-white hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Check className="size-3.5" />
                      )}
                      {t('common.save')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border/50 cursor-pointer"
                      onClick={handleCancelEdit}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Investment Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          <Card className="border-border/40 gsp-card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
                  <TrendingUp className="size-[18px]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-light">{t('dashboard.totalInvested')}</p>
                  <p className="text-lg font-bold">{formatUSD(dashboardUser?.totalInvested || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 gsp-card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <DollarSign className="size-[18px]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-light">{t('dashboard.totalEarnings')}</p>
                  <p className="text-lg font-bold text-primary">{formatUSD(dashboardUser?.totalEarnings || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 gsp-card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                  <PieChart className="size-[18px]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-light">{t('dashboard.myInvestments')}</p>
                  <p className="text-lg font-bold">{investments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallet / Billetera Digital */}
        <WalletConnectCard />

        {/* Quick Actions */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              onClick={() => navigate('kyc')}
              className="flex w-full items-center justify-between rounded-xl p-3 transition-colors duration-200 hover:bg-muted/50 cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t('nav.kyc')}</p>
                  <p className="text-xs text-muted-foreground font-light">
                    {user.kycStatus === 'verified'
                      ? 'Tu cuenta está verificada'
                      : 'Completa tu verificación de identidad'}
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => navigate('dashboard')}
              className="flex w-full items-center justify-between rounded-xl p-3 transition-colors duration-200 hover:bg-muted/50 cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <ArrowRight className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t('nav.portfolio')}</p>
                  <p className="text-xs text-muted-foreground font-light">
                    Ver tu portafolio de inversiones
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => navigate('liquidity')}
              className="flex w-full items-center justify-between rounded-xl p-3 transition-colors duration-200 hover:bg-muted/50 cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                  <DollarSign className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t('nav.liquidity')}</p>
                  <p className="text-xs text-muted-foreground font-light">
                    Salida express — retira en 48 hrs
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
