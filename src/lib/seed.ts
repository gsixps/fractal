import { db } from '@/lib/db'
import { translationsData } from '@/lib/i18n-data'

const ASSET_TYPES = ['real_estate', 'micro_datacenter', 'last_mile_logistics', 'solar_energy', 'mining'] as const

// ─── Currency Seed Data ──────────────────────────────────────────────────
const CURRENCIES = [
  { code: 'USD', name: 'Dólar Estadounidense', symbol: 'US$', flag: '🇺🇸', sortOrder: 1, isActive: true },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', sortOrder: 2, isActive: true },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$', flag: '🇨🇱', sortOrder: 3, isActive: true },
  { code: 'MXN', name: 'Peso Mexicano', symbol: 'MX$', flag: '🇲🇽', sortOrder: 4, isActive: true },
  { code: 'COP', name: 'Peso Colombiano', symbol: 'COL$', flag: '🇨🇴', sortOrder: 5, isActive: true },
  { code: 'ARS', name: 'Peso Argentino', symbol: 'AR$', flag: '🇦🇷', sortOrder: 6, isActive: true },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', flag: '🇵🇪', sortOrder: 7, isActive: true },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$', flag: '🇧🇷', sortOrder: 8, isActive: true },
  { code: 'VES', name: 'Bolívar Venezolano', symbol: 'Bs.', flag: '🇻🇪', sortOrder: 9, isActive: true },
]

const DEMO_ASSETS = [
  {
    name: 'Centro Logístico Santiago Norte',
    slug: 'centro-logistico-stgo-norte',
    type: 'last_mile_logistics',
    status: 'active',
    address: 'Av. Américo Vespucio 0450, Quilicura',
    city: 'Santiago',
    region: 'Metropolitana',
    country: 'Chile',
    latitude: -33.3872,
    longitude: -70.7401,
    totalValue: 2800000000,
    pricePerFraction: 250000,
    totalFractions: 11200,
    availableFractions: 3200,
    minimumInvestment: 250000,
    fundedPercentage: 71.4,
    annualYield: 11.2,
    projectedAppreciation: 5.8,
    totalProjectedReturn: 17.0,
    leaseStatus: 'leased',
    leaseStart: new Date('2024-03-01'),
    leaseEnd: new Date('2029-02-28'),
    monthlyRent: 19800000,
    tenantName: 'LogiChile SpA',
    totalArea: 4500,
    units: 12,
    constructionYear: 2021,
    landUse: 'Industrial / Logístico',
    shortDescription: 'Centro de distribución de última milla en zona de alta demanda logística, con 12 módulos independientes y contratos de arriendo a 5 años.',
    fullDescription: `## Centro Logístico Santiago Norte\n\nUbicado en el corazón del corredor industrial de Quilicura, este centro de distribución de última milla representa una oportunidad excepcional en el sector logístico chileno.\n\n### ¿Por qué invertir?\n\nEl e-commerce en Chile creció un **340%** desde 2019, generando una demanda insatisfecha de espacios de última milla.`,
    highlights: JSON.stringify(['Zona de mayor crecimiento logístico de Chile', 'Contrato de arriendo a 5 años con empresa AAA', 'Certificación LEED Gold', 'Costos operativos del 3% vs 15% del mercado']),
    badge: 'En Arriendo',
    operationalCosts: 712800000,
    operationalCostsPct: 3.0,
    riskLevel: 'medium',
    riskDescription: 'Riesgo moderado asociado al sector logístico. Mitigado por contratos de arriendo de largo plazo.',
    dividendFrequency: 'monthly',
    minInvestmentPeriod: 12,
    tags: 'logística,última milla,e-commerce,Quilicura',
    amenities: JSON.stringify(['Andenes de carga nivelados', 'Vigilancia 24/7', 'Estacionamiento para 40 vehículos', 'Certificación LEED Gold']),
    images: [
      { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop', alt: 'Centro logístico - Vista aérea', sortOrder: 0, isCover: true },
      { url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop', alt: 'Interior bodega', sortOrder: 1, isCover: false },
    ],
    documents: [
      { title: 'Escritura SpA', documentType: 'escritura_spa', fileUrl: '#' },
      { title: 'Informe de Tasación 2024', documentType: 'tasacion', fileUrl: '#' },
    ],
    cashFlowProjections: [
      { period: 'Año 1', periodType: 'yearly', grossIncome: 237600000, operationalCost: 7128000, netIncome: 230472000, appreciation: 162400000, totalReturn: 392872000, cumulativeReturn: 392872000 },
      { period: 'Año 2', periodType: 'yearly', grossIncome: 244928000, operationalCost: 7347840, netIncome: 237580160, appreciation: 171822400, totalReturn: 409402560, cumulativeReturn: 802274560 },
      { period: 'Año 3', periodType: 'yearly', grossIncome: 252275840, operationalCost: 7568275, netIncome: 244707565, appreciation: 181783520, totalReturn: 426491085, cumulativeReturn: 1228765645 },
      { period: 'Año 4', periodType: 'yearly', grossIncome: 259844115, operationalCost: 7795323, netIncome: 252048792, appreciation: 192325600, totalReturn: 444374392, cumulativeReturn: 1673139837 },
      { period: 'Año 5', periodType: 'yearly', grossIncome: 267639438, operationalCost: 8029183, netIncome: 259610255, appreciation: 203470400, totalReturn: 463080655, cumulativeReturn: 2136220492 },
    ],
  },
  {
    name: 'Micro Data Center Valparaíso',
    slug: 'micro-datacenter-valparaiso',
    type: 'micro_datacenter',
    status: 'active',
    address: 'Calle Condell 1520, Valparaíso',
    city: 'Valparaíso',
    region: 'Valparaíso',
    country: 'Chile',
    latitude: -33.0472,
    longitude: -71.6127,
    totalValue: 1850000000,
    pricePerFraction: 185000,
    totalFractions: 10000,
    availableFractions: 1500,
    minimumInvestment: 185000,
    fundedPercentage: 85.0,
    annualYield: 13.8,
    projectedAppreciation: 7.2,
    totalProjectedReturn: 21.0,
    leaseStatus: 'leased',
    leaseStart: new Date('2024-01-15'),
    leaseEnd: new Date('2031-01-14'),
    monthlyRent: 15680000,
    tenantName: 'CloudSur SpA',
    totalArea: 800,
    units: 3,
    constructionYear: 2023,
    landUse: 'Tecnológico / Data Center',
    shortDescription: 'Micro data center Tier II con infraestructura redundante y contratos de hosting a 7 años.',
    fullDescription: `## Micro Data Center Valparaíso\n\nUn centro de datos de última generación ubicado estratégicamente en Valparaíso, el segundo hub tecnológico de Chile.`,
    highlights: JSON.stringify(['Sector tecnológico de mayor crecimiento en Chile', 'Contrato de arriendo a 7 años', 'Certificación Tier II']),
    badge: 'Últimos cupos',
    operationalCosts: 555000000,
    operationalCostsPct: 3.0,
    riskLevel: 'low',
    riskDescription: 'Bajo riesgo por contratos de arriendo a largo plazo con empresa tecnológica consolidada.',
    dividendFrequency: 'monthly',
    minInvestmentPeriod: 24,
    tags: 'data center,tecnología,Valparaíso,nube',
    amenities: JSON.stringify(['Tier II certificado', 'Energía redundante', 'Seguridad biométrica', 'Fibra óptica múltiple']),
    images: [
      { url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop', alt: 'Data center', sortOrder: 0, isCover: true },
      { url: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&h=600&fit=crop', alt: 'Servidores', sortOrder: 1, isCover: false },
    ],
    documents: [
      { title: 'Escritura SpA', documentType: 'escritura_spa', fileUrl: '#' },
      { title: 'Informe de Tasación 2024', documentType: 'tasacion', fileUrl: '#' },
    ],
    cashFlowProjections: [
      { period: 'Año 1', periodType: 'yearly', grossIncome: 188160000, operationalCost: 5644800, netIncome: 182515200, appreciation: 133200000, totalReturn: 315715200, cumulativeReturn: 315715200 },
      { period: 'Año 2', periodType: 'yearly', grossIncome: 194582400, operationalCost: 5837472, netIncome: 188744928, appreciation: 142794240, totalReturn: 331539168, cumulativeReturn: 647254368 },
      { period: 'Año 3', periodType: 'yearly', grossIncome: 201273379, operationalCost: 6038201, netIncome: 195235178, appreciation: 152954208, totalReturn: 348189386, cumulativeReturn: 995443754 },
    ],
  },
  {
    name: 'Parque Solar Atacama III',
    slug: 'parque-solar-atacama-iii',
    type: 'solar_energy',
    status: 'active',
    address: 'Camino a Calama km 12, Antofagasta',
    city: 'Calama',
    region: 'Antofagasta',
    country: 'Chile',
    latitude: -22.4567,
    longitude: -68.9333,
    totalValue: 5200000000,
    pricePerFraction: 520000,
    totalFractions: 10000,
    availableFractions: 6800,
    minimumInvestment: 520000,
    fundedPercentage: 32.0,
    annualYield: 9.5,
    projectedAppreciation: 4.2,
    totalProjectedReturn: 13.7,
    leaseStatus: 'leased',
    leaseStart: new Date('2024-06-01'),
    leaseEnd: new Date('2034-05-31'),
    monthlyRent: 28500000,
    tenantName: 'EnergíaPlus SpA',
    totalArea: 12000,
    units: 1,
    constructionYear: 2024,
    landUse: 'Energía Renovable',
    shortDescription: 'Parque solar de 2MW en el desierto de Atacama, el lugar con mayor radiación solar del mundo.',
    fullDescription: `## Parque Solar Atacama III\n\nUbicado en el desierto de Atacama — el lugar con la **mayor radiación solar del planeta**.`,
    highlights: JSON.stringify(['Mayor radiación solar del mundo', 'Contrato PPA a 10 años', 'Sector con crecimiento obligatorio por ley']),
    badge: 'Oportunidad',
    operationalCosts: 1560000000,
    operationalCostsPct: 3.0,
    riskLevel: 'medium',
    riskDescription: 'Riesgo moderado. Mitigado por contrato PPA a 10 años con garantía estatal.',
    dividendFrequency: 'quarterly',
    minInvestmentPeriod: 36,
    tags: 'energía solar,renovable,Atacama,PPA',
    amenities: JSON.stringify(['2MW capacidad instalada', 'Paneles bifaciales', 'Mantenimiento preventivo incluido']),
    images: [
      { url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop', alt: 'Paneles solares', sortOrder: 0, isCover: true },
      { url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&h=600&fit=crop', alt: 'Parque solar', sortOrder: 1, isCover: false },
    ],
    documents: [
      { title: 'Escritura SpA', documentType: 'escritura_spa', fileUrl: '#' },
      { title: 'Informe de Tasación 2024', documentType: 'tasacion', fileUrl: '#' },
    ],
    cashFlowProjections: [
      { period: 'Año 1', periodType: 'yearly', grossIncome: 342000000, operationalCost: 10260000, netIncome: 331740000, appreciation: 218400000, totalReturn: 550140000, cumulativeReturn: 550140000 },
      { period: 'Año 2', periodType: 'yearly', grossIncome: 348840000, operationalCost: 10465200, netIncome: 338374800, appreciation: 227616000, totalReturn: 565990800, cumulativeReturn: 1116130800 },
    ],
  },
  {
    name: 'Residencial Providencia Sky',
    slug: 'residencial-providencia-sky',
    type: 'real_estate',
    status: 'active',
    address: 'Av. Providencia 2340, Providencia',
    city: 'Santiago',
    region: 'Metropolitana',
    country: 'Chile',
    latitude: -33.4378,
    longitude: -70.6285,
    totalValue: 1600000000,
    pricePerFraction: 160000,
    totalFractions: 10000,
    availableFractions: 4100,
    minimumInvestment: 160000,
    fundedPercentage: 59.0,
    annualYield: 8.4,
    projectedAppreciation: 6.5,
    totalProjectedReturn: 14.9,
    leaseStatus: 'leased',
    leaseStart: new Date('2024-04-01'),
    leaseEnd: new Date('2027-03-31'),
    monthlyRent: 8900000,
    tenantName: 'Inmobiliaria Andes SpA',
    totalArea: 2200,
    units: 8,
    constructionYear: 2022,
    landUse: 'Residencial / Arriendo',
    shortDescription: 'Edificio residencial premium en Providencia con 8 departamentos de alto estándar.',
    fullDescription: `## Residencial Providencia Sky\n\nEdificio residencial de lujo en una de las comunas más cotizadas de Santiago.`,
    highlights: JSON.stringify(['Ubicación premium en Providencia', 'Tasa de ocupación del 97%', 'Cerca del metro']),
    badge: 'En Arriendo',
    operationalCosts: 480000000,
    operationalCostsPct: 3.0,
    riskLevel: 'low',
    riskDescription: 'Bajo riesgo por ubicación premium y alta demanda residencial en Providencia.',
    dividendFrequency: 'monthly',
    minInvestmentPeriod: 6,
    tags: 'residencial,Providencia,departamentos,inmueble',
    amenities: JSON.stringify(['Gimnasio', 'Terraza comunitaria', 'Estacionamiento bicicletas', 'Laundry']),
    images: [
      { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop', alt: 'Edificio', sortOrder: 0, isCover: true },
      { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop', alt: 'Interior', sortOrder: 1, isCover: false },
    ],
    documents: [
      { title: 'Escritura SpA', documentType: 'escritura_spa', fileUrl: '#' },
      { title: 'Informe de Tasación 2024', documentType: 'tasacion', fileUrl: '#' },
    ],
    cashFlowProjections: [
      { period: 'Año 1', periodType: 'yearly', grossIncome: 106800000, operationalCost: 3204000, netIncome: 103596000, appreciation: 104000000, totalReturn: 207596000, cumulativeReturn: 207596000 },
      { period: 'Año 2', periodType: 'yearly', grossIncome: 110004000, operationalCost: 3300120, netIncome: 106703880, appreciation: 110760000, totalReturn: 217463880, cumulativeReturn: 425059880 },
    ],
  },
  {
    name: 'Complejo Minero Atacama Norte',
    slug: 'complejo-minero-atacama-norte',
    type: 'mining',
    status: 'active',
    address: 'Sector Sierra Gorda, Antofagasta',
    city: 'Sierra Gorda',
    region: 'Antofagasta',
    country: 'Chile',
    latitude: -22.8933,
    longitude: -69.7333,
    totalValue: 8500000000,
    pricePerFraction: 850000,
    totalFractions: 10000,
    availableFractions: 7200,
    minimumInvestment: 850000,
    fundedPercentage: 28.0,
    annualYield: 14.2,
    projectedAppreciation: 8.5,
    totalProjectedReturn: 22.7,
    leaseStatus: 'leased',
    leaseStart: new Date('2024-02-01'),
    leaseEnd: new Date('2032-01-31'),
    monthlyRent: 63500000,
    tenantName: 'MineraAndina SpA',
    totalArea: 50000,
    units: 1,
    constructionYear: 2020,
    landUse: 'Minero / Extractivo',
    shortDescription: 'Complejo de apoyo minero con contratos de arriendo a 8 años. Exposición al boom del litio.',
    fullDescription: `## Complejo Minero Atacama Norte\n\nComplejo logístico-minero con infraestructura para apoyo a operaciones extractivas en el corredor del litio chileno.`,
    highlights: JSON.stringify(['Exposición al boom del litio y cobre', 'Contrato de arriendo a 8 años', 'Retorno total del 22.7% anual']),
    badge: 'Oportunidad',
    operationalCosts: 2550000000,
    operationalCostsPct: 3.0,
    riskLevel: 'high',
    riskDescription: 'Riesgo alto por exposición al ciclo de commodities. Mitigado por contratos a largo plazo.',
    dividendFrequency: 'quarterly',
    minInvestmentPeriod: 36,
    tags: 'minería,litio,cobre,Antofagasta',
    amenities: JSON.stringify(['Campamento 200 personas', 'Talleres mecánicos', 'Planta tratamiento de aguas']),
    images: [
      { url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&h=600&fit=crop', alt: 'Operación minera', sortOrder: 0, isCover: true },
      { url: 'https://images.unsplash.com/photo-1578496479531-32e296d5c6e8?w=800&h=600&fit=crop', alt: 'Maquinaria', sortOrder: 1, isCover: false },
    ],
    documents: [
      { title: 'Escritura SpA', documentType: 'escritura_spa', fileUrl: '#' },
      { title: 'Informe de Tasación 2024', documentType: 'tasacion', fileUrl: '#' },
    ],
    cashFlowProjections: [
      { period: 'Año 1', periodType: 'yearly', grossIncome: 762000000, operationalCost: 22860000, netIncome: 739140000, appreciation: 722500000, totalReturn: 1461640000, cumulativeReturn: 1461640000 },
      { period: 'Año 2', periodType: 'yearly', grossIncome: 787380000, operationalCost: 23621400, netIncome: 763758600, appreciation: 783912500, totalReturn: 1547671100, cumulativeReturn: 3009311100 },
    ],
  },
  {
    name: 'Bodega E-Commerce Maipú Hub',
    slug: 'bodega-ecommerce-maipu',
    type: 'last_mile_logistics',
    status: 'active',
    address: 'Av. Pajaritos 3345, Maipú',
    city: 'Santiago',
    region: 'Metropolitana',
    country: 'Chile',
    latitude: -33.4725,
    longitude: -70.7542,
    totalValue: 1200000000,
    pricePerFraction: 120000,
    totalFractions: 10000,
    availableFractions: 5600,
    minimumInvestment: 120000,
    fundedPercentage: 44.0,
    annualYield: 10.5,
    projectedAppreciation: 5.0,
    totalProjectedReturn: 15.5,
    leaseStatus: 'leased',
    leaseStart: new Date('2024-05-01'),
    leaseEnd: new Date('2029-04-30'),
    monthlyRent: 7800000,
    tenantName: 'MercadoLibre Logistics',
    totalArea: 2800,
    units: 6,
    constructionYear: 2023,
    landUse: 'Logístico / Last Mile',
    shortDescription: 'Hub de fulfillment para e-commerce en Maipú. Contrato con operador logístico líder.',
    fullDescription: `## Bodega E-Commerce Maipú Hub\n\nHub logístico diseñado específicamente para operaciones de e-commerce y fulfillment.`,
    highlights: JSON.stringify(['Operador logístico líder regional', 'Diseñado para e-commerce', 'Entrada desde $120.000']),
    badge: 'En Arriendo',
    operationalCosts: 360000000,
    operationalCostsPct: 3.0,
    riskLevel: 'low',
    riskDescription: 'Bajo riesgo. Contrato con operador líder de e-commerce en Latinoamérica.',
    dividendFrequency: 'monthly',
    minInvestmentPeriod: 12,
    tags: 'e-commerce,logística,Maipú,fulfillment',
    amenities: JSON.stringify(['Andenes de carga', 'Sistema de inventario', 'CCTV 24/7']),
    images: [
      { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop', alt: 'Bodega', sortOrder: 0, isCover: true },
      { url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop', alt: 'Interior', sortOrder: 1, isCover: false },
    ],
    documents: [
      { title: 'Escritura SpA', documentType: 'escritura_spa', fileUrl: '#' },
      { title: 'Informe de Tasación', documentType: 'tasacion', fileUrl: '#' },
    ],
    cashFlowProjections: [
      { period: 'Año 1', periodType: 'yearly', grossIncome: 93600000, operationalCost: 2808000, netIncome: 90792000, appreciation: 60000000, totalReturn: 150792000, cumulativeReturn: 150792000 },
      { period: 'Año 2', periodType: 'yearly', grossIncome: 96408000, operationalCost: 2892240, netIncome: 93515760, appreciation: 63000000, totalReturn: 156515760, cumulativeReturn: 307307760 },
    ],
  },
]

// ─── Site Settings Seed ──────────────────────────────────────────────────────
const SITE_SETTINGS = [
  // Hero
  { key: 'hero_badge', value: 'Plataforma de inversión fraccionaria', type: 'text', group: 'hero', label: 'Badge del Hero' },
  { key: 'hero_title', value: 'Invierte en activos inmobiliarios desde {price}', type: 'text', group: 'hero', label: 'Título del Hero' },
  { key: 'hero_highlight', value: '$120.000', type: 'text', group: 'hero', label: 'Precio destacado' },
  { key: 'hero_subtitle', value: 'Accede a propiedades inmobiliarias, data centers y activos de infraestructura con inversión fraccionaria y liquidez inmediata.', type: 'text', group: 'hero', label: 'Subtítulo del Hero' },
  { key: 'hero_cta_primary', value: 'Explorar Activos', type: 'text', group: 'hero', label: 'Botón CTA Primario' },
  { key: 'hero_cta_secondary', value: 'Cómo Funciona', type: 'text', group: 'hero', label: 'Botón CTA Secundario' },
  // Stats
  { key: 'stat_1_value', value: '$2.100M+', type: 'text', group: 'stats', label: 'Stat 1 - Valor' },
  { key: 'stat_1_label', value: 'Activos gestionados', type: 'text', group: 'stats', label: 'Stat 1 - Etiqueta' },
  { key: 'stat_2_value', value: '340+', type: 'text', group: 'stats', label: 'Stat 2 - Valor' },
  { key: 'stat_2_label', value: 'Inversores activos', type: 'text', group: 'stats', label: 'Stat 2 - Etiqueta' },
  { key: 'stat_3_value', value: '12.8%', type: 'text', group: 'stats', label: 'Stat 3 - Valor' },
  { key: 'stat_3_label', value: 'Retorno anual promedio', type: 'text', group: 'stats', label: 'Stat 3 - Etiqueta' },
  { key: 'stat_4_value', value: '3%', type: 'text', group: 'stats', label: 'Stat 4 - Valor' },
  { key: 'stat_4_label', value: 'Costos operativos', type: 'text', group: 'stats', label: 'Stat 4 - Etiqueta' },
  // CTA
  { key: 'cta_title', value: 'Comienza a invertir hoy', type: 'text', group: 'cta', label: 'Título CTA' },
  { key: 'cta_subtitle', value: 'Únete a más de 340 inversores diversificando su portafolio con activos inmobiliarios premium.', type: 'text', group: 'cta', label: 'Subtítulo CTA' },
  { key: 'cta_button', value: 'Comenzar', type: 'text', group: 'cta', label: 'Botón CTA' },
  // Footer
  { key: 'footer_company', value: 'GSP Inversiones SpA', type: 'text', group: 'footer', label: 'Nombre empresa' },
  { key: 'footer_address', value: 'Av. Apoquindo 3000, Las Condes, Santiago, Chile', type: 'text', group: 'footer', label: 'Dirección' },
  { key: 'footer_email', value: 'contacto@gsp.cl', type: 'text', group: 'footer', label: 'Email contacto' },
  { key: 'footer_phone', value: '+56 2 2345 6789', type: 'text', group: 'footer', label: 'Teléfono' },
  // SEO
  { key: 'seo_title', value: 'GSP — Inversión Fraccionaria en Activos Inmobiliarios', type: 'text', group: 'seo', label: 'Meta Title' },
  { key: 'seo_description', value: 'Invierte en propiedades inmobiliarias, data centers y activos de infraestructura desde $120.000. Rendimientos de hasta 22% anual con liquidez inmediata.', type: 'text', group: 'seo', label: 'Meta Description' },
  // Platform
  { key: 'platform_fee_pct', value: '3.0', type: 'number', group: 'platform', label: 'Comisión plataforma (%)', description: 'Comisión total cobrada por GSP' },
  { key: 'liquidity_processing_days', value: '3', type: 'number', group: 'platform', label: 'Días procesamiento liquidez' },
  { key: 'min_investment_default', value: '120000', type: 'number', group: 'platform', label: 'Inversión mínima por defecto (CLP)' },
]

// ─── FAQ Seed ─────────────────────────────────────────────────────────────────
const FAQS = [
  { question: '¿Qué es GSP?', answer: 'GSP es una plataforma chilena de inversión fraccionaria que te permite invertir en activos inmobiliarios y de infraestructura desde $120.000. Nos diferenciamos por tener los costos operativos más bajos del mercado (3%) y un fondo de liquidez propio para que puedas salir cuando lo necesites.', category: 'inversion', sortOrder: 1 },
  { question: '¿Cómo funciona la inversión fraccionaria?', answer: 'GSP adquiere activos inmobiliarios y de infraestructura (data centers, parques solares, bodegas logísticas) y los divide en fracciones. Cada fracción representa una parte proporcional del activo. Al invertir, recibes dividendos mensuales según la renta generada y participas de la apreciación del activo.', category: 'inversion', sortOrder: 2 },
  { question: '¿Cuál es la inversión mínima?', answer: 'Puedes comenzar a invertir desde $120.000 CLP (aprox. $120 USD). No hay montos máximos de inversión. Cada activo tiene su propio precio por fracción y puedes adquirir múltiples fracciones del mismo o diferentes activos.', category: 'inversion', sortOrder: 3 },
  { question: '¿Qué es la Salida Express?', answer: 'La Salida Express es nuestro fondo de liquidez propio que te permite vender tus fracciones a valor contable en solo 48 horas. A diferencia de otras plataformas donde tu dinero queda atrapado por años, en GSP tienes liquidez inmediata sin penalizaciones ni comisiones adicionales.', category: 'liquidez', sortOrder: 1 },
  { question: '¿Cuánto tiempo toma recuperar mi inversión?', answer: 'Puedes solicitar la Salida Express en cualquier momento y recibir el dinero en 48 horas hábiles. Alternativamente, puedes mantener tu inversión a largo plazo y recibir dividendos mensuales + plusvalía al momento de la venta del activo.', category: 'liquidez', sortOrder: 2 },
  { question: '¿Es seguro invertir en GSP?', answer: 'Sí. GSP opera bajo supervisión de la CMF (Comisión para el Mercado Financiero) de Chile. Todos los activos tienen escrituras registradas, estados financieros auditados trimestralmente, y los fondos de los inversores están custodiados por entidades reguladas. Además, contamos con certificación de seguridad de la información.', category: 'seguridad', sortOrder: 1 },
  { question: '¿Cómo se protegen mis datos?', answer: 'Utilizamos encriptación de extremo a extremo (E2E) y contamos con certificación SOC 2. Tus datos personales y financieros están protegidos con los más altos estándares de seguridad de la industria.', category: 'seguridad', sortOrder: 2 },
  { question: '¿Qué documentos necesito para registrarme?', answer: 'Solo necesitas tu cédula de identidad o pasaporte, RUT, y una cuenta bancaria chilena. El proceso de verificación KYC toma menos de 5 minutos y se aprueba generalmente en 24 horas hábiles.', category: 'cuentas', sortOrder: 1 },
  { question: '¿Puedo tener más de una inversión activa?', answer: '¡Por supuesto! Puedes diversificar tu portafolio invirtiendo en múltiples activos simultáneamente. Te recomendamos diversificar entre diferentes tipos de activos (inmuebles, data centers, energía solar, logística) para optimizar el riesgo-retorno de tu inversión.', category: 'cuentas', sortOrder: 2 },
  { question: '¿Cómo se calculan los dividendos?', answer: 'Los dividendos se calculan mensualmente según la renta neta del activo (ingresos por arriendo menos costos operativos). Tu dividendo es proporcional a la cantidad de fracciones que posees. Los dividendos se depositan directamente en tu cuenta bancaria registrada durante los primeros 5 días hábiles de cada mes.', category: 'inversion', sortOrder: 4 },
  { question: '¿Qué tipos de activos puedo encontrar?', answer: 'GSP ofrece 5 clases de activos: Inmuebles residenciales y comerciales, Micro Data Centers, Logística de última milla, Energía Solar (parques solares) y Minería (derechos mineros y apoyo logístico). Cada activo es previamente evaluado por nuestro equipo de análisis.', category: 'inversion', sortOrder: 5 },
  { question: '¿Existen costos ocultos?', answer: 'No. GSP cobra una comisión total del 3% que incluye administración, gestión de activos, auditoría, tecnología y custodia. Todos los costos están transparentados en la plataforma. No cobramos comisiones de entrada ni salida adicionales.', category: 'tributacion', sortOrder: 1 },
]

// ─── Blog Posts Seed ─────────────────────────────────────────────────────────
const BLOG_POSTS = [
  {
    title: 'Guía completa: Cómo diversificar tu portafolio con activos alternativos en 2025',
    slug: 'guia-diversificacion-activos-alternativos-2025',
    excerpt: 'Aprende las mejores estrategias para diversificar tus inversiones más allá de la bolsa, con rendimientos reales de hasta 22% anual.',
    content: `## ¿Por qué diversificar con activos alternativos?

La diversificación es la regla de oro de la inversión. Cuando el mercado bursátil es volátil, los activos alternativos como bienes raíces e infraestructura ofrecen un refugio estable con rendimientos consistentes.

### El caso chileno

En Chile, la inversión inmobiliaria ha entregado un **retorno promedio de 8-10% anual** en los últimos 10 años, superando consistentemente a los depósitos a plazo y fondos mutuos conservadores.

### Tipos de activos alternativos

1. **Inmuebles residenciales**: Estabilidad y plusvalía en ubicaciones premium
2. **Data Centers**: Crecimiento del 25% anual por demanda de nube local
3. **Logística de última milla**: Beneficiados por el boom del e-commerce
4. **Energía solar**: Retornos garantizados por contratos PPA estatales
5. **Minería**: Exposición al litio y cobre, minerales críticos globales

### Cómo empezar con GSP

Solo necesitas $120.000 CLP para comenzar. Nuestra plataforma te permite:

- Seleccionar activos evaluados por expertos
- Invertir fracciones de propiedades completas
- Recibir dividendos mensuales automáticos
- Contar con liquidez inmediata a través de la Salida Express`,
    category: 'educacion',
    tags: 'diversificación,inversión,educación financiera,activos alternativos',
    status: 'published',
    publishedAt: new Date('2025-01-15'),
    featured: true,
    readingTime: 8,
    seoTitle: 'Diversificación con Activos Alternativos 2025 | GSP',
    seoDescription: 'Guía completa para diversificar tu portafolio con activos alternativos en Chile. Rendimientos de hasta 22% anual.',
  },
  {
    title: 'Data Centers en Chile: La oportunidad de inversión que pocos conocen',
    slug: 'data-centers-chile-oportunidad-inversion',
    excerpt: 'La demanda de centros de datos en Chile crece un 25% anual. Descubre por qué es una de las mejores inversiones alternativas.',
    content: `## El boom de los data centers en Chile

Chile se ha consolidado como el hub tecnológico de América Latina. La regulación de soberanía de datos y el crecimiento exponencial de la nube están generando una demanda insatisfecha de infraestructura de data centers.

### Números clave

- **Crecimiento anual**: 25% en demanda de centros de datos
- **Inversión prevista**: USD $5.000 millones para 2027
- **Uptime requerido**: 99.99% para aplicaciones críticas

### ¿Por qué invertir ahora?

1. Regulación de soberanía de datos obliga a las empresas a tener servidores locales
2. Los contratos de arriendo son a largo plazo (5-10 años)
3. Los yields superan el 13% anual neto
4. La apreciación del activo es consistente por la escasez de oferta

### Caso de éxito: Micro Data Center Valparaíso

Nuestro primer micro data center ofrece un **retorno total del 21% anual** con un contrato de 7 años con CloudSur SpA. Las fracciones están disponibles desde $185.000.`,
    category: 'mercado',
    tags: 'data center,tecnología,inversión,nube,Chile',
    status: 'published',
    publishedAt: new Date('2025-02-10'),
    featured: false,
    readingTime: 6,
  },
  {
    title: 'Salida Express: La revolución de la liquidez en la inversión inmobiliaria',
    slug: 'salida-express-liquidez-inversion-inmobiliaria',
    excerpt: 'Conoce cómo el fondo de liquidez de GSP te permite salir de tu inversión en 48 horas, sin comisiones ni penalizaciones.',
    content: `## El problema de la liquidez

Uno de los mayores desafíos de la inversión inmobiliaria tradicional es la **falta de liquidez**. Tu dinero queda atrapado por meses o años hasta que logras vender la propiedad.

### La solución GSP: Salida Express

Hemos creado un fondo de liquidez propio de $850 millones que te permite:

- Vender tus fracciones en **48 horas**
- Recibir el dinero a **valor contable**
- Sin comisiones ni penalizaciones
- Sin necesidad de esperar a un comprador

### ¿Cómo funciona?

1. Solicitas la venta de tus fracciones desde la plataforma
2. Nuestro sistema evalúa la solicitud automáticamente
3. El fondo de liquidez compra tus fracciones al valor contable actual
4. Recibes el dinero en tu cuenta bancaria en 48 horas

### Fondos del fondo

- Reserva actual: $850 millones CLP
- Contribución mensual: $25 millones
- Reabastecimiento automático activado`,
    category: 'gsp_updates',
    tags: 'liquidez,salida express,fondo,GSP,novedades',
    status: 'published',
    publishedAt: new Date('2025-03-05'),
    featured: true,
    readingTime: 5,
  },
]

// ─── Testimonials Seed ────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Carolina Muñoz',
    role: 'Ingeniera Comercial',
    quote: 'Llevaba años queriendo invertir en bienes raíces pero no tenía el capital suficiente. Con GSP pude diversificar en 4 activos diferentes desde mi primera inversión. Los dividendos mensuales son una grata sorpresa.',
    rating: 5,
    investmentAmount: 2500000,
    assetName: 'Centro Logístico Santiago Norte',
    isFeatured: true,
    isVerified: true,
    sortOrder: 1,
    status: 'approved',
  },
  {
    name: 'Roberto Fuentes',
    role: 'Emprendedor',
    quote: 'Lo que más me gustó fue la transparencia. Puedo ver exactamente cuánto genera cada activo, los contratos de arriendo, y los estados financieros. Nada de cajas negras.',
    rating: 5,
    investmentAmount: 5000000,
    assetName: 'Micro Data Center Valparaíso',
    isFeatured: true,
    isVerified: true,
    sortOrder: 2,
    status: 'approved',
  },
  {
    name: 'Matías Sánchez',
    role: 'Profesor Universitario',
    quote: 'Como académico de finanzas, valoro mucho la estructura de costos. Pasar de 15% a 3% hace una diferencia enorme en el retorno real del inversor. Eso es innovación real.',
    rating: 5,
    investmentAmount: 1000000,
    isFeatured: false,
    isVerified: true,
    sortOrder: 3,
    status: 'approved',
  },
  {
    name: 'Daniela Sepúlveda',
    role: 'Diseñadora UX',
    quote: 'La experiencia de usar la plataforma es increíble. En 10 minutos ya tenía mi cuenta verificada y mi primera inversión hecha. La Salida Express me da tranquilidad de saber que puedo salir cuando necesite.',
    rating: 4,
    investmentAmount: 850000,
    assetName: 'Residencial Providencia Sky',
    isFeatured: true,
    isVerified: true,
    sortOrder: 4,
    status: 'approved',
  },
  {
    name: 'Felipe Araya',
    role: 'Arquitecto',
    quote: 'Invertí en el parque solar y ha superado mis expectativas. Los dividendos trimestrales son puntuales y el rendimiento supera lo que ofrecen los fondos mutuos de renta fija.',
    rating: 5,
    investmentAmount: 3200000,
    assetName: 'Parque Solar Atacama III',
    isFeatured: false,
    isVerified: true,
    sortOrder: 5,
    status: 'approved',
  },
]

// ─── Team Members Seed ────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
  { name: 'Alejandro Vera', role: 'CEO & Co-founder', bio: '15 años de experiencia en finanzas corporativas. Ex-socio de McKinsey Chile.', photoUrl: '', linkedinUrl: '#', sortOrder: 1, isActive: true },
  { name: 'Valentina Rojas', role: 'COO & Co-founder', bio: 'MBA de MIT. Especialista en operaciones y tecnología financiera.', photoUrl: '', linkedinUrl: '#', sortOrder: 2, isActive: true },
  { name: 'Diego Mendoza', role: 'CTO', bio: 'Ex-ingeniero senior de MercadoLibre. Expert en infraestructura cloud y fintech.', photoUrl: '', linkedinUrl: '#', sortOrder: 3, isActive: true },
  { name: 'Francisca Lagos', role: 'Head de Inversiones', bio: '12 años en gestión de activos inmobiliarios. Ex-Banco de Chile.', photoUrl: '', linkedinUrl: '#', sortOrder: 4, isActive: true },
  { name: 'Tomás Bravo', role: 'Head de Legal & Compliance', bio: 'Abogado especialista en regulación financiera de la CMF.', photoUrl: '', linkedinUrl: '#', sortOrder: 5, isActive: true },
]

// ─── Legal Documents Seed ─────────────────────────────────────────────────────
const LEGAL_DOCUMENTS = [
  {
    title: 'Términos y Condiciones',
    slug: 'terminos-y-condiciones',
    content: `# Términos y Condiciones de GSP Inversiones SpA

## 1. Información General

GSP Inversiones SpA ("GSP", "nosotros", "nuestro") opera una plataforma de inversión fraccionaria en activos inmobiliarios y de infraestructura, supervisada por la Comisión para el Mercado Financiero (CMF) de Chile.

## 2. Requisitos para invertir

- Ser mayor de 18 años
- Residir en Chile
- Contar con RUT vigente
- Completar exitosamente el proceso de verificación KYC
- Disponer de cuenta bancaria chilena

## 3. Mecanismo de inversión

GSP adquiere activos y los fracciona. Cada fracción representa una parte proporcional de la propiedad del activo. Los inversores pueden adquirir fracciones a través de la plataforma.

## 4. Dividendos

Los dividendos se calculan mensualmente según la renta neta del activo y se distribuyen proporcionalmente a los inversores dentro de los primeros 5 días hábiles del mes siguiente.

## 5. Salida Express

Los inversores pueden solicitar la venta de sus fracciones a través del fondo de liquidez. El procesamiento toma hasta 48 horas hábiles.

## 6. Riesgos

La inversión en activos inmobiliarios y de infraestructura conlleva riesgos, incluyendo pero no limitado a: riesgo de mercado, riesgo de vacancia, riesgo regulatorio, y riesgo de liquidez del fondo.

## 7. Modificaciones

GSP se reserva el derecho de modificar estos términos. Los cambios serán notificados con al menos 30 días de anticipación.`,
    version: '2.0',
    effectiveDate: new Date('2025-01-01'),
    type: 'terms',
    isRequired: true,
    isActive: true,
  },
  {
    title: 'Política de Privacidad',
    slug: 'politica-privacidad',
    content: `# Política de Privacidad de GSP

## 1. Datos que recopilamos

- Datos de identificación: nombre, RUT, fecha de nacimiento
- Datos de contacto: email, teléfono, dirección
- Datos financieros: información bancaria, historial de inversiones
- Datos de verificación: documentos KYC

## 2. Finalidad del tratamiento

- Verificación de identidad (KYC)
- Gestión de inversiones
- Cumplimiento regulatorio
- Comunicaciones de servicio

## 3. Seguridad

Utilizamos encriptación AES-256, certificación SOC 2 y protocolos de seguridad de la información conforme a la Ley 19.628 de Protección de Datos Personales.

## 4. Derechos del titular

Puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales contactándonos a privacidad@gsp.cl.`,
    version: '1.5',
    effectiveDate: new Date('2025-01-01'),
    type: 'privacy',
    isRequired: true,
    isActive: true,
  },
  {
    title: 'Descargo de Riesgos de Inversión',
    slug: 'descargo-riesgos-inversion',
    content: `# Descargo de Riesgos de Inversión

## Información importante

Toda inversión conlleva riesgo. El valor de las inversiones puede fluctuar y no se garantiza el retorno del capital invertido.

## Riesgos específicos

1. **Riesgo de mercado**: El valor de los activos puede disminuir
2. **Riesgo de vacancia**: Los activos pueden quedar desocupados temporalmente
3. **Riesgo regulatorio**: Cambios en la regulación pueden afectar los rendimientos
4. **Riesgo de liquidez**: El fondo de liquidez puede no tener disponibilidad inmediata
5. **Riesgo de crédito**: Riesgo de incumplimiento de los arrendatarios

## Recomendación

GSP recomienda diversificar entre múltiples activos y no invertir más del 10% de su patrimonio neto en inversiones alternativas.`,
    version: '1.0',
    effectiveDate: new Date('2025-01-01'),
    type: 'risk_disclosure',
    isRequired: true,
    isActive: true,
  },
]

// ─── Promotions Seed ──────────────────────────────────────────────────────────
const PROMOTIONS = [
  {
    name: 'Bienvenida GSP',
    code: 'BIENVENIDA2025',
    type: 'bonus_yield',
    value: 1.0,
    minInvestment: 500000,
    validFrom: new Date('2025-01-01'),
    validTo: new Date('2025-12-31'),
    maxUses: 500,
    description: '1% adicional de rendimiento en tu primera inversión. Mínimo $500.000.',
    isActive: true,
  },
  {
    name: 'Referidos GSP',
    code: 'REFIEREAMIGO',
    type: 'cashback',
    value: 50000,
    validFrom: new Date('2025-01-01'),
    description: '$50.000 de cashback por cada amigo que invierta. Tu amigo también recibe $25.000.',
    isActive: true,
  },
]

// ─── Email Templates Seed ─────────────────────────────────────────────────────
const EMAIL_TEMPLATES = [
  {
    name: 'welcome_email',
    subject: '¡Bienvenido/a {{user_name}} a GSP! Tu cuenta ha sido creada',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #059669, #047857); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido/a a GSP!</h1>
  </div>
  <div style="padding: 32px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; color: #374151;">Hola <strong>{{user_name}}</strong>,</p>
    <p style="font-size: 16px; color: #374151;">Tu cuenta ha sido creada exitosamente. Estamos encantados de tenerte como parte de nuestra comunidad de inversores.</p>
    <p style="font-size: 16px; color: #374151;">Para comenzar a invertir, completa tu verificación de identidad (KYC) haciendo clic en el siguiente botón:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="{{verification_url}}" style="background: #059669; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Completar Verificación</a>
    </div>
    <p style="font-size: 14px; color: #6b7280;">El proceso de verificación toma menos de 5 minutos.</p>
  </div>
  <div style="padding: 16px; text-align: center; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 12px; color: #9ca3af;">GSP Inversiones SpA — Inversión fraccionaria en activos inmobiliarios</p>
  </div>
</div>`,
    bodyText: '¡Bienvenido/a {{user_name}} a GSP!\n\nTu cuenta ha sido creada exitosamente. Para comenzar a invertir, completa tu verificación de identidad (KYC).\n\nCompleta tu verificación aquí: {{verification_url}}\n\nEl proceso toma menos de 5 minutos.\n\nGSP Inversiones SpA',
    variables: JSON.stringify(['{{user_name}}', '{{verification_url}}']),
    category: 'onboarding',
    isActive: true,
  },
  {
    name: 'investment_confirmation',
    subject: '¡Confirmación de tu inversión en {{asset_name}}!',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #059669, #047857); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">¡Inversión Confirmada!</h1>
  </div>
  <div style="padding: 32px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; color: #374151;">Hola <strong>{{user_name}}</strong>,</p>
    <p style="font-size: 16px; color: #374151;">Tu inversión ha sido procesada exitosamente. Aquí tienes los detalles:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; color: #6b7280; font-weight: 600;">Activo</td>
        <td style="padding: 12px; color: #374151; text-align: right;">{{asset_name}}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; color: #6b7280; font-weight: 600;">Fracciones</td>
        <td style="padding: 12px; color: #374151; text-align: right;">{{fraction_count}}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; color: #6b7280; font-weight: 600;">Monto Total</td>
        <td style="padding: 12px; color: #374151; text-align: right;">{{amount}}</td>
      </tr>
      <tr>
        <td style="padding: 12px; color: #6b7280; font-weight: 600;">ID de Transacción</td>
        <td style="padding: 12px; color: #374151; text-align: right;">{{transaction_id}}</td>
      </tr>
    </table>
    <p style="font-size: 14px; color: #6b7280;">Los primeros dividendos se acreditarán dentro del próximo ciclo de pago.</p>
  </div>
  <div style="padding: 16px; text-align: center; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 12px; color: #9ca3af;">GSP Inversiones SpA</p>
  </div>
</div>`,
    bodyText: '¡Inversión Confirmada!\n\nHola {{user_name}},\n\nTu inversión ha sido procesada exitosamente.\n\nActivo: {{asset_name}}\nFracciones: {{fraction_count}}\nMonto Total: {{amount}}\nID de Transacción: {{transaction_id}}\n\nLos primeros dividendos se acreditarán dentro del próximo ciclo de pago.\n\nGSP Inversiones SpA',
    variables: JSON.stringify(['{{user_name}}', '{{asset_name}}', '{{fraction_count}}', '{{amount}}', '{{transaction_id}}']),
    category: 'transactional',
    isActive: true,
  },
  {
    name: 'dividend_notification',
    subject: '¡Tienes un nuevo dividendo de {{amount}}!',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #059669, #047857); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">💰 ¡Nuevo Dividendo!</h1>
  </div>
  <div style="padding: 32px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; color: #374151;">Hola <strong>{{user_name}}</strong>,</p>
    <p style="font-size: 16px; color: #374151;">Has recibido un nuevo dividendo por tu inversión en activos de GSP.</p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
      <p style="font-size: 32px; font-weight: 700; color: #059669; margin: 0;">{{amount}}</p>
      <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0;">CLP</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px; color: #6b7280;">Activo</td>
        <td style="padding: 8px; color: #374151; text-align: right;">{{asset_name}}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px; color: #6b7280;">Período</td>
        <td style="padding: 8px; color: #374151; text-align: right;">{{period}}</td>
      </tr>
      <tr>
        <td style="padding: 8px; color: #6b7280;">Fracciones</td>
        <td style="padding: 8px; color: #374151; text-align: right;">{{fraction_count}}</td>
      </tr>
    </table>
    <p style="font-size: 14px; color: #6b7280;">El dividendo será depositado en tu cuenta bancaria registrada dentro de los próximos 3 días hábiles.</p>
  </div>
  <div style="padding: 16px; text-align: center; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 12px; color: #9ca3af;">GSP Inversiones SpA</p>
  </div>
</div>`,
    bodyText: '¡Nuevo Dividendo!\n\nHola {{user_name}},\n\nHas recibido un nuevo dividendo por tu inversión.\n\nMonto: {{amount}} CLP\nActivo: {{asset_name}}\nPeríodo: {{period}}\nFracciones: {{fraction_count}}\n\nEl dividendo será depositado en tu cuenta bancaria registrada dentro de los próximos 3 días hábiles.\n\nGSP Inversiones SpA',
    variables: JSON.stringify(['{{user_name}}', '{{amount}}', '{{asset_name}}', '{{period}}', '{{fraction_count}}']),
    category: 'notification',
    isActive: true,
  },
  {
    name: 'kyc_approved',
    subject: '✅ ¡Tu verificación KYC ha sido aprobada, {{user_name}}!',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #059669, #047857); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✅ ¡Verificación Aprobada!</h1>
  </div>
  <div style="padding: 32px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; color: #374151;">Hola <strong>{{user_name}}</strong>,</p>
    <p style="font-size: 16px; color: #374151;">¡Excelentes noticias! Tu verificación de identidad (KYC) ha sido aprobada exitosamente.</p>
    <p style="font-size: 16px; color: #374151;">Ya puedes acceder a todas las funcionalidades de la plataforma:</p>
    <ul style="font-size: 16px; color: #374151; padding-left: 20px;">
      <li>Invertir en activos inmobiliarios fraccionarios</li>
      <li>Recibir dividendos mensuales</li>
      <li>Solicitar Salida Express</li>
      <li>Acceder a tu portafolio completo</li>
    </ul>
    <div style="text-align: center; margin: 24px 0;">
      <a href="{{dashboard_url}}" style="background: #059669; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">Ir a mi Portafolio</a>
    </div>
  </div>
  <div style="padding: 16px; text-align: center; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 12px; color: #9ca3af;">GSP Inversiones SpA</p>
  </div>
</div>`,
    bodyText: '¡Verificación Aprobada!\n\nHola {{user_name}},\n\n¡Excelentes noticias! Tu verificación de identidad (KYC) ha sido aprobada exitosamente.\n\nYa puedes:\n- Invertir en activos inmobiliarios fraccionarios\n- Recibir dividendos mensuales\n- Solicitar Salida Express\n- Acceder a tu portafolio completo\n\nIr a tu portafolio: {{dashboard_url}}\n\nGSP Inversiones SpA',
    variables: JSON.stringify(['{{user_name}}', '{{dashboard_url}}']),
    category: 'transactional',
    isActive: true,
  },
  {
    name: 'kyc_rejected',
    subject: '⚠️ Tu verificación KYC requiere atención',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Verificación Requerida</h1>
  </div>
  <div style="padding: 32px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; color: #374151;">Hola <strong>{{user_name}}</strong>,</p>
    <p style="font-size: 16px; color: #374151;">Tu verificación de identidad no ha podido ser completada. Esto puede deberse a:</p>
    <ul style="font-size: 16px; color: #374151; padding-left: 20px;">
      <li>La imagen del documento no es legible</li>
      <li>Los datos no coinciden con los registros</li>
      <li>El documento ha expirado</li>
    </ul>
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="font-size: 14px; color: #991b1b;"><strong>Motivo:</strong> {{rejection_reason}}</p>
    </div>
    <p style="font-size: 16px; color: #374151;">Por favor, vuelve a subir tu documentación desde tu perfil para completar la verificación.</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="{{verification_url}}" style="background: #dc2626; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">Reintentar Verificación</a>
    </div>
  </div>
  <div style="padding: 16px; text-align: center; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 12px; color: #9ca3af;">GSP Inversiones SpA</p>
  </div>
</div>`,
    bodyText: '⚠️ Verificación Requerida\n\nHola {{user_name}},\n\nTu verificación de identidad no ha podido ser completada.\n\nMotivo: {{rejection_reason}}\n\nPor favor, vuelve a subir tu documentación desde tu perfil.\n\nReintentar: {{verification_url}}\n\nGSP Inversiones SpA',
    variables: JSON.stringify(['{{user_name}}', '{{rejection_reason}}', '{{verification_url}}']),
    category: 'transactional',
    isActive: true,
  },
  {
    name: 'password_reset',
    subject: '🔒 Restablece tu contraseña de GSP',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #374151, #1f2937); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🔒 Restablecer Contraseña</h1>
  </div>
  <div style="padding: 32px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; color: #374151;">Hola <strong>{{user_name}}</strong>,</p>
    <p style="font-size: 16px; color: #374151;">Hemos recibido una solicitud para restablecer tu contraseña. Si no fuiste tú, puedes ignorar este email.</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="{{reset_url}}" style="background: #374151; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">Restablecer Contraseña</a>
    </div>
    <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin: 16px 0;">
      <p style="font-size: 14px; color: #92400e;">⚠️ Este enlace expira en 24 horas por seguridad.</p>
    </div>
    <p style="font-size: 14px; color: #6b7280;">O copia y pega este enlace en tu navegador:</p>
    <p style="font-size: 12px; color: #059669; word-break: break-all;">{{reset_url}}</p>
  </div>
  <div style="padding: 16px; text-align: center; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 12px; color: #9ca3af;">GSP Inversiones SpA — Si no solicitaste este cambio, ignora este email.</p>
  </div>
</div>`,
    bodyText: 'Restablecer Contraseña\n\nHola {{user_name}},\n\nHemos recibido una solicitud para restablecer tu contraseña. Si no fuiste tú, puedes ignorar este email.\n\nRestablecer: {{reset_url}}\n\nEste enlace expira en 24 horas.\n\nGSP Inversiones SpA',
    variables: JSON.stringify(['{{user_name}}', '{{reset_url}}']),
    category: 'security',
    isActive: true,
  },
  {
    name: 'liquidity_request_processed',
    subject: '{{status_emoji}} Tu solicitud de Salida Express ha sido {{status_text}}',
    bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, {{header_color}}, {{header_color_dark}}); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">{{status_emoji}} Salida Express</h1>
  </div>
  <div style="padding: 32px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; color: #374151;">Hola <strong>{{user_name}}</strong>,</p>
    <p style="font-size: 16px; color: #374151;">Tu solicitud de Salida Express ha sido <strong>{{status_text}}</strong>.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px; color: #6b7280;">Activo</td>
        <td style="padding: 8px; color: #374151; text-align: right;">{{asset_name}}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px; color: #6b7280;">Fracciones</td>
        <td style="padding: 8px; color: #374151; text-align: right;">{{fraction_count}}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px; color: #6b7280;">Monto Bruto</td>
        <td style="padding: 8px; color: #374151; text-align: right;">{{gross_amount}}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px; color: #6b7280;">Fee Express</td>
        <td style="padding: 8px; color: #374151; text-align: right;">{{fee_amount}}</td>
      </tr>
      <tr>
        <td style="padding: 8px; color: #6b7280; font-weight: 700;">Monto Neto</td>
        <td style="padding: 8px; color: #059669; text-align: right; font-weight: 700;">{{net_amount}}</td>
      </tr>
    </table>
    <p style="font-size: 14px; color: #6b7280;">Tiempo estimado de depósito: {{processing_days}} días hábiles.</p>
  </div>
  <div style="padding: 16px; text-align: center; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 12px; color: #9ca3af;">GSP Inversiones SpA</p>
  </div>
</div>`,
    bodyText: 'Salida Express - {{status_text}}\n\nHola {{user_name}},\n\nTu solicitud de Salida Express ha sido {{status_text}}.\n\nActivo: {{asset_name}}\nFracciones: {{fraction_count}}\nMonto Bruto: {{gross_amount}}\nFee Express: {{fee_amount}}\nMonto Neto: {{net_amount}}\n\nTiempo estimado de depósito: {{processing_days}} días hábiles.\n\nGSP Inversiones SpA',
    variables: JSON.stringify(['{{user_name}}', '{{status_emoji}}', '{{status_text}}', '{{header_color}}', '{{header_color_dark}}', '{{asset_name}}', '{{fraction_count}}', '{{gross_amount}}', '{{fee_amount}}', '{{net_amount}}', '{{processing_days}}']),
    category: 'transactional',
    isActive: true,
  },
]

export async function seedDatabase(options?: { force?: boolean }) {
  const force = options?.force === true

  // Check if already seeded (skip only if not forced)
  const existingAssets = await db.asset.count()
  const existingSettings = await db.siteSetting.count()

  if (!force && existingAssets > 0 && existingSettings > 0) {
    return { message: 'Database already seeded', count: existingAssets }
  }

  // Seed translations (always upsert-safe)
  let translationCount = 0
  for (const [locale, map] of Object.entries(translationsData)) {
    for (const [key, value] of Object.entries(map)) {
      await db.translation.upsert({
        where: { key_locale: { key, locale } },
        update: { value },
        create: { key, locale, value },
      })
      translationCount++
    }
  }

  // Seed currencies (always upsert-safe)
  let currencyCount = 0
  for (const currency of CURRENCIES) {
    await db.currency.upsert({
      where: { code: currency.code },
      update: {
        name: currency.name,
        symbol: currency.symbol,
        flag: currency.flag,
        sortOrder: currency.sortOrder,
        isActive: currency.isActive,
      },
      create: currency,
    })
    currencyCount++
  }

  // If forced but data already exists, return early after translations/currencies
  if (force && existingAssets > 0 && existingSettings > 0) {
    return {
      message: 'Translations and currencies re-seeded (force mode)',
      translations: translationCount,
      currencies: currencyCount,
    }
  }

  // Create demo user
  await db.user.upsert({
    where: { email: 'maria@example.com' },
    update: {},
    create: {
      id: 'usr_demo_001',
      email: 'maria@example.com',
      name: 'María González',
      phone: '+56912345678',
      rut: '12.345.678-9',
      role: 'investor',
      kycStatus: 'verified',
      kycVerifiedAt: new Date('2024-01-15'),
      balance: 5200000,
      totalInvested: 18250000,
      totalEarnings: 1685000,
      referralCode: 'MARIA10',
      newsletterOptIn: true,
      termsAcceptedAt: new Date('2024-01-10'),
      termsVersion: '2.0',
      riskProfile: 'moderate',
      lastLoginAt: new Date('2025-03-15'),
    },
  })

  await db.user.upsert({
    where: { email: 'admin@gsp.cl' },
    update: {},
    create: {
      id: 'usr_admin_001',
      email: 'admin@gsp.cl',
      name: 'Admin GSP',
      role: 'admin',
      kycStatus: 'verified',
    },
  })

  // Create assets with nested data
  for (const asset of DEMO_ASSETS) {
    const { images, documents, cashFlowProjections, ...assetData } = asset
    await db.asset.create({
      data: {
        ...assetData,
        images: { create: images },
        documents: { create: documents },
        cashFlowProjections: { create: cashFlowProjections },
      },
    })
  }

  // Create liquidity pool
  await db.liquidityPool.create({
    data: {
      id: 'pool_main_001',
      totalReserve: 850000000,
      totalAssets: 5,
      activeRequests: 2,
      utilizationRate: 12.5,
      monthlyContribution: 25000000,
      autoReplenish: true,
    },
  })

  // Create sample investments for demo user
  const assets = await db.asset.findMany({ take: 3 })
  const userId = 'usr_demo_001'

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i]
    const qty = [10, 8, 5][i] as number

    const investment = await db.investment.create({
      data: {
        userId,
        assetId: asset.id,
        quantity: qty,
        pricePerUnit: asset.pricePerFraction,
        totalAmount: qty * asset.pricePerFraction,
        status: 'completed',
        completedAt: new Date(`2024-0${i + 1}-15`),
      },
    })

    await db.transaction.create({
      data: {
        userId,
        investmentId: investment.id,
        type: 'buy',
        amount: investment.totalAmount,
        status: 'completed',
        description: `Inversión en ${asset.name} - ${qty} fracciones`,
        referenceId: `TXN-${Date.now()}-${i}`,
        feeAmount: investment.totalAmount * 0.03,
        netAmount: investment.totalAmount,
        processedBy: 'system',
      },
    })

    for (let m = 0; m < 6; m++) {
      const monthlyDiv = (asset.monthlyRent || 0) / asset.totalFractions * qty * 0.9
      await db.dividendPayment.create({
        data: {
          userId,
          investmentId: investment.id,
          assetId: asset.id,
          amount: Math.round(monthlyDiv),
          perFraction: Math.round((asset.monthlyRent || 0) / asset.totalFractions * 0.9),
          fractions: qty,
          periodStart: new Date(2024, m, 1),
          periodEnd: new Date(2024, m + 1, 0),
          paymentDate: new Date(2024, m + 1, 5),
          status: 'paid',
        },
      })
    }
  }

  // Create notifications
  await db.notification.createMany({
    data: [
      { userId, type: 'dividend', title: 'Nuevo dividendo recibido', message: 'Has recibido $45.200 de dividendos de Centro Logístico Santiago Norte.', read: false },
      { userId, type: 'system', title: 'Nuevo activo disponible', message: 'Parque Solar Atacama III ya está disponible para inversión.', read: false },
      { userId, type: 'transaction', title: 'Inversión completada', message: 'Tu inversión en Micro Data Center Valparaíso ha sido procesada exitosamente.', read: true },
    ],
  })

  // Seed CMS data
  await db.siteSetting.createMany({ data: SITE_SETTINGS })
  await db.fAQ.createMany({ data: FAQS })
  await db.blogPost.createMany({ data: BLOG_POSTS })
  await db.testimonial.createMany({ data: TESTIMONIALS })
  await db.teamMember.createMany({ data: TEAM_MEMBERS })
  await db.legalDocument.createMany({ data: LEGAL_DOCUMENTS })
  await db.promotion.createMany({ data: PROMOTIONS })
  await db.emailTemplate.createMany({ data: EMAIL_TEMPLATES })

  // Audit log
  await db.auditLog.create({
    data: {
      action: 'system.seed',
      entity: 'system',
      details: 'Base de datos inicializada con datos de demostración',
    },
  })

  return { message: 'Database seeded successfully', count: DEMO_ASSETS.length, translations: translationCount, currencies: currencyCount }
}
