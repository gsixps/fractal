'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useT } from '@/lib/i18n-utils'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import {
  Sun,
  Moon,
  ExternalLink,
} from 'lucide-react'

export function Footer() {
  const t = useT()
  const navigate = useAppStore((s) => s.navigate)
  const appTheme = useAppStore((s) => s.theme)
  const setAppTheme = useAppStore((s) => s.setTheme)
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const currency = useAppStore((s) => s.currency)
  const setCurrency = useAppStore((s) => s.setCurrency)

  const [currencies, setCurrencies] = useState<Array<{code: string; name: string; symbol: string; flagEmoji?: string; isDefault?: boolean; active?: boolean}>>([])

  useEffect(() => {
    fetch('/api/currencies')
      .then(r => r.ok ? r.json() : [])
      .then(setCurrencies)
      .catch(() => {})
  }, [])

  return (
    <footer className="mt-auto border-t bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Main Row */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
              <span className="text-sm font-bold text-emerald-400">G</span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                3GSP
              </span>
            </div>
          </div>

          {/* Powered by GALAXY */}
          <a
            href="https://galaxylabs.site"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-emerald-400"
          >
            powered by
            <span className="font-bold text-emerald-400">GALAXY</span>
            <ExternalLink className="size-3" />
          </a>
        </div>

        <Separator className="my-4 bg-white/10" />

        {/* Bottom Row */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-center text-xs text-white/40 sm:text-left">
            &copy; {new Date().getFullYear()} 3GSP. Todos Los Derechos reservados.
          </p>

          {/* Controls */}
          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <button
              onClick={() => setAppTheme(appTheme === 'dark' ? 'light' : 'dark')}
              className="flex size-7 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/10 hover:text-emerald-400"
              aria-label="Toggle theme"
            >
              {appTheme === 'dark' ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>

            <span className="mx-1 text-white/10">|</span>

            {/* Language Toggle */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setLanguage('es')}
                className={cn(
                  'flex size-7 items-center justify-center rounded-md text-[11px] font-medium transition-colors',
                  language === 'es'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-white/40 hover:bg-white/10 hover:text-white/60'
                )}
              >
                ES
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  'flex size-7 items-center justify-center rounded-md text-[11px] font-medium transition-colors',
                  language === 'en'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-white/40 hover:bg-white/10 hover:text-white/60'
                )}
              >
                EN
              </button>
            </div>

            <span className="mx-1 text-white/10">|</span>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="h-7 rounded-md border border-white/10 bg-white/5 px-2 text-[11px] font-medium text-white/60 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            >
              {currencies.length > 0 ? currencies.filter(c => c.active).map((c) => (
                <option key={c.code} value={c.code}>{c.flagEmoji || ''} {c.code}</option>
              )) : (
                <option value="USD">🇺🇸 USD</option>
              )}
            </select>
          </div>
        </div>

        {/* Risk Warning */}
        <p className="mt-3 text-center text-[11px] leading-relaxed text-white/25">
          {t('footer.riskWarning')}
        </p>
      </div>
    </footer>
  )
}
