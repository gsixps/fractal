'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

import { useAppStore } from '@/lib/store'
import {
  Search, Building2, FlaskConical, Truck, Sun, Pickaxe,
  ArrowUpDown, MapPin, SlidersHorizontal,
} from 'lucide-react'
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

function formatCurrency(v: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)
}

export default function MarketplacePage() {
  const selectAsset = useAppStore((s) => s.selectAsset)
  const storeAssets = useAppStore((s) => s.assets)
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('yield')

  const sorted = useMemo(() => {
    let arr = storeAssets.filter(a => a.status === 'active')
    if (typeFilter !== 'all') arr = arr.filter(a => a.type === typeFilter)
    if (search) {
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
  }, [storeAssets, typeFilter, search, sortBy])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-emerald-50/80 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Marketplace</h1>
          <p className="mt-2 text-muted-foreground text-lg">Encuentra activos inmobiliarios para diversificar tu portafolio.</p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre o ciudad..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11" />
            </div>
            {/* Mobile filter button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="sm:hidden gap-2 h-11">
                  <SlidersHorizontal className="size-4" /> Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[70vh]">
                <SheetHeader><SheetTitle>Filtros</SheetTitle></SheetHeader>
                <div className="flex flex-wrap gap-2 mt-4">
                  {TYPES.map(t => (
                    <Button key={t.key} variant={typeFilter === t.key ? 'default' : 'outline'}
                      size="sm" onClick={() => setTypeFilter(t.key)}
                      className={typeFilter === t.key ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}>
                      {t.icon} {t.label}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {SORTS.map(s => (
                    <Button key={s.key} variant={sortBy === s.key ? 'default' : 'outline'} size="sm"
                      onClick={() => setSortBy(s.key)}
                      className={sortBy === s.key ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}>
                      {s.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop filters */}
          <div className="hidden sm:flex flex-wrap items-center gap-3 mt-5">
            <span className="text-sm font-medium text-muted-foreground mr-1">Tipo:</span>
            {TYPES.map(t => (
              <Button key={t.key} variant={typeFilter === t.key ? 'default' : 'outline'} size="sm"
                onClick={() => setTypeFilter(t.key)}
                className={typeFilter === t.key ? 'bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5' : 'gap-1.5'}>
                {t.icon} {t.label}
              </Button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <ArrowUpDown className="size-4 text-muted-foreground" />
              {SORTS.map(s => (
                <Button key={s.key} variant={sortBy === s.key ? 'default' : 'ghost'} size="sm"
                  onClick={() => setSortBy(s.key)}
                  className={sortBy === s.key ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-muted-foreground'}>
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {`${sorted.length} activo${sorted.length !== 1 ? 's' : ''} encontrado${sorted.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-20">
            <Search className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No se encontraron activos</h3>
            <p className="text-muted-foreground mt-1">Intenta ajustar los filtros de búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((asset) => (
              <Card key={asset.id} className="overflow-hidden gsp-card-hover border-border/60 group cursor-pointer h-full"
                onClick={() => selectAsset(asset.id)}>
                <div className="relative h-48 overflow-hidden bg-muted">
                  {asset.images?.[0]?.url ? (
                    <img src={asset.images[0].url} alt={asset.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Building2 className="size-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-emerald-600/90 text-white backdrop-blur-sm border-0">
                      {typeLabels[asset.type] || asset.type}
                    </Badge>
                    {asset.badge && (
                      <Badge className="bg-white/90 text-amber-700 backdrop-blur-sm border-0 font-medium">{asset.badge}</Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-emerald-700 backdrop-blur-sm border-0 font-bold">{asset.annualYield}%</Badge>
                  </div>
                </div>
                <CardContent className="p-5 flex flex-col gap-3 flex-1">
                  <div>
                    <h3 className="font-semibold text-base leading-tight line-clamp-1">{asset.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5 text-emerald-500" /> {asset.city}, {asset.region}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Financiamiento</span>
                      <span className="font-medium text-emerald-600">{asset.fundedPercentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        style={{ width: `${Math.min(asset.fundedPercentage, 100)}%` }} />
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-auto pt-1">
                    <div>
                      <p className="text-xs text-muted-foreground">Desde</p>
                      <p className="text-lg font-bold">{formatCurrency(asset.pricePerFraction)}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>Retorno total</p>
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
