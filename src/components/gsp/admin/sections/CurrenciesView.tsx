'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2, Coins } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

interface CurrencyItem {
  id: string
  code: string
  name: string
  symbol: string
  flag: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CurrencyFormState {
  code: string
  name: string
  symbol: string
  flag: string
  sortOrder: string
  isActive: boolean
}

const emptyForm: CurrencyFormState = {
  code: '', name: '', symbol: '', flag: '🇨🇱', sortOrder: '0', isActive: true,
}

const commonFlags: Record<string, string> = {
  CLP: '🇨🇱',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  BRL: '🇧🇷',
  ARS: '🇦🇷',
  MXN: '🇲🇽',
  COP: '🇨🇴',
  PEN: '🇵🇪',
  JPY: '🇯🇵',
  CNY: '🇨🇳',
}

export function CurrenciesView() {
  const [items, setItems] = useState<CurrencyItem[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CurrencyItem | null>(null)
  const [form, setForm] = useState<CurrencyFormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<CurrencyItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { toast } = useToast()

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/currencies')
      if (!res.ok) throw new Error('Error al cargar monedas')
      const data = await res.json()
      setItems(data.currencies || data || [])
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las monedas', variant: 'destructive' })
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

  const openEdit = (item: CurrencyItem) => {
    setEditing(item)
    setForm({
      code: item.code,
      name: item.name,
      symbol: item.symbol,
      flag: item.flag,
      sortOrder: item.sortOrder.toString(),
      isActive: item.isActive,
    })
    setFormOpen(true)
  }

  const handleCodeChange = (code: string) => {
    const upperCode = code.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
    setForm({
      ...form,
      code: upperCode,
      flag: commonFlags[upperCode] || form.flag,
    })
  }

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      toast({ title: 'Error', description: 'El código y nombre son obligatorios', variant: 'destructive' })
      return
    }
    try {
      setSubmitting(true)
      const body = {
        code: form.code.toUpperCase(),
        name: form.name,
        symbol: form.symbol,
        flag: form.flag,
        sortOrder: parseInt(form.sortOrder) || 0,
        isActive: form.isActive,
      }
      let res: Response
      if (editing) {
        res = await fetch(`/api/currencies/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/currencies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }
      toast({
        title: editing ? 'Moneda actualizada' : 'Moneda creada',
        description: editing ? 'Los cambios se guardaron correctamente' : 'La nueva moneda fue creada',
      })
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
      const res = await fetch(`/api/currencies/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al eliminar')
      }
      toast({ title: 'Moneda eliminada', description: 'La moneda fue eliminada correctamente' })
      setDeleteTarget(null)
      fetchItems()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (item: CurrencyItem) => {
    try {
      setTogglingId(item.id)
      const res = await fetch(`/api/currencies/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al actualizar')
      }
      toast({
        title: item.isActive ? 'Moneda desactivada' : 'Moneda activada',
        description: `${item.code} - ${item.name}`,
      })
      fetchItems()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido', variant: 'destructive' })
    } finally {
      setTogglingId(null)
    }
  }

  const sortedItems = React.useMemo(
    () => [...items].sort((a, b) => a.sortOrder - b.sortOrder),
    [items],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Monedas</h2>
          <p className="text-muted-foreground">Gestiona las monedas disponibles en la plataforma</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={openCreate}>
          <Plus className="mr-2 size-4" /> Nueva Moneda
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bandera</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead className="hidden sm:table-cell">Nombre</TableHead>
                      <TableHead>Símbolo</TableHead>
                      <TableHead className="hidden md:table-cell">Orden</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <span className="text-xl leading-none">{item.flag}</span>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold">{item.code}</code>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell font-medium">{item.name}</TableCell>
                        <TableCell className="text-sm">{item.symbol}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{item.sortOrder}</TableCell>
                        <TableCell>
                          <Switch
                            checked={item.isActive}
                            onCheckedChange={() => handleToggleActive(item)}
                            disabled={togglingId === item.id}
                            className="cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => openEdit(item)}>
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-red-500 hover:text-red-600 cursor-pointer"
                              onClick={() => setDeleteTarget(item)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Coins className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">No se encontraron monedas</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Moneda' : 'Nueva Moneda'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Modifica los datos de la moneda' : 'Completa los datos para crear una nueva moneda'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cur-code">Código *</Label>
                <Input
                  id="cur-code"
                  value={form.code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="CLP"
                  maxLength={3}
                  className="uppercase font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cur-symbol">Símbolo</Label>
                <Input
                  id="cur-symbol"
                  value={form.symbol}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                  placeholder="$"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cur-name">Nombre *</Label>
              <Input
                id="cur-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Peso Chileno"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cur-flag">Bandera (emoji)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="cur-flag"
                    value={form.flag}
                    onChange={(e) => setForm({ ...form, flag: e.target.value })}
                    placeholder="🇨🇱"
                    className="text-xl text-center"
                  />
                  <span className="text-2xl shrink-0">{form.flag || ''}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cur-order">Orden</Label>
                <Input
                  id="cur-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                id="cur-active"
                className="cursor-pointer"
              />
              <Label htmlFor="cur-active">Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editing ? 'Guardar Cambios' : 'Crear Moneda'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar moneda?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>{deleteTarget?.flag} {deleteTarget?.code}</strong> - {deleteTarget?.name}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
