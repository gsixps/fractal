'use client'

import { motion } from 'framer-motion'
import { Building2, MapPin, TrendingUp, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

interface FeaturedAsset {
  id: string
  name: string
  type: string
  typeIcon: React.ReactNode
  location: string
  yieldPercent: number
  pricePerFraction: number
  fundedPercent: number
  imageUrl: string
  imageAlt: string
}

const featuredAssets: FeaturedAsset[] = [
  {
    id: 'asset_residencial_norte',
    name: 'Torre Vitacura Residencial',
    type: 'Inmueble Residencial',
    typeIcon: <Building2 className="size-3.5" />,
    location: 'Las Condes, Santiago',
    yieldPercent: 14.2,
    pricePerFraction: 150000,
    fundedPercent: 78,
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop',
    imageAlt: 'Torre residencial moderna en Santiago',
  },
  {
    id: 'asset_datacenter_sp',
    name: 'Data Center Sur Poniente',
    type: 'Micro Data Center',
    typeIcon: <Building2 className="size-3.5" />,
    location: 'Quilicura, Santiago',
    yieldPercent: 16.5,
    pricePerFraction: 120000,
    fundedPercent: 92,
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop',
    imageAlt: 'Centro de datos moderno',
  },
  {
    id: 'asset_logistica_valpo',
    name: 'Parque Logístico Valparaíso',
    type: 'Logística Última Milla',
    typeIcon: <Building2 className="size-3.5" />,
    location: 'Placilla, Valparaíso',
    yieldPercent: 12.8,
    pricePerFraction: 180000,
    fundedPercent: 65,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop',
    imageAlt: 'Parque logístico industrial',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function FeaturedAssets() {
  const selectAsset = useAppStore((s) => s.selectAsset)
  const navigate = useAppStore((s) => s.navigate)

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">
            <TrendingUp className="size-3.5 mr-1" />
            Activos destacados
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Oportunidades de inversión activas
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-lg">
            Descubre activos inmobiliarios seleccionados con retornos atractivos y transparencia total.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAssets.map((asset, i) => (
            <motion.div
              key={asset.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              <Card className="overflow-hidden gsp-card-hover border-border/60 group cursor-pointer h-full">
                {/* Asset Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={asset.imageUrl}
                    alt={asset.imageAlt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-emerald-600/90 text-white backdrop-blur-sm border-0">
                      {asset.typeIcon}
                      {asset.type}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-emerald-700 backdrop-blur-sm border-0 font-semibold">
                      {asset.yieldPercent}% anual
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-5 flex flex-col gap-4 flex-1">
                  {/* Asset Info */}
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">
                      {asset.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground text-sm">
                      <MapPin className="size-3.5 text-emerald-500" />
                      {asset.location}
                    </div>
                  </div>

                  {/* Funding Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Financiamiento</span>
                      <span className="font-medium text-emerald-600">{asset.fundedPercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${asset.fundedPercent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-end justify-between mt-auto pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Desde</p>
                      <p className="text-xl font-bold text-foreground">
                        {formatCurrency(asset.pricePerFraction)}
                      </p>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        selectAsset(asset.id)
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    >
                      Invertir
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center mt-10"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('marketplace')}
            className="gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          >
            Ver todos los activos
            <ArrowRight className="size-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
