'use client'

import { useAppStore } from '@/lib/store'

// ─── Exchange Rates (relative to CLP base currency) ─────────────────────────

const EXCHANGE_RATES: Record<string, number> = {
  CLP: 1,
  USD: 0.00108,
  EUR: 0.00099,
  MXN: 0.0185,
  COP: 4.32,
  ARS: 0.965,
  PEN: 0.00403,
  BRL: 0.00585,
}

// ─── Currency Display Configs ──────────────────────────────────────────────

const CURRENCY_CONFIG: Record<string, { symbol: string; locale: string; decimals: number }> = {
  CLP: { symbol: '$', locale: 'es-CL', decimals: 0 },
  USD: { symbol: 'US$', locale: 'en-US', decimals: 2 },
  EUR: { symbol: '€', locale: 'de-DE', decimals: 2 },
  MXN: { symbol: 'MX$', locale: 'es-MX', decimals: 0 },
  COP: { symbol: 'COL$', locale: 'es-CO', decimals: 0 },
  ARS: { symbol: 'AR$', locale: 'es-AR', decimals: 0 },
  PEN: { symbol: 'S/', locale: 'es-PE', decimals: 2 },
  BRL: { symbol: 'R$', locale: 'pt-BR', decimals: 2 },
}

// ─── Currency names for labels ─────────────────────────────────────────────

export const CURRENCY_NAMES: Record<string, string> = {
  CLP: 'Peso Chileno',
  USD: 'Dólar',
  EUR: 'Euro',
  MXN: 'Peso Mexicano',
  COP: 'Peso Colombiano',
  ARS: 'Peso Argentino',
  PEN: 'Sol Peruano',
  BRL: 'Real Brasilero',
}

export const SUPPORTED_CURRENCIES = Object.keys(EXCHANGE_RATES)

// ─── Hook ──────────────────────────────────────────────────────────────────

/**
 * Real-time currency conversion hook.
 * Reads the current currency from the app store and provides
 * `convert` (raw number) and `format` (locale-aware string) functions.
 *
 * All amounts in the system are stored in CLP (base currency).
 *
 * @example
 * ```tsx
 * const { format, convert, currency } = useCurrency()
 * format(120000) // => "$120.000" or "US$129.60" depending on currency
 * convert(120000) // => 120000 (CLP) or 129.6 (USD)
 * ```
 */
export function useCurrency() {
  const currency = useAppStore((s) => s.currency)

  function convert(amountCLP: number): number {
    return amountCLP * (EXCHANGE_RATES[currency] || 1)
  }

  function format(amountCLP: number): string {
    const converted = convert(amountCLP)
    const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.CLP
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(converted)
  }

  return { convert, format, currency }
}
