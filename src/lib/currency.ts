'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useAppStore } from '@/lib/store'

// ─── Exchange Rates (relative to USD base currency) ─────────────────────────

const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  CLP: 926.5,
  MXN: 17.15,
  COP: 3985,
  ARS: 920,
  PEN: 3.72,
  BRL: 5.06,
  VES: 56.3,
}

// Active rates — starts with fallback, updated from API on mount
let activeRates: Record<string, number> = { ...FALLBACK_RATES }
let ratesFetched = false

// ─── Currency Display Configs ──────────────────────────────────────────────

const CURRENCY_CONFIG: Record<string, { symbol: string; locale: string; decimals: number }> = {
  USD: { symbol: 'US$', locale: 'en-US', decimals: 2 },
  EUR: { symbol: '€', locale: 'de-DE', decimals: 2 },
  CLP: { symbol: '$', locale: 'es-CL', decimals: 0 },
  MXN: { symbol: 'MX$', locale: 'es-MX', decimals: 2 },
  COP: { symbol: 'COL$', locale: 'es-CO', decimals: 0 },
  ARS: { symbol: 'AR$', locale: 'es-AR', decimals: 0 },
  PEN: { symbol: 'S/', locale: 'es-PE', decimals: 2 },
  BRL: { symbol: 'R$', locale: 'pt-BR', decimals: 2 },
  VES: { symbol: 'Bs.', locale: 'es-VE', decimals: 2 },
}

// ─── Rate fetcher ──────────────────────────────────────────────────────────

async function fetchExchangeRates(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch('/api/exchange-rates')
    if (!res.ok) return null
    const data = await res.json()
    if (data.rates) {
      return data.rates as Record<string, number>
    }
    return null
  } catch {
    return null
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────

/**
 * Real-time currency conversion hook.
 * Reads the current currency from the app store and provides
 * `convert` (raw number) and `format` (locale-aware string) functions.
 *
 * All amounts in the system are stored in USD (base currency).
 * Exchange rates are fetched from /api/exchange-rates on first mount
 * and cached in memory for subsequent renders.
 *
 * @example
 * ```tsx
 * const { format, convert, currency } = useCurrency()
 * format(100) // => "$100.00" (USD) or "€92.00" (EUR) or "$92.650" (CLP)
 * convert(100) // => 100 (USD) or 92 (EUR) or 92650 (CLP)
 * ```
 */
export function useCurrency() {
  const currency = useAppStore((s) => s.currency)
  const [, forceUpdate] = useState(0)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (ratesFetched || fetchedRef.current) return
    fetchedRef.current = true

    fetchExchangeRates().then((rates) => {
      if (rates) {
        activeRates = { ...FALLBACK_RATES, ...rates }
        ratesFetched = true
        forceUpdate((v) => v + 1)
      }
    })
  }, [])

  const convert = useCallback(
    (amountUSD: number): number => {
      return amountUSD * (activeRates[currency] || 1)
    },
    [currency]
  )

  const format = useCallback(
    (amountUSD: number): string => {
      const converted = convert(amountUSD)
      const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: config.decimals,
        maximumFractionDigits: config.decimals,
      }).format(converted)
    },
    [currency, convert]
  )

  return { convert, format, currency }
}
