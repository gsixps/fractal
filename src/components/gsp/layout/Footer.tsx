'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useT } from '@/lib/i18n-utils'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  Sun,
  Moon,
  ExternalLink,
  Globe,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Building2,
  FileText,
  ShieldCheck,
  Scale,
  Users,
  BookOpen,
} from 'lucide-react'

function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: '¡Suscrito!', description: data.message || 'Recibirás nuestro newsletter pronto.' })
        setEmail('')
      } else {
        toast({ title: 'Error', description: data.error || 'Intenta de nuevo.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo conectar al servidor.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
        className="flex-1 h-9 rounded-lg bg-white/5 border border-white/10 px-3 text-xs text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30"
      />
      <button
        type="submit"
        disabled={loading}
        className="h-9 px-3 rounded-lg gsp-gradient text-white text-xs font-semibold hover:opacity-90 transition-opacity duration-200 shrink-0 disabled:opacity-60"
      >
        {loading ? '...' : 'OK'}
      </button>
    </form>
  )
}

export function Footer() {
  const t = useT()
  const navigate = useAppStore((s) => s.navigate)
  const appTheme = useAppStore((s) => s.theme)
  const setAppTheme = useAppStore((s) => s.setTheme)
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const currency = useAppStore((s) => s.currency)
  const setCurrency = useAppStore((s) => s.setCurrency)

  const [currencies, setCurrencies] = useState<Array<{code: string; name: string; symbol: string; flag?: string; isActive?: boolean}>>([])

  useEffect(() => {
    fetch('/api/currencies')
      .then(r => r.ok ? r.json() : [])
      .then(setCurrencies)
      .catch(() => {})
  }, [])

  const navigateCmsPage = useAppStore((s) => s.navigateCmsPage)

  const companyLinks = [
    { label: 'Sobre Nosotros', onClick: () => navigateCmsPage('sobre-nosotros') },
    { label: 'Cómo Funciona', onClick: () => navigateCmsPage('como-funciona') },
    { label: 'Marketplace', onClick: () => navigate('marketplace') },
    { label: 'Mercado Secundario', onClick: () => navigate('secondary-market') },
  ]

  const supportLinks = [
    { label: 'Centro de Ayuda', onClick: () => navigateCmsPage('centro-de-ayuda') },
    { label: 'Términos y Condiciones', onClick: () => navigateCmsPage('terminos-y-condiciones') },
    { label: 'Política de Privacidad', onClick: () => navigateCmsPage('politica-privacidad') },
    { label: 'Política de Cookies', onClick: () => navigateCmsPage('politica-cookies') },
  ]

  return (
    <footer className="mt-auto border-t border-border/40 bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Column 1: Brand + Company Info */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                  <span className="text-sm font-bold text-emerald-400">G</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  3GSP
                </span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed font-light max-w-xs">
                Inversión inmobiliaria fraccionada. Diversifica tu portafolio con activos reales desde $50 USD.
              </p>
              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <MapPin className="size-3.5 shrink-0" />
                  <span>Santiago, Chile · Miami, USA</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Mail className="size-3.5 shrink-0" />
                  <span>contacto@3gsp.com</span>
                </div>
              </div>
            </div>

            {/* Column 2: Company */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-white/60 mb-4 flex items-center gap-2">
                <Building2 className="size-3.5" /> Empresa
              </h4>
              <ul className="space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.onClick}
                      className="text-sm text-white/45 hover:text-emerald-400 transition-colors duration-200 font-light"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Legal + Support */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-white/60 mb-4 flex items-center gap-2">
                <Scale className="size-3.5" /> Legal y Soporte
              </h4>
              <ul className="space-y-2.5">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.onClick}
                      className="text-sm text-white/45 hover:text-emerald-400 transition-colors duration-200 font-light"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
              {/* Regulatory badges */}
              <div className="mt-6 flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/8">
                  <ShieldCheck className="size-3 text-emerald-400" />
                  <span className="text-[10px] font-semibold text-white/50">CMF</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/8">
                  <FileText className="size-3 text-emerald-400" />
                  <span className="text-[10px] font-semibold text-white/50">SEC</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/8">
                  <Users className="size-3 text-emerald-400" />
                  <span className="text-[10px] font-semibold text-white/50">AML</span>
                </div>
              </div>
            </div>

            {/* Column 4: Newsletter + Social */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-white/60 mb-4 flex items-center gap-2">
                <BookOpen className="size-3.5" /> Newsletter
              </h4>
              <p className="text-sm text-white/45 font-light mb-3">
                Recibe oportunidades de inversión cada semana.
              </p>
              <NewsletterForm />
            </div>
          </div>
        </div>

        <Separator className="bg-white/8" />

        {/* Bottom Bar */}
        <div className="py-5">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            {/* Left: Copyright */}
            <div className="flex items-center gap-3">
              <p className="text-xs text-white/35 font-light">
                &copy; {new Date().getFullYear()} 3GSP. Todos los derechos reservados.
              </p>
              <a
                href="https://galaxylabs.site"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-white/35 transition-colors hover:bg-white/8 hover:text-emerald-400"
              >
                powered by
                <span className="font-bold text-emerald-400/70">GALAXY</span>
                <ExternalLink className="size-2.5" />
              </a>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-1.5">
              {/* Theme Toggle */}
              <button
                onClick={() => setAppTheme(appTheme === 'dark' ? 'light' : 'dark')}
                className="flex size-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/8 hover:text-emerald-400"
                aria-label="Toggle theme"
              >
                {appTheme === 'dark' ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
              </button>

              <div className="mx-1 h-3 w-px bg-white/8" />

              {/* Language Toggle */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setLanguage('es')}
                  className={cn(
                    'flex size-7 items-center justify-center rounded-lg text-[11px] font-semibold transition-colors',
                    language === 'es'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-white/35 hover:bg-white/8 hover:text-white/55'
                  )}
                >
                  ES
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={cn(
                    'flex size-7 items-center justify-center rounded-lg text-[11px] font-semibold transition-colors',
                    language === 'en'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-white/35 hover:bg-white/8 hover:text-white/55'
                  )}
                >
                  EN
                </button>
              </div>

              <div className="mx-1 h-3 w-px bg-white/8" />

              {/* Currency Selector */}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-7 rounded-lg border border-white/8 bg-white/5 px-2 text-[11px] font-semibold text-white/50 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                {currencies.length > 0 ? currencies.filter(c => c.isActive).map((c) => (
                  <option key={c.code} value={c.code}>{c.flag || ''} {c.code}</option>
                )) : (
                  <option value="USD">🇺🇸 USD</option>
                )}
              </select>
            </div>
          </div>

          {/* Risk Warning */}
          <p className="mt-4 text-center text-[10px] leading-relaxed text-white/20">
            {t('footer.riskWarning')}
          </p>
        </div>
      </div>
    </footer>
  )
}
