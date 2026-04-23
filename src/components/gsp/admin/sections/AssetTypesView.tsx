'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2, Layers } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

interface AssetTypeItem {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  color: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface AssetTypeFormState {
  name: string
  slug: string
  icon: string
  description: string
  color: string
  sortOrder: string
  isActive: boolean
}

const emptyForm: AssetTypeFormState = {
  name: '', slug: '', icon: '', description: '', color: '#059669', sortOrder: '0', isActive: true,
}

const presetColors = [
  '#059669', '#0891b2', '#7c3aed', '#dc2626', '#ea580c',
  '#ca8a04', '#65a30d', '#0284c7', '#be185d', '#475569',
]

export function AssetTypesView() {
  const [items, setItems] = useState<AssetTypeItem[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AssetTypeItem | null>(null)
  const [form, setForm] = useState<AssetTypeFormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<AssetTypeItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToast()

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/asset-types')
      if (!res.ok) throw new Error('Error al cargar tipos de activo')
      const data = await res.json()
      setItems(data.assetTypes || [])
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar los tipos de activo', variant: 'destructive' })
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

  const openEdit = (item: AssetTypeItem) => {
    setEditing(item)
    setForm({
      name: item.name,
      slug: item.slug,
      icon: item.icon || '',
      description: item.description || '',
      color: item.color || '#059669',
      sortOrder: item.sortOrder.toString(),
      isActive: item.isActive,
    })
    setFormOpen(true)
  }

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    setForm({ ...form, name, slug: editing ? form.slug : slug })
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: 'Error', description: 'El nombre y el slug son obligatorios', variant: 'destructive' })
      return
    }
    try {
      setSubmitting(true)
      const body = {
        name: form.name,
        slug: form.slug,
        icon: form.icon || null,
        description: form.description || null,
        color: form.color || '#059669',
        sortOrder: parseInt(form.sortOrder) || 0,
        isActive: form.isActive,
      }
      let res: Response
      if (editing) {
        res = await fetch(`/api/admin/asset-types/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/asset-types', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      }
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }
      toast({ title: editing ? 'Tipo de activo actualizado' : 'Tipo de activo creado', description: editing ? 'Los cambios se guardaron correctamente' : 'El nuevo tipo de activo fue creado' })
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
      const res = await fetch(`/api/admin/asset-types/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al eliminar')
      }
      toast({ title: 'Tipo de activo eliminado', description: 'El tipo de activo fue eliminado correctamente' })
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
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Tipos de Activo</h2>
          <p className="text-muted-foreground">Gestiona las categorías de activos de la plataforma</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={openCreate}>
          <Plus className="mr-2 size-4" /> Nuevo Tipo
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
                      <TableHead className="hidden sm:table-cell">Slug</TableHead>
                      <TableHead className="hidden md:table-cell">Color</TableHead>
                      <TableHead className="hidden md:table-cell">Orden</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{item.slug}</code>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div
                              className="size-5 rounded-full border border-border/50 shrink-0"
                              style={{ backgroundColor: item.color || '#059669' }}
                            />
                            <span className="text-xs text-muted-foreground">{item.color}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{item.sortOrder}</TableCell>
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
                  <Layers className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">No se encontraron tipos de activo</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Tipo de Activo' : 'Nuevo Tipo de Activo'}</DialogTitle>
            <DialogDescription>{editing ? 'Modifica los datos del tipo de activo' : 'Completa los datos para crear un nuevo tipo de activo'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="at-name">Nombre *</Label>
                <Input id="at-name" value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Ej: Inmuebles" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="at-slug">Slug *</Label>
                <Input id="at-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Ej: real_estate" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="at-icon">Icono (nombre Lucide)</Label>
              <Input id="at-icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Ej: Building2, Server, Truck" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="at-desc">Descripción</Label>
              <Textarea id="at-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Descripción breve del tipo de activo" />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="h-9 w-12 shrink-0 cursor-pointer p-1"
                />
                <Input
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="#059669"
                  className="flex-1"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`size-6 rounded-full border-2 transition-all cursor-pointer ${
                      form.color === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setForm({ ...form, color: c })}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="at-order">Orden</Label>
              <Input id="at-order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} id="at-active" />
              <Label htmlFor="at-active">Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editing ? 'Guardar Cambios' : 'Crear Tipo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tipo de activo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{deleteTarget?.name}&quot;. Esta acción no se puede deshacer.
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
    </div>
  )
}
