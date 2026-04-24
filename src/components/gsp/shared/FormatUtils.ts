import type { BadgeVariants } from '@/components/ui/badge'

/**
 * Format a number as US dollars (USD).
 * Uses comma as thousands separator and 2 decimal places.
 *
 * @example formatUSD(15000) → "$15,000.00"
 * @example formatUSD(0) → "$0.00"
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a number as Chilean pesos (CLP).
 * Uses dot as thousands separator and no decimal places.
 *
 * @example formatCLP(15000000) → "$15.000.000"
 * @example formatCLP(0) → "$0"
 * @deprecated Use formatUSD or useCurrency() hook instead.
 */
export function formatCLP(amount: number): string {
  const rounded = Math.round(amount)
  const formatted = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `$${formatted}`
}

/**
 * Format a number in a locale-aware currency string.
 * Defaults to USD with 2 decimal places.
 *
 * @example formatCurrency(15000, 'USD') → "$15,000.00"
 * @example formatCurrency(15000000, 'CLP') → "$15.000.000"
 * @example formatCurrency(100, 'EUR') → "€100.00"
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD'
): string {
  const localeMap: Record<string, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    CLP: 'es-CL',
    MXN: 'es-MX',
    COP: 'es-CO',
    ARS: 'es-AR',
    PEN: 'es-PE',
    BRL: 'pt-BR',
    VES: 'es-VE',
  }
  const decimalsMap: Record<string, number> = {
    CLP: 0, COP: 0, ARS: 0,
    USD: 2, EUR: 2, MXN: 2, PEN: 2, BRL: 2, VES: 2,
  }

  return new Intl.NumberFormat(localeMap[currencyCode] || 'en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: decimalsMap[currencyCode] ?? 2,
    maximumFractionDigits: decimalsMap[currencyCode] ?? 2,
  }).format(amount)
}

/**
 * Format a number as a percentage string.
 * Adds + prefix for positive values, - for negative.
 *
 * @example formatPercent(8.5) → "+8,50%"
 * @example formatPercent(-3.2) → "-3,20%"
 * @example formatPercent(0) → "0,00%"
 */
export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2).replace('.', ',')}%`
}

/**
 * Format a date string or Date object in Spanish locale (Chile).
 *
 * @example formatDate('2024-03-15') → "15 de marzo de 2024"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format a date in short Spanish format.
 *
 * @example formatShortDate('2024-03-15') → "15 mar 2024"
 */
export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Map an asset type string to a human-readable Spanish label.
 */
export function getAssetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    residential: 'Residencial',
    commercial: 'Comercial',
    industrial: 'Industrial',
    retail: 'Retail',
    office: 'Oficina',
    mixed: 'Mixto',
    land: 'Terreno',
    hospitality: 'Hotelería',
    logistics: 'Logística',
    apartment: 'Departamento',
    house: 'Casa',
  }
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

/**
 * Map an asset type string to a Lucide icon name.
 */
export function getAssetTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    residential: 'Home',
    commercial: 'Building2',
    industrial: 'Factory',
    retail: 'Store',
    office: 'Briefcase',
    mixed: 'LayoutGrid',
    land: 'Map',
    hospitality: 'Hotel',
    logistics: 'Truck',
    apartment: 'Building',
    house: 'Home',
  }
  return icons[type] || 'Building'
}

/**
 * Map a status string to a shadcn/ui Badge variant.
 *
 * Asset statuses: active, funded, closed, paused, upcoming
 * KYC statuses: pending, submitted, verified, rejected
 * General: success, warning, error, info, default
 */
export function getStatusBadgeVariant(
  status: string
): BadgeVariants['variant'] {
  const variants: Record<string, BadgeVariants['variant']> = {
    // Asset statuses
    active: 'default',
    funded: 'default',
    closed: 'secondary',
    paused: 'outline',
    upcoming: 'outline',

    // KYC statuses
    pending: 'outline',
    submitted: 'secondary',
    verified: 'default',
    rejected: 'destructive',

    // General
    success: 'default',
    warning: 'secondary',
    error: 'destructive',
    info: 'outline',
  }
  return variants[status.toLowerCase()] || 'secondary'
}

/**
 * Map a status string to a human-readable Spanish label.
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Activo',
    funded: 'Financiado',
    closed: 'Cerrado',
    paused: 'Pausado',
    upcoming: 'Próximo',
    pending: 'Pendiente',
    submitted: 'Enviado',
    verified: 'Verificado',
    rejected: 'Rechazado',
    success: 'Éxito',
    warning: 'Advertencia',
    error: 'Error',
    info: 'Información',
  }
  return (
    labels[status.toLowerCase()] ||
    status.charAt(0).toUpperCase() + status.slice(1)
  )
}

/**
 * Format a large number into a compact readable format.
 * Uses USD as the base currency.
 *
 * @example formatCompact(15000000) → "$15M"
 * @example formatCompact(2500000) → "$2.5M"
 * @example formatCompact(500000) → "$500K"
 */
export function formatCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    const value = (amount / 1_000_000_000).toFixed(1).replace('.', ',')
    return `$${value}MM`
  }
  if (amount >= 1_000_000) {
    const value = (amount / 1_000_000).toFixed(1).replace('.', ',')
    return `$${value}M`
  }
  if (amount >= 1_000) {
    const value = (amount / 1_000).toFixed(0)
    return `$${value}K`
  }
  return formatUSD(amount)
}
