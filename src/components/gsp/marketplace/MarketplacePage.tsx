'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

import { useAppStore } from '@/lib/store'
import {
  Search, Building2, FlaskConical, Truck, Sun, Pickaxe,
  ArrowUpDown, MapPin, SlidersHorizontal, Globe, Sparkles, Loader2,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import AIRecommendations from '@/components/gsp/marketplace/AIRecommendations'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'

const TYPES = [
  { key: 'all', label: 'Todos', icon: <Search className="size-3.5" /> },
  { key: 'real_estate', label: 'Inmuebles', icon: <Building2 className="size-3.5" /> },
  { key: 'micro_datacenter', label: 'Data Centers', icon: <FlaskConical className="size-3.5" /> },
  { key: 'last_mile_logistics', label: 'Logística', icon: <Truck className="size-3.5" /> },
  { key: 'solar_energy', label: 'Solar', icon: <Sun className="size-3.5" /> },
  { key: 'mining', label: 'Minería', icon: <Pickaxe className="size-3.5" /> },
] as const

const COUNTRIES = [
  { key: 'all', label: 'Todos', flag: <Globe className="size-3.5" /> },
  { key: 'Chile', label: 'Chile', flag: '🇨🇱' },
  { key: 'Colombia', label: 'Colombia', flag: '🇨🇴' },
  { key: 'Venezuela', label: 'Venezuela', flag: '🇻🇪' },
  { key: 'USA', label: 'USA', flag: '🇺🇸' },
] as const

const COUNTRY_FLAGS: Record<string, string> = {
  Chile: '🇨🇱',
  Colombia: '🇨🇴',
  Venezuela: '🇻🇪',
  USA: '🇺🇸',
}

const SORTS = [
  { key: 'yield', label: 'Mayor rendimiento' },
  { key: 'price-asc', label: 'Menor precio' },
  { key: 'price-desc', label: 'Mayor precio' },
  { key: 'funded', label: 'Más financiado' },
] as const

const typeLabels: Record<string, string> = {
  real_estate: 'Inmueble', micro_datacenter: 'Data Center', last_mile_logistics: 'Logística',
  solar_energy: 'Energía Solar', mining: 'Minería',
}

const typeIcons: Record<string, React.ReactNode> = {
  real_estate: <Building2 className="size-3.5" />, micro_datacenter: <FlaskConical className="size-3.5" />,
  last_mile_logistics: <Truck className="size-3.5" />, solar_energy: <Sun className="size-3.5" />,
  mining: <Pickaxe className="size-3.5" />,
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)
}

// Type for AI search results (partial asset shape)
interface AISearchResult {
  id: string
  name: string
  type: string
  status: string
  city: string
  region: string
  country: string
  totalValue: number
  pricePerFraction: number
  totalFractions: number
  availableFractions: number
  minimumInvestment: number
  annualYield: number
  projectedAppreciation: number
  totalProjectedReturn: number
  shortDescription: string | null
  fundedPercentage: number
  badge: string | null
  images?: Array<{ url: string; alt: string | null }>
}

export default function MarketplacePage() {
  const selectAsset = useAppStore((s) => s.selectAsset)
  const storeAssets = useAppStore((s) => s.assets)
  const fetchAssets = useAppStore((s) => s.fetchAssets)
  const assetsLoading = useAppStore((s) => s.assetsLoading)
  const [typeFilter, setTypeFilter] = useState('all')
  const [countryFilter, setCountryFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('yield')

  // AI search state
  const [aiSearching, setAiSearching] = useState(false)
  const [aiResults, setAiResults] = useState<AISearchResult[] | null>(null)
  const [aiSearchQuery, setAiSearchQuery] = useState('')

  useEffect(() => { fetchAssets() }, [fetchAssets])

  const sorted = useMemo(() => {
    let arr = storeAssets.filter(a => a.status === 'active')
    if (typeFilter !== 'all') arr = arr.filter(a => a.type === typeFilter)
    if (countryFilter !== 'all') arr = arr.filter(a => a.country === countryFilter)
    if (search && !aiResults) {
      const q = search.toLowerCase()
      arr = arr.filter(a => a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q))
    }
    switch (sortBy) {
      case 'yield': return [...arr].sort((a, b) => b.annualYield - a.annualYield)
      case 'price-asc': return [...arr].sort((a, b) => a.pricePerFraction - b.pricePerFraction)
      case 'price-desc': return [...arr].sort((a, b) => b.pricePerFraction - a.pricePerFraction)
      case 'funded': return [...arr].sort((a, b) => b.fundedPercentage - a.fundedPercentage)
      default: return arr
    }
  }, [storeAssets, typeFilter, countryFilter, search, sortBy, aiResults])

  const performAISearch = useCallback(async (query: string) => {
    if (!query.trim()) return
    setAiSearching(true)
    setAiSearchQuery(query.trim())
    try {
      const res = await fetch(`/api/assets/search?q=${encodeURIComponent(query.trim())}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        if (data.results && data.results.length > 0) {
          setAiResults(data.results)
          return
        }
      }
      // If API fails or no results, fall back to client-side filtering
      setAiResults(null)
    } catch {
      // Fall back to client-side filtering on error
      setAiResults(null)
    } finally {
      setAiSearching(false)
    }
  }, [])

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performAISearch(search)
    }
  }

  const handleSearchClick = () => {
    performAISearch(search)
  }

  // Clear AI results when filters change or search is cleared
  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value)
    setAiResults(null)
    setAiSearchQuery('')
  }

  const handleClearSearch = () => {
    setSearch('')
    setAiResults(null)
    setAiSearchQuery('')
  }

  // Determine which assets to display
  const displayAssets = aiResults || sorted
  const isAISearch = aiResults !== null && aiSearchQuery !== ''

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-gradient-to-b from-secondary/50 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <h1 className="gsp-serif text-3xl sm:text-4xl font-normal tracking-tight">Marketplace</h1>
          <p className="mt-2 text-muted-foreground text-lg font-light">
            Encuentra activos inmobiliarios para diversificar tu portafolio.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre o ciudad..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 pr-20 h-11 bg-card/60 backdrop-blur-sm border-border/50" />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {aiSearching && (
                  <Loader2 className="size-4 text-primary animate-spin mr-1" />
                )}
                {search && !aiSearching && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={handleClearSearch}
                  >
                    ✕
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 gap-1 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer rounded-lg text-xs"
                  onClick={handleSearchClick}
                  disabled={aiSearching || !search.trim()}
                >
                  <Sparkles className="size-3" />
                  <span className="hidden sm:inline">Buscar IA</span>
                </Button>
              </div>
            </div>
            {/* Mobile filter button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="sm:hidden gap-2 h-11 border-border/50 cursor-pointer">
                  <SlidersHorizontal className="size-4" /> Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[70vh]">
                <SheetHeader><SheetTitle>Filtros</SheetTitle></SheetHeader>
                <div className="flex flex-wrap gap-2 mt-4">
                  {TYPES.map(t => (
                    <Button key={t.key} variant={typeFilter === t.key ? 'default' : 'outline'}
                      size="sm" onClick={() => handleFilterChange(setTypeFilter, t.key)}
                      className={typeFilter === t.key ? 'bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer' : 'border-border/50 cursor-pointer'}>
                      {t.icon} {t.label}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">País</span>
                  {COUNTRIES.map(c => (
                    <Button key={c.key} variant={countryFilter === c.key ? 'default' : 'outline'}
                      size="sm" onClick={() => handleFilterChange(setCountryFilter, c.key)}
                      className={countryFilter === c.key ? 'bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 cursor-pointer' : 'gap-1.5 border-border/50 cursor-pointer'}>
                      {c.flag} {c.label}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ordenar</span>
                  {SORTS.map(s => (
                    <Button key={s.key} variant={sortBy === s.key ? 'default' : 'outline'} size="sm"
                      onClick={() => setSortBy(s.key)}
                      className={sortBy === s.key ? 'bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer' : 'border-border/50 cursor-pointer'}>
                      {s.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop filters */}
          <div className="hidden sm:flex flex-wrap items-center gap-2 mt-5">
            <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-border/30 rounded-full px-2 py-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Tipo</span>
              {TYPES.map(t => (
                <Button key={t.key} variant={typeFilter === t.key ? 'default' : 'ghost'} size="sm"
                  onClick={() => handleFilterChange(setTypeFilter, t.key)}
                  className={
                    typeFilter === t.key
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground gap-1 shadow-sm cursor-pointer h-8 rounded-full text-xs'
                      : 'gap-1 text-muted-foreground hover:text-foreground cursor-pointer h-8 rounded-full text-xs'
                  }>
                  {t.icon} {t.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-border/30 rounded-full px-2 py-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">País</span>
              {COUNTRIES.map(c => (
                <Button key={c.key} variant={countryFilter === c.key ? 'default' : 'ghost'} size="sm"
                  onClick={() => handleFilterChange(setCountryFilter, c.key)}
                  className={
                    countryFilter === c.key
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground gap-1 shadow-sm cursor-pointer h-8 rounded-full text-xs'
                      : 'gap-1 text-muted-foreground hover:text-foreground cursor-pointer h-8 rounded-full text-xs'
                  }>
                  {c.flag} {c.label}
                </Button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-border/30 rounded-full px-2 py-1">
              <ArrowUpDown className="size-3 text-muted-foreground ml-1" />
              {SORTS.map(s => (
                <Button key={s.key} variant={sortBy === s.key ? 'default' : 'ghost'} size="sm"
                  onClick={() => setSortBy(s.key)}
                  className={
                    sortBy === s.key
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer h-8 rounded-full text-xs'
                      : 'text-muted-foreground hover:text-foreground cursor-pointer h-8 rounded-full text-xs'
                  }>
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations (top, before grid) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AIRecommendations />
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground font-light">
              {aiSearching ? 'Buscando con IA...' : assetsLoading ? 'Cargando...' : `${displayAssets.length} activo${displayAssets.length !== 1 ? 's' : ''} encontrado${displayAssets.length !== 1 ? 's' : ''}`}
            </p>
            {isAISearch && (
              <Badge variant="outline" className="gap-1 bg-primary/5 border-primary/20 text-primary text-xs">
                <Sparkles className="size-3" />
                Powered by IA
              </Badge>
            )}
          </div>
          {isAISearch && (
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground cursor-pointer" onClick={handleClearSearch}>
              Limpiar búsqueda IA
            </Button>
          )}
        </div>

        {(assetsLoading && !aiSearching) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-border/40">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between pt-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : aiSearching ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="size-10 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium">Buscando con IA</p>
            <p className="text-muted-foreground mt-1 text-sm font-light">Analizando tu consulta con inteligencia artificial...</p>
          </div>
        ) : displayAssets.length === 0 ? (
          <div className="text-center py-20">
            <Search className="size-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No se encontraron activos</h3>
            <p className="text-muted-foreground mt-1 font-light">Intenta ajustar los filtros de búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayAssets.map((asset) => (
              <Card key={asset.id}
                className="overflow-hidden gsp-card-hover gsp-shine border-border/40 group h-full flex flex-col"
                onClick={() => selectAsset(asset.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && selectAsset(asset.id)}
              >
                <div className="relative h-48 overflow-hidden bg-muted">
                  {asset.images?.[0]?.url ? (
                    <img src={asset.images[0].url} alt={asset.name}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                      <Building2 className="size-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <Badge className="bg-white/90 text-emerald-800 backdrop-blur-md border-0 gap-1 font-medium shadow-sm">
                      {typeIcons[asset.type]} {typeLabels[asset.type] || asset.type}
                    </Badge>
                    {asset.badge && (
                      <Badge className="bg-amber-100/90 text-amber-800 backdrop-blur-md border-0 font-medium shadow-sm">
                        {asset.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-md border-0 font-bold shadow-sm">
                      {asset.annualYield}%
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5 flex flex-col gap-3 flex-1">
                  <div>
                    <h3 className="font-semibold text-base leading-snug line-clamp-1">{asset.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                      <span>{COUNTRY_FLAGS[asset.country] || ''}</span>
                      <MapPin className="size-3.5 text-emerald-500" /> {asset.city}, {asset.region}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-light">Financiamiento</span>
                      <span className="font-medium text-primary">{asset.fundedPercentage}%</span>
                    </div>
                    <div className="gsp-progress-bar">
                      <div className="gsp-progress-bar-fill" style={{ width: `${Math.min(asset.fundedPercentage, 100)}%` }} />
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-auto pt-1">
                    <div>
                      <p className="text-xs text-muted-foreground font-light">Desde</p>
                      <p className="text-lg font-bold tracking-tight">{formatCurrency(asset.pricePerFraction)}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p className="font-light">Retorno total</p>
                      <p className="text-sm font-semibold text-foreground">{asset.totalProjectedReturn}% anual</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
