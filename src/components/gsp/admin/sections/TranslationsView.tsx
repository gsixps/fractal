'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Pencil, Trash2, Loader2, Search, Languages, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

interface TranslationRow {
  id: string
  key: string
  locale: string
  value: string
}

const localeLabels: Record<string, string> = {
  es: 'Español',
  en: 'Inglés',
}

const localeColors: Record<string, string> = {
  es: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40',
  en: 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800/40',
}

const ITEMS_PER_PAGE = 20

export function TranslationsView() {
  const [allTranslations, setAllTranslations] = useState<TranslationRow[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchKey, setSearchKey] = useState('')
  const [filterLocale, setFilterLocale] = useState('all')
  const [page, setPage] = useState(1)

  // Dialog states
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<TranslationRow | null>(null)
  const [editValue, setEditValue] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<TranslationRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToast()

  const fetchTranslations = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchKey) params.set('key', searchKey)
      if (filterLocale !== 'all') params.set('locale', filterLocale)
      params.set('limit', '500')

      const res = await fetch(`/api/admin/translations?${params}`)
      if (!res.ok) throw new Error('Error al cargar traducciones')
      const data = await res.json()
      setAllTranslations(data.translations || data || [])
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las traducciones', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [searchKey, filterLocale, toast])

  useEffect(() => { fetchTranslations() }, [fetchTranslations])
  useEffect(() => { setPage(1) }, [searchKey, filterLocale])

  // Client-side pagination
  const totalPages = Math.max(Math.ceil(allTranslations.length / ITEMS_PER_PAGE), 1)
  const paginatedTranslations = allTranslations.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  )

  // Group translations by key for display
  const translationsByKey = React.useMemo(() => {
    const grouped: Record<string, Record<string, TranslationRow>> = {}
    for (const t of paginatedTranslations) {
      if (!grouped[t.key]) grouped[t.key] = {}
      grouped[t.key][t.locale] = t
    }
    return grouped
  }, [paginatedTranslations])

  const uniqueKeys = React.useMemo(() => Object.keys(translationsByKey), [translationsByKey])

  const openEdit = (item: TranslationRow) => {
    setEditing(item)
    setEditValue(item.value)
    setEditOpen(true)
  }

  const handleSubmit = async () => {
    if (!editing) return
    try {
      setSubmitting(true)
      const res = await fetch(`/api/admin/translations/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: editValue }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }
      toast({ title: 'Traducción actualizada', description: 'El valor se actualizó correctamente' })
      setEditOpen(false)
      fetchTranslations()
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
      const res = await fetch(`/api/admin/translations/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al eliminar')
      }
      toast({ title: 'Traducción eliminada', description: 'La traducción fue eliminada correctamente' })
      setDeleteTarget(null)
      fetchTranslations()
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
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Traducciones</h2>
          <p className="text-muted-foreground">Gestiona las traducciones de la plataforma</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTranslations}>
          <Loader2 className={`mr-2 size-3 ${loading ? 'animate-spin' : 'hidden'}`} />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por clave..."
            className="pl-9"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />
        </div>
        <Select value={filterLocale} onValueChange={setFilterLocale}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Idioma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los idiomas</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="en">Inglés</SelectItem>
          </SelectContent>
        </Select>
        {(searchKey || filterLocale !== 'all') && (
          <Button variant="ghost" size="icon" className="size-10 shrink-0 cursor-pointer" onClick={() => { setSearchKey(''); setFilterLocale('all') }}>
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Info */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>{allTranslations.length} traducciones encontradas</span>
        {filterLocale !== 'all' && (
          <Badge variant="outline" className={localeColors[filterLocale]}>
            {localeLabels[filterLocale]}
          </Badge>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[280px]">Clave</TableHead>
                      <TableHead>Español</TableHead>
                      <TableHead>Inglés</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uniqueKeys.map((key) => {
                      const esItem = translationsByKey[key]['es']
                      const enItem = translationsByKey[key]['en']
                      return (
                        <TableRow key={key}>
                          <TableCell>
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{key}</code>
                          </TableCell>
                          <TableCell className="max-w-[250px]">
                            {esItem ? (
                              <span className="text-sm">{esItem.value.length > 80 ? esItem.value.slice(0, 80) + '...' : esItem.value}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Sin traducción</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[250px]">
                            {enItem ? (
                              <span className="text-sm">{enItem.value.length > 80 ? enItem.value.slice(0, 80) + '...' : enItem.value}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Sin traducción</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {esItem && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="size-8 cursor-pointer"
                                  title="Editar ES"
                                  onClick={() => openEdit(esItem)}
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                              )}
                              {enItem && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="size-8 cursor-pointer"
                                  title="Editar EN"
                                  onClick={() => openEdit(enItem)}
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                              )}
                              {esItem && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="size-8 text-red-500 hover:text-red-600 cursor-pointer"
                                  title="Eliminar ES"
                                  onClick={() => setDeleteTarget(esItem)}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              )}
                              {enItem && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="size-8 text-red-500 hover:text-red-600 cursor-pointer"
                                  title="Eliminar EN"
                                  onClick={() => setDeleteTarget(enItem)}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              {uniqueKeys.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Languages className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">No se encontraron traducciones</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Traducción</DialogTitle>
            <DialogDescription>
              Modifica el valor de la traducción para la clave: <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{editing?.key}</code>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Clave</Label>
              <Input value={editing?.key || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Idioma</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={editing ? localeColors[editing.locale] : ''}>
                  {editing ? localeLabels[editing.locale] || editing.locale : ''}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tr-value">Valor</Label>
              <textarea
                id="tr-value"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y custom-scrollbar"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Valor de la traducción..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar traducción?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la traducción para la clave <strong>{deleteTarget?.key}</strong> ({deleteTarget ? localeLabels[deleteTarget.locale] : ''}). Esta acción no se puede deshacer.
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
