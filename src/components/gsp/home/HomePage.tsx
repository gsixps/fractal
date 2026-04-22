'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import {
  ArrowRight, Building2, CheckCircle2, Clock, DollarSign,
  FlaskConical, HandCoins, Layers, Lock, Mail, Pickaxe,
  Search, Shield, ShieldCheck, Sun, Truck, UserCheck, Wallet,
  Zap, TrendingUp, ChevronRight, BadgePercent, Landmark, Eye,
  FileCheck2, MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

import { useAppStore } from '@/lib/store'

/* ── Impeccable Motion Config (no bounce/elastic) ── */
const ease = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease },
  }),
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.section ref={ref} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.section>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
}

const typeLabels: Record<string, string> = {
  real_estate: 'Inmueble', micro_datacenter: 'Data Center', last_mile_logistics: 'Logística',
  solar_energy: 'Energía Solar', mining: 'Minería',
}
const typeIcons: Record<string, React.ReactNode> = {
  real_estate: <Building2 className="size-3.5" />, micro_datacenter: <FlaskConical className="size-3.5" />,
  last_mile_logistics: <Truck className="size-3.5" />, solar_energy: <Sun className="size-3.5" />,
  mining: <Pickaxe className="size-3.5" />,
}

/* ══════════════════════════════════════════════════════════════════
   HERO — Serif heading + gradient + soft radial glow
   ══════════════════════════════════════════════════════════════════ */
function HeroSection() {
  const navigate = useAppStore((s) => s.navigate)
  const stats = [
    { value: '$2.100M+', label: 'Activos gestionados' },
    { value: '340+', label: 'Inversores activos' },
    { value: '12.8%', label: 'Retorno anual promedio' },
    { value: '3%', label: 'Costos operativos' },
  ]
  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full bg-gradient-to-br from-emerald-200/40 via-emerald-100/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-emerald-200/15 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <Badge variant="outline" className="mb-6 px-3.5 py-1.5 text-sm gap-1.5 border-primary/20 bg-primary/5 text-primary font-medium">
              <Zap className="size-3.5" /> Plataforma de inversión fraccionaria
            </Badge>
          </motion.div>

          {/* Impeccable: serif heading for trust/premium feel */}
          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="gsp-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-normal tracking-tight leading-[1.15]">
            Invierte en activos inmobiliarios desde{' '}
            <span className="gsp-gradient-text font-bold">$120.000</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            Accede a propiedades inmobiliarias, data centers y activos de
            infraestructura con inversión fraccionaria y liquidez inmediata.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate('marketplace')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 px-8 text-base font-medium shadow-lg shadow-primary/20 transition-shadow duration-200 hover:shadow-xl hover:shadow-primary/25 cursor-pointer">
              Explorar Activos <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('marketplace')}
              className="h-12 px-8 text-base font-medium gap-2 transition-colors duration-200 cursor-pointer">
              Cómo Funciona <ChevronRight className="size-4" />
            </Button>
          </motion.div>
        </div>

        {/* Stats Bar — Glass card */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="mt-16 sm:mt-20">
          <div className="gsp-glass rounded-2xl border border-border/40 shadow-[0_4px_24px_oklch(0.45_0.155_162/0.06)]">
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {stats.map((s, i) => (
                <div key={i} className={`py-6 px-6 sm:px-8 text-center ${i < 3 ? 'lg:border-r lg:border-border/30' : ''} ${i < 2 ? 'border-b border-border/30 lg:border-b-0' : ''}`}>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">{s.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground font-light">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════
   HOW IT WORKS — Numbered steps with connecting line
   ══════════════════════════════════════════════════════════════════ */
function HowItWorksSection() {
  const steps = [
    { step: 1, icon: <UserCheck className="size-6" />, title: 'Regístrate y verifica', description: 'Crea tu cuenta y completa tu verificación KYC en minutos.' },
    { step: 2, icon: <Search className="size-6" />, title: 'Explora activos', description: 'Navega activos seleccionados con métricas detalladas.' },
    { step: 3, icon: <HandCoins className="size-6" />, title: 'Invierte desde $120.000', description: 'Adquiere fracciones de activos inmobiliarios premium.' },
    { step: 4, icon: <Wallet className="size-6" />, title: 'Recibe dividendos', description: 'Rendimientos periódicos con transparencia total.' },
  ]
  return (
    <AnimatedSection className="gsp-section bg-secondary/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-14">
          <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary font-medium"><Layers className="size-3.5 mr-1" /> Proceso simple</Badge>
          <h2 className="gsp-serif text-3xl sm:text-4xl font-normal tracking-tight">Cómo funciona</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-lg font-light">
            En 4 pasos simples comienza a diversificar tu portafolio.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, i) => (
            <motion.div key={item.step} custom={i + 1} variants={fadeUp}>
              <Card className="h-full gsp-card-hover border-border/50 bg-card/80 backdrop-blur-sm group">
                <CardContent className="p-6 flex flex-col items-start gap-4">
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex items-center justify-center size-11 rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-5xl font-bold text-muted-foreground/30 leading-none tabular-nums">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-snug">{item.title}</h3>
                    <p className="mt-2 text-muted-foreground text-sm leading-relaxed font-light">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ══════════════════════════════════════════════════════════════════
   ASSET TYPES — Bento-style grid
   ══════════════════════════════════════════════════════════════════ */
function AssetTypesSection() {
  const navigate = useAppStore((s) => s.navigate)
  const types = [
    { icon: <Building2 className="size-7" />, title: 'Inmuebles', description: 'Propiedades en ubicaciones premium con alto potencial de apreciación.', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
    { icon: <FlaskConical className="size-7" />, title: 'Micro Data Centers', description: 'Infraestructura de cómputo con contratos a largo plazo.', color: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400' },
    { icon: <Truck className="size-7" />, title: 'Logística Última Milla', description: 'Centros de distribución para comercio electrónico.', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
    { icon: <Sun className="size-7" />, title: 'Energía Solar', description: 'Parques solares con contratos de energía a largo plazo.', color: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400' },
    { icon: <Pickaxe className="size-7" />, title: 'Minería', description: 'Derechos mineros con ingresos recurrentes y contratos estables.', color: 'bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-400' },
  ]
  return (
    <AnimatedSection className="gsp-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-14">
          <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary font-medium"><TrendingUp className="size-3.5 mr-1" /> Diversificación</Badge>
          <h2 className="gsp-serif text-3xl sm:text-4xl font-normal tracking-tight">Tipos de activos</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-lg font-light">
            Diversifica tu portafolio con activos de diferentes industrias.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {types.map((t, i) => (
            <motion.div key={t.title} custom={i + 1} variants={fadeUp}>
              <Card
                className="h-full gsp-card-interactive border-border/40 bg-card/60 backdrop-blur-sm group"
                onClick={() => navigate('marketplace')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate('marketplace')}
              >
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center size-14 rounded-2xl ${t.color} mb-4 transition-transform duration-300 ease-out group-hover:scale-110`}>
                    {t.icon}
                  </div>
                  <h3 className="font-semibold text-lg leading-snug">{t.title}</h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed font-light">{t.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ══════════════════════════════════════════════════════════════════
   FEATURED ASSETS — Cards with proper image + data hierarchy
   ══════════════════════════════════════════════════════════════════ */
function FeaturedAssetsSection() {
  const navigate = useAppStore((s) => s.navigate)
  const selectAsset = useAppStore((s) => s.selectAsset)
  const assets = useAppStore((s) => s.assets.filter(a => a.status === 'active')).slice(0, 3)

  return (
    <AnimatedSection className="gsp-section bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary font-medium"><TrendingUp className="size-3.5 mr-1" /> Oportunidades</Badge>
          <h2 className="gsp-serif text-3xl sm:text-4xl font-normal tracking-tight">Activos destacados</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-lg font-light">
            Descubre activos con retornos atractivos y transparencia total.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assets.map((asset, i) => (
            <motion.div key={asset.id} custom={i + 1} variants={fadeUp}>
              <Card
                className="overflow-hidden gsp-card-hover border-border/40 group h-full flex flex-col"
                role="button"
                tabIndex={0}
                onClick={() => selectAsset(asset.id)}
                onKeyDown={(e) => e.key === 'Enter' && selectAsset(asset.id)}
              >
                <div className="relative h-48 overflow-hidden bg-muted">
                  {asset.images?.[0]?.url ? (
                    <img src={asset.images[0].url} alt={asset.name} className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                      <Building2 className="size-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <Badge className="bg-white/90 text-emerald-800 backdrop-blur-md border-0 gap-1 font-medium shadow-sm">
                      {typeIcons[asset.type]} {typeLabels[asset.type] || asset.type}
                    </Badge>
                    {asset.badge && (
                      <Badge className="bg-amber-100/90 text-amber-800 backdrop-blur-md border-0 font-medium shadow-sm">
                        {asset.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-md border-0 font-bold shadow-sm">
                      {asset.annualYield}%
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-5 flex flex-col gap-3.5 flex-1">
                  <div>
                    <h3 className="font-semibold text-lg leading-snug">{asset.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground text-sm">
                      <MapPin className="size-3.5 text-emerald-500" /> {asset.city}, {asset.region}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-light">Financiamiento</span>
                      <span className="font-medium text-primary">{asset.fundedPercentage}%</span>
                    </div>
                    <div className="gsp-progress-bar">
                      <div className="gsp-progress-bar-fill" style={{ width: `${asset.fundedPercentage}%` }} />
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-auto pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground font-light">Desde</p>
                      <p className="text-xl font-bold tracking-tight">{formatCurrency(asset.pricePerFraction)}</p>
                    </div>
                    <Button
                      onClick={(e) => { e.stopPropagation(); selectAsset(asset.id) }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm transition-all duration-200 cursor-pointer"
                      size="sm"
                    >
                      Invertir <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div custom={5} variants={fadeUp} className="text-center mt-10">
          <Button variant="outline" size="lg" onClick={() => navigate('marketplace')}
            className="gap-2 font-medium transition-all duration-200 cursor-pointer">
            Ver todos los activos <ArrowRight className="size-4" />
          </Button>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

/* ══════════════════════════════════════════════════════════════════
   LIQUIDITY — Salida Express with cost comparison
   ══════════════════════════════════════════════════════════════════ */
function LiquiditySection() {
  return (
    <AnimatedSection className="gsp-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-14">
          <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary font-medium"><Clock className="size-3.5 mr-1" /> Liquidez</Badge>
          <h2 className="gsp-serif text-3xl sm:text-4xl font-normal tracking-tight">Liquidez cuando la necesitas</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-lg font-light">
            Nuestro fondo de liquidez te permite salir en 48 horas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div custom={1} variants={fadeUp}>
            <Card className="h-full border-border/40 gsp-card-hover bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-primary/10 text-primary mb-5">
                  <Zap className="size-6" />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">Salida Express</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed font-light">
                  Vende tus fracciones a <strong className="text-foreground font-medium">valor contable</strong> en solo <strong className="text-foreground font-medium">48 horas</strong>.
                </p>
                <ul className="mt-6 space-y-3">
                  {['Proceso automatizado en 48 horas', 'Sin penalizaciones ni comisiones', 'Fondo de liquidez propio de GSP', 'Disponible para inversores verificados'].map(item => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={2} variants={fadeUp}>
            <Card className="h-full border-border/40 gsp-card-hover bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-primary/10 text-primary mb-5">
                  <BadgePercent className="size-6" />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">Costos competitivos</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed font-light">
                  Nuestros costos son hasta <strong className="text-foreground font-medium">5x menores</strong> que el mercado.
                </p>
                <div className="mt-8 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-primary flex items-center gap-2 text-sm">
                        <TrendingUp className="size-4" /> GSP
                      </span>
                      <span className="font-bold text-primary text-lg">3%</span>
                    </div>
                    <div className="gsp-progress-bar">
                      <div className="gsp-progress-bar-fill" style={{ width: '20%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-amber-600 text-sm">Mercado tradicional</span>
                      <span className="font-bold text-amber-600 text-lg">15%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-amber-100 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                    <p className="text-sm font-medium text-primary flex items-center gap-2">
                      <DollarSign className="size-4" />
                      Ahorro promedio: 12% anual en costos operativos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ══════════════════════════════════════════════════════════════════
   TRANSPARENCY — Clean comparison table
   ══════════════════════════════════════════════════════════════════ */
function TransparencySection() {
  const rows = [
    { concept: 'Administración', gsp: '1.2%', market: '4.0%' },
    { concept: 'Gestión de activos', gsp: '0.8%', market: '5.0%' },
    { concept: 'Auditoría y compliance', gsp: '0.5%', market: '2.0%' },
    { concept: 'Tecnología y plataforma', gsp: '0.3%', market: '1.5%' },
    { concept: 'Custodia y seguros', gsp: '0.2%', market: '2.5%' },
  ]
  return (
    <AnimatedSection className="gsp-section bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-14">
          <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary font-medium"><Eye className="size-3.5 mr-1" /> Transparencia</Badge>
          <h2 className="gsp-serif text-3xl sm:text-4xl font-normal tracking-tight">Costos claros, sin sorpresas</h2>
        </motion.div>
        <motion.div custom={1} variants={fadeUp} className="max-w-3xl mx-auto">
          <Card className="border-border/40 overflow-hidden shadow-[0_4px_24px_oklch(0.45_0.155_162/0.06)]">
            <div className="grid grid-cols-3 gsp-gradient text-white">
              <div className="px-5 py-3.5 font-semibold text-sm">Concepto</div>
              <div className="px-5 py-3.5 font-semibold text-sm text-center">GSP</div>
              <div className="px-5 py-3.5 font-semibold text-sm text-center">Mercado</div>
            </div>
            {rows.map((row, i) => (
              <div key={row.concept} className={`grid grid-cols-3 ${i < rows.length - 1 ? 'border-b border-border/30' : ''} hover:bg-secondary/50 transition-colors duration-150`}>
                <div className="px-5 py-3.5 text-sm">{row.concept}</div>
                <div className="px-5 py-3.5 text-sm text-center font-medium text-primary">{row.gsp}</div>
                <div className="px-5 py-3.5 text-sm text-center text-amber-600">{row.market}</div>
              </div>
            ))}
            <div className="grid grid-cols-3 bg-secondary/60 font-bold">
              <div className="px-5 py-3.5 text-sm">Total</div>
              <div className="px-5 py-3.5 text-sm text-center text-primary">3%</div>
              <div className="px-5 py-3.5 text-sm text-center text-amber-600">15%</div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

/* ══════════════════════════════════════════════════════════════════
   CTA — Gradient section with noise texture
   ══════════════════════════════════════════════════════════════════ */
function CTASection() {
  const [email, setEmail] = useState('')
  return (
    <AnimatedSection className="gsp-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div custom={0} variants={fadeUp}
          className="relative overflow-hidden rounded-3xl gsp-gradient-hero p-10 sm:p-16 text-center text-white">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="gsp-serif text-3xl sm:text-4xl font-normal tracking-tight">
              Comienza a invertir hoy
            </h2>
            <p className="mt-4 text-white/80 max-w-lg mx-auto text-lg font-light">
              Únete a más de 340 inversores diversificando su portafolio con activos inmobiliarios premium.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white/15 backdrop-blur-md border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
              />
              <Button size="lg"
                className="bg-white text-emerald-800 hover:bg-white/90 gap-2 h-12 px-6 shrink-0 font-medium shadow-lg transition-all duration-200 cursor-pointer">
                Comenzar <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

/* ══════════════════════════════════════════════════════════════════
   TRUST — Security badges
   ══════════════════════════════════════════════════════════════════ */
function TrustSection() {
  const badges = [
    { icon: <Shield className="size-6" />, title: 'Datos protegidos', description: 'Encriptación de extremo a extremo y certificación SOC 2.' },
    { icon: <Landmark className="size-6" />, title: 'Regulado por CMF', description: 'Supervisión completa de la CMF de Chile.' },
    { icon: <FileCheck2 className="size-6" />, title: 'Auditoría externa', description: 'Estados financieros auditados trimestralmente.' },
    { icon: <Lock className="size-6" />, title: 'Fondos custodiados', description: 'Custodia por entidades reguladas y asegurados.' },
  ]
  return (
    <AnimatedSection className="gsp-section bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-14">
          <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary font-medium"><ShieldCheck className="size-3.5 mr-1" /> Confianza</Badge>
          <h2 className="gsp-serif text-3xl sm:text-4xl font-normal tracking-tight">Tu inversión está protegida</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((b, i) => (
            <motion.div key={b.title} custom={i + 1} variants={fadeUp}>
              <Card className="h-full border-border/40 gsp-card-hover bg-card/60 backdrop-blur-sm text-center">
                <CardContent className="p-6 flex flex-col items-center gap-3">
                  <div className="flex items-center justify-center size-14 rounded-2xl bg-primary/8 text-primary">
                    {b.icon}
                  </div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="text-muted-foreground text-sm font-light leading-relaxed">{b.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ══════════════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <AssetTypesSection />
        <FeaturedAssetsSection />
        <LiquiditySection />
        <TransparencySection />
        <CTASection />
        <TrustSection />
      </main>
    </div>
  )
}
