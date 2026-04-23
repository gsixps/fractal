'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2, Mail } from 'lucide-react'
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

interface EmailTemplate {
  id: string
  name: string
  subject: string
  bodyHtml: string
  bodyText: string
  variables: string
  category: string
  isActive: boolean
}

interface EmailTemplateFormState {
  name: string
  subject: string
  bodyHtml: string
  bodyText: string
  category: string
  isActive: boolean
}

const emptyForm: EmailTemplateFormState = {
  name: '', subject: '', bodyHtml: '', bodyText: '', category: 'transactional', isActive: true,
}

const categoryLabels: Record<string, string> = {
  transactional: 'Transaccional',
  marketing: 'Marketing',
  notification: 'Notificación',
  onboarding: 'Onboarding',
  security: 'Seguridad',
}

export function EmailTemplatesView() {
  const [items, setItems] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<EmailTemplate | null>(null)
  const [form, setForm] = useState<EmailTemplateFormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToast()

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/email-templates')
      if (!res.ok) throw new Error('Error al cargar plantillas')
      const data = await res.json()
      setItems(data.templates || data || [])
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las plantillas', variant: 'destructive' })
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

  const openEdit = (item: EmailTemplate) => {
    setEditing(item)
    setForm({
      name: item.name, subject: item.subject, bodyHtml: item.bodyHtml,
      bodyText: item.bodyText, category: item.category, isActive: item.isActive,
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.subject.trim()) {
      toast({ title: 'Error', description: 'Nombre y asunto son obligatorios', variant: 'destructive' })
      return
    }
    try {
      setSubmitting(true)
      const body = {
        name: form.name, subject: form.subject, bodyHtml: form.bodyHtml,
        bodyText: form.bodyText, category: form.category, isActive: form.isActive,
      }
      let res: Response
      if (editing) {
        res = await fetch(`/api/admin/email-templates/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/email-templates', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      }
      if (!res.ok) throw new Error('Error al guardar')
      toast({ title: editing ? 'Plantilla actualizada' : 'Plantilla creada' })
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
      const res = await fetch(`/api/admin/email-templates/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      toast({ title: 'Plantilla eliminada' })
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
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Plantillas de Email</h2>
          <p className="text-muted-foreground">Gestiona las plantillas de correo electrónico</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={openCreate}>
          <Plus className="mr-2 size-4" /> Nueva Plantilla
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
                      <TableHead className="hidden sm:table-cell">Asunto</TableHead>
                      <TableHead className="hidden md:table-cell">Categoría</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className="cursor-pointer" onClick={() => openEdit(item)}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm max-w-[250px] truncate">{item.subject}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">{categoryLabels[item.category] || item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={item.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-600 border-gray-200/60 dark:bg-gray-900/30 dark:text-gray-400'
                          }>
                            {item.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                  <Mail className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No se encontraron plantillas</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Plantilla' : 'Nueva Plantilla'}</DialogTitle>
            <DialogDescription>{editing ? 'Modifica la plantilla' : 'Crea una nueva plantilla de email'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="et-name">Nombre *</Label>
                <Input id="et-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="et-subject">Asunto *</Label>
                <Input id="et-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="et-cat">Categoría</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {editing && editing.variables && (
              <div className="space-y-2">
                <Label>Variables Disponibles</Label>
                <Input value={editing.variables} readOnly className="bg-muted font-mono text-xs" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="et-html">Cuerpo HTML</Label>
              <Textarea id="et-html" value={form.bodyHtml} onChange={(e) => setForm({ ...form, bodyHtml: e.target.value })} rows={8} className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="et-text">Cuerpo Texto Plano</Label>
              <Textarea id="et-text" value={form.bodyText} onChange={(e) => setForm({ ...form, bodyText: e.target.value })} rows={6} className="font-mono text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} id="et-active" />
              <Label htmlFor="et-active">Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editing ? 'Guardar Cambios' : 'Crear Plantilla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
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
