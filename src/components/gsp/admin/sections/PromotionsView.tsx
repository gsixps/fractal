'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

interface Promotion {
  id: string
  name: string
  code: string
  type: string
  value: number
  minInvestment: number
  description: string
  validFrom: string
  validTo: string
  maxUses: number
  usedCount: number
  assetTypes: string
  isActive: boolean
}

interface PromotionFormState {
  name: string
  code: string
  type: string
  value: string
  minInvestment: string
  description: string
  validFrom: string
  validTo: string
  maxUses: string
  assetTypes: string
  isActive: boolean
}

const emptyForm: PromotionFormState = {
  name: '', code: '', type: 'bonus_yield', value: '', minInvestment: '',
  description: '', validFrom: '', validTo: '', maxUses: '', assetTypes: '', isActive: true,
}

const typeLabels: Record<string, string> = {
  bonus_yield: 'Rendimiento Extra',
  fee_discount: 'Descuento Comisiones',
  cashback: 'Cashback',
  free_fractions: 'Fracciones Gratis',
}

export function PromotionsView() {
  const [items, setItems] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [form, setForm] = useState<PromotionFormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToast()

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/promotions')
      if (!res.ok) throw new Error('Error al cargar promociones')
      const data = await res.json()
      setItems(data.promotions || data || [])
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las promociones', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchItems() }, [fetchItems])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (item: Promotion) => {
    setEditing(item)
    setForm({
      name: item.name ?? '', code: item.code ?? '', type: item.type ?? 'bonus_yield',
      value: item.value != null ? String(item.value) : '',
      minInvestment: item.minInvestment != null ? String(item.minInvestment) : '',
      description: item.description ?? '',
      validFrom: item.validFrom ? item.validFrom.split('T')[0] : '',
      validTo: item.validTo ? item.validTo.split('T')[0] : '',
      maxUses: item.maxUses != null ? String(item.maxUses) : '',
      assetTypes: item.assetTypes ?? '',
      isActive: item.isActive ?? true,
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast({ title: 'Error', description: 'Nombre y código son obligatorios', variant: 'destructive' })
      return
    }
    try {
      setSubmitting(true)
      const body = {
        name: form.name, code: form.code, type: form.type,
        value: parseFloat(form.value) || 0,
        minInvestment: parseFloat(form.minInvestment) || 0,
        description: form.description,
        validFrom: form.validFrom, validTo: form.validTo,
        maxUses: parseInt(form.maxUses) || 0,
        assetTypes: form.assetTypes, isActive: form.isActive,
      }
      let res: Response
      if (editing) {
        res = await fetch(`/api/admin/promotions/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/promotions', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      }
      if (!res.ok) throw new Error('Error al guardar')
      toast({ title: editing ? 'Promoción actualizada' : 'Promoción creada' })
      setFormOpen(false)
      fetchItems()
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
      const res = await fetch(`/api/admin/promotions/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      toast({ title: 'Promoción eliminada' })
      setDeleteTarget(null)
      fetchItems()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Promociones</h2>
          <p className="text-muted-foreground">Gestiona las promociones y códigos de la plataforma 3GSP</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={openCreate}>
          <Plus className="mr-2 size-4" /> Nueva Promoción
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <>
              <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="hidden sm:table-cell">Código</TableHead>
                      <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                      <TableHead className="hidden md:table-cell">Valor</TableHead>
                      <TableHead className="hidden lg:table-cell">Vigencia</TableHead>
                      <TableHead className="hidden lg:table-cell">Uso</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{item.code}</code>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary">{typeLabels[item.type] || item.type}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{item.value}%</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {item.validFrom ? new Date(item.validFrom).toLocaleDateString('en-US') : '—'}
                          {' → '}
                          {item.validTo ? new Date(item.validTo).toLocaleDateString('en-US') : '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {item.usedCount}/{item.maxUses || '∞'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={item.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-600 border-gray-200/60 dark:bg-gray-900/30 dark:text-gray-400'
                          }>
                            {item.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => openEdit(item)}><Pencil className="size-4" /></Button>
                            <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-600 cursor-pointer" onClick={() => setDeleteTarget(item)}><Trash2 className="size-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Tag className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No se encontraron promociones</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Promoción' : 'Nueva Promoción'}</DialogTitle>
            <DialogDescription>{editing ? 'Modifica los datos' : 'Crea una nueva promoción'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-name">Nombre *</Label>
                <Input id="p-name" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-code">Código *</Label>
                <Input id="p-code" value={form.code ?? ''} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="font-mono" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-type">Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-value">Valor (%)</Label>
                <Input id="p-value" type="number" step="0.01" value={form.value ?? ''} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-min">Inversión Mínima (USD)</Label>
                <Input id="p-min" type="number" value={form.minInvestment ?? ''} onChange={(e) => setForm({ ...form, minInvestment: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-max">Máximo de Usos</Label>
                <Input id="p-max" type="number" value={form.maxUses ?? ''} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-from">Válido Desde</Label>
                <Input id="p-from" type="date" value={form.validFrom ?? ''} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-to">Válido Hasta</Label>
                <Input id="p-to" type="date" value={form.validTo ?? ''} onChange={(e) => setForm({ ...form, validTo: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-asset-types">Tipos de Activo (separados por coma)</Label>
              <Input id="p-asset-types" value={form.assetTypes ?? ''} onChange={(e) => setForm({ ...form, assetTypes: e.target.value })} placeholder="real_estate, solar_energy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-desc">Descripción</Label>
              <Textarea id="p-desc" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} id="p-active" />
              <Label htmlFor="p-active">Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editing ? 'Guardar Cambios' : 'Crear Promoción'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar promoción?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
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
    </div>
  )
}
