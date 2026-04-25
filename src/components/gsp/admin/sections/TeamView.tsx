'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, Loader2, UsersRound, Upload } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  photoUrl: string
  linkedinUrl: string
  sortOrder: number
  isActive: boolean
}

interface TeamFormState {
  name: string
  role: string
  bio: string
  photoUrl: string
  linkedinUrl: string
  sortOrder: string
  isActive: boolean
}

const emptyForm: TeamFormState = {
  name: '', role: '', bio: '', photoUrl: '', linkedinUrl: '', sortOrder: '0', isActive: true,
}

export function TeamView() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [form, setForm] = useState<TeamFormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/team')
      if (!res.ok) throw new Error('Error al cargar miembros')
      const data = await res.json()
      setMembers(data.members || data || [])
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar el equipo', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (member: TeamMember) => {
    setEditing(member)
    setForm({
      name: member.name ?? '', role: member.role ?? '', bio: member.bio ?? '',
      photoUrl: member.photoUrl ?? '', linkedinUrl: member.linkedinUrl ?? '',
      sortOrder: member.sortOrder != null ? String(member.sortOrder) : '0', isActive: member.isActive ?? true,
    })
    setFormOpen(true)
  }

  const handleImageUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setForm(prev => ({ ...prev, photoUrl: data.url }))
        toast({ title: 'Imagen subida', description: 'La foto se ha cargado correctamente' })
      } else {
        toast({ title: 'Error', description: 'No se pudo subir la imagen', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Error al subir la imagen', variant: 'destructive' })
    }
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Error', description: 'El nombre es obligatorio', variant: 'destructive' })
      return
    }
    try {
      setSubmitting(true)
      const body = {
        name: form.name, role: form.role, bio: form.bio,
        photoUrl: form.photoUrl, linkedinUrl: form.linkedinUrl,
        sortOrder: parseInt(form.sortOrder) || 0, isActive: form.isActive,
      }
      let res: Response
      if (editing) {
        res = await fetch(`/api/admin/team/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/team', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      }
      if (!res.ok) throw new Error('Error al guardar')
      toast({ title: editing ? 'Miembro actualizado' : 'Miembro creado' })
      setFormOpen(false)
      fetchMembers()
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
      const res = await fetch(`/api/admin/team/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      toast({ title: 'Miembro eliminado' })
      setDeleteTarget(null)
      fetchMembers()
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
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Equipo</h2>
          <p className="text-muted-foreground">Gestiona los miembros del equipo</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={openCreate}>
          <Plus className="mr-2 size-4" /> Nuevo Miembro
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
                      <TableHead className="hidden md:table-cell">Bio</TableHead>
                      <TableHead className="hidden md:table-cell">Orden</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">{member.role}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[250px] truncate">{member.bio}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{member.sortOrder}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={member.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-600 border-gray-200/60 dark:bg-gray-900/30 dark:text-gray-400'
                          }>
                            {member.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => openEdit(member)}><Pencil className="size-4" /></Button>
                            <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-600 cursor-pointer" onClick={() => setDeleteTarget(member)}><Trash2 className="size-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {members.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <UsersRound className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No se encontraron miembros</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Miembro' : 'Nuevo Miembro'}</DialogTitle>
            <DialogDescription>{editing ? 'Modifica los datos' : 'Agrega un nuevo miembro'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tm-name">Nombre *</Label>
                <Input id="tm-name" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tm-role">Rol / Cargo</Label>
                <Input id="tm-role" value={form.role ?? ''} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tm-bio">Biografía</Label>
              <Textarea id="tm-bio" value={form.bio ?? ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tm-photo">URL Foto</Label>
                <div className="flex gap-2">
                  <Input id="tm-photo" value={form.photoUrl ?? ''} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} className="flex-1" />
                  <Button type="button" variant="outline" size="icon" className="shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="size-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                      e.target.value = ''
                    }}
                  />
                </div>
                {form.photoUrl && (
                  <div className="mt-2">
                    <img src={form.photoUrl} alt="Preview" className="h-20 w-20 rounded-md border object-cover" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tm-linkedin">URL LinkedIn</Label>
                <Input id="tm-linkedin" value={form.linkedinUrl ?? ''} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tm-order">Orden</Label>
                <Input id="tm-order" type="number" value={form.sortOrder ?? ''} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} id="tm-active" />
                <Label htmlFor="tm-active">Activo</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editing ? 'Guardar Cambios' : 'Crear Miembro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
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
