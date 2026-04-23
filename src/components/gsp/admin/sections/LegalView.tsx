'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2, Scale } from 'lucide-react'
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

interface LegalDoc {
  id: string
  title: string
  slug: string
  type: string
  version: string
  effectiveDate: string
  isRequired: boolean
  isActive: boolean
  content: string
}

interface LegalFormState {
  title: string
  slug: string
  type: string
  version: string
  effectiveDate: string
  isRequired: boolean
  isActive: boolean
  content: string
}

const emptyForm: LegalFormState = {
  title: '', slug: '', type: 'terms', version: '1.0',
  effectiveDate: new Date().toISOString().split('T')[0],
  isRequired: false, isActive: true, content: '',
}

const typeLabels: Record<string, string> = {
  terms: 'Términos y Condiciones',
  privacy: 'Política de Privacidad',
  risk_disclosure: 'Descargo de Riesgo',
  contract_template: 'Plantilla de Contrato',
}

export function LegalView() {
  const [items, setItems] = useState<LegalDoc[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<LegalDoc | null>(null)
  const [form, setForm] = useState<LegalFormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<LegalDoc | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToast()

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/legal')
      if (!res.ok) throw new Error('Error al cargar documentos')
      const data = await res.json()
      setItems(data.documents || data || [])
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar los documentos', variant: 'destructive' })
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

  const openEdit = (item: LegalDoc) => {
    setEditing(item)
    setForm({
      title: item.title, slug: item.slug, type: item.type, version: item.version,
      effectiveDate: item.effectiveDate ? item.effectiveDate.split('T')[0] : '',
      isRequired: item.isRequired, isActive: item.isActive, content: item.content,
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Error', description: 'El título es obligatorio', variant: 'destructive' })
      return
    }
    try {
      setSubmitting(true)
      const body = {
        title: form.title, slug: form.slug, type: form.type, version: form.version,
        effectiveDate: form.effectiveDate, isRequired: form.isRequired,
        isActive: form.isActive, content: form.content,
      }
      let res: Response
      if (editing) {
        res = await fetch(`/api/admin/legal/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/legal', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      }
      if (!res.ok) throw new Error('Error al guardar')
      toast({ title: editing ? 'Documento actualizado' : 'Documento creado' })
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
      const res = await fetch(`/api/admin/legal/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      toast({ title: 'Documento eliminado' })
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
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Documentos Legales</h2>
          <p className="text-muted-foreground">Gestiona los documentos legales de la plataforma</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={openCreate}>
          <Plus className="mr-2 size-4" /> Nuevo Documento
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
                      <TableHead>Título</TableHead>
                      <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                      <TableHead className="hidden md:table-cell">Versión</TableHead>
                      <TableHead className="hidden md:table-cell">Vigencia</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary">{typeLabels[item.type] || item.type}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">v{item.version}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {item.effectiveDate ? new Date(item.effectiveDate).toLocaleDateString('es-CL') : '—'}
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
                  <Scale className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No se encontraron documentos</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Documento' : 'Nuevo Documento'}</DialogTitle>
            <DialogDescription>{editing ? 'Modifica los datos' : 'Agrega un nuevo documento legal'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="l-title">Título *</Label>
                <Input id="l-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="l-slug">Slug</Label>
                <Input id="l-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="l-type">Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="l-version">Versión</Label>
                <Input id="l-version" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="l-date">Fecha de Vigencia</Label>
                <Input id="l-date" type="date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.isRequired} onCheckedChange={(v) => setForm({ ...form, isRequired: v })} id="l-required" />
                <Label htmlFor="l-required">Obligatorio</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} id="l-active" />
                <Label htmlFor="l-active">Activo</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="l-content">Contenido</Label>
              <Textarea id="l-content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} className="font-mono text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editing ? 'Guardar Cambios' : 'Crear Documento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
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
