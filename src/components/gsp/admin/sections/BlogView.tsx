'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, Search, Loader2, FileText, Sparkles, Upload } from 'lucide-react'
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

interface BlogPost {
  id: string
  title: string
  slug: string
  category: string
  tags: string
  excerpt: string
  content: string
  coverImageUrl: string
  status: string
  featured: boolean
  readingTime: number
  seoTitle: string
  seoDescription: string
  publishedAt: string
  views: number
}

interface BlogFormState {
  title: string
  slug: string
  category: string
  tags: string
  excerpt: string
  content: string
  coverImageUrl: string
  status: string
  featured: boolean
  readingTime: string
  seoTitle: string
  seoDescription: string
}

const emptyForm: BlogFormState = {
  title: '', slug: '', category: 'educacion', tags: '', excerpt: '', content: '',
  coverImageUrl: '', status: 'draft', featured: false, readingTime: '5',
  seoTitle: '', seoDescription: '',
}

const categoryLabels: Record<string, string> = {
  educacion: 'Educación', inversiones: 'Inversiones', mercado: 'Mercado',
  normativas: 'Normativas', noticias: 'Noticias', plataforma: 'Plataforma',
}

const statusConfig: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200/60',
  published: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/60',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200/60',
}
const statusLabels: Record<string, string> = {
  draft: 'Borrador', published: 'Publicado', archived: 'Archivado',
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function BlogView() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [form, setForm] = useState<BlogFormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [generating, setGenerating] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterCategory !== 'all') params.set('category', filterCategory)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      const res = await fetch(`/api/admin/blog?${params}`)
      if (!res.ok) throw new Error('Error al cargar artículos')
      const data = await res.json()
      setPosts(data.posts || data || [])
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar los artículos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [search, filterCategory, filterStatus, toast])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (post: BlogPost) => {
    setEditing(post)
    setForm({
      title: post.title ?? '', slug: post.slug ?? '', category: post.category ?? 'educacion', tags: post.tags ?? '',
      excerpt: post.excerpt ?? '', content: post.content ?? '', coverImageUrl: post.coverImageUrl ?? '',
      status: post.status ?? 'draft', featured: post.featured ?? false,
      readingTime: post.readingTime != null ? String(post.readingTime) : '5',
      seoTitle: post.seoTitle ?? '', seoDescription: post.seoDescription ?? '',
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
        setForm(prev => ({ ...prev, coverImageUrl: data.url }))
        toast({ title: 'Imagen subida', description: 'La imagen se ha cargado correctamente' })
      } else {
        toast({ title: 'Error', description: 'No se pudo subir la imagen', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Error al subir la imagen', variant: 'destructive' })
    }
  }

  const handleAIGenerate = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Error', description: 'El título es necesario para generar con IA', variant: 'destructive' })
      return
    }
    try {
      setGenerating(true)
      const res = await fetch('/api/admin/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          tags: form.tags,
          excerpt: form.excerpt,
          locale: 'es',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al generar contenido')
      setForm(prev => ({
        ...prev,
        content: data.content ?? prev.content,
        seoTitle: data.seoTitle ?? prev.seoTitle,
        seoDescription: data.seoDescription ?? prev.seoDescription,
        readingTime: data.readingTime != null ? String(data.readingTime) : prev.readingTime,
      }))
      toast({ title: 'Contenido generado', description: 'El contenido ha sido generado por IA exitosamente' })
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error al generar con IA', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Error', description: 'El título es obligatorio', variant: 'destructive' })
      return
    }
    try {
      setSubmitting(true)
      const body = {
        title: form.title,
        slug: form.slug || generateSlug(form.title),
        category: form.category,
        tags: form.tags,
        excerpt: form.excerpt,
        content: form.content,
        coverImageUrl: form.coverImageUrl,
        status: form.status,
        featured: form.featured,
        readingTime: parseInt(form.readingTime) || 5,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
      }
      let res: Response
      if (editing) {
        res = await fetch(`/api/admin/blog/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/blog', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      }
      if (!res.ok) throw new Error('Error al guardar')
      toast({ title: editing ? 'Artículo actualizado' : 'Artículo creado' })
      setFormOpen(false)
      fetchPosts()
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
      const res = await fetch(`/api/admin/blog/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      toast({ title: 'Artículo eliminado' })
      setDeleteTarget(null)
      fetchPosts()
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
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Blog</h2>
          <p className="text-muted-foreground">Gestiona los artículos del blog</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={openCreate}>
          <Plus className="mr-2 size-4" /> Nuevo Artículo
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar artículos..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
            <SelectItem value="archived">Archivado</SelectItem>
          </SelectContent>
        </Select>
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
                      <TableHead className="hidden sm:table-cell">Categoría</TableHead>
                      <TableHead className="hidden md:table-cell">Estado</TableHead>
                      <TableHead className="hidden lg:table-cell">Publicado</TableHead>
                      <TableHead className="hidden lg:table-cell">Vistas</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="font-medium">{post.title ?? ''}</div>
                          {post.featured && <Badge variant="outline" className="mt-1 text-xs text-primary border-primary/30">Destacado</Badge>}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary">{categoryLabels[post.category] ?? post.category}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className={statusConfig[post.status] ?? ''}>
                            {statusLabels[post.status] ?? post.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US') : '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{post.views ?? 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="size-8 cursor-pointer" onClick={() => openEdit(post)}><Pencil className="size-4" /></Button>
                            <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-600 cursor-pointer" onClick={() => setDeleteTarget(post)}><Trash2 className="size-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {posts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No se encontraron artículos</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Artículo' : 'Nuevo Artículo'}</DialogTitle>
            <DialogDescription>{editing ? 'Modifica los datos del artículo' : 'Completa los datos para crear un artículo'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="b-title">Título *</Label>
                <Input id="b-title" value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : generateSlug(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-slug">Slug</Label>
                <Input id="b-slug" value={form.slug ?? ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="b-cat">Categoría</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-status">Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-time">Tiempo de Lectura (min)</Label>
                <Input id="b-time" type="number" value={form.readingTime ?? ''} onChange={(e) => setForm({ ...form, readingTime: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-tags">Etiquetas (separadas por coma)</Label>
              <Input id="b-tags" value={form.tags ?? ''} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-cover">URL Imagen de Portada</Label>
              <div className="flex gap-2">
                <Input id="b-cover" value={form.coverImageUrl ?? ''} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className="flex-1" />
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
              {form.coverImageUrl && (
                <div className="mt-2">
                  <img src={form.coverImageUrl} alt="Preview" className="h-24 w-auto rounded-md border object-cover" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-excerpt">Extracto</Label>
              <Textarea id="b-excerpt" value={form.excerpt ?? ''} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2 cursor-pointer border-primary/30 text-primary hover:bg-primary/10"
                onClick={handleAIGenerate}
                disabled={generating}
              >
                {generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {generating ? 'Generando...' : 'Generar con IA'}
              </Button>
              <span className="text-xs text-muted-foreground">Genera contenido, SEO y tiempo de lectura basado en el título y extracto</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-content">Contenido</Label>
              <Textarea id="b-content" value={form.content ?? ''} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} id="b-featured" />
              <Label htmlFor="b-featured">Destacado</Label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="b-seotitle">SEO Título</Label>
                <Input id="b-seotitle" value={form.seoTitle ?? ''} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-seodesc">SEO Descripción</Label>
                <Textarea id="b-seodesc" value={form.seoDescription ?? ''} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} rows={2} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editing ? 'Guardar Cambios' : 'Crear Artículo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente &quot;{deleteTarget?.title}&quot;. No se puede deshacer.
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
