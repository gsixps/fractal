'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  Building2,
  Server,
  Truck,
  Sun,
  Pickaxe,
  TrendingUp,
  ArrowUpDown,
  Clock,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DemoAsset {
  id: string
  name: string
  type: AssetType
  city: string
  region: string
  annualYield: number
  projectedAppreciation: number
  totalProjectedReturn: number
  pricePerFraction: number
  fundedPercentage: number
  availableFractions: number
  badge: 'Oportunidad' | 'Últimos cupos' | 'En Arriendo'
  imageUrl: string
}

type AssetType =
  | 'real_estate'
  | 'micro_datacenter'
  | 'last_mile_logistics'
  | 'solar_energy'
  | 'mining'

type SortOption =
  | 'highest-yield'
  | 'lowest-price'
  | 'highest-funded'
  | 'recent'

// ─── Data ───────────────────────────────────────────────────────────────────

const demoAssets: DemoAsset[] = [
  {
    id: 'demo_1',
    name: 'Centro Logístico Santiago Norte',
    type: 'last_mile_logistics',
    city: 'Santiago',
    region: 'Metropolitana',
    annualYield: 11.2,
    projectedAppreciation: 5.8,
    totalProjectedReturn: 17.0,
    pricePerFraction: 250000,
    fundedPercentage: 71.4,
    availableFractions: 3200,
    badge: 'En Arriendo',
    imageUrl:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
  },
  {
    id: 'demo_2',
    name: 'Micro Data Center Valparaíso',
    type: 'micro_datacenter',
    city: 'Valparaíso',
    region: 'Valparaíso',
    annualYield: 13.8,
    projectedAppreciation: 7.2,
    totalProjectedReturn: 21.0,
    pricePerFraction: 185000,
    fundedPercentage: 85.0,
    availableFractions: 1500,
    badge: 'Últimos cupos',
    imageUrl:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
  },
  {
    id: 'demo_3',
    name: 'Parque Solar Atacama III',
    type: 'solar_energy',
    city: 'Calama',
    region: 'Antofagasta',
    annualYield: 9.5,
    projectedAppreciation: 4.2,
    totalProjectedReturn: 13.7,
    pricePerFraction: 520000,
    fundedPercentage: 32.0,
    availableFractions: 6800,
    badge: 'Oportunidad',
    imageUrl:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
  },
  {
    id: 'demo_4',
    name: 'Residencial Providencia Sky',
    type: 'real_estate',
    city: 'Santiago',
    region: 'Metropolitana',
    annualYield: 8.4,
    projectedAppreciation: 6.5,
    totalProjectedReturn: 14.9,
    pricePerFraction: 160000,
    fundedPercentage: 59.0,
    availableFractions: 4100,
    badge: 'En Arriendo',
    imageUrl:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
  },
  {
    id: 'demo_5',
    name: 'Complejo Minero Atacama Norte',
    type: 'mining',
    city: 'Sierra Gorda',
    region: 'Antofagasta',
    annualYield: 14.2,
    projectedAppreciation: 8.5,
    totalProjectedReturn: 22.7,
    pricePerFraction: 850000,
    fundedPercentage: 28.0,
    availableFractions: 7200,
    badge: 'Oportunidad',
    imageUrl:
      'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=300&fit=crop',
  },
  {
    id: 'demo_6',
    name: 'Bodega E-Commerce Maipú Hub',
    type: 'last_mile_logistics',
    city: 'Santiago',
    region: 'Metropolitana',
    annualYield: 10.5,
    projectedAppreciation: 5.0,
    totalProjectedReturn: 15.5,
    pricePerFraction: 120000,
    fundedPercentage: 44.0,
    availableFractions: 5600,
    badge: 'En Arriendo',
    imageUrl:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
  },
]

// ─── Constants ──────────────────────────────────────────────────────────────

const ASSET_TYPE_OPTIONS: { value: AssetType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'real_estate', label: 'Inmuebles' },
  { value: 'micro_datacenter', label: 'Micro Data Centers' },
  { value: 'last_mile_logistics', label: 'Logística' },
  { value: 'solar_energy', label: 'Energía Solar' },
  { value: 'mining', label: 'Minería' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'highest-yield', label: 'Mayor rendimiento' },
  { value: 'lowest-price', label: 'Menor precio' },
  { value: 'highest-funded', label: 'Mayor financiamiento' },
  { value: 'recent', label: 'Recientes' },
]

const BADGE_FILTERS: DemoAsset['badge'][] = [
  'Oportunidad',
  'Últimos cupos',
  'En Arriendo',
]

const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  real_estate: 'Inmueble',
  micro_datacenter: 'Micro Data Center',
  last_mile_logistics: 'Logística',
  solar_energy: 'Energía Solar',
  mining: 'Minería',
}

const ASSET_TYPE_ICONS: Record<AssetType, React.ReactNode> = {
  real_estate: <Building2 className="size-3.5" />,
  micro_datacenter: <Server className="size-3.5" />,
  last_mile_logistics: <Truck className="size-3.5" />,
  solar_energy: <Sun className="size-3.5" />,
  mining: <Pickaxe className="size-3.5" />,
}

const BADGE_COLORS: Record<
  DemoAsset['badge'],
  string
> = {
  Oportunidad: 'bg-emerald-500/90 text-white border-emerald-500/90',
  'Últimos cupos': 'bg-amber-500/90 text-white border-amber-500/90',
  'En Arriendo': 'bg-sky-600/90 text-white border-sky-600/90',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCLP(amount: number): string {
  return '$' + amount.toLocaleString('es-CL')
}

// ─── Mobile Filter Sheet (extracted component) ────────────────────────────

function MobileFilterSheet({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedBadges,
  onToggleBadge,
  selectedSort,
  onSortChange,
}: {
  searchQuery: string
  onSearchChange: (v: string) => void
  selectedType: AssetType | 'all'
  onTypeChange: (v: AssetType | 'all') => void
  selectedBadges: DemoAsset['badge'][]
  onToggleBadge: (badge: DemoAsset['badge']) => void
  selectedSort: SortOption
  onSortChange: (v: SortOption) => void
}) {
  return (
    <div className="flex flex-col gap-6 overflow-y-auto px-1 pb-8 pt-2">
      {/* Search */}
      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          Buscar
        </label>
        <div className="relative">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Nombre, ciudad o tipo..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Asset Type */}
      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          Tipo de activo
        </label>
        <div className="flex flex-wrap gap-2">
          {ASSET_TYPE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={selectedType === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTypeChange(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Badge filters */}
      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          Etiquetas
        </label>
        <div className="flex flex-wrap gap-2">
          {BADGE_FILTERS.map((badge) => (
            <Button
              key={badge}
              variant={selectedBadges.includes(badge) ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToggleBadge(badge)}
            >
              {badge}
            </Button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          Ordenar por
        </label>
        <Select
          value={selectedSort}
          onValueChange={(v) => onSortChange(v as SortOption)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const selectAsset = useAppStore((s) => s.selectAsset)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<AssetType | 'all'>('all')
  const [selectedSort, setSelectedSort] = useState<SortOption>('highest-yield')
  const [selectedBadges, setSelectedBadges] = useState<DemoAsset['badge'][]>([])

  // Toggle badge filter
  function toggleBadgeFilter(badge: DemoAsset['badge']) {
    setSelectedBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
    )
  }

  // Remove active filter
  function removeFilter(
    type: 'search' | 'assetType' | 'badge',
    value?: string
  ) {
    if (type === 'search') setSearchQuery('')
    if (type === 'assetType') setSelectedType('all')
    if (type === 'badge' && value) {
      setSelectedBadges((prev) => prev.filter((b) => b !== value))
    }
  }

  function clearAllFilters() {
    setSearchQuery('')
    setSelectedType('all')
    setSelectedSort('highest-yield')
    setSelectedBadges([])
  }

  // Active filter tags
  const activeFilters = useMemo(() => {
    const filters: { type: 'search' | 'assetType' | 'badge'; label: string; value?: string }[] = []
    if (searchQuery.trim())
      filters.push({ type: 'search', label: `"${searchQuery}"` })
    if (selectedType !== 'all') {
      const label = ASSET_TYPE_OPTIONS.find((o) => o.value === selectedType)?.label
      if (label) filters.push({ type: 'assetType', label, value: selectedType })
    }
    for (const badge of selectedBadges) {
      filters.push({ type: 'badge', label: badge, value: badge })
    }
    return filters
  }, [searchQuery, selectedType, selectedBadges])

  // Has any filter active
  const hasFilters = activeFilters.length > 0

  // Filtered & sorted assets
  const filteredAssets = useMemo(() => {
    let result = [...demoAssets]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.region.toLowerCase().includes(q) ||
          ASSET_TYPE_LABELS[a.type].toLowerCase().includes(q)
      )
    }

    // Asset type
    if (selectedType !== 'all') {
      result = result.filter((a) => a.type === selectedType)
    }

    // Badge filters
    if (selectedBadges.length > 0) {
      result = result.filter((a) => selectedBadges.includes(a.badge))
    }

    // Sort
    switch (selectedSort) {
      case 'highest-yield':
        result.sort((a, b) => b.totalProjectedReturn - a.totalProjectedReturn)
        break
      case 'lowest-price':
        result.sort((a, b) => a.pricePerFraction - b.pricePerFraction)
        break
      case 'highest-funded':
        result.sort((a, b) => b.fundedPercentage - a.fundedPercentage)
        break
      case 'recent':
        // Keep original order (recent first = same as array order)
        break
    }

    return result
  }, [searchQuery, selectedType, selectedSort, selectedBadges])

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── Sticky Filter Bar ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          {/* Top row: Search + Sort + Mobile filter button */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                placeholder="Buscar por nombre, ciudad o tipo de activo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Sort dropdown (desktop) */}
            <div className="hidden sm:block">
              <Select
                value={selectedSort}
                onValueChange={(v) => setSelectedSort(v as SortOption)}
              >
                <SelectTrigger className="w-[200px]">
                  <ArrowUpDown className="text-muted-foreground mr-1 size-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mobile filter button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="sm:hidden">
                  <SlidersHorizontal className="size-4" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85vh] rounded-t-xl">
                <SheetHeader>
                  <SheetTitle>Filtrar activos</SheetTitle>
                </SheetHeader>
                <MobileFilterSheet
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedType={selectedType}
                  onTypeChange={setSelectedType}
                  selectedBadges={selectedBadges}
                  onToggleBadge={toggleBadgeFilter}
                  selectedSort={selectedSort}
                  onSortChange={(v: SortOption) => setSelectedSort(v)}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop filter row: Asset type + Badge filters */}
          <div className="mt-3 hidden items-center gap-3 sm:flex">
            {/* Asset type buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {ASSET_TYPE_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={selectedType === opt.value ? 'default' : 'outline'}
                  size="sm"
                  className="shrink-0"
                  onClick={() => setSelectedType(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            <div className="bg-border h-5 w-px shrink-0" />

            {/* Badge filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {BADGE_FILTERS.map((badge) => (
                <Button
                  key={badge}
                  variant={selectedBadges.includes(badge) ? 'default' : 'outline'}
                  size="sm"
                  className="shrink-0"
                  onClick={() => toggleBadgeFilter(badge)}
                >
                  {badge}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Active Filters + Results Count */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            <span className="text-foreground font-semibold">
              {filteredAssets.length}
            </span>{' '}
            {filteredAssets.length === 1 ? 'activo disponible' : 'activos disponibles'}
          </p>

          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map((f, i) => (
                <Badge
                  key={`${f.type}-${f.value || i}`}
                  variant="secondary"
                  className="cursor-pointer gap-1 pr-1 hover:bg-secondary/80"
                  onClick={() => removeFilter(f.type, f.value)}
                >
                  {f.label}
                  <X className="size-3" />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground"
                onClick={clearAllFilters}
              >
                Limpiar todo
              </Button>
            </div>
          )}
        </div>

        {/* ── Asset Grid ─────────────────────────────────────────────────── */}
        {filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onViewDetail={() => selectAsset(asset.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState onClear={clearAllFilters} />
        )}
      </main>
    </div>
  )
}

// ─── Asset Card ─────────────────────────────────────────────────────────────

function AssetCard({
  asset,
  onViewDetail,
}: {
  asset: DemoAsset
  onViewDetail: () => void
}) {
  return (
    <Card
      className="group cursor-pointer gap-0 overflow-hidden py-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      onClick={onViewDetail}
    >
      {/* Cover image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={asset.imageUrl}
          alt={asset.name}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badge overlay */}
        <Badge
          className={`absolute top-3 left-3 text-xs ${BADGE_COLORS[asset.badge]}`}
        >
          {asset.badge}
        </Badge>

        {/* Funded percentage badge */}
        <div className="absolute top-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {asset.fundedPercentage.toFixed(1)}% financiado
        </div>
      </div>

      {/* Content */}
      <CardContent className="flex flex-col gap-3 p-4">
        {/* Asset type label */}
        <div className="flex items-center gap-1.5 text-emerald-600">
          {ASSET_TYPE_ICONS[asset.type]}
          <span className="text-xs font-semibold uppercase tracking-wide">
            {ASSET_TYPE_LABELS[asset.type]}
          </span>
        </div>

        {/* Name */}
        <h3 className="line-clamp-1 text-sm font-semibold leading-tight text-foreground">
          {asset.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate text-xs">
            {asset.city}, {asset.region}
          </span>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-2.5">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] leading-tight text-muted-foreground">
              Rent. Total
            </span>
            <span className="text-xs font-bold text-emerald-600">
              {asset.totalProjectedReturn}%
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] leading-tight text-muted-foreground">
              Yield Arriendo
            </span>
            <span className="text-xs font-bold text-foreground">
              {asset.annualYield}%
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] leading-tight text-muted-foreground">
              Plusvalía
            </span>
            <span className="text-xs font-bold text-foreground">
              {asset.projectedAppreciation}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Financiamiento</span>
            <span className="font-medium text-foreground">
              {asset.fundedPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={asset.fundedPercentage} className="h-1.5" />
        </div>

        {/* Bottom row: fractions + price */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] text-muted-foreground">
              {asset.availableFractions.toLocaleString('es-CL')} fracciones
            </p>
            <p className="text-sm font-bold text-foreground">
              {formatCLP(asset.pricePerFraction)}
              <span className="text-[10px] font-normal text-muted-foreground">
                {' '}
                / fracción
              </span>
            </p>
          </div>
          <Button
            size="sm"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetail()
            }}
          >
            Ver Detalle
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Search className="text-muted-foreground size-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">No se encontraron activos</h3>
        <p className="text-sm text-muted-foreground">
          Intenta ajustar los filtros o buscar con otros términos.
        </p>
      </div>
      <Button variant="outline" onClick={onClear}>
        <X className="size-4" />
        Limpiar filtros
      </Button>
    </div>
  )
}
