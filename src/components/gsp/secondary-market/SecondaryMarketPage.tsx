'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useCurrency } from '@/lib/currency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Store,
  ShoppingBag,
  PlusCircle,
  Clock,
  TrendingUp,
  XCircle,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  ChevronDown,
  Search,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────

interface SecondaryListing {
  id: string
  sellerId: string
  investmentId: string
  assetId: string
  fractionCount: number
  pricePerFraction: number
  totalPrice: number
  status: string
  soldFractionCount: number
  platformFee: number
  netAmount: number | null
  expiresAt: string | null
  soldAt: string | null
  cancelledAt: string | null
  createdAt: string
  seller: { id: string; name: string | null; avatarUrl: string | null }
  asset: {
    id: string
    name: string
    type: string
    city: string
    pricePerFraction: number
    images: { id: string; url: string; alt: string | null; sortOrder: number; isCover: boolean }[]
  }
  buyer?: { id: string; name: string | null } | null
}

interface AvailableInvestment {
  id: string
  userId: string
  assetId: string
  quantity: number
  pricePerUnit: number
  totalAmount: number
  status: string
  completedAt: string | null
  createdAt: string
  updatedAt: string
  availableFractions: number
  alreadyListed: number
  asset: {
    id: string
    name: string
    type: string
    city: string
    pricePerFraction: number
    images: { id: string; url: string; alt: string | null; sortOrder: number; isCover: boolean }[]
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────

function getTimeRemaining(expiresAt: string | null): string {
  if (!expiresAt) return ''
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diffMs = expiry.getTime() - now.getTime()

  if (diffMs <= 0) return 'Expirada'

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days > 0) return `${days}d restantes`
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours > 0) return `${hours}h restantes`
  const minutes = Math.floor(diffMs / (1000 * 60))
  return `${minutes}m restantes`
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Activa</Badge>
    case 'sold':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Vendida</Badge>
    case 'cancelled':
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100">Cancelada</Badge>
    case 'partial':
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Parcial</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// ─── Component ────────────────────────────────────────────────────────

export default function SecondaryMarketPage() {
  const user = useAppStore((s) => s.user)
  const { format } = useCurrency()
  const [activeTab, setActiveTab] = useState('explore')

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden gsp-gradient-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-emerald-800/80 to-emerald-900/90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tMTItNmgydjJIMjR2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
              <Store className="size-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Mercado Secundario
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-emerald-100/90">
              Compra y vende fracciones de activos entre inversores. Liquidez inmediata para tus inversiones.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-white/80 backdrop-blur-sm shadow-sm border border-border/50 rounded-xl">
            <TabsTrigger
              value="explore"
              className="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all"
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">Explorar</span>
            </TabsTrigger>
            <TabsTrigger
              value="my-listings"
              className="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all"
            >
              <ShoppingBag className="size-4" />
              <span className="hidden sm:inline">Mis Listas</span>
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              className="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all"
            >
              <PlusCircle className="size-4" />
              <span className="hidden sm:inline">Vender</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explore">
            <ExploreTab format={format} user={user} />
          </TabsContent>
          <TabsContent value="my-listings">
            <MyListingsTab format={format} user={user} />
          </TabsContent>
          <TabsContent value="sell">
            <SellTab format={format} user={user} onListingCreated={() => setActiveTab('my-listings')} />
          </TabsContent>
        </Tabs>
      </div>
      <div className="h-16" />
    </div>
  )
}

// ─── Explore Tab ──────────────────────────────────────────────────────

function ExploreTab({ format, user }: { format: (a: number) => string; user: { id: string; kycStatus: string } | null }) {
  const [listings, setListings] = useState<SecondaryListing[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest')
  const [assetFilter, setAssetFilter] = useState('all')
  const [buyDialog, setBuyDialog] = useState<{ listing: SecondaryListing; maxFractions: number } | null>(null)
  const [buyFractionCount, setBuyFractionCount] = useState(1)
  const [buying, setBuying] = useState(false)
  const [buyError, setBuyError] = useState('')

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ sort, limit: '50' })
      if (assetFilter !== 'all') params.set('assetId', assetFilter)
      const res = await fetch(`/api/secondary-market?${params}`)
      if (res.ok) {
        const data = await res.json()
        setListings(data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [sort, assetFilter])

  useEffect(() => { fetchListings() }, [fetchListings])

  const handleBuy = async () => {
    if (!buyDialog) return
    setBuying(true)
    setBuyError('')
    try {
      const res = await fetch(`/api/secondary-market/${buyDialog.listing.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fractionCount: buyFractionCount }),
      })
      if (res.ok) {
        setBuyDialog(null)
        fetchListings()
      } else {
        const data = await res.json()
        setBuyError(data.error || 'Error al comprar')
      }
    } catch {
      setBuyError('Error de conexión')
    } finally {
      setBuying(false)
    }
  }

  const filtered = listings

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Store className="size-4" />
          <span>{filtered.length} listados disponibles</span>
        </div>
        <div className="flex items-center gap-3">
          <Select value={assetFilter} onValueChange={setAssetFilter}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="Tipo de activo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los activos</SelectItem>
              <SelectItem value="real_estate">Real Estate</SelectItem>
              <SelectItem value="micro_datacenter">Micro Datacenter</SelectItem>
              <SelectItem value="solar_energy">Solar Energy</SelectItem>
              <SelectItem value="last_mile_logistics">Last Mile Logistics</SelectItem>
              <SelectItem value="mining">Mining</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <ArrowUpDown className="mr-2 size-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="price_asc">Precio ↑</SelectItem>
              <SelectItem value="price_desc">Precio ↓</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <Store className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No hay listados disponibles</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            No hay fracciones en venta en este momento. Vuelve pronto.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => {
            const coverImage = listing.asset.images?.[0]?.url || '/placeholder.jpg'
            const available = listing.fractionCount - listing.soldFractionCount
            const timeRemaining = getTimeRemaining(listing.expiresAt)
            const priceGain = listing.asset.pricePerFraction > 0 
              ? ((listing.pricePerFraction - listing.asset.pricePerFraction) / listing.asset.pricePerFraction) * 100 
              : 0

            return (
              <Card key={listing.id} className="overflow-hidden gsp-card-hover group">
                <div className="relative h-40 overflow-hidden bg-muted">
                  <img
                    src={coverImage}
                    alt={listing.asset.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-sm font-semibold text-white truncate">{listing.asset.name}</p>
                    <p className="text-xs text-white/80">{listing.asset.city}</p>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 text-xs backdrop-blur-sm">
                      {listing.asset.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                      {listing.seller.name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm text-muted-foreground">{listing.seller.name || 'Usuario'}</span>
                    {timeRemaining && (
                      <span className="ml-auto flex items-center gap-1 text-xs text-amber-600">
                        <Clock className="size-3" />
                        {timeRemaining}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">Precio/fracción</span>
                      <span className="text-lg font-bold text-emerald-700">{format(listing.pricePerFraction)}</span>
                    </div>
                    {priceGain !== 0 && (
                      <div className={`flex items-baseline justify-between text-xs ${priceGain > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        <span className="text-muted-foreground">Variación</span>
                        <span className="font-medium">{priceGain > 0 ? '+' : ''}{priceGain.toFixed(1)}%</span>
                      </div>
                    )}
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">Fracciones</span>
                      <span className="text-sm font-medium">{available} disponibles</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">Total</span>
                      <span className="text-sm font-medium">{format(available * listing.pricePerFraction)}</span>
                    </div>
                  </div>

                  <Button
                    className="mt-4 w-full gsp-gradient text-white hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                    onClick={() => {
                      if (!user) return
                      setBuyDialog({ listing, maxFractions: available })
                      setBuyFractionCount(1)
                      setBuyError('')
                    }}
                    disabled={!user}
                  >
                    {user ? 'Comprar' : 'Inicia sesión para comprar'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Buy Dialog */}
      <Dialog open={!!buyDialog} onOpenChange={() => setBuyDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="size-5 text-emerald-600" />
              Comprar Fracciones
            </DialogTitle>
            <DialogDescription>
              {buyDialog && (
                <>
                  <span className="font-medium">{buyDialog.listing.asset.name}</span> — Listado por{' '}
                  {buyDialog.listing.seller.name || 'Usuario'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {buyDialog && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Precio por fracción</span>
                  <span className="font-medium">{format(buyDialog.listing.pricePerFraction)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Máximo disponible</span>
                  <span className="font-medium">{buyDialog.maxFractions} fracciones</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buy-fractions">Fracciones a comprar</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="buy-fractions"
                    type="number"
                    min={1}
                    max={buyDialog.maxFractions}
                    value={buyFractionCount}
                    onChange={(e) => setBuyFractionCount(Math.max(1, Math.min(buyDialog.maxFractions, parseInt(e.target.value) || 1)))}
                    className="text-center font-semibold"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">de {buyDialog.maxFractions}</span>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{format(buyFractionCount * buyDialog.listing.pricePerFraction)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Comisión plataforma (1.5%)</span>
                  <span className="text-red-500 font-medium">-{format(buyFractionCount * buyDialog.listing.pricePerFraction * 0.015)}</span>
                </div>
                <div className="my-1 border-t border-border" />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-emerald-700">{format(buyFractionCount * buyDialog.listing.pricePerFraction * 1.015)}</span>
                </div>
              </div>

              {buyError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                  <AlertCircle className="size-4 shrink-0" />
                  {buyError}
                </div>
              )}

              {!user && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 border border-amber-200">
                  <AlertCircle className="size-4 shrink-0" />
                  Debes iniciar sesión para comprar fracciones.
                </div>
              )}
              {user && user.kycStatus !== 'verified' && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 border border-amber-200">
                  <AlertCircle className="size-4 shrink-0" />
                  Necesitas verificación KYC para comprar en el mercado secundario.
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setBuyDialog(null)}>Cancelar</Button>
            <Button
              className="gsp-gradient text-white hover:shadow-lg hover:shadow-emerald-500/20"
              onClick={handleBuy}
              disabled={buying || !user || (user && user.kycStatus !== 'verified')}
            >
              {buying ? 'Procesando...' : `Comprar ${buyFractionCount} fracción${buyFractionCount > 1 ? 'es' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── My Listings Tab ──────────────────────────────────────────────────

function MyListingsTab({ format, user }: { format: (a: number) => string; user: { id: string } | null }) {
  const [listings, setListings] = useState<SecondaryListing[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const fetchListings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch('/api/secondary-market/my-listings')
      if (res.ok) setListings(await res.json())
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchListings() }, [fetchListings])

  const handleCancel = async (id: string) => {
    setCancelling(id)
    try {
      const res = await fetch(`/api/secondary-market/${id}/cancel`, { method: 'POST' })
      if (res.ok) fetchListings()
    } catch {
      // silent
    } finally {
      setCancelling(null)
    }
  }

  if (!user) {
    return (
      <Card className="p-12 text-center">
        <AlertCircle className="mx-auto mb-4 size-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Inicia sesión</h3>
        <p className="mt-2 text-sm text-muted-foreground">Debes iniciar sesión para ver tus listas.</p>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Sin listas aún</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No has publicado ninguna fracción en el mercado secundario.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {listings.map((listing) => {
        const available = listing.fractionCount - listing.soldFractionCount
        const coverImage = listing.asset.images?.[0]?.url || '/placeholder.jpg'
        const isActive = listing.status === 'active' || listing.status === 'partial'

        return (
          <Card key={listing.id} className="overflow-hidden gsp-card-hover">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Image */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img src={coverImage} alt={listing.asset.name} className="h-full w-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold truncate">{listing.asset.name}</h3>
                    {getStatusBadge(listing.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-4">
                    <span>Precio: <strong className="text-foreground">{format(listing.pricePerFraction)}</strong>/f</span>
                    <span>Listadas: <strong className="text-foreground">{listing.fractionCount}</strong></span>
                    <span>Vendidas: <strong className="text-foreground">{listing.soldFractionCount}</strong></span>
                    <span>Disponibles: <strong className="text-foreground">{available}</strong></span>
                  </div>
                  {listing.buyer && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Comprador: {listing.buyer.name || 'Usuario'}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isActive && available > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleCancel(listing.id)}
                      disabled={cancelling === listing.id}
                    >
                      {cancelling === listing.id ? (
                        <span className="flex items-center gap-1"><XCircle className="size-3" /> Cancelando...</span>
                      ) : (
                        <span className="flex items-center gap-1"><XCircle className="size-3" /> Cancelar</span>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress bar for partial sales */}
              {listing.soldFractionCount > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progreso de venta</span>
                    <span>{listing.soldFractionCount}/{listing.fractionCount} vendidas</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${(listing.soldFractionCount / listing.fractionCount) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ─── Sell Tab ─────────────────────────────────────────────────────────

function SellTab({ format, user, onListingCreated }: { format: (a: number) => string; user: { id: string } | null; onListingCreated: () => void }) {
  const [investments, setInvestments] = useState<AvailableInvestment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvestment, setSelectedInvestment] = useState<AvailableInvestment | null>(null)
  const [sellFractionCount, setSellFractionCount] = useState(1)
  const [sellPrice, setSellPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetch('/api/secondary-market/my-investments')
      .then((r) => r.ok ? r.json() : [])
      .then(setInvestments)
      .catch(() => setInvestments([]))
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    if (selectedInvestment) {
      setSellFractionCount(1)
      setSellPrice(String(selectedInvestment.asset.pricePerFraction))
    }
  }, [selectedInvestment])

  const totalPrice = sellFractionCount * parseFloat(sellPrice || '0')
  const platformFeeEst = totalPrice * 0.015
  const netAmountEst = totalPrice - platformFeeEst

  const handleCreateListing = async () => {
    if (!selectedInvestment || !sellPrice || parseFloat(sellPrice) <= 0) {
      setError('Precio inválido')
      return
    }
    if (sellFractionCount <= 0 || sellFractionCount > selectedInvestment.availableFractions) {
      setError('Cantidad de fracciones inválida')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/secondary-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investmentId: selectedInvestment.id,
          fractionCount: sellFractionCount,
          pricePerFraction: parseFloat(sellPrice),
        }),
      })

      if (res.ok) {
        onListingCreated()
      } else {
        const data = await res.json()
        setError(data.error || 'Error al crear listado')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <Card className="p-12 text-center">
        <AlertCircle className="mx-auto mb-4 size-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Inicia sesión</h3>
        <p className="mt-2 text-sm text-muted-foreground">Debes iniciar sesión para vender fracciones.</p>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Investment Selector */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PlusCircle className="size-5 text-emerald-600" />
            Seleccionar Inversión
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : investments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No tienes inversiones disponibles para vender.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Solo inversiones completadas con fracciones disponibles pueden ser listadas.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {investments.map((inv) => {
                const coverImage = inv.asset.images?.[0]?.url || '/placeholder.jpg'
                const isSelected = selectedInvestment?.id === inv.id

                return (
                  <button
                    key={inv.id}
                    onClick={() => setSelectedInvestment(inv)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200'
                        : 'border-border hover:border-emerald-200 hover:bg-muted/50'
                    }`}
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <img src={coverImage} alt={inv.asset.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{inv.asset.name}</p>
                      <p className="text-xs text-muted-foreground">{inv.asset.city}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-emerald-700">{inv.availableFractions}</p>
                      <p className="text-xs text-muted-foreground">fracciones</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Listing Form */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="size-5 text-emerald-600" />
            Crear Listado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedInvestment ? (
            <div className="space-y-5">
              {/* Selected Investment Summary */}
              <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                <p className="text-sm font-medium">{selectedInvestment.asset.name}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Precio compra: {format(selectedInvestment.pricePerUnit)}/f</span>
                  <span>Disponibles: {selectedInvestment.availableFractions}</span>
                </div>
              </div>

              {/* Fraction Count */}
              <div className="space-y-2">
                <Label htmlFor="sell-fractions">Fracciones a vender</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="sell-fractions"
                    type="number"
                    min={1}
                    max={selectedInvestment.availableFractions}
                    value={sellFractionCount}
                    onChange={(e) => setSellFractionCount(Math.max(1, Math.min(selectedInvestment.availableFractions, parseInt(e.target.value) || 1)))}
                    className="max-w-[120px] text-center font-semibold"
                  />
                  <span className="text-sm text-muted-foreground">de {selectedInvestment.availableFractions}</span>
                </div>
                <div className="flex gap-1">
                  {[1, 5, 10, 25].map((n) => (
                    <Button
                      key={n}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2"
                      disabled={n > selectedInvestment.availableFractions}
                      onClick={() => setSellFractionCount(Math.min(n, selectedInvestment.availableFractions))}
                    >
                      {n}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => setSellFractionCount(selectedInvestment.availableFractions)}
                  >
                    Todas
                  </Button>
                </div>
              </div>

              {/* Price per Fraction */}
              <div className="space-y-2">
                <Label htmlFor="sell-price">Precio por fracción (USD)</Label>
                <Input
                  id="sell-price"
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="Ej: 250000"
                  className="font-semibold"
                />
                <p className="text-xs text-muted-foreground">
                  Precio sugerido: {format(selectedInvestment.asset.pricePerFraction)} (precio actual del activo)
                </p>
              </div>

              {/* Summary */}
              <div className="rounded-lg border border-border p-4 space-y-2">
                <h4 className="text-sm font-semibold">Resumen</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fracciones</span>
                  <span className="font-medium">{sellFractionCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Precio por fracción</span>
                  <span className="font-medium">{format(parseFloat(sellPrice || '0'))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Precio total</span>
                  <span className="font-semibold">{format(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Comisión plataforma (1.5%)</span>
                  <span className="text-red-500 font-medium">-{format(platformFeeEst)}</span>
                </div>
                <div className="my-1 border-t border-border" />
                <div className="flex justify-between text-base font-bold">
                  <span>Estimado neto</span>
                  <span className="text-emerald-700">{format(netAmountEst)}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                className="w-full gsp-gradient text-white hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                onClick={handleCreateListing}
                disabled={submitting || !sellPrice || parseFloat(sellPrice) <= 0}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Publicando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <PlusCircle className="size-4" />
                    Publicar Listado
                  </span>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                El listado estará activo por 30 días. Puedes cancelarlo en cualquier momento.
              </p>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <PlusCircle className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold">Selecciona una inversión</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Elige una inversión de la lista para comenzar a vender fracciones.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
