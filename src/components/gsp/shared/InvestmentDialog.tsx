'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Building2, TrendingUp, Percent, ChevronDown, ChevronUp,
  Loader2, CheckCircle2, PartyPopper,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'

// ─── Types ──────────────────────────────────────────────────────────────────

interface InvestmentDialogAsset {
  id: string
  name: string
  type: string
  city: string
  region: string
  pricePerFraction: number
  totalFractions: number
  availableFractions: number
  annualYield: number
  totalProjectedReturn: number
  fundedPercentage: number
  images: { id: string; url: string; alt?: string; isCover: boolean }[]
}

interface InvestmentDialogUser {
  id: string
  name: string | null
  email: string
}

type DialogStep = 'review' | 'success'

interface InvestmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: InvestmentDialogAsset | null
  user: InvestmentDialogUser | null
}

// ─── Formatters ─────────────────────────────────────────────────────────────

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
function formatUSD(value: number): string {
  return usdFormatter.format(value)
}

// ─── Component ──────────────────────────────────────────────────────────────

export function InvestmentDialog({
  open,
  onOpenChange,
  asset,
  user,
}: InvestmentDialogProps) {
  const [step, setStep] = useState<DialogStep>('review')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useAppStore((s) => s.navigate)
  const coverImage = asset?.images.find((img) => img.isCover)?.url || asset?.images[0]?.url

  // Detect payment success from Stripe Checkout redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('payment') === 'success') {
        setStep('success')
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

  // Reset state when dialog opens/closes
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        // Reset on close
        setStep('review')
        setQuantity(1)
        setLoading(false)
        setError(null)
      }
      onOpenChange(nextOpen)
    },
    [onOpenChange],
  )

  // ── Derived calculations ──────────────────────────────────────────────────
  const maxFractions = asset ? Math.min(asset.availableFractions, 100) : 1
  const totalAmount = asset ? quantity * asset.pricePerFraction : 0
  const annualDividend = asset ? quantity * (asset.annualYield / 100) * asset.pricePerFraction : 0
  const monthlyDividend = annualDividend / 12

  // ── Proceed to payment ────────────────────────────────────────────────────
  async function handleProceedToPayment() {
    if (!asset || !user) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: asset.id,
          fractionCount: quantity,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al crear el pago. Intenta de nuevo.')
        setLoading(false)
        return
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
        return
      }

      setError('No se recibió la URL de pago. Intenta de nuevo.')
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // ── Guard: no asset or user ───────────────────────────────────────────────
  if (!asset || !user) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'sm:max-w-md',
          step === 'success' && 'sm:max-w-sm',
        )}
      >
        {/* ── REVIEW STEP ──────────────────────────────────────────────── */}
        {step === 'review' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">Confirmar Inversión</DialogTitle>
              <DialogDescription>
                Revisa los detalles de tu inversión antes de proceder al pago.
              </DialogDescription>
            </DialogHeader>

            {/* Asset preview */}
            {coverImage ? (
              <div className="relative aspect-[16/8] w-full overflow-hidden rounded-xl">
                <img
                  src={coverImage}
                  alt={asset.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="flex aspect-[16/8] w-full items-center justify-center rounded-xl bg-muted">
                <Building2 className="h-10 w-10 text-muted-foreground/30" />
              </div>
            )}

            <div className="space-y-1">
              <h3 className="font-semibold text-base">{asset.name}</h3>
              <p className="text-sm text-muted-foreground font-light">
                {asset.city}, {asset.region}
              </p>
            </div>

            {/* Fraction selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fracciones</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 hover:bg-accent disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-2xl font-bold text-primary">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxFractions, q + 1))}
                    disabled={quantity >= maxFractions}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 hover:bg-accent disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Slider
                value={[quantity]}
                onValueChange={(val) => setQuantity(val[0])}
                min={1}
                max={maxFractions}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-light">
                <span>1 fracción ({formatUSD(asset.pricePerFraction)})</span>
                <span>{maxFractions} fracciones ({formatUSD(maxFractions * asset.pricePerFraction)})</span>
              </div>
            </div>

            {/* Investment summary */}
            <Card className="border-primary/20 dark:border-primary/15">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-light">Precio por fracción</span>
                  <span className="font-medium">{formatUSD(asset.pricePerFraction)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-light">Cantidad</span>
                  <span className="font-medium">{quantity} fracciones</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total a invertir</span>
                  <span className="text-xl font-bold text-primary">{formatUSD(totalAmount)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground font-light">
                    <Percent className="h-3.5 w-3.5" />
                    Yield anual ({asset.annualYield}%)
                  </span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {formatUSD(annualDividend)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground font-light">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Dividendo mensual est.
                  </span>
                  <span className="font-medium text-primary">
                    {formatUSD(monthlyDividend)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Investor info */}
            <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm">
              <span className="text-muted-foreground font-light">Inversor: </span>
              <span className="font-medium">{user.name || user.email}</span>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 cursor-pointer border-border/50"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 h-11 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 cursor-pointer"
                onClick={handleProceedToPayment}
                disabled={loading || totalAmount <= 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando pago…
                  </>
                ) : (
                  `Pagar ${formatUSD(totalAmount)}`
                )}
              </Button>
            </div>
          </>
        )}

        {/* ── SUCCESS STEP ─────────────────────────────────────────────── */}
        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg text-center">Inversión Confirmada</DialogTitle>
              <DialogDescription className="text-center" />
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                  <PartyPopper className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold">Felicidades, {user.name?.split(' ')[0] || 'Inversor'}!</h3>
                <p className="text-sm text-muted-foreground font-light">
                  Tu inversión en <span className="font-medium text-foreground">{asset.name}</span> ha sido procesada exitosamente.
                </p>
              </div>

              <Card className="w-full border-primary/20 dark:border-primary/15">
                <CardContent className="space-y-2 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-light">Fracciones</span>
                    <span className="font-medium">{quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-light">Monto invertido</span>
                    <span className="font-bold text-primary">{formatUSD(totalAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-light">Dividendo mensual est.</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      +{formatUSD(monthlyDividend)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <p className="text-xs text-muted-foreground font-light max-w-xs">
                Recibirás un correo de confirmación con los detalles de tu inversión y los dividendos estimados.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 cursor-pointer border-border/50"
                onClick={() => handleOpenChange(false)}
              >
                Cerrar
              </Button>
              <Button
                className="flex-1 font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                onClick={() => { handleOpenChange(false); navigate('dashboard') }}
              >
                Ver Mi Portafolio
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
