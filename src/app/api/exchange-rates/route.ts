import { NextResponse } from 'next/server'

// ─── In-memory cache ────────────────────────────────────────────────────────

interface CachedRates {
  rates: Record<string, number>
  fetchedAt: number
}

let cachedRates: CachedRates | null = null
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

// ─── Hardcoded fallback rates (USD = 1 base) ───────────────────────────────

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

// ─── GET /api/exchange-rates ────────────────────────────────────────────────

export async function GET() {
  // Return cached rates if still fresh
  if (cachedRates && Date.now() - cachedRates.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({
      base: 'USD',
      rates: cachedRates.rates,
      cached: true,
      fetchedAt: cachedRates.fetchedAt,
    })
  }

  try {
    const res = await fetch(
      'https://open.er-api.com/v6/latest/USD',
      {
        next: { revalidate: 3600 }, // Next.js cache for 1 hour
        headers: { 'Accept': 'application/json' },
      }
    )

    if (!res.ok) {
      throw new Error(`Exchange rate API responded with ${res.status}`)
    }

    const data = await res.json()

    if (data.result !== 'success' || !data.rates) {
      throw new Error('Invalid response from exchange rate API')
    }

    // Merge API rates with VES (not always available from free APIs)
    const rates: Record<string, number> = {
      USD: 1,
      ...pick(data.rates, ['EUR', 'CLP', 'MXN', 'COP', 'ARS', 'PEN', 'BRL']),
      VES: FALLBACK_RATES.VES, // Use estimated rate for VES
    }

    // Cache in memory
    cachedRates = {
      rates,
      fetchedAt: Date.now(),
    }

    return NextResponse.json({
      base: 'USD',
      rates,
      cached: false,
      fetchedAt: cachedRates.fetchedAt,
    })
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)

    // Return cached rates even if expired (better stale than nothing)
    if (cachedRates) {
      return NextResponse.json({
        base: 'USD',
        rates: cachedRates.rates,
        cached: true,
        stale: true,
        fetchedAt: cachedRates.fetchedAt,
      })
    }

    // Return hardcoded fallback
    return NextResponse.json({
      base: 'USD',
      rates: FALLBACK_RATES,
      cached: false,
      fallback: true,
      fetchedAt: Date.now(),
    })
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function pick<T extends Record<string, unknown>>(
  obj: T,
  keys: string[]
): Record<string, number> {
  const result: Record<string, number> = {}
  for (const key of keys) {
    if (key in obj && typeof obj[key] === 'number') {
      result[key] = obj[key] as number
    }
  }
  return result
}
