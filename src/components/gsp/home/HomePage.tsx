'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  FlaskConical,
  HandCoins,
  Layers,
  Lock,
  Mail,
  Pickaxe,
  Search,
  Shield,
  ShieldCheck,
  Sun,
  Truck,
  UserCheck,
  Wallet,
  Zap,
  TrendingUp,
  BarChart3,
  ChevronRight,
  BadgePercent,
  Landmark,
  Eye,
  FileCheck2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import FeaturedAssets from './FeaturedAssets'

/* ─────────────────────────────────────────────
   Animation Helpers
   ───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.12, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/* ─────────────────────────────────────────────
   HERO SECTION
   ───────────────────────────────────────────── */
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
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-br from-emerald-100/60 via-emerald-50/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-emerald-100/40 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <Badge variant="secondary" className="mb-6 px-3 py-1 text-sm gap-1.5">
              <Zap className="size-3.5 text-emerald-600" />
              Plataforma de inversión fraccionaria
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
          >
            Invierte en activos inmobiliarios desde{' '}
            <span className="gsp-gradient-text">$120.000</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Accede a propiedades inmobiliarias, data centers y activos de infraestructura
            con inversión fraccionaria. Diversifica tu portafolio con liquidez cuando la necesites.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate('marketplace')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-12 px-8 text-base shadow-lg shadow-emerald-600/20"
            >
              Explorar Activos
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="h-12 px-8 text-base border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 gap-2"
            >
              Cómo Funciona
              <ChevronRight className="size-4" />
            </Button>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-16 sm:mt-20"
        >
          <div className="gsp-glass rounded-2xl border border-emerald-100/60 shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-emerald-100/60">
              {stats.map((stat, i) => (
                <div key={i} className="py-6 px-6 sm:px-8 text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   HOW IT WORKS SECTION
   ───────────────────────────────────────────── */
function HowItWorksSection() {
  const steps = [
    {
      step: 1,
      icon: <UserCheck className="size-6" />,
      title: 'Regístrate y verifica',
      description:
        'Crea tu cuenta en minutos y completa tu verificación de identidad (KYC) de forma segura.',
    },
    {
      step: 2,
      icon: <Search className="size-6" />,
      title: 'Explora activos',
      description:
        'Navega nuestro catálogo de activos cuidadosamente seleccionados con métricas de rendimiento detalladas.',
    },
    {
      step: 3,
      icon: <HandCoins className="size-6" />,
      title: 'Invierte desde $120.000',
      description:
        'Elige cuánto invertir sin mínimos altos. Adquiere fracciones de activos inmobiliarios premium.',
    },
    {
      step: 4,
      icon: <Wallet className="size-6" />,
      title: 'Recibe dividendos',
      description:
        'Obtén rendimientos periódicos directamente en tu cuenta. Transparencia total sobre tus ganancias.',
    },
  ]

  return (
    <AnimatedSection id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-50/40">
      <div className="max-w-7xl mx-auto">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-14">
          <Badge variant="secondary" className="mb-4">
            <Layers className="size-3.5 mr-1" />
            Proceso simple
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Cómo funciona
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-lg">
            En 4 pasos simples comienza a diversificar tu portafolio de inversión.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, i) => (
            <motion.div key={item.step} custom={i + 1} variants={scaleIn}>
              <Card className="h-full border-border/60 gsp-card-hover bg-white">
                <CardContent className="p-6 flex flex-col items-start gap-4">
                  {/* Step number + icon */}
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex items-center justify-center size-12 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-5xl font-black text-emerald-100/80 leading-none">
                      {item.step}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
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

/* ─────────────────────────────────────────────
   ASSET TYPES SECTION
   ───────────────────────────────────────────── */
function AssetTypesSection() {
  const navigate = useAppStore((s) => s.navigate)

  const types = [
    {
      icon: <Building2 className="size-7" />,
      title: 'Inmuebles',
      description:
        'Propiedades residenciales y comerciales en ubicaciones premium con alto potencial de apreciación.',
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      icon: <FlaskConical className="size-7" />,
      title: 'Micro Data Centers',
      description:
        'Infraestructura de cómputo en el borde con contratos a largo plazo y retornos estables.',
      color: 'bg-teal-100 text-teal-700',
    },
    {
      icon: <Truck className="size-7" />,
      title: 'Logística Última Milla',
      description:
        'Bodegas y centros de distribución estratégicos para el comercio electrónico.',
      color: 'bg-amber-100 text-amber-700',
    },
    {
      icon: <Sun className="size-7" />,
      title: 'Energía Solar',
      description:
        'Parques solares con contratos de compraventa de energía a largo plazo.',
      color: 'bg-orange-100 text-orange-700',
    },
    {
      icon: <Pickaxe className="size-7" />,
      title: 'Minería',
      description:
        'Derechos mineros y contratos de arrendamiento con ingresos recurrentes.',
      color: 'bg-stone-100 text-stone-700',
    },
  ]

  return (
    <AnimatedSection className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-14">
          <Badge variant="secondary" className="mb-4">
            <BarChart3 className="size-3.5 mr-1" />
            Diversificación
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Tipos de activos
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-lg">
            Diversifica tu portafolio con diferentes clases de activos inmobiliarios e infraestructura.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map((type, i) => (
            <motion.div key={type.title} custom={i + 1} variants={scaleIn}>
              <Card className="h-full border-border/60 gsp-card-hover bg-white group cursor-pointer">
                <CardContent className="p-6">
                  <div
                    className={`inline-flex items-center justify-center size-14 rounded-2xl ${type.color} mb-4 transition-transform duration-300 group-hover:scale-110`}
                  >
                    {type.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{type.title}</h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    {type.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div custom={6} variants={fadeUp} className="text-center mt-10">
          <Button
            onClick={() => navigate('marketplace')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            Ver activos disponibles
            <ArrowRight className="size-4" />
          </Button>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

/* ─────────────────────────────────────────────
   LIQUIDITY SECTION
   ───────────────────────────────────────────── */
function LiquiditySection() {
  return (
    <AnimatedSection className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-50/40">
      <div className="max-w-7xl mx-auto">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-14">
          <Badge variant="secondary" className="mb-4">
            <Clock className="size-3.5 mr-1" />
            Liquidez inmediata
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Liquidez cuando la necesitas
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-lg">
            A diferencia de otras plataformas, GSP te da la flexibilidad de convertir tus
            fracciones en efectivo rápidamente.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Salida Express Card */}
          <motion.div custom={1} variants={scaleIn}>
            <Card className="h-full border-0 bg-white shadow-lg gsp-card-hover">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-emerald-100 text-emerald-700 mb-5">
                  <Zap className="size-7" />
                </div>
                <h3 className="text-2xl font-bold">Salida Express</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Vende tus fracciones a <span className="font-semibold text-foreground">valor contable</span> en
                  solo <span className="font-semibold text-foreground">48 horas</span>. Sin comisiones ocultas,
                  sin esperas interminables.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    'Proceso automatizado en 48 horas',
                    'Sin penalizaciones ni comisiones de salida',
                    'Fondo de liquidez propio de GSP',
                    'Disponible para todos los inversores verificados',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cost Comparison Card */}
          <motion.div custom={2} variants={scaleIn}>
            <Card className="h-full border-0 bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-emerald-100 text-emerald-700 mb-5">
                  <BadgePercent className="size-7" />
                </div>
                <h3 className="text-2xl font-bold">Costos competitivos</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Nuestros costos operativos son hasta <span className="font-semibold text-foreground">5x menores</span> que
                  los del mercado tradicional.
                </p>

                {/* Visual Comparison */}
                <div className="mt-8 space-y-6">
                  {/* GSP */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-emerald-700 flex items-center gap-2">
                        <TrendingUp className="size-4" />
                        GSP
                      </span>
                      <span className="font-bold text-emerald-700 text-lg">3%</span>
                    </div>
                    <div className="h-4 rounded-full bg-emerald-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        initial={{ width: 0 }}
                        whileInView={{ width: '20%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Costos operativos anuales</p>
                  </div>

                  {/* Market */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-amber-600 flex items-center gap-2">
                        <BarChart3 className="size-4" />
                        Mercado tradicional
                      </span>
                      <span className="font-bold text-amber-600 text-lg">15%</span>
                    </div>
                    <div className="h-4 rounded-full bg-amber-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.4 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Costos operativos anuales</p>
                  </div>

                  {/* Savings callout */}
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200/60">
                    <p className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                      <DollarSign className="size-4" />
                      Ahorro promedio: 12% anual en costos operativos vs mercado tradicional
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

/* ─────────────────────────────────────────────
   TRANSPARENCY SECTION
   ───────────────────────────────────────────── */
function TransparencySection() {
  const costItems = [
    { concept: 'Administración', gsp: '1.2%', market: '4.0%' },
    { concept: 'Gestión de activos', gsp: '0.8%', market: '5.0%' },
    { concept: 'Auditoría y compliance', gsp: '0.5%', market: '2.0%' },
    { concept: 'Tecnología y plataforma', gsp: '0.3%', market: '1.5%' },
    { concept: 'Custodia y seguros', gsp: '0.2%', market: '2.5%' },
  ]

  const gspTotal = 3.0
  const marketTotal = 15.0

  return (
    <AnimatedSection className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-14">
          <Badge variant="secondary" className="mb-4">
            <Eye className="size-3.5 mr-1" />
            Transparencia total
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Costos claros, sin sorpresas
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-lg">
            Conoce exactamente a qué destino va cada peso de tus costos operativos.
          </p>
        </motion.div>

        <motion.div custom={1} variants={fadeUp} className="max-w-3xl mx-auto">
          <Card className="border-border/60 overflow-hidden shadow-lg">
            {/* Header */}
            <div className="grid grid-cols-3 bg-emerald-600 text-white">
              <div className="px-5 py-3.5 font-semibold text-sm">Concepto</div>
              <div className="px-5 py-3.5 font-semibold text-sm text-center">GSP</div>
              <div className="px-5 py-3.5 font-semibold text-sm text-center">Mercado</div>
            </div>

            {/* Rows */}
            {costItems.map((row, i) => (
              <div
                key={row.concept}
                className={`grid grid-cols-3 ${
                  i < costItems.length - 1 ? 'border-b border-border/40' : ''
                }`}
              >
                <div className="px-5 py-3.5 text-sm">{row.concept}</div>
                <div className="px-5 py-3.5 text-sm text-center">
                  <span className="font-medium text-emerald-700">{row.gsp}</span>
                </div>
                <div className="px-5 py-3.5 text-sm text-center">
                  <span className="text-amber-600">{row.market}</span>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="grid grid-cols-3 bg-muted/40 font-bold">
              <div className="px-5 py-3.5 text-sm">Total</div>
              <div className="px-5 py-3.5 text-sm text-center text-emerald-700">{gspTotal}%</div>
              <div className="px-5 py-3.5 text-sm text-center text-amber-600">{marketTotal}%</div>
            </div>
          </Card>

          <motion.div custom={2} variants={fadeUp} className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Todos los costos están documentados y disponibles en el contrato de cada activo.
              Sin comisiones ocultas ni cargos adicionales.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

/* ─────────────────────────────────────────────
   CTA SECTION
   ───────────────────────────────────────────── */
function CTASection() {
  const [email, setEmail] = useState('')

  return (
    <AnimatedSection className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          custom={0}
          variants={scaleIn}
          className="relative overflow-hidden rounded-3xl gsp-gradient p-10 sm:p-16 text-center"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Comienza a invertir hoy
            </h2>
            <p className="mt-4 text-emerald-100 max-w-lg mx-auto text-lg">
              Únete a más de 340 inversores que ya están diversificando su portafolio
              con activos inmobiliarios fraccionarios.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white/15 backdrop-blur-sm border-white/20 text-white placeholder:text-emerald-200/70 focus-visible:ring-white/30 focus-visible:border-white/40"
              />
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 gap-2 h-12 px-6 shrink-0 shadow-lg"
              >
                Comenzar
                <ArrowRight className="size-4" />
              </Button>
            </div>

            <p className="mt-4 text-emerald-200/70 text-xs">
              Sin compromiso. Sin tarjetas de crédito. Solo necesitas tu RUT.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

/* ─────────────────────────────────────────────
   TRUST / SECURITY SECTION
   ───────────────────────────────────────────── */
function TrustSection() {
  const badges = [
    {
      icon: <Shield className="size-7" />,
      title: 'Datos protegidos',
      description: 'Encriptación de extremo a extremo para toda tu información personal y financiera.',
    },
    {
      icon: <Landmark className="size-7" />,
      title: 'Regulado por CMF',
      description: 'Operamos bajo supervisión de la Comisión para el Mercado Financiero de Chile.',
    },
    {
      icon: <FileCheck2 className="size-7" />,
      title: 'Auditoría externa',
      description: 'Estados financieros auditados trimestralmente por firmas independientes.',
    },
    {
      icon: <Lock className="size-7" />,
      title: 'Fondos custodiados',
      description: 'Tus inversiones están custodiadas por entidades financieras reguladas.',
    },
  ]

  return (
    <AnimatedSection className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div custom={0} variants={fadeUp} className="text-center mb-14">
          <Badge variant="secondary" className="mb-4">
            <ShieldCheck className="size-3.5 mr-1" />
            Confianza y seguridad
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Tu inversión está protegida
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-lg">
            Cumplimos con los más altos estándares de seguridad y regulación del mercado.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, i) => (
            <motion.div key={badge.title} custom={i + 1} variants={scaleIn}>
              <Card className="h-full border-border/60 gsp-card-hover bg-white text-center">
                <CardContent className="p-6 flex flex-col items-center gap-3">
                  <div className="flex items-center justify-center size-16 rounded-full bg-emerald-50 text-emerald-600">
                    {badge.icon}
                  </div>
                  <h3 className="font-semibold">{badge.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {badge.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ─────────────────────────────────────────────
   FOOTER (Simple)
   ───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-border/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg gsp-gradient">
            <TrendingUp className="size-4 text-white" />
          </div>
          <span className="font-bold text-lg">GSP</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} GSP Fintech. Todos los derechos reservados.
        </p>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors">Términos</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Privacidad</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Contacto</span>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────────
   HOME PAGE (main export)
   ───────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <AssetTypesSection />
        <FeaturedAssets />
        <LiquiditySection />
        <TransparencySection />
        <CTASection />
        <TrustSection />
      </main>
      <Footer />
    </div>
  )
}
