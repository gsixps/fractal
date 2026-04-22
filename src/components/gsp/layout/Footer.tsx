'use client'

import { useAppStore } from '@/lib/store'
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
} from 'lucide-react'

const plataformaLinks = [
  { label: 'Marketplace', page: 'marketplace' as const },
  { label: 'Mi Portafolio', page: 'dashboard' as const },
  { label: 'Mercado Secundario', page: 'liquidity' as const },
]

const legalLinks = [
  { label: 'Términos y Condiciones', icon: FileText },
  { label: 'Política de Privacidad', icon: ShieldCheck },
  { label: 'Aviso Legal', icon: Scale },
]

const contactoInfo = [
  { icon: Mail, text: 'contacto@gsp-inversiones.cl' },
  { icon: Phone, text: '+56 2 2345 6789' },
  { icon: MapPin, text: 'Santiago, Chile' },
]

const socialLinks = [
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
]

export function Footer() {
  const navigate = useAppStore((s) => s.navigate)

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
              Global Solidarity Partners — Plataforma líder en inversión
              fraccionada de bienes raíces en Chile. Democratizamos el acceso
              al mercado inmobiliario.
            </p>
            {/* Social Links */}
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((social) => (
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
              Plataforma
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
              Legal
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
              Contacto
            </h3>
            <ul className="mt-4 space-y-3">
              {contactoInfo.map((item) => (
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
            &copy; {new Date().getFullYear()} Global Solidarity Partners. Todos
            los derechos reservados.
          </p>
          <div className="flex flex-col items-center gap-1 sm:items-end">
            <p className="text-center text-xs text-white/40 sm:text-right">
              Regulado bajo la CMF de Chile
            </p>
            <p className="text-center text-[11px] leading-relaxed text-white/25 sm:text-right">
              La inversión en bienes raíces fraccionados conlleva riesgos.
              Infórmese antes de invertir. Rendimientos pasados no garantizan
              resultados futuros.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
