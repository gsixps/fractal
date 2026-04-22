'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import {
  ArrowRight, Building2, CheckCircle2, Clock, DollarSign,
  FlaskConical, HandCoins, Layers, Lock, Mail, Pickaxe,
  Search, Shield, ShieldCheck, Sun, Truck, UserCheck, Wallet,
  Zap, TrendingUp, ChevronRight, BadgePercent, Landmark, Eye,
  FileCheck2, MapPin, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/lib/store'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
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

/* ── HERO ── */
function HeroSection() {
  const navigate = useAppStore((s) => s.navigate)
  const stats = [
    { value: '2.100M+', label: 'En activos gestionados' },
    { value: '340+', label: 'Inversores activos' },
    { value: '12.8%', label: 'Retorno promedio anual' },
    { value: '3%', label: 'Costos operativos' },
  ]
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-br from-emerald-100/60 via-emerald-50/30 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <Badge variant="secondary" className="mb-6 px-3 py-1 text-sm gap-1.5">
              <Zap className="size-3.5 text-emerald-600" /> Plataforma de inversión fraccionaria
            </Badge>
          </motion.div>
          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Invierte en activos inmobiliarios desde <span className="gsp-gradient-text">$120.000</span>
          </motion.h1>
          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Accede a propiedades inmobiliarias, data centers y activos de infraestructura con inversión fraccionaria.
          </motion.p>
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('marketplace')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-12 px-8 text-base shadow-lg shadow-emerald-600/20">
              Explorar Activos <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('marketplace')}
              className="h-12 px-8 text-base border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-2">
              Cómo Funciona <ChevronRight className="size-4" />
            </Button>
          </motion.div>
        </div>
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="mt-16 sm:mt-20">
          <div className="gsp-glass rounded-2xl border border-emerald-100/60 shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-emerald-100/60">
              {stats.map((s, i) => (
                <div key={i} className="py-6 px-6 sm:px-8 text-center">
                  <p className="text-2xl sm:text-3xl font-bold">{s.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── HOW IT WORKS ── */
function HowItWorksSection() {
  const steps = [
    { step: 1, icon: <UserCheck className="size-6" />, title: 'Regístrate y verifica', description: 'Crea tu cuenta y completa tu verificación KYC.' },
    { step: 2, icon: <Search className="size-6" />, title: 'Explora activos', description: 'Navega activos seleccionados con métricas detalladas.' },
    { step: 3, icon: <HandCoins className="size-6" />, title: 'Invierte desde $120.000', description: 'Adquiere fracciones de activos inmobiliarios premium.' },
    { step: 4, icon: <Wallet className="size-6" />, title: 'Recibe dividendos', description: 'Rendimientos periódicos con transparencia total.' },
  ]
  return (
    <AnimatedSection className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-50/40">
      <div className="max-w-7xl mx-auto">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-14">
          <Badge variant="secondary" className="mb-4"><Layers className="size-3.5 mr-1" /> Proceso simple</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Cómo funciona</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-lg">En 4 pasos simples comienza a diversificar tu portafolio.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, i) => (
            <motion.div key={item.step} custom={i + 1} variants={fadeUp}>
              <Card className="h-full border-border/60 gsp-card-hover bg-white">
                <CardContent className="p-6 flex flex-col items-start gap-4">
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex items-center justify-center size-12 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">{item.icon}</div>
                    <span className="text-5xl font-black text-emerald-100/80 leading-none">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{item.description}</p>
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

/* ── ASSET TYPES ── */
function AssetTypesSection() {
  const navigate = useAppStore((s) => s.navigate)
  const types = [
    { icon: <Building2 className="size-7" />, title: 'Inmuebles', description: 'Propiedades en ubicaciones premium con alto potencial de apreciación.', color: 'bg-emerald-100 text-emerald-700' },
    { icon: <FlaskConical className="size-7" />, title: 'Micro Data Centers', description: 'Infraestructura de cómputo con contratos a largo plazo.', color: 'bg-teal-100 text-teal-700' },
    { icon: <Truck className="size-7" />, title: 'Logística Última Milla', description: 'Centros de distribución para comercio electrónico.', color: 'bg-amber-100 text-amber-700' },
    { icon: <Sun className="size-7" />, title: 'Energía Solar', description: 'Parques solares con contratos de energía a largo plazo.', color: 'bg-orange-100 text-orange-700' },
    { icon: <Pickaxe className="size-7" />, title: 'Minería', description: 'Derechos mineros con ingresos recurrentes.', color: 'bg-stone-100 text-stone-700' },
  ]
  return (
    <AnimatedSection className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-14">
          <Badge variant="secondary" className="mb-4"><TrendingUp className="size-3.5 mr-1" /> Diversificación</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Tipos de activos</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map((t, i) => (
            <motion.div key={t.title} custom={i + 1} variants={fadeUp}>
              <Card className="h-full border-border/60 gsp-card-hover bg-white group cursor-pointer" onClick={() => navigate('marketplace')}>
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center size-14 rounded-2xl ${t.color} mb-4 transition-transform duration-300 group-hover:scale-110`}>{t.icon}</div>
                  <h3 className="font-semibold text-lg">{t.title}</h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{t.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ── FEATURED ASSETS (from API) ── */
function FeaturedAssetsSection() {
  const navigate = useAppStore((s) => s.navigate)
  const selectAsset = useAppStore((s) => s.selectAsset)
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/assets?status=active')
      .then(r => r.json())
      .then(data => { setAssets(data.slice(0, 3)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <AnimatedSection className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-12">
          <Badge variant="secondary" className="mb-4"><TrendingUp className="size-3.5 mr-1" /> Activos destacados</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Oportunidades activas</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-lg">Descubre activos con retornos atractivos y transparencia total.</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="overflow-hidden"><Skeleton className="h-48 w-full" /><CardContent className="p-5 space-y-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-8 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset, i) => (
              <motion.div key={asset.id} custom={i + 1} variants={fadeUp}>
                <Card className="overflow-hidden gsp-card-hover border-border/60 group cursor-pointer h-full">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {asset.images?.[0]?.url ? (
                      <img src={asset.images[0].url} alt={asset.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Building2 className="size-12" /></div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-emerald-600/90 text-white backdrop-blur-sm border-0 gap-1">
                        {typeIcons[asset.type]} {typeLabels[asset.type] || asset.type}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-emerald-700 backdrop-blur-sm border-0 font-semibold">{asset.annualYield}% anual</Badge>
                    </div>
                  </div>
                  <CardContent className="p-5 flex flex-col gap-4 flex-1">
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{asset.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground text-sm">
                        <MapPin className="size-3.5 text-emerald-500" /> {asset.city}, {asset.region}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Financiamiento</span>
                        <span className="font-medium text-emerald-600">{asset.fundedPercentage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000" style={{ width: `${asset.fundedPercentage}%` }} />
                      </div>
                    </div>
                    <div className="flex items-end justify-between mt-auto pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Desde</p>
                        <p className="text-xl font-bold">{formatCurrency(asset.pricePerFraction)}</p>
                      </div>
                      <Button onClick={(e) => { e.stopPropagation(); selectAsset(asset.id); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">Invertir <ArrowRight className="size-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div custom={5} variants={fadeUp} className="text-center mt-10">
          <Button variant="outline" size="lg" onClick={() => navigate('marketplace')}
            className="gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50">Ver todos los activos <ArrowRight className="size-4" /></Button>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

/* ── LIQUIDITY ── */
function LiquiditySection() {
  return (
    <AnimatedSection className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-50/40">
      <div className="max-w-7xl mx-auto">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-14">
          <Badge variant="secondary" className="mb-4"><Clock className="size-3.5 mr-1" /> Liquidez inmediata</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Liquidez cuando la necesitas</h2>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div custom={1} variants={fadeUp}>
            <Card className="h-full border-0 bg-white shadow-lg"><CardContent className="p-8">
              <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-emerald-100 text-emerald-700 mb-5"><Zap className="size-7" /></div>
              <h3 className="text-2xl font-bold">Salida Express</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">Vende tus fracciones a <strong>valor contable</strong> en solo <strong>48 horas</strong>.</p>
              <ul className="mt-6 space-y-3">
                {['Proceso automatizado en 48 horas', 'Sin penalizaciones ni comisiones', 'Fondo de liquidez propio de GSP', 'Disponible para inversores verificados'].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm"><CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" /><span>{item}</span></li>
                ))}
              </ul>
            </CardContent></Card>
          </motion.div>
          <motion.div custom={2} variants={fadeUp}>
            <Card className="h-full border-0 bg-white shadow-lg"><CardContent className="p-8">
              <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-emerald-100 text-emerald-700 mb-5"><BadgePercent className="size-7" /></div>
              <h3 className="text-2xl font-bold">Costos competitivos</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">Nuestros costos son hasta <strong>5x menores</strong> que el mercado.</p>
              <div className="mt-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2"><span className="font-semibold text-emerald-700 flex items-center gap-2"><TrendingUp className="size-4" /> GSP</span><span className="font-bold text-emerald-700 text-lg">3%</span></div>
                  <div className="h-4 rounded-full bg-emerald-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: '20%' }} /></div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2"><span className="font-semibold text-amber-600">Mercado tradicional</span><span className="font-bold text-amber-600 text-lg">15%</span></div>
                  <div className="h-4 rounded-full bg-amber-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: '100%' }} /></div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200/60">
                  <p className="text-sm font-medium text-emerald-800 flex items-center gap-2"><DollarSign className="size-4" /> Ahorro promedio: 12% anual en costos operativos</p>
                </div>
              </div>
            </CardContent></Card>
          </motion.div>
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ── TRANSPARENCY ── */
function TransparencySection() {
  const rows = [
    { concept: 'Administración', gsp: '1.2%', market: '4.0%' },
    { concept: 'Gestión de activos', gsp: '0.8%', market: '5.0%' },
    { concept: 'Auditoría y compliance', gsp: '0.5%', market: '2.0%' },
    { concept: 'Tecnología y plataforma', gsp: '0.3%', market: '1.5%' },
    { concept: 'Custodia y seguros', gsp: '0.2%', market: '2.5%' },
  ]
  return (
    <AnimatedSection className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-14">
          <Badge variant="secondary" className="mb-4"><Eye className="size-3.5 mr-1" /> Transparencia total</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Costos claros, sin sorpresas</h2>
        </motion.div>
        <motion.div custom={1} variants={fadeUp} className="max-w-3xl mx-auto">
          <Card className="border-border/60 overflow-hidden shadow-lg">
            <div className="grid grid-cols-3 bg-emerald-600 text-white">
              <div className="px-5 py-3.5 font-semibold text-sm">Concepto</div>
              <div className="px-5 py-3.5 font-semibold text-sm text-center">GSP</div>
              <div className="px-5 py-3.5 font-semibold text-sm text-center">Mercado</div>
            </div>
            {rows.map((row, i) => (
              <div key={row.concept} className={`grid grid-cols-3 ${i < rows.length - 1 ? 'border-b border-border/40' : ''}`}>
                <div className="px-5 py-3.5 text-sm">{row.concept}</div>
                <div className="px-5 py-3.5 text-sm text-center font-medium text-emerald-700">{row.gsp}</div>
                <div className="px-5 py-3.5 text-sm text-center text-amber-600">{row.market}</div>
              </div>
            ))}
            <div className="grid grid-cols-3 bg-muted/40 font-bold">
              <div className="px-5 py-3.5 text-sm">Total</div>
              <div className="px-5 py-3.5 text-sm text-center text-emerald-700">3%</div>
              <div className="px-5 py-3.5 text-sm text-center text-amber-600">15%</div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

/* ── CTA ── */
function CTASection() {
  const [email, setEmail] = useState('')
  return (
    <AnimatedSection className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div custom={0} variants={fadeUp} className="relative overflow-hidden rounded-3xl gsp-gradient p-10 sm:p-16 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <h2 className="relative text-3xl sm:text-4xl font-bold text-white tracking-tight">Comienza a invertir hoy</h2>
          <p className="relative mt-4 text-emerald-100 max-w-lg mx-auto text-lg">Únete a más de 340 inversores diversificando su portafolio.</p>
          <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-white/15 backdrop-blur-sm border-white/20 text-white placeholder:text-emerald-200/70" />
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 gap-2 h-12 px-6 shrink-0">Comenzar <ArrowRight className="size-4" /></Button>
          </div>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

/* ── TRUST ── */
function TrustSection() {
  const badges = [
    { icon: <Shield className="size-7" />, title: 'Datos protegidos', description: 'Encriptación de extremo a extremo.' },
    { icon: <Landmark className="size-7" />, title: 'Regulado por CMF', description: 'Supervisión de la CMF de Chile.' },
    { icon: <FileCheck2 className="size-7" />, title: 'Auditoría externa', description: 'Estados financieros auditados.' },
    { icon: <Lock className="size-7" />, title: 'Fondos custodiados', description: 'Custodia por entidades reguladas.' },
  ]
  return (
    <AnimatedSection className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-14">
          <Badge variant="secondary" className="mb-4"><ShieldCheck className="size-3.5 mr-1" /> Confianza</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Tu inversión está protegida</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((b, i) => (
            <motion.div key={b.title} custom={i + 1} variants={fadeUp}>
              <Card className="h-full border-border/60 gsp-card-hover bg-white text-center">
                <CardContent className="p-6 flex flex-col items-center gap-3">
                  <div className="flex items-center justify-center size-16 rounded-full bg-emerald-50 text-emerald-600">{b.icon}</div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="text-muted-foreground text-sm">{b.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

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
