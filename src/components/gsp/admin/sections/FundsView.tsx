'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, Search, Loader2, RefreshCw,
  Calculator, DollarSign, ArrowUpDown, Eye, Landmark,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

// ─── Types ───────────────────────────────────────────────────────────────────
interface FundHolding {
  id: string
  assetId: string
  fundId: string
  targetWeightPct: number
  currentWeightPct: number
  fractionCount: number
  valueUsd: number
  averageBuyPrice: number
  totalCostBasis: number
  unrealizedPL: number
  asset: {
    id: string
    name: string
    type: string
    pricePerFraction: number
    annualYield: number
  }
}

interface Fund {
  id: string
  name: string
  slug: string
  description: string
  status: string
  fundType: string
  riskLevel: string
  initialNavPerShare: number
  navPerShare: number
  totalShares: number
  availableShares: number
  pricePerShare: number
  totalAUM: number
  expenseRatio: number | null
  dividendYield: number | null
  totalReturn1Y: number | null
  totalReturnSinceInception: number | null
  rebalanceFrequency: string
  minInvestment: number
  maxInvestmentPerUser: number | null
  inceptionDate: string | null
  dividendFrequency: string
  fundManager: string | null
  badge: string | null
  highlights: string | null
  holdings: FundHolding[]
  _count: { fundInvestments: number; holdings: number }
  createdAt: string
  updatedAt: string
}

interface FundFormState {
  name: string
  slug: string
  description: string
  fundType: string
  riskLevel: string
  status: string
  initialNavPerShare: string
  navPerShare: string
  totalShares: string
  availableShares: string
  pricePerShare: string
  totalAUM: string
  expenseRatio: string
  dividendYield: string
  minInvestment: string
  maxInvestmentPerUser: string
  dividendFrequency: string
  rebalanceFrequency: string
  fundManager: string
  badge: string
  highlights: string
}

interface HoldingFormState {
  assetId: string
  targetWeightPct: string
  fractionCount: string
  averageBuyPrice: string
}

interface HoldingRow {
  id: string
  assetId: string
  assetName: string
  assetType: string
  targetWeightPct: number
  currentWeightPct: number
  fractionCount: number
  valueUsd: number
  unrealizedPL: number
}

// ─── Constants ───────────────────────────────────────────────────────────────
const emptyFundForm: FundFormState = {
  name: '', slug: '', description: '', fundType: 'mixed', riskLevel: 'medium',
  status: 'draft', initialNavPerShare: '100', navPerShare: '100', totalShares: '0',
  availableShares: '0', pricePerShare: '100', totalAUM: '0', expenseRatio: '',
  dividendYield: '', minInvestment: '100', maxInvestmentPerUser: '',
  dividendFrequency: 'quarterly', rebalanceFrequency: 'quarterly',
  fundManager: '', badge: '', highlights: '',
}

const emptyHoldingForm: HoldingFormState = {
  assetId: '', targetWeightPct: '', fractionCount: '', averageBuyPrice: '',
}

const fundTypeLabels: Record<string, string> = {
  mixed: 'Mixto', reit: 'REIT', equity: 'Renta Variable', bond: 'Renta Fija', commodity: 'Materias Primas',
}
const riskLevelLabels: Record<string, string> = {
  low: 'Bajo', medium: 'Medio', medium_high: 'Medio-Alto', high: 'Alto',
}
const statusLabels: Record<string, string> = {
  active: 'Activo', draft: 'Borrador', paused: 'Pausado',
}
const statusConfig: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40',
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200/60 dark:border-yellow-800/40',
  paused: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200/60 dark:border-orange-800/40',
}
const freqLabels: Record<string, string> = {
  monthly: 'Mensual', quarterly: 'Trimestral', semi_annual: 'Semestral', annual: 'Anual',
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(amount)
}

function formatShortUSD(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount.toFixed(0)}`
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Holdings Sub-View ───────────────────────────────────────────────────────
function HoldingsSubView({ fundId, onBack }: { fundId: string; onBack: () => void }) {
  const [holdings, setHoldings] = useState<HoldingRow[]>([])
  const [fund, setFund] = useState<Fund | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingHolding, setAddingHolding] = useState(false)
  const [holdingForm, setHoldingForm] = useState<HoldingFormState>(emptyHoldingForm)
  const [assets, setAssets] = useState<Array<{ id: string; name: string; type: string; pricePerFraction: number }>>([])
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<HoldingRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const fetchHoldings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/funds/${fundId}`)
      if (!res.ok) throw new Error('Error al cargar fondo')
      const data = await res.json()
      setFund(data)
      setHoldings(
        (data.holdings || []).map((h: FundHolding) => ({
          id: h.id,
          assetId: h.assetId,
          assetName: h.asset.name,
          assetType: h.asset.type,
          targetWeightPct: h.targetWeightPct,
          currentWeightPct: h.currentWeightPct,
          fractionCount: h.fractionCount,
          valueUsd: h.valueUsd,
          unrealizedPL: h.unrealizedPL,
        }))
      )
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las posiciones', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [fundId, toast])

  const fetchAssets = useCallback(async () => {
    try {
      const res = await fetch('/api/assets?status=active&limit=100')
      if (res.ok) {
        const data = await res.json()
        setAssets((data.data || data.assets || []).map((a: { id: string; name: string; type: string; pricePerFraction: number }) => ({
          id: a.id, name: a.name, type: a.type, pricePerFraction: a.pricePerFraction,
        })))
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => { fetchHoldings(); fetchAssets() }, [fetchHoldings, fetchAssets])

  const handleAddHolding = async () => {
    if (!holdingForm.assetId || !holdingForm.targetWeightPct) {
      toast({ title: 'Error', description: 'Activo y peso objetivo son obligatorios', variant: 'destructive' })
      return
    }
    try {
      setSubmitting(true)
      const weight = parseFloat(holdingForm.targetWeightPct) || 0
      const fractions = parseInt(holdingForm.fractionCount) || 0
      const buyPrice = parseFloat(holdingForm.averageBuyPrice) || 0
      const totalCostBasis = fractions * buyPrice
      const res = await fetch(`/api/admin/funds/${fundId}/holdings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: holdingForm.assetId,
          targetWeightPct: weight,
          currentWeightPct: 0,
          fractionCount: fractions,
          valueUsd: 0,
          averageBuyPrice: buyPrice,
          totalCostBasis,
          unrealizedPL: 0,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al crear posición')
      }
      toast({ title: 'Posición agregada', description: 'La posición fue creada correctamente' })
      setAddingHolding(false)
      setHoldingForm(emptyHoldingForm)
      fetchHoldings()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteHolding = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/admin/funds/${fundId}/holdings`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdingId: deleteTarget.id }),
      })
      if (!res.ok) throw new Error('Error al eliminar posición')
      toast({ title: 'Posición eliminada' })
      setDeleteTarget(null)
      fetchHoldings()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  const totalWeight = holdings.reduce((s, h) => s + h.targetWeightPct, 0)

  if (loading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="cursor-pointer">← Volver a Fondos</Button>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 -ml-2 cursor-pointer">← Volver a Fondos</Button>
          <h3 className="gsp-serif text-xl font-normal tracking-tight">{fund?.name} — Posiciones</h3>
          <p className="text-sm text-muted-foreground">
            {holdings.length} posiciones · Peso total: {totalWeight.toFixed(1)}% · AUM: {formatShortUSD(fund?.totalAUM || 0)}
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={() => setAddingHolding(true)}>
          <Plus className="mr-2 size-4" /> Agregar Posición
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-x-auto overflow-y-auto custom-scrollbar">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Activo</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                  <TableHead className="text-right">Fracciones</TableHead>
                  <TableHead className="text-right">Valor USD</TableHead>
                  <TableHead className="text-right">Peso Objetivo</TableHead>
                  <TableHead className="text-right">Peso Actual</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdings.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.assetName}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className="capitalize text-xs">{h.assetType.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">{h.fractionCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm">{formatUSD(h.valueUsd)}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{h.targetWeightPct}%</TableCell>
                    <TableCell className="text-right text-sm">
                      <span className={Math.abs(h.currentWeightPct - h.targetWeightPct) > 5 ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
                        {h.currentWeightPct}%
                      </span>
                    </TableCell>
                    <TableCell className={`text-right text-sm ${h.unrealizedPL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {h.unrealizedPL >= 0 ? '+' : ''}{formatUSD(h.unrealizedPL)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-600 cursor-pointer" onClick={() => setDeleteTarget(h)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {holdings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Landmark className="mb-3 size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Sin posiciones en este fondo</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weight distribution bar */}
      {holdings.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Distribución de Peso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-3 w-full overflow-hidden rounded-full">
              {holdings.map((h, i) => {
                const colors = [
                  'bg-primary', 'bg-emerald-500', 'bg-amber-500',
                  'bg-rose-500', 'bg-violet-500', 'bg-cyan-500',
                  'bg-orange-500', 'bg-teal-500', 'bg-pink-500', 'bg-lime-500',
                ]
                return (
                  <div
                    key={h.id}
                    className={`${colors[i % colors.length]} transition-all`}
                    style={{ width: `${Math.max(h.targetWeightPct, 2)}%` }}
                    title={`${h.assetName}: ${h.targetWeightPct}%`}
                  />
                )
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {holdings.map((h, i) => {
                const colors = [
                  'bg-primary', 'bg-emerald-500', 'bg-amber-500',
                  'bg-rose-500', 'bg-violet-500', 'bg-cyan-500',
                  'bg-orange-500', 'bg-teal-500', 'bg-pink-500', 'bg-lime-500',
                ]
                return (
                  <div key={h.id} className="flex items-center gap-1.5 text-xs">
                    <div className={`size-2.5 rounded-full ${colors[i % colors.length]}`} />
                    <span className="text-muted-foreground">{h.assetName}</span>
                    <span className="font-medium">{h.targetWeightPct}%</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Holding Dialog */}
      <Dialog open={addingHolding} onOpenChange={setAddingHolding}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Posición</DialogTitle>
            <DialogDescription>Selecciona un activo y define el peso objetivo en el fondo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Activo *</Label>
              <Select value={holdingForm.assetId} onValueChange={(v) => setHoldingForm({ ...holdingForm, assetId: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar activo" /></SelectTrigger>
                <SelectContent>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} — {formatUSD(a.pricePerFraction)}/frac
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hw-weight">Peso Objetivo (%) *</Label>
                <Input id="hw-weight" type="number" step="0.1" placeholder="Ej: 25" value={holdingForm.targetWeightPct} onChange={(e) => setHoldingForm({ ...holdingForm, targetWeightPct: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hw-fracs">Fracciones</Label>
                <Input id="hw-fracs" type="number" placeholder="0" value={holdingForm.fractionCount} onChange={(e) => setHoldingForm({ ...holdingForm, fractionCount: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hw-price">Precio Promedio Compra (USD)</Label>
              <Input id="hw-price" type="number" step="0.01" placeholder="0.00" value={holdingForm.averageBuyPrice} onChange={(e) => setHoldingForm({ ...holdingForm, averageBuyPrice: e.target.value })} />
            </div>
            <p className="text-xs text-muted-foreground">
              Peso total actual: <span className={totalWeight > 100 ? 'text-red-600 font-medium' : ''}>{totalWeight.toFixed(1)}%</span> / 100%
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingHolding(false)}>Cancelar</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={handleAddHolding} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar posición?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la posición de &quot;{deleteTarget?.assetName}&quot; del fondo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={handleDeleteHolding} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Engine Result Dialog ────────────────────────────────────────────────────
function EngineResultDialog({
  open, onOpenChange, title, children,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string; children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main FundsView ──────────────────────────────────────────────────────────
export function FundsView() {
  const [funds, setFunds] = useState<Fund[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  // Fund CRUD
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Fund | null>(null)
  const [form, setForm] = useState<FundFormState>(emptyFundForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Fund | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Holdings view
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null)

  // Engine actions
  const [engineLoading, setEngineLoading] = useState(false)
  const [engineResult, setEngineResult] = useState<{ title: string; data: unknown } | null>(null)

  const { toast } = useToast()

  const fetchFunds = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/funds')
      if (!res.ok) throw new Error('Error al cargar fondos')
      const data = await res.json()
      setFunds(data || [])
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar los fondos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchFunds() }, [fetchFunds])

  const filteredFunds = funds.filter((f) => {
    if (filterStatus !== 'all' && f.status !== filterStatus) return false
    if (filterType !== 'all' && f.fundType !== filterType) return false
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.slug.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyFundForm)
    setFormOpen(true)
  }

  const openEdit = (fund: Fund) => {
    setEditing(fund)
    setForm({
      name: fund.name ?? '',
      slug: fund.slug ?? '',
      description: fund.description ?? '',
      fundType: fund.fundType ?? 'mixed',
      riskLevel: fund.riskLevel ?? 'medium',
      status: fund.status ?? 'draft',
      initialNavPerShare: String(fund.initialNavPerShare ?? 100),
      navPerShare: String(fund.navPerShare ?? 100),
      totalShares: String(fund.totalShares ?? 0),
      availableShares: String(fund.availableShares ?? 0),
      pricePerShare: String(fund.pricePerShare ?? 100),
      totalAUM: String(fund.totalAUM ?? 0),
      expenseRatio: fund.expenseRatio != null ? String(fund.expenseRatio) : '',
      dividendYield: fund.dividendYield != null ? String(fund.dividendYield) : '',
      minInvestment: String(fund.minInvestment ?? 100),
      maxInvestmentPerUser: fund.maxInvestmentPerUser != null ? String(fund.maxInvestmentPerUser) : '',
      dividendFrequency: fund.dividendFrequency ?? 'quarterly',
      rebalanceFrequency: fund.rebalanceFrequency ?? 'quarterly',
      fundManager: fund.fundManager ?? '',
      badge: fund.badge ?? '',
      highlights: fund.highlights ?? '',
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Error', description: 'El nombre es obligatorio', variant: 'destructive' })
      return
    }
    try {
      setSubmitting(true)
      const body = {
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        description: form.description,
        fundType: form.fundType,
        riskLevel: form.riskLevel,
        status: form.status,
        initialNavPerShare: parseFloat(form.initialNavPerShare) || 100,
        navPerShare: parseFloat(form.navPerShare) || 100,
        totalShares: parseInt(form.totalShares) || 0,
        availableShares: parseInt(form.availableShares) || 0,
        pricePerShare: parseFloat(form.pricePerShare) || 100,
        totalAUM: parseFloat(form.totalAUM) || 0,
        expenseRatio: form.expenseRatio ? parseFloat(form.expenseRatio) : null,
        dividendYield: form.dividendYield ? parseFloat(form.dividendYield) : null,
        minInvestment: parseFloat(form.minInvestment) || 100,
        maxInvestmentPerUser: form.maxInvestmentPerUser ? parseFloat(form.maxInvestmentPerUser) : null,
        dividendFrequency: form.dividendFrequency,
        rebalanceFrequency: form.rebalanceFrequency,
        fundManager: form.fundManager || null,
        badge: form.badge || null,
        highlights: form.highlights || null,
      }
      let res: Response
      if (editing) {
        res = await fetch(`/api/admin/funds/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/funds', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      }
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }
      toast({ title: editing ? 'Fondo actualizado' : 'Fondo creado' })
      setFormOpen(false)
      fetchFunds()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/admin/funds/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      toast({ title: 'Fondo eliminado' })
      setDeleteTarget(null)
      fetchFunds()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  const runEngineAction = async (action: string, fundId?: string) => {
    try {
      setEngineLoading(true)
      const res = await fetch('/api/admin/funds/engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, fundId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error en la operación')

      if (action === 'calculate-nav') {
        const results = data.results as Array<{ fundName: string; navPerShare: number; totalAUM: number }>
        setEngineResult({
          title: 'NAV Recalculado',
          data: results,
        })
        toast({ title: 'NAV actualizado', description: `${results.length} fondos recalculados` })
      } else if (action === 'distribute-dividends') {
        setEngineResult({
          title: `Dividendos: ${data.fundName}`,
          data,
        })
        toast({ title: 'Dividendos distribuidos', description: `$${data.totalDistributed?.toFixed(2)} a ${data.investorCount} inversores` })
      } else if (action === 'check-rebalance') {
        setEngineResult({
          title: `Rebalanceo: ${data.fundName}`,
          data,
        })
        toast({ title: data.needsRebalance ? 'Rebalanceo necesario' : 'Sin rebalanceo necesario', description: data.message || 'Ver resultados' })
      }
      fetchFunds()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido', variant: 'destructive' })
    } finally {
      setEngineLoading(false)
    }
  }

  // Holdings view
  if (selectedFundId) {
    return <HoldingsSubView fundId={selectedFundId} onBack={() => setSelectedFundId(null)} />
  }

  // KPI summary
  const totalAUM = funds.reduce((s, f) => s + (f.totalAUM || 0), 0)
  const totalInvestors = funds.reduce((s, f) => s + (f._count?.fundInvestments || 0), 0)
  const activeFunds = funds.filter(f => f.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Fondos ETF</h2>
          <p className="text-muted-foreground">Gestiona los fondos de inversión de la plataforma</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 cursor-pointer border-primary/30 text-primary hover:bg-primary/10"
            disabled={engineLoading}
            onClick={() => runEngineAction('calculate-nav')}
          >
            {engineLoading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            <span className="hidden sm:inline">Recalcular NAV</span>
            <span className="sm:hidden">NAV</span>
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={openCreate}>
            <Plus className="mr-2 size-4" /> Nuevo Fondo
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AUM Total</p>
                <p className="text-2xl font-bold">{formatShortUSD(totalAUM)}</p>
              </div>
              <div className="rounded-xl bg-primary/8 p-2.5 text-primary">
                <DollarSign className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inversores Totales</p>
                <p className="text-2xl font-bold">{totalInvestors}</p>
              </div>
              <div className="rounded-xl bg-primary/8 p-2.5 text-primary">
                <Landmark className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fondos Activos</p>
                <p className="text-2xl font-bold">{activeFunds} / {funds.length}</p>
              </div>
              <div className="rounded-xl bg-primary/8 p-2.5 text-primary">
                <Calculator className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar fondos..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="mixed">Mixto</SelectItem>
            <SelectItem value="reit">REIT</SelectItem>
            <SelectItem value="equity">Renta Variable</SelectItem>
            <SelectItem value="bond">Renta Fija</SelectItem>
            <SelectItem value="commodity">Materias Primas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="paused">Pausado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <>
              <div className="max-h-[480px] overflow-x-auto overflow-y-auto custom-scrollbar">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">NAV</TableHead>
                      <TableHead className="hidden md:table-cell text-right">AUM</TableHead>
                      <TableHead className="hidden md:table-cell text-right">Yield</TableHead>
                      <TableHead className="hidden lg:table-cell text-right">Inversores</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFunds.map((fund) => {
                      const outstanding = fund.totalShares - fund.availableShares
                      return (
                        <TableRow key={fund.id}>
                          <TableCell>
                            <div className="font-medium">{fund.name}</div>
                            {fund.badge && (
                              <Badge variant="outline" className="mt-0.5 text-xs border-primary/30 text-primary">{fund.badge}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="secondary">{fundTypeLabels[fund.fundType] || fund.fundType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusConfig[fund.status] || ''}>
                              {statusLabels[fund.status] || fund.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {formatUSD(fund.navPerShare)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-right text-sm">
                            {formatShortUSD(fund.totalAUM || 0)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-right text-sm">
                            {fund.dividendYield != null ? `${fund.dividendYield}%` : '—'}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-right text-sm">
                            {fund._count?.fundInvestments || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 cursor-pointer"
                                title="Ver posiciones"
                                onClick={() => setSelectedFundId(fund.id)}
                              >
                                <Eye className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 cursor-pointer"
                                title="Distribuir dividendos"
                                disabled={engineLoading || fund.status !== 'active'}
                                onClick={() => runEngineAction('distribute-dividends', fund.id)}
                              >
                                {engineLoading ? <Loader2 className="size-4 animate-spin" /> : <DollarSign className="size-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 cursor-pointer"
                                title="Verificar rebalanceo"
                                disabled={engineLoading || fund.status !== 'active'}
                                onClick={() => runEngineAction('check-rebalance', fund.id)}
                              >
                                <ArrowUpDown className="size-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => openEdit(fund)}>
                                <Pencil className="size-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-600 cursor-pointer" onClick={() => setDeleteTarget(fund)}>
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              {filteredFunds.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Landmark className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">No se encontraron fondos</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Fund Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Fondo' : 'Nuevo Fondo'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Modifica los datos del fondo' : 'Completa los datos para crear un nuevo fondo'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="f-name">Nombre *</Label>
                <Input id="f-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : generateSlug(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-slug">Slug</Label>
                <Input id="f-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="f-desc">Descripción</Label>
              <Textarea id="f-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>

            <Separator className="my-2" />

            {/* Strategy */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Tipo de Fondo</Label>
                <Select value={form.fundType} onValueChange={(v) => setForm({ ...form, fundType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(fundTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nivel de Riesgo</Label>
                <Select value={form.riskLevel} onValueChange={(v) => setForm({ ...form, riskLevel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(riskLevelLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-2" />

            {/* Pricing */}
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Precios y Acciones</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="f-inav">NAV Inicial</Label>
                <Input id="f-inav" type="number" step="0.01" value={form.initialNavPerShare} onChange={(e) => setForm({ ...form, initialNavPerShare: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-nav">NAV Actual</Label>
                <Input id="f-nav" type="number" step="0.01" value={form.navPerShare} onChange={(e) => setForm({ ...form, navPerShare: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="f-total">Acciones Totales</Label>
                <Input id="f-total" type="number" value={form.totalShares} onChange={(e) => setForm({ ...form, totalShares: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-avail">Acciones Disponibles</Label>
                <Input id="f-avail" type="number" value={form.availableShares} onChange={(e) => setForm({ ...form, availableShares: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-price">Precio/Acción</Label>
                <Input id="f-price" type="number" step="0.01" value={form.pricePerShare} onChange={(e) => setForm({ ...form, pricePerShare: e.target.value })} />
              </div>
            </div>

            <Separator className="my-2" />

            {/* Metrics */}
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Métricas</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="f-aum">AUM Total</Label>
                <Input id="f-aum" type="number" step="0.01" value={form.totalAUM} onChange={(e) => setForm({ ...form, totalAUM: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-expense">Ratio de Gastos (%)</Label>
                <Input id="f-expense" type="number" step="0.01" placeholder="0.00" value={form.expenseRatio} onChange={(e) => setForm({ ...form, expenseRatio: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-yield">Yield de Dividendos (%)</Label>
                <Input id="f-yield" type="number" step="0.01" placeholder="0.00" value={form.dividendYield} onChange={(e) => setForm({ ...form, dividendYield: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-mininv">Inversión Mínima</Label>
                <Input id="f-mininv" type="number" step="0.01" value={form.minInvestment} onChange={(e) => setForm({ ...form, minInvestment: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="f-maxinv">Máx Inversión por Usuario</Label>
                <Input id="f-maxinv" type="number" step="0.01" placeholder="Sin límite" value={form.maxInvestmentPerUser} onChange={(e) => setForm({ ...form, maxInvestmentPerUser: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-manager">Gestor del Fondo</Label>
                <Input id="f-manager" placeholder="Ej: 3GSP Capital" value={form.fundManager} onChange={(e) => setForm({ ...form, fundManager: e.target.value })} />
              </div>
            </div>

            <Separator className="my-2" />

            {/* Frequency */}
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Frecuencias</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Frecuencia de Dividendos</Label>
                <Select value={form.dividendFrequency} onValueChange={(v) => setForm({ ...form, dividendFrequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(freqLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frecuencia de Rebalanceo</Label>
                <Select value={form.rebalanceFrequency} onValueChange={(v) => setForm({ ...form, rebalanceFrequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(freqLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-2" />

            {/* Branding */}
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Branding</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="f-badge">Badge</Label>
                <Input id="f-badge" placeholder="Ej: Popular, Nuevo" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-highlights">Highlights (JSON)</Label>
                <Input id="f-highlights" placeholder='["Diversificado","Alto Yield"]' value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editing ? 'Guardar Cambios' : 'Crear Fondo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar fondo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente &quot;{deleteTarget?.name}&quot; y todas sus posiciones. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Engine Result Dialog */}
      <EngineResultDialog
        open={!!engineResult}
        onOpenChange={(v) => { if (!v) setEngineResult(null) }}
        title={engineResult?.title || ''}
      >
        {engineResult?.data && (
          <div className="space-y-3 text-sm">
            {engineResult.title === 'NAV Recalculado' && (
              <>
                {(engineResult.data as Array<{ fundName: string; navPerShare: number; totalAUM: number; outstandingShares: number }>).map((r, i) => (
                  <Card key={i} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{r.fundName}</p>
                        <p className="text-xs text-muted-foreground">{r.outstandingShares} acciones outstanding</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatUSD(r.navPerShare)}</p>
                        <p className="text-xs text-muted-foreground">AUM: {formatShortUSD(r.totalAUM)}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
            {engineResult.title.startsWith('Dividendos') && (() => {
              const d = engineResult.data as { fundName: string; dividendPerShare: number; totalDistributed: number; investorCount: number; periodStart: string; periodEnd: string; investors: Array<{ userId: string; amount: number; shares: number }> }
              return (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <p className="text-lg font-bold">{formatUSD(d.dividendPerShare)}</p>
                      <p className="text-xs text-muted-foreground">Dividendo/Acción</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <p className="text-lg font-bold">{formatUSD(d.totalDistributed)}</p>
                      <p className="text-xs text-muted-foreground">Total Distribuido</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <p className="text-lg font-bold">{d.investorCount}</p>
                      <p className="text-xs text-muted-foreground">Inversores</p>
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuario</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(d.investors || []).map((inv, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs font-mono">{inv.userId.slice(0, 12)}...</TableCell>
                            <TableCell className="text-right text-sm">{inv.shares}</TableCell>
                            <TableCell className="text-right text-sm font-medium text-emerald-600 dark:text-emerald-400">{formatUSD(inv.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )
            })()}
            {engineResult.title.startsWith('Rebalanceo') && (() => {
              const r = engineResult.data as { needsRebalance: boolean; message: string; holdings: Array<{ asset: string; target: number; current: number; drift: number }> }
              return (
                <>
                  <div className={`rounded-lg p-3 text-center ${r.needsRebalance ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-400' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'}`}>
                    <p className="font-medium">{r.needsRebalance ? '⚠️ Rebalanceo necesario' : '✓ Pesos dentro del rango aceptable'}</p>
                    <p className="text-xs mt-1">{r.message}</p>
                  </div>
                  {r.holdings && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Activo</TableHead>
                          <TableHead className="text-right">Objetivo</TableHead>
                          <TableHead className="text-right">Actual</TableHead>
                          <TableHead className="text-right">Desviación</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {r.holdings.map((h, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm">{h.asset}</TableCell>
                            <TableCell className="text-right text-sm">{h.target}%</TableCell>
                            <TableCell className="text-right text-sm">{h.current}%</TableCell>
                            <TableCell className={`text-right text-sm font-medium ${h.drift > 5 ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                              {h.drift > 5 ? `${h.drift.toFixed(1)}% ⚠` : `${h.drift.toFixed(1)}%`}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </>
              )
            })()}
          </div>
        )}
      </EngineResultDialog>
    </div>
  )
}
