'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  Globe,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowLeft,
  Save,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/lib/store'

interface CmsPageItem {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  icon: string
  sortOrder: number
  isPublished: boolean
  updatedAt: string
}

interface CmsPageForm {
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  icon: string
  sortOrder: string
  isPublished: boolean
  seoTitle: string
  seoDescription: string
}

const emptyForm: CmsPageForm = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  category: 'company',
  icon: 'FileText',
  sortOrder: '0',
  isPublished: true,
  seoTitle: '',
  seoDescription: '',
}

const CATEGORY_LABELS: Record<string, string> = {
  company: 'Empresa',
  legal: 'Legal',
  support: 'Soporte',
  other: 'Otro',
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function CmsPagesView() {
  const navigateCmsPage = useAppStore((s) => s.navigateCmsPage)
  const navigate = useAppStore((s) => s.navigate)
  const { toast } = useToast()

  // List state
  const [pages, setPages] = useState<CmsPageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // Editor state
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<CmsPageForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<CmsPageItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ all: 'true' })
      if (filterCategory !== 'all') params.set('category', filterCategory)
      const res = await fetch(`/api/cms/pages?${params}`)
      if (!res.ok) throw new Error('Error al cargar páginas')
      const data = await res.json()
      setPages(data.pages || [])
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las páginas', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [filterCategory, toast])

  useEffect(() => { fetchPages() }, [fetchPages])

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setForm(emptyForm)
    setEditing(false)
  }

  const openEdit = async (page: CmsPageItem) => {
    try {
      const res = await fetch(`/api/cms/pages/${page.slug}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      const p = data.page
      setForm({
        title: p.title,
        slug: p.slug,
        content: p.content || '',
        excerpt: p.excerpt || '',
        category: p.category || 'company',
        icon: p.icon || 'FileText',
        sortOrder: String(p.sortOrder ?? 0),
        isPublished: p.isPublished,
        seoTitle: p.seoTitle || '',
        seoDescription: p.seoDescription || '',
      })
      setEditing(true)
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar la página', variant: 'destructive' })
    }
  }

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: editing ? prev.slug : generateSlug(title),
    }))
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast({ title: 'Error', description: 'Título y slug son obligatorios', variant: 'destructive' })
      return
    }

    try {
      setSubmitting(true)
      const body = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        content: form.content,
        excerpt: form.excerpt,
        category: form.category,
        icon: form.icon,
        sortOrder: parseInt(form.sortOrder) || 0,
        isPublished: form.isPublished,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
      }

      let res: Response
      if (editing) {
        // Need to send original slug for lookup
        const originalSlug = pages.find((p) => p.id && form.title)?.slug || form.slug
        res = await fetch(`/api/cms/pages/${form.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/cms/pages', {
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
        title: editing ? 'Página actualizada' : 'Página creada',
        description: editing ? 'Los cambios se guardaron correctamente' : 'La nueva página fue creada',
      })
      setForm(emptyForm)
      setEditing(false)
      fetchPages()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error desconocido',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/cms/pages/${deleteTarget.slug}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al eliminar')
      }
      toast({ title: 'Página eliminada', description: 'La página fue eliminada correctamente' })
      setDeleteTarget(null)
      fetchPages()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error desconocido',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const previewPage = (slug: string) => {
    navigateCmsPage(slug)
  }

  // --- Editor Panel (create/edit) ---
  if (editing || (!editing && form.title === '' && form.slug === '' && false)) {
    // Always render the list unless in edit mode
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Páginas del Sitio</h2>
          <p className="text-muted-foreground">
            Gestiona las páginas estáticas: información legal, sobre nosotros, ayuda, etc.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPages}>
            <RefreshCw className="mr-2 size-4" /> Actualizar
          </Button>
          <Button
            onClick={openCreate}
            disabled={editing || form.title !== ''}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="mr-2 size-4" /> Nueva Página
          </Button>
        </div>
      </div>

      {/* Editor Panel - shown when creating or editing */}
      {(editing || (form.title === '' && !editing)) && (
        <>
          {!editing && form.title === '' ? null : (
            <Card className="border-emerald-200 dark:border-emerald-800/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="size-4 text-emerald-600" />
                    {editing ? `Editando: ${form.title}` : 'Nueva Página'}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setForm(emptyForm)
                      setEditing(false)
                    }}
                  >
                    <ArrowLeft className="mr-2 size-4" /> Cancelar
                  </Button>
                </div>
                <CardDescription>
                  {editing
                    ? 'Modifica el contenido de la página y guarda los cambios.'
                    : 'Completa los campos para crear una nueva página en el sitio.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="cms-title">Título *</Label>
                    <Input
                      id="cms-title"
                      placeholder="Ej: Sobre Nosotros"
                      value={form.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                    />
                  </div>
                  {/* Slug */}
                  <div className="space-y-2">
                    <Label htmlFor="cms-slug">URL Slug *</Label>
                    <Input
                      id="cms-slug"
                      placeholder="sobre-nosotros"
                      value={form.slug}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, '-')
                            .replace(/-+/g, '-')
                            .replace(/^-|-$/g, ''),
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      URL: /paginas/<span className="font-mono">{form.slug || '...'}</span>
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm((prev) => ({ ...prev, category: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Order */}
                  <div className="space-y-2">
                    <Label htmlFor="cms-order">Orden</Label>
                    <Input
                      id="cms-order"
                      type="number"
                      min={0}
                      value={form.sortOrder}
                      onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                    />
                  </div>
                  {/* Published */}
                  <div className="flex items-end gap-3 pb-1">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={form.isPublished}
                        onCheckedChange={(v) => setForm((prev) => ({ ...prev, isPublished: v }))}
                      />
                      <Label className="text-sm">
                        {form.isPublished ? 'Publicada' : 'Borrador'}
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label htmlFor="cms-excerpt">Extracto</Label>
                  <Input
                    id="cms-excerpt"
                    placeholder="Breve descripción de la página (opcional)"
                    value={form.excerpt}
                    onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                  />
                </div>

                {/* Content Editor */}
                <div className="space-y-2">
                  <Label htmlFor="cms-content">Contenido (HTML) *</Label>
                  <p className="text-xs text-muted-foreground">
                    Puedes usar etiquetas HTML para dar formato: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;a&gt;, etc.
                  </p>
                  <Textarea
                    id="cms-content"
                    placeholder="<h2>Sección Principal</h2>
<p>Contenido de la página...</p>"
                    value={form.content}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                    className="min-h-[300px] font-mono text-sm"
                  />
                  {/* Content Preview */}
                  {form.content && (
                    <div className="mt-3 rounded-lg border p-4">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Vista previa del contenido:
                      </p>
                      <div
                        className="prose prose-slate prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: form.content }}
                      />
                    </div>
                  )}
                </div>

                {/* SEO Section */}
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    SEO (Opcional)
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cms-seo-title" className="text-xs">
                        Meta Title
                      </Label>
                      <Input
                        id="cms-seo-title"
                        placeholder="Título para buscadores"
                        value={form.seoTitle}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, seoTitle: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cms-seo-desc" className="text-xs">
                        Meta Description
                      </Label>
                      <Input
                        id="cms-seo-desc"
                        placeholder="Descripción para buscadores"
                        value={form.seoDescription}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, seoDescription: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setForm(emptyForm)
                      setEditing(false)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !form.title.trim() || !form.slug.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {submitting ? (
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 size-4" />
                    )}
                    {editing ? 'Guardar Cambios' : 'Crear Página'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Create button prompt when no editor is open */}
      {!editing && form.title === '' && (
        <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Globe className="mb-3 size-10 text-muted-foreground/40" />
            <p className="mb-1 text-sm font-medium text-muted-foreground">Gestor de Páginas</p>
            <p className="mb-4 text-xs text-muted-foreground/60">
              Edita páginas existentes o crea nuevas secciones para el sitio
            </p>
            <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 size-4" /> Crear Nueva Página
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar páginas..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pages List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredPages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-10">
            <AlertCircle className="mb-3 size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {search || filterCategory !== 'all'
                ? 'No se encontraron páginas con los filtros aplicados'
                : 'No hay páginas creadas aún'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredPages.map((page) => (
            <Card key={page.id} className="hover:border-primary/20 transition-colors">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                  <Globe className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold">{page.title}</h3>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {CATEGORY_LABELS[page.category] || page.category}
                    </Badge>
                    {!page.isPublished && (
                      <Badge variant="secondary" className="shrink-0 gap-1 text-[10px]">
                        <EyeOff className="size-3" /> Borrador
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    /paginas/{page.slug}
                    {page.excerpt && <span className="ml-2">— {page.excerpt}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0"
                    title="Vista previa"
                    onClick={() => previewPage(page.slug)}
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0"
                    title="Editar"
                    onClick={() => openEdit(page)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Eliminar"
                    onClick={() => setDeleteTarget(page)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar página?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente la página &quot;{deleteTarget?.title}&quot;. Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <RefreshCw className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
