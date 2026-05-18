'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from 'react'
import { translationsData, type Locale, type TranslationMap } from '@/lib/i18n-data'

// ─── Re-export types from shared data module ─────────────────────────────────────

export type { Locale }

// ─── Translation Maps ──────────────────────────────────────────────────────────

type LocaleMap = Record<Locale, TranslationMap>

const translations: LocaleMap = translationsData

// ─── Translation Resolver ──────────────────────────────────────────────────────

/**
 * Resolves a dot-notation key against a translation map.
 * e.g. t('nav.home') → translations[locale]['nav.home']
 *
 * Returns the key itself if no translation is found (for debugging).
 */
function resolve(
  key: string,
  map: TranslationMap,
): string {
  return map[key] ?? key
}

// ─── Context ───────────────────────────────────────────────────────────────────

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  loading: boolean
}

const I18nContext = createContext<I18nContextValue | null>(null)

// ─── DB Translation Fetcher ──────────────────────────────────────────────────

/**
 * Fetch translations from the database for a given locale.
 * Returns a flat { key: value } object, or an empty object on failure.
 */
async function fetchDbTranslations(locale: string): Promise<Record<string, string>> {
  try {
    const res = await fetch(`/api/translations?locale=${locale}`)
    if (!res.ok) return {}
    return await res.json()
  } catch {
    return {}
  }
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function I18nProvider({
  children,
  defaultLocale = 'es',
}: {
  children: ReactNode
  defaultLocale?: Locale
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)
  const [dbOverrides, setDbOverrides] = useState<TranslationMap>({})
  const [loading, setLoading] = useState(true)
  const fetchedLocales = useRef<Set<string>>(new Set())

  // Merge DB translations with hardcoded fallbacks (DB takes priority)
  const mergedMap = useMemo<TranslationMap>(() => {
    const base = { ...translations[locale] }
    for (const [key, value] of Object.entries(dbOverrides)) {
      base[key] = value
    }
    return base
  }, [locale, dbOverrides])

  // Fetch DB translations when locale changes
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      const dbMap = await fetchDbTranslations(locale)
      if (!cancelled) {
        setDbOverrides(dbMap)
        fetchedLocales.current.add(locale)
        setLoading(false)
      }
    }

    load()

    return () => { cancelled = true }
  }, [locale])

  const t = useCallback(
    (key: string): string => {
      return resolve(key, mergedMap)
    },
    [mergedMap],
  )

  const handleSetLocale = useCallback((next: Locale) => {
    setLocale(next)
  }, [])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: handleSetLocale,
      t,
      loading,
    }),
    [locale, handleSetLocale, t, loading],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error(
      'useTranslation must be used within an <I18nProvider>. ' +
        'Wrap your app with <I18nProvider> in the root layout.',
    )
  }
  return ctx
}

// ─── Helpers (optional utilities) ──────────────────────────────────────────────

/** Get the alternate locale (es ↔ en) */
export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'es' ? 'en' : 'es'
}

/** Locale display labels */
export const localeLabels: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
}

/** Available locales for iteration */
export const availableLocales: Locale[] = ['es', 'en']
