'use client'

import { useTranslation } from '@/lib/i18n'

/**
 * Convenience hook that returns the translation function `t` from the i18n context.
 * Automatically reactive to language changes.
 *
 * @example
 * ```tsx
 * const t = useT()
 * t('nav.home') // => 'Inicio' or 'Home' depending on language
 * ```
 */
export function useT(): (key: string) => string {
  const { t } = useTranslation()
  return t
}
