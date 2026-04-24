'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2, Quote, Star, CheckCircle2, XCircle, Upload } from 'lucide-react'
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

interface Testimonial {
  id: string
  name: string
  role: string
  avatarUrl: string
  quote: string
  rating: number
  investmentAmount: number
  assetName: string
  isFeatured: boolean
  isVerified: boolean
  status: string
}

interface TestimonialFormState {
  name: string
  role: string
  avatarUrl: string
  quote: string
  rating: string
  investmentAmount: string
  assetName: string
  isFeatured: boolean
  isVerified: boolean
  status: string
}

const emptyForm: TestimonialFormState = {
  name: '', role: '', avatarUrl: '', quote: '', rating: '5',
  investmentAmount: '', assetName: '', isFeatured: false, isVerified: false, status: 'pending',
}

const statusConfig: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200/60',
  approved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/60',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200/60',
}
const statusLabels: Record<string, string> = { pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado' }

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

export function TestimonialsView() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState<TestimonialFormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToast()

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/testimonials')
      if (!res.ok) throw new Error('Error al cargar testimonios')
      const data = await res.json()
      setItems(data.testimonials || data || [])
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar los testimonios', variant: 'destructive' })
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

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setForm({ ...form, avatarUrl: data.url })
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo subir la imagen', variant: 'destructive' })
    }
  }

  const openEdit = (item: Testimonial) => {
    setEditing(item)
    setForm({
      name: item.name ?? '', role: item.role ?? '', avatarUrl: item.avatarUrl ?? '', quote: item.quote ?? '',
      rating: item.rating != null ? String(item.rating) : '5',
      investmentAmount: item.investmentAmount != null ? String(item.investmentAmount) : '',
      assetName: item.assetName ?? '', isFeatured: item.isFeatured ?? false, isVerified: item.isVerified ?? false,
      status: item.status ?? 'pending',
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.quote.trim()) {
      toast({ title: 'Error', description: 'Nombre y testimonio son obligatorios', variant: 'destructive' })
      return
    }
    try {
      setSubmitting(true)
      const body = {
        name: form.name, role: form.role, avatarUrl: form.avatarUrl, quote: form.quote,
        rating: parseInt(form.rating) || 5,
        investmentAmount: parseFloat(form.investmentAmount) || 0,
        assetName: form.assetName, isFeatured: form.isFeatured, isVerified: form.isVerified,
        status: form.status,
      }
      let res: Response
      if (editing) {
        res = await fetch(`/api/admin/testimonials/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/testimonials', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      }
      if (!res.ok) throw new Error('Error al guardar')
      toast({ title: editing ? 'Testimonio actualizado' : 'Testimonio creado' })
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
      const res = await fetch(`/api/admin/testimonials/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      toast({ title: 'Testimonio eliminado' })
      setDeleteTarget(null)
      fetchItems()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error desconocido', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (item: Testimonial, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: newStatus }),
      })
      if (!res.ok) throw new Error('Error al actualizar estado')
      toast({ title: `Testimonio ${newStatus === 'approved' ? 'aprobado' : 'rechazado'}` })
      fetchItems()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Testimonios</h2>
          <p className="text-muted-foreground">Gestiona los testimonios de inversores</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={openCreate}>
          <Plus className="mr-2 size-4" /> Nuevo Testimonio
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
                      <TableHead className="hidden sm:table-cell">Rol</TableHead>
                      <TableHead className="hidden md:table-cell">Testimonio</TableHead>
                      <TableHead className="hidden lg:table-cell">Rating</TableHead>
                      <TableHead className="hidden lg:table-cell">Activo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.isVerified && <CheckCircle2 className="size-3.5 text-primary shrink-0" />}
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{item.role}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">{item.quote}</TableCell>
                        <TableCell className="hidden lg:table-cell"><RatingStars rating={item.rating} /></TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {item.isFeatured && <Badge variant="outline" className="text-xs text-primary border-primary/30">Destacado</Badge>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusConfig[item.status] || ''}>
                            {statusLabels[item.status] || item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {item.status === 'pending' && (
                              <>
                                <Button variant="ghost" size="icon" className="size-8 text-emerald-600 hover:text-emerald-700 cursor-pointer" onClick={() => handleStatusChange(item, 'approved')}>
                                  <CheckCircle2 className="size-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-600 cursor-pointer" onClick={() => handleStatusChange(item, 'rejected')}>
                                  <XCircle className="size-4" />
                                </Button>
                              </>
                            )}
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
                  <Quote className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No se encontraron testimonios</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Testimonio' : 'Nuevo Testimonio'}</DialogTitle>
            <DialogDescription>{editing ? 'Modifica los datos' : 'Agrega un nuevo testimonio'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="t-name">Nombre *</Label>
                <Input id="t-name" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-role">Rol / Ocupación</Label>
                <Input id="t-role" value={form.role ?? ''} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-avatar">URL Avatar</Label>
              <div className="flex gap-2">
                <Input id="t-avatar" className="flex-1" value={form.avatarUrl ?? ''} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} />
                <Button type="button" variant="outline" size="sm" className="shrink-0 cursor-pointer" onClick={() => document.getElementById('upload-input')?.click()}>
                  <Upload className="size-4 mr-1" />Subir
                </Button>
                <input id="upload-input" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
              </div>
              {form.avatarUrl && (
                <div className="mt-1">
                  <img src={form.avatarUrl} alt="Avatar preview" className="size-12 rounded-full object-cover border" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-quote">Testimonio *</Label>
              <Textarea id="t-quote" value={form.quote ?? ''} onChange={(e) => setForm({ ...form, quote: e.target.value })} rows={4} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="t-rating">Rating</Label>
                <Select value={form.rating} onValueChange={(v) => setForm({ ...form, rating: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? 'estrella' : 'estrellas'}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-amount">Monto Invertido (USD)</Label>
                <Input id="t-amount" type="number" value={form.investmentAmount ?? ''} onChange={(e) => setForm({ ...form, investmentAmount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-asset">Nombre del Activo</Label>
                <Input id="t-asset" value={form.assetName ?? ''} onChange={(e) => setForm({ ...form, assetName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-status">Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} id="t-featured" />
                <Label htmlFor="t-featured">Destacado</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isVerified} onCheckedChange={(v) => setForm({ ...form, isVerified: v })} id="t-verified" />
                <Label htmlFor="t-verified">Verificado</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editing ? 'Guardar Cambios' : 'Crear Testimonio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar testimonio?</AlertDialogTitle>
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
