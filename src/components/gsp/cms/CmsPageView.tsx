'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { ArrowLeft, Calendar } from 'lucide-react'

interface CmsPageData {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  icon: string
  updatedAt: string
  lastEditedBy: string | null
}

export function CmsPageView() {
  const slug = useAppStore((s) => s.cmsPageSlug)
  const navigate = useAppStore((s) => s.navigate)
  const [page, setPage] = useState<CmsPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPage = useCallback(async () => {
    if (!slug) {
      setError('No se especificó ninguna página')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/cms/pages/${encodeURIComponent(slug)}`)
      if (!res.ok) throw new Error('Página no encontrada')
      const data = await res.json()
      setPage(data.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la página')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchPage()
  }, [fetchPage])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground mb-6">{error || 'Página no encontrada'}</p>
        <button
          onClick={() => navigate('home')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <button
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Inicio
          </button>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-300 mb-4">
            <span className="uppercase tracking-wider">{page.category}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            {page.title}
          </h1>
          {page.excerpt && (
            <p className="mt-4 text-lg text-white/70 max-w-2xl font-light leading-relaxed">
              {page.excerpt}
            </p>
          )}
          <div className="mt-6 flex items-center gap-4 text-xs text-white/40">
            {page.lastEditedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {new Date(page.lastEditedAt).toLocaleDateString('es-CL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div
          className="prose prose-slate prose-lg max-w-none
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground prose-strong:font-semibold
            prose-ul:my-4 prose-ul:pl-6 prose-li:text-muted-foreground
            prose-ol:my-4 prose-ol:pl-6 prose-li:text-muted-foreground
            prose-blockquote:border-l-emerald-500 prose-blockquote:text-muted-foreground
            prose-hr:border-border
            prose-table:border prose-th:bg-muted prose-th:p-3 prose-td:p-3 prose-td:border"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  )
}
