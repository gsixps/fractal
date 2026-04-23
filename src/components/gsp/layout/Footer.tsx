'use client'

import { useAppStore } from '@/lib/store'
import { useT } from '@/lib/i18n-utils'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ShieldCheck,
  FileText,
  Scale,
  Sun,
  Moon,
  Globe,
  DollarSign,
} from 'lucide-react'
import { useMemo } from 'react'

export function Footer() {
  const t = useT()
  const navigate = useAppStore((s) => s.navigate)
  const appTheme = useAppStore((s) => s.theme)
  const setAppTheme = useAppStore((s) => s.setTheme)
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const currency = useAppStore((s) => s.currency)
  const setCurrency = useAppStore((s) => s.setCurrency)

  const plataformaLinks = useMemo(() => [
    { label: t('nav.marketplace'), page: 'marketplace' as const },
    { label: t('nav.portfolio'), page: 'dashboard' as const },
    { label: t('nav.liquidity'), page: 'liquidity' as const },
  ], [t])

  const legalLinks = useMemo(() => [
    { label: t('footer.terms'), icon: FileText },
    { label: t('footer.privacy'), icon: ShieldCheck },
    { label: t('footer.legal'), icon: Scale },
  ], [t])

  return (
    <footer className="mt-auto border-t bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                <span className="text-sm font-bold text-emerald-400">G</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                GSP
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              Global Solidarity Partners — {t('footer.company')}
            </p>
            {/* Social Links */}
            <div className="mt-5 flex items-center gap-3">
              {[
                { icon: Linkedin, label: 'LinkedIn', href: '#' },
                { icon: Twitter, label: 'Twitter', href: '#' },
                { icon: Facebook, label: 'Facebook', href: '#' },
                { icon: Instagram, label: 'Instagram', href: '#' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-emerald-400"
                  aria-label={social.label}
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Plataforma Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              {t('footer.company')}
            </h3>
            <ul className="mt-4 space-y-3">
              {plataformaLinks.map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="group flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-emerald-400"
                  >
                    {link.label}
                    <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              {t('footer.legal')}
            </h3>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <button className="group flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-emerald-400">
                    <link.icon className="size-3.5" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              {t('footer.contact')}
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { icon: Mail, text: 'contacto@gsp-inversiones.cl' },
                { icon: Phone, text: '+56 2 2345 6789' },
                { icon: MapPin, text: 'Santiago, Chile' },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-2.5">
                  <item.icon className="mt-0.5 size-4 shrink-0 text-emerald-500/60" />
                  <span className="text-sm text-white/60">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-center text-xs text-white/40 sm:text-left">
            &copy; {new Date().getFullYear()} Global Solidarity Partners. {t('footer.rights')}.
          </p>
          <div className="flex flex-col items-center gap-2 sm:items-center">
            {/* Controls Row */}
            <div className="flex items-center gap-1">
              {/* Theme Toggle */}
              <button
                onClick={() => setAppTheme(appTheme === 'dark' ? 'light' : 'dark')}
                className="flex size-8 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/10 hover:text-emerald-400"
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
                <option value="CLP">🇨🇱 CLP</option>
                <option value="USD">🇺🇸 USD</option>
                <option value="EUR">🇪🇺 EUR</option>
                <option value="MXN">🇲🇽 MXN</option>
                <option value="COP">🇨🇴 COP</option>
                <option value="ARS">🇦🇷 ARS</option>
                <option value="PEN">🇵🇪 PEN</option>
                <option value="BRL">🇧🇷 BRL</option>
              </select>
            </div>
            <p className="text-center text-xs text-white/40 sm:text-right">
              {t('home.trust.badge1')} CMF {t('footer.about').toLowerCase()}
            </p>
            <p className="text-center text-[11px] leading-relaxed text-white/25 sm:text-right">
              {t('footer.riskWarning')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
