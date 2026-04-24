'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, RefreshCw, Save, Upload, ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

interface SettingItem {
  id: string
  key: string
  value: string
  label: string
  description: string
  type: string
  group: string
}

const groupLabels: Record<string, string> = {
  hero: 'Hero',
  stats: 'Estadísticas',
  cta: 'Llamada a la Acción',
  footer: 'Pie de Página',
  seo: 'SEO',
  platform: 'Plataforma',
  company: 'Empresa',
  general: 'General',
}

// Keys that look like image/logo URLs
function isImageField(key: string, type: string): boolean {
  const lowerKey = key.toLowerCase()
  return (
    lowerKey.includes('logo') ||
    lowerKey.includes('image') ||
    lowerKey.includes('icon') ||
    lowerKey.includes('favicon') ||
    lowerKey.includes('avatar') ||
    lowerKey.includes('photo') ||
    lowerKey.includes('cover') ||
    lowerKey.includes('banner') ||
    lowerKey.includes('background') ||
    lowerKey.includes('picture') ||
    type === 'image' ||
    type === 'file'
  )
}

export function SettingsView() {
  const [settings, setSettings] = useState<SettingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const { toast } = useToast()

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/settings')
      if (!res.ok) throw new Error('Error al cargar configuración')
      const data = await res.json()
      // API returns grouped object: { hero: [...], stats: [...], ... }
      if (Array.isArray(data.settings)) {
        setSettings(data.settings)
      } else if (typeof data === 'object' && data !== null) {
        // Flatten grouped object into a single array
        const flat: SettingItem[] = []
        for (const group of Object.values(data)) {
          if (Array.isArray(group)) {
            flat.push(...group)
          }
        }
        setSettings(flat)
      } else {
        setSettings([])
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar la configuración', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const updateValue = (key: string, value: string) => {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: settings.map((s) => ({ key: s.key, value: s.value })),
        }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      toast({ title: 'Configuración guardada', description: 'Los cambios se guardaron correctamente' })
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar la configuración', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (key: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Solo se permiten archivos de imagen', variant: 'destructive' })
      return
    }
    try {
      setUploadingKey(key)
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Error al subir imagen')
      const data = await res.json()
      updateValue(key, data.url)
      toast({ title: 'Imagen subida', description: 'La imagen se ha cargado correctamente' })
    } catch {
      toast({ title: 'Error', description: 'No se pudo subir la imagen', variant: 'destructive' })
    } finally {
      setUploadingKey(null)
    }
  }

  const grouped = settings.reduce<Record<string, SettingItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="gsp-serif text-2xl font-normal tracking-tight">Configuración del Sitio</h2>
          <p className="text-muted-foreground">Administra los ajustes generales de la plataforma 3GSP</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSettings}>
            <RefreshCw className="mr-2 size-3" /> Actualizar
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            Guardar Todo
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(grouped).map(([group, items]) => (
          <Card key={group} className="gsp-card-hover border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{groupLabels[group] || group}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, idx) => (
                <div key={item.key}>
                  <div className="space-y-2">
                    <Label htmlFor={`setting-${item.key}`} className="text-sm font-medium">{item.label}</Label>
                    {isImageField(item.key, item.type) ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            id={`setting-${item.key}`}
                            type="text"
                            value={item.value ?? ''}
                            onChange={(e) => updateValue(item.key, e.target.value)}
                            placeholder="URL de la imagen..."
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-9 shrink-0 cursor-pointer"
                            disabled={uploadingKey === item.key}
                            onClick={() => fileInputRefs.current[item.key]?.click()}
                          >
                            {uploadingKey === item.key ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Upload className="size-4" />
                            )}
                          </Button>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={(el) => { fileInputRefs.current[item.key] = el }}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(item.key, file)
                            e.target.value = ''
                          }}
                        />
                        {item.value && (
                          <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/30 p-2">
                            <div className="size-10 shrink-0 overflow-hidden rounded-md bg-background">
                              <img
                                src={item.value}
                                alt={item.label}
                                className="size-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            </div>
                            <span className="truncate text-xs text-muted-foreground">{item.value}</span>
                          </div>
                        )}
                      </div>
                    ) : item.type === 'long_text' || item.type === 'textarea' ? (
                      <Textarea
                        id={`setting-${item.key}`}
                        value={item.value ?? ''}
                        onChange={(e) => updateValue(item.key, e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={`setting-${item.key}`}
                        type={item.type === 'number' ? 'number' : 'text'}
                        value={item.value ?? ''}
                        onChange={(e) => updateValue(item.key, e.target.value)}
                      />
                    )}
                    {item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  {idx < items.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
