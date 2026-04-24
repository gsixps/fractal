import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient({
  datasourceUrl: 'file:/home/z/my-project/db/custom.db',
})

async function seed() {
  console.log('🌱 GSP Seed Script Started')
  console.log('─'.repeat(50))

  // ═══════════════════════════════════════════════════════════════
  // 1. ASSET TYPES
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📦 Seeding Asset Types...')

  const assetTypesData = [
    { name: 'Real Estate', slug: 'real_estate', icon: 'Building2', description: 'Propiedades residenciales, comerciales e industriales', color: '#059669', sortOrder: 1 },
    { name: 'Micro Datacenter', slug: 'micro_datacenter', icon: 'Server', description: 'Centros de datos de alta densidad e infraestructura tecnológica', color: '#0891b2', sortOrder: 2 },
    { name: 'Solar Energy', slug: 'solar_energy', icon: 'Sun', description: 'Parques solares y activos de energía renovable', color: '#d97706', sortOrder: 3 },
    { name: 'Last Mile Logistics', slug: 'last_mile_logistics', icon: 'Truck', description: 'Bodegas de fulfillment y centros de distribución e-commerce', color: '#7c3aed', sortOrder: 4 },
    { name: 'Mining', slug: 'mining', icon: 'Pickaxe', description: 'Complejos mineros y derechos de explotación', color: '#dc2626', sortOrder: 5 },
  ]

  let assetTypesCreated = 0
  for (const at of assetTypesData) {
    const result = await db.assetType.upsert({
      where: { slug: at.slug },
      update: { name: at.name, icon: at.icon, description: at.description, color: at.color, sortOrder: at.sortOrder },
      create: at,
    })
    if (result) assetTypesCreated++
  }
  console.log(`   ✅ Asset Types: ${assetTypesCreated} seeded`)

  // ═══════════════════════════════════════════════════════════════
  // 2. ASSETS
  // ═══════════════════════════════════════════════════════════════
  console.log('\n🏗️  Seeding Assets...')

  const assetsData = [
    // ─── Asset 1: Centro Logístico Santiago Norte ───
    {
      name: 'Centro Logístico Santiago Norte',
      slug: 'centro-logistico-santiago-norte',
      type: 'last_mile_logistics',
      status: 'active',
      address: 'Av. Américo Vespucio 0800, Parque Industrial Norte',
      city: 'Santiago',
      region: 'Región Metropolitana',
      country: 'Chile',
      totalValue: 2_500_000_000,
      pricePerFraction: 250_000,
      totalFractions: 10_000,
      availableFractions: 3_200,
      minimumInvestment: 250_000,
      fundedPercentage: 68,
      annualYield: 13.8,
      projectedAppreciation: 4.2,
      totalProjectedReturn: 18.0,
      leaseStatus: 'leased',
      monthlyRent: 18_500_000,
      tenantName: 'LogiChile S.A.',
      totalArea: 12_500,
      units: 48,
      constructionYear: 2022,
      landUse: 'Industrial / Logístico',
      shortDescription: 'Centro logístico de última milla en zona estratégica de Santiago con contrato de arriendo a 10 años.',
      fullDescription: 'El Centro Logístico Santiago Norte es una propiedad industrial de última milla ubicada en una de las zonas de mayor crecimiento logístico de la Región Metropolitana. Cuenta con 12.500 m² de área útil distribuidos en 48 unidades modulares que se adaptan a las necesidades de empresas de comercio electrónico y distribución.\n\nLa propiedad está arrendada a LogiChile S.A. mediante un contrato de arriendo corporativo a 10 años con ajuste anual según IPC. La ubicación estratégica sobre la Américo Vespucio permite acceso directo a las principales rutas de distribución de la capital.\n\nEntre sus características se incluyen: docks de carga de nivel, sistema de suppression de incendios, cámaras de seguridad 24/7, estacionamiento para camiones y personal administrativo, y certificación LEED Silver en eficiencia energética.',
      highlights: JSON.stringify([
        'Contrato de arriendo a 10 años con ajuste IPC',
        'Ubicación estratégica sobre Américo Vespucio',
        '12.500 m² de área útil con 48 unidades modulares',
        'Certificación LEED Silver en eficiencia energética',
        'Sistema de suppression de incendios y seguridad 24/7',
        'Tenant blue-chip: LogiChile S.A.',
      ]),
      badge: 'Últimas Millas',
      operationalCostsPct: 3.0,
      riskLevel: 'medium',
      dividendFrequency: 'monthly',
      minInvestmentPeriod: 12,
      tags: 'logística,última milla,e-commerce,Santiago',
      images: [
        { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=500&fit=crop', alt: 'Centro logístico moderno en Santiago', sortOrder: 0, isCover: true },
        { url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=500&fit=crop', alt: 'Interior del centro de distribución', sortOrder: 1, isCover: false },
        { url: 'https://images.unsplash.com/photo-1586953208270-767889db8665?w=800&h=500&fit=crop', alt: 'Docks de carga del centro logístico', sortOrder: 2, isCover: false },
      ],
      documents: [
        { title: 'Estudio de Tasa de Arriendo', documentType: 'tasacion', fileUrl: '/docs/asset_logistico_norte/tasacion.pdf', fileSize: 2_450_000 },
        { title: 'Contrato de Arriendo', documentType: 'contrato', fileUrl: '/docs/asset_logistico_norte/contrato.pdf', fileSize: 1_820_000 },
        { title: 'Informe de Ingeniería Estructural', documentType: 'informe', fileUrl: '/docs/asset_logistico_norte/ingenieria.pdf', fileSize: 5_300_000 },
        { title: 'Certificado LEED Silver', documentType: 'certificado', fileUrl: '/docs/asset_logistico_norte/leed.pdf', fileSize: 980_000 },
      ],
      cashFlowProjections: [
        { period: 'Año 1', periodType: 'annual', grossIncome: 222_000_000, operationalCost: 6_660_000, netIncome: 215_340_000, appreciation: 4.2, totalReturn: 18.0, cumulativeReturn: 18.0 },
        { period: 'Año 2', periodType: 'annual', grossIncome: 230_664_000, operationalCost: 6_920_000, netIncome: 223_744_000, appreciation: 4.0, totalReturn: 17.8, cumulativeReturn: 36.2 },
        { period: 'Año 3', periodType: 'annual', grossIncome: 239_501_120, operationalCost: 7_185_000, netIncome: 232_316_120, appreciation: 3.8, totalReturn: 17.6, cumulativeReturn: 54.5 },
        { period: 'Año 4', periodType: 'annual', grossIncome: 248_511_666, operationalCost: 7_455_000, netIncome: 241_056_666, appreciation: 3.6, totalReturn: 17.4, cumulativeReturn: 72.7 },
        { period: 'Año 5', periodType: 'annual', grossIncome: 257_697_132, operationalCost: 7_731_000, netIncome: 249_966_132, appreciation: 3.5, totalReturn: 17.3, cumulativeReturn: 90.8 },
      ],
    },
    // ─── Asset 2: Micro Data Center Valparaíso ───
    {
      name: 'Micro Data Center Valparaíso',
      slug: 'micro-data-center-valparaiso',
      type: 'micro_datacenter',
      status: 'active',
      address: 'Pasaje Rodrigo de Araya 285, Barrio Industrial',
      city: 'Valparaíso',
      region: 'Valparaíso',
      country: 'Chile',
      totalValue: 925_000_000,
      pricePerFraction: 185_000,
      totalFractions: 5_000,
      availableFractions: 1_150,
      minimumInvestment: 185_000,
      fundedPercentage: 77,
      annualYield: 16.5,
      projectedAppreciation: 3.8,
      totalProjectedReturn: 20.3,
      leaseStatus: 'leased',
      monthlyRent: 9_200_000,
      tenantName: 'CloudSur Datacenters SpA',
      totalArea: 1_800,
      units: 12,
      constructionYear: 2023,
      landUse: 'Tecnológico / Infraestructura',
      shortDescription: 'Micro data center de alta densidad en Valparaíso con contrato de arriendo a largo plazo.',
      fullDescription: 'El Micro Data Center Valparaíso es una instalación tecnológica de alta densidad ubicada en el corazón del corredor tecnológico de la Región de Valparaíso. Diseñado para satisfacer la creciente demanda de servicios cloud en la zona, cuenta con 1.800 m² de área técnica distribuidos en 12 salas de servidores.\n\nLa propiedad está arrendada a CloudSur Datacenters SpA bajo un contrato de arriendo triple-net a 8 años con opción de renovación automática. El data center cuenta con certificación Tier II+, refrigeración free-cooling y alimentación dual de energía.\n\nLa inversión incluye acceso a reportes trimestrales de SLA, auditorías de seguridad física y lógica, y un comité técnico de monitoreo continuo.',
      highlights: JSON.stringify([
        'Contrato triple-net a 8 años con renovación automática',
        'Certificación Tier II+ de disponibilidad',
        'Refrigeración free-cooling — menor consumo energético',
        'Alimentación dual de energía con UPS redundante',
        'Reportes trimestrales de SLA y auditorías',
        'Tenant especializado: CloudSur Datacenters SpA',
      ]),
      badge: 'Alto Rendimiento',
      operationalCostsPct: 2.5,
      riskLevel: 'low',
      dividendFrequency: 'monthly',
      minInvestmentPeriod: 24,
      tags: 'data center,tecnología,Valparaíso,nube',
      images: [
        { url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=500&fit=crop', alt: 'Data center con servidores iluminados', sortOrder: 0, isCover: true },
        { url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=500&fit=crop', alt: 'Racks de servidores modernos', sortOrder: 1, isCover: false },
      ],
      documents: [
        { title: 'Certificación Tier II+', documentType: 'certificado', fileUrl: '/docs/asset_datacenter_vp/tier2plus.pdf', fileSize: 1_500_000 },
        { title: 'Informe de SLA Q4 2024', documentType: 'informe', fileUrl: '/docs/asset_datacenter_vp/sla-q4.pdf', fileSize: 3_200_000 },
        { title: 'Contrato de Arriendo', documentType: 'contrato', fileUrl: '/docs/asset_datacenter_vp/contrato.pdf', fileSize: 1_100_000 },
      ],
      cashFlowProjections: [
        { period: 'Año 1', periodType: 'annual', grossIncome: 110_400_000, operationalCost: 2_760_000, netIncome: 107_640_000, appreciation: 3.8, totalReturn: 20.3, cumulativeReturn: 20.3 },
        { period: 'Año 2', periodType: 'annual', grossIncome: 113_112_000, operationalCost: 2_828_000, netIncome: 110_284_000, appreciation: 3.6, totalReturn: 20.1, cumulativeReturn: 40.8 },
        { period: 'Año 3', periodType: 'annual', grossIncome: 115_879_440, operationalCost: 2_897_000, netIncome: 112_982_440, appreciation: 3.4, totalReturn: 19.9, cumulativeReturn: 61.5 },
        { period: 'Año 4', periodType: 'annual', grossIncome: 118_703_329, operationalCost: 2_968_000, netIncome: 115_735_329, appreciation: 3.2, totalReturn: 19.7, cumulativeReturn: 82.0 },
        { period: 'Año 5', periodType: 'annual', grossIncome: 121_584_908, operationalCost: 3_040_000, netIncome: 118_544_908, appreciation: 3.0, totalReturn: 19.5, cumulativeReturn: 102.3 },
      ],
    },
    // ─── Asset 3: Parque Solar Atacama III ───
    {
      name: 'Parque Solar Atacama III',
      slug: 'parque-solar-atacama-iii',
      type: 'solar_energy',
      status: 'active',
      address: 'Camino al Salar de Atacama km 12, Sector Coya Sur',
      city: 'Calama',
      region: 'Antofagasta',
      country: 'Chile',
      totalValue: 4_200_000_000,
      pricePerFraction: 520_000,
      totalFractions: 8_077,
      availableFractions: 2_400,
      minimumInvestment: 520_000,
      fundedPercentage: 70,
      annualYield: 14.2,
      projectedAppreciation: 3.0,
      totalProjectedReturn: 17.2,
      leaseStatus: 'leased',
      monthlyRent: 32_500_000,
      tenantName: 'AtacamaSolar Energía Ltda.',
      totalArea: 35_000,
      units: 4,
      constructionYear: 2023,
      landUse: 'Energía Renovable',
      shortDescription: 'Parque solar de gran escala en el desierto de Atacama con PPA a 15 años y altos niveles de irradiación.',
      fullDescription: 'El Parque Solar Atacama III es una instalación de generación fotovoltaica a gran escala ubicada en el desierto de Atacama, la zona con mayor irradiación solar del mundo. Con 35.000 m² de paneles solares de última generación, la planta tiene una capacidad instalada de 8 MW.\n\nLa energía generada se vende mediante un Power Purchase Agreement (PPA) a 15 años firmado con AtacamaSolar Energía Ltda. El contrato garantiza un flujo de ingresos estable y predecible, ajustado anualmente según la variación del costo de energía en la red eléctrica.\n\nEl activo incluye mantenimiento preventivo y correctivo cubierto por el fabricante de los paneles, seguros contra todo riesgo y un sistema de monitoreo remoto 24/7.',
      highlights: JSON.stringify([
        'PPA a 15 años con garantía de compra de energía',
        'Mayor irradiación solar del mundo (>2.500 kWh/m²/año)',
        'Capacidad instalada: 8 MW de generación limpia',
        'Mantenimiento cubierto por fabricante por 10 años',
        'Contribuye a bonos de carbono verificables',
        'Seguro contra todo riesgo incluido',
      ]),
      badge: 'Energía Limpia',
      operationalCostsPct: 2.0,
      riskLevel: 'medium',
      dividendFrequency: 'quarterly',
      minInvestmentPeriod: 36,
      tags: 'energía solar,renovable,Atacama,PPA',
      images: [
        { url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=500&fit=crop', alt: 'Paneles solares en el desierto de Atacama', sortOrder: 0, isCover: true },
        { url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&h=500&fit=crop', alt: 'Vista aérea del parque solar', sortOrder: 1, isCover: false },
        { url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=500&fit=crop', alt: 'Atardecer sobre paneles solares', sortOrder: 2, isCover: false },
      ],
      documents: [
        { title: 'PPA – Contrato de Compra de Energía', documentType: 'contrato', fileUrl: '/docs/asset_solar_atacama/ppa.pdf', fileSize: 2_800_000 },
        { title: 'Estudio de Irradiación Solar', documentType: 'estudio', fileUrl: '/docs/asset_solar_atacama/irradiacion.pdf', fileSize: 4_100_000 },
        { title: 'Certificado de Medición NCRE', documentType: 'certificado', fileUrl: '/docs/asset_solar_atacama/ncre.pdf', fileSize: 920_000 },
      ],
      cashFlowProjections: [
        { period: 'Año 1', periodType: 'annual', grossIncome: 390_000_000, operationalCost: 7_800_000, netIncome: 382_200_000, appreciation: 3.0, totalReturn: 17.2, cumulativeReturn: 17.2 },
        { period: 'Año 2', periodType: 'annual', grossIncome: 399_000_000, operationalCost: 7_980_000, netIncome: 391_020_000, appreciation: 2.8, totalReturn: 17.0, cumulativeReturn: 34.6 },
        { period: 'Año 3', periodType: 'annual', grossIncome: 408_120_000, operationalCost: 8_162_000, netIncome: 399_958_000, appreciation: 2.6, totalReturn: 16.8, cumulativeReturn: 52.2 },
        { period: 'Año 4', periodType: 'annual', grossIncome: 417_362_400, operationalCost: 8_347_000, netIncome: 409_015_400, appreciation: 2.5, totalReturn: 16.7, cumulativeReturn: 69.5 },
        { period: 'Año 5', periodType: 'annual', grossIncome: 426_726_648, operationalCost: 8_535_000, netIncome: 418_191_648, appreciation: 2.3, totalReturn: 16.5, cumulativeReturn: 86.8 },
      ],
    },
    // ─── Asset 4: Residencial Providencia Sky ───
    {
      name: 'Residencial Providencia Sky',
      slug: 'residencial-providencia-sky',
      type: 'real_estate',
      status: 'active',
      address: 'Av. Providencia 2340, Torre A, Piso 15',
      city: 'Santiago',
      region: 'Región Metropolitana',
      country: 'Chile',
      totalValue: 1_600_000_000,
      pricePerFraction: 160_000,
      totalFractions: 10_000,
      availableFractions: 4_500,
      minimumInvestment: 160_000,
      fundedPercentage: 55,
      annualYield: 11.5,
      projectedAppreciation: 5.5,
      totalProjectedReturn: 17.0,
      leaseStatus: 'leased',
      monthlyRent: 12_800_000,
      tenantName: 'Providencia Rent SpA',
      totalArea: 4_200,
      units: 24,
      constructionYear: 2021,
      landUse: 'Residencial / Uso Mixto',
      shortDescription: 'Torre residencial de lujo en Providencia con arriendo corporativo y alto potencial de plusvalía.',
      fullDescription: 'Residencial Providencia Sky es una torre de 18 pisos ubicada en una de las avenidas más emblemáticas de Santiago. Las 24 unidades residenciales de alta gama incluyen departamentos de 2 y 3 dormitorios con acabados premium y terrazas con vista panorámica.\n\nLa propiedad está arrendada en su totalidad a Providencia Rent SpA, que opera las unidades como arriendos corporativos de mediana y larga estadía. El contrato de arriendo maestro tiene una vigencia de 5 años con renovación automática.\n\nLa ubicación en el corazón de Providencia garantiza un alto potencial de plusvalía, con un crecimiento promedio del sector de 5.5% anual en los últimos 3 años.',
      highlights: JSON.stringify([
        'Ubicación premium en Av. Providencia — sector de mayor plusvalía',
        'Arriendo corporativo maestro a 5 años con renovación automática',
        '24 unidades de alta gama con acabados premium',
        'Crecimiento de plusvalía histórico: 5.5% anual',
        'Cercanía a metro Pedro Aguirre Cerda y servicios',
        'Gimnasio, rooftop y estacionamientos subterráneos',
      ]),
      badge: 'Plusvalía Premium',
      operationalCostsPct: 3.5,
      riskLevel: 'low',
      dividendFrequency: 'monthly',
      minInvestmentPeriod: 6,
      tags: 'residencial,Providencia,departamentos,inmueble',
      images: [
        { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop', alt: 'Torre residencial moderna en Santiago', sortOrder: 0, isCover: true },
        { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop', alt: 'Interior departamento de lujo', sortOrder: 1, isCover: false },
        { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop', alt: 'Vista panorámica desde la torre', sortOrder: 2, isCover: false },
      ],
      documents: [
        { title: 'Tasación Comercial Actualizada', documentType: 'tasacion', fileUrl: '/docs/asset_residencial_prov/tasacion.pdf', fileSize: 1_800_000 },
        { title: 'Contrato de Arriendo Maestro', documentType: 'contrato', fileUrl: '/docs/asset_residencial_prov/contrato.pdf', fileSize: 1_350_000 },
        { title: 'Informe de Plusvalía del Sector', documentType: 'informe', fileUrl: '/docs/asset_residencial_prov/plusvalia.pdf', fileSize: 2_900_000 },
      ],
      cashFlowProjections: [
        { period: 'Año 1', periodType: 'annual', grossIncome: 153_600_000, operationalCost: 5_376_000, netIncome: 148_224_000, appreciation: 5.5, totalReturn: 17.0, cumulativeReturn: 17.0 },
        { period: 'Año 2', periodType: 'annual', grossIncome: 158_208_000, operationalCost: 5_537_000, netIncome: 152_671_000, appreciation: 5.2, totalReturn: 16.7, cumulativeReturn: 34.0 },
        { period: 'Año 3', periodType: 'annual', grossIncome: 162_954_240, operationalCost: 5_703_000, netIncome: 157_251_240, appreciation: 5.0, totalReturn: 16.5, cumulativeReturn: 51.3 },
        { period: 'Año 4', periodType: 'annual', grossIncome: 167_842_867, operationalCost: 5_875_000, netIncome: 161_967_867, appreciation: 4.8, totalReturn: 16.3, cumulativeReturn: 68.4 },
        { period: 'Año 5', periodType: 'annual', grossIncome: 172_878_153, operationalCost: 6_051_000, netIncome: 166_827_153, appreciation: 4.5, totalReturn: 16.0, cumulativeReturn: 85.4 },
      ],
    },
    // ─── Asset 5: Complejo Minero Atacama Norte ───
    {
      name: 'Complejo Minero Atacama Norte',
      slug: 'complejo-minero-atacama-norte',
      type: 'mining',
      status: 'active',
      address: 'Sector Minero Sierra Gorda, Concesión Minera SG-2048',
      city: 'Sierra Gorda',
      region: 'Antofagasta',
      country: 'Chile',
      totalValue: 6_800_000_000,
      pricePerFraction: 850_000,
      totalFractions: 8_000,
      availableFractions: 1_800,
      minimumInvestment: 850_000,
      fundedPercentage: 78,
      annualYield: 15.8,
      projectedAppreciation: 2.5,
      totalProjectedReturn: 18.3,
      leaseStatus: 'leased',
      monthlyRent: 55_200_000,
      tenantName: 'MineraAtacama SpA',
      totalArea: 120_000,
      units: 2,
      constructionYear: 2020,
      landUse: 'Minero / Extractivo',
      shortDescription: 'Complejo minero de cobre en Antofagasta con derechos de explotación a 20 años y royalties crecientes.',
      fullDescription: 'El Complejo Minero Atacama Norte comprende una concesión minera de cobre de 120 hectáreas ubicada en Sierra Gorda, una de las zonas de mayor producción cuprífera del mundo. La concesión tiene derechos de explotación vigentes por 20 años.\n\nLa propiedad está arrendada a MineraAtacama SpA, empresa con más de 15 años de operación en la zona. El contrato incluye royalties variables ligados al precio del cobre en la Bolsa de Metales de Londres (LME), lo que permite capturar alza en los precios del commodity.\n\nLa inversión ofrece una combinación única de ingresos por arriendo plus royalties, con un flujo de caja que históricamente ha superado las proyecciones conservadoras.',
      highlights: JSON.stringify([
        'Derechos de explotación vigentes por 20 años',
        'Royalties variables ligados al precio del cobre (LME)',
        '120 hectáreas en zona de mayor producción cuprífera del mundo',
        'Tenant con 15+ años de operación en la zona',
        'Ingresos duales: arriendo + royalties sobre producción',
        'Estudio geológico independiente disponible',
      ]),
      badge: 'Royalties Cobre',
      operationalCostsPct: 2.0,
      riskLevel: 'high',
      dividendFrequency: 'quarterly',
      minInvestmentPeriod: 36,
      tags: 'minería,litio,cobre,Antofagasta',
      images: [
        { url: 'https://images.unsplash.com/photo-1599894019798-7b8e3f888a0e?w=800&h=500&fit=crop', alt: 'Operación minera en el desierto de Atacama', sortOrder: 0, isCover: true },
        { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=500&fit=crop', alt: 'Vista del complejo minero a cielo abierto', sortOrder: 1, isCover: false },
      ],
      documents: [
        { title: 'Derechos de Concesión Minera', documentType: 'legal', fileUrl: '/docs/asset_minero_atacama/concesion.pdf', fileSize: 3_400_000 },
        { title: 'Estudio Geológico Independiente', documentType: 'estudio', fileUrl: '/docs/asset_minero_atacama/geologia.pdf', fileSize: 8_200_000 },
        { title: 'Contrato de Arriendo con Royalties', documentType: 'contrato', fileUrl: '/docs/asset_minero_atacama/contrato.pdf', fileSize: 2_100_000 },
      ],
      cashFlowProjections: [
        { period: 'Año 1', periodType: 'annual', grossIncome: 662_400_000, operationalCost: 13_248_000, netIncome: 649_152_000, appreciation: 2.5, totalReturn: 18.3, cumulativeReturn: 18.3 },
        { period: 'Año 2', periodType: 'annual', grossIncome: 678_888_000, operationalCost: 13_578_000, netIncome: 665_310_000, appreciation: 2.4, totalReturn: 18.2, cumulativeReturn: 37.1 },
        { period: 'Año 3', periodType: 'annual', grossIncome: 695_760_120, operationalCost: 13_915_000, netIncome: 681_845_120, appreciation: 2.3, totalReturn: 18.1, cumulativeReturn: 55.9 },
        { period: 'Año 4', periodType: 'annual', grossIncome: 713_027_723, operationalCost: 14_261_000, netIncome: 698_766_723, appreciation: 2.2, totalReturn: 18.0, cumulativeReturn: 74.6 },
        { period: 'Año 5', periodType: 'annual', grossIncome: 730_700_420, operationalCost: 14_614_000, netIncome: 716_086_420, appreciation: 2.0, totalReturn: 17.8, cumulativeReturn: 93.3 },
      ],
    },
    // ─── Asset 6: Bodega E-Commerce Maipú Hub ───
    {
      name: 'Bodega E-Commerce Maipú Hub',
      slug: 'bodega-e-commerce-maipu-hub',
      type: 'last_mile_logistics',
      status: 'active',
      address: 'Av. Pajaritos 4820, Zona Industrial Maipú',
      city: 'Santiago',
      region: 'Región Metropolitana',
      country: 'Chile',
      totalValue: 1_200_000_000,
      pricePerFraction: 120_000,
      totalFractions: 10_000,
      availableFractions: 6_200,
      minimumInvestment: 120_000,
      fundedPercentage: 38,
      annualYield: 12.5,
      projectedAppreciation: 4.8,
      totalProjectedReturn: 17.3,
      leaseStatus: 'leased',
      monthlyRent: 8_200_000,
      tenantName: 'MercadoExpress Chile SpA',
      totalArea: 6_800,
      units: 32,
      constructionYear: 2024,
      landUse: 'Industrial / Logístico',
      shortDescription: 'Bodega de fulfillment e-commerce en Maipú con contrato de arriendo a 7 años — acceso desde $120.000.',
      fullDescription: 'La Bodega E-Commerce Maipú Hub es una instalación de fulfillment diseñada específicamente para el comercio electrónico. Con 6.800 m² de área útil distribuidos en 32 módulos de almacenamiento y despacho, la propiedad atiende la creciente demanda logística del e-commerce en Chile.\n\nLa propiedad está arrendada a MercadoExpress Chile SpA, uno de los marketplaces de mayor crecimiento en el país. El contrato de arriendo a 7 años incluye cláusulas de ajuste anual y un mecanismo de participación en la productividad del centro.\n\nEste activo es ideal para inversores que buscan entrar al mercado de inversión fraccionaria desde un monto accesible, con una proyección de retorno total de 17.3% anual combinando yield y plusvalía.',
      highlights: JSON.stringify([
        'Inversión mínima accesible desde $120.000 CLP',
        'Contrato de arriendo a 7 años con ajuste anual',
        'Diseñada específicamente para fulfillment e-commerce',
        '32 módulos de almacenamiento y despacho',
        'Tenant de alto crecimiento: MercadoExpress Chile SpA',
        'Zona de Maipú con fuerte demanda logística',
      ]),
      badge: 'Accesible',
      operationalCostsPct: 3.0,
      riskLevel: 'low',
      dividendFrequency: 'monthly',
      minInvestmentPeriod: 12,
      tags: 'e-commerce,logística,Maipú,fulfillment',
      images: [
        { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=500&fit=crop', alt: 'Bodega logística moderna', sortOrder: 0, isCover: true },
        { url: 'https://images.unsplash.com/photo-1565891741441-64926e441838?w=800&h=500&fit=crop', alt: 'Interior de bodega de fulfillment', sortOrder: 1, isCover: false },
      ],
      documents: [
        { title: 'Tasación Comercial', documentType: 'tasacion', fileUrl: '/docs/asset_ecommerce_maipu/tasacion.pdf', fileSize: 1_600_000 },
        { title: 'Contrato de Arriendo', documentType: 'contrato', fileUrl: '/docs/asset_ecommerce_maipu/contrato.pdf', fileSize: 1_200_000 },
        { title: 'Plano Arquitectónico Aprobado', documentType: 'plano', fileUrl: '/docs/asset_ecommerce_maipu/plano.pdf', fileSize: 4_500_000 },
      ],
      cashFlowProjections: [
        { period: 'Año 1', periodType: 'annual', grossIncome: 98_400_000, operationalCost: 2_952_000, netIncome: 95_448_000, appreciation: 4.8, totalReturn: 17.3, cumulativeReturn: 17.3 },
        { period: 'Año 2', periodType: 'annual', grossIncome: 101_352_000, operationalCost: 3_041_000, netIncome: 98_311_000, appreciation: 4.6, totalReturn: 17.1, cumulativeReturn: 34.8 },
        { period: 'Año 3', periodType: 'annual', grossIncome: 104_392_560, operationalCost: 3_132_000, netIncome: 101_260_560, appreciation: 4.4, totalReturn: 16.9, cumulativeReturn: 52.4 },
        { period: 'Año 4', periodType: 'annual', grossIncome: 107_524_336, operationalCost: 3_226_000, netIncome: 104_298_336, appreciation: 4.2, totalReturn: 16.7, cumulativeReturn: 69.8 },
        { period: 'Año 5', periodType: 'annual', grossIncome: 110_750_066, operationalCost: 3_323_000, netIncome: 107_427_066, appreciation: 4.0, totalReturn: 16.5, cumulativeReturn: 87.1 },
      ],
    },
  ]

  // Track asset IDs by slug for linking to investments
  const assetIdBySlug: Record<string, string> = {}
  let assetsCreated = 0

  for (const assetData of assetsData) {
    const { images, documents, cashFlowProjections, ...assetFields } = assetData

    // Check if asset exists by slug
    const existing = await db.asset.findUnique({ where: { slug: assetData.slug } })

    if (existing) {
      // Update existing asset with full data
      await db.asset.update({
        where: { slug: assetData.slug },
        data: assetFields,
      })

      // Replace images
      await db.assetImage.deleteMany({ where: { assetId: existing.id } })
      await db.assetImage.createMany({
        data: images.map((img) => ({ assetId: existing.id, ...img })),
      })

      // Replace documents
      await db.assetDocument.deleteMany({ where: { assetId: existing.id } })
      await db.assetDocument.createMany({
        data: documents.map((doc) => ({ assetId: existing.id, ...doc })),
      })

      // Replace cash flow projections
      await db.cashFlowProjection.deleteMany({ where: { assetId: existing.id } })
      await db.cashFlowProjection.createMany({
        data: cashFlowProjections.map((cfp) => ({ assetId: existing.id, ...cfp })),
      })

      assetIdBySlug[assetData.slug] = existing.id
      console.log(`   🔄 Updated: ${assetData.name}`)
    } else {
      // Create new asset with nested relations
      const asset = await db.asset.create({
        data: {
          ...assetFields,
          images: { create: images },
          documents: { create: documents },
          cashFlowProjections: { create: cashFlowProjections },
        },
      })

      assetIdBySlug[assetData.slug] = asset.id
      console.log(`   ✅ Created: ${assetData.name}`)
      assetsCreated++
    }
    assetsCreated++
  }
  console.log(`   📊 Assets: ${assetsCreated} processed`)

  // ═══════════════════════════════════════════════════════════════
  // 3. DEMO USER
  // ═══════════════════════════════════════════════════════════════
  console.log('\n👤 Seeding Demo User (maria@example.com)...')

  let demoUserId = 'usr_demo_001'
  const demoUserEmail = 'maria@example.com'

  const existingDemoUser = await db.user.findUnique({ where: { email: demoUserEmail } })

  if (existingDemoUser) {
    demoUserId = existingDemoUser.id
    // Update with latest values
    await db.user.update({
      where: { id: demoUserId },
      data: {
        name: 'María González',
        role: 'investor',
        kycStatus: 'verified',
        balance: 4_850_000,
        totalInvested: 12_750_000,
        totalEarnings: 1_832_500,
        kycVerifiedAt: new Date('2024-12-20T09:00:00.000Z'),
        isActive: true,
        preferredLanguage: 'es',
      },
    })
    console.log(`   🔄 Updated demo user: ${demoUserEmail}`)
  } else {
    const hashedPassword = await bcrypt.hash('Maria2024!', 12)
    const demoUser = await db.user.create({
      data: {
        id: 'usr_demo_001',
        email: demoUserEmail,
        passwordHash: hashedPassword,
        name: 'María González',
        role: 'investor',
        kycStatus: 'verified',
        balance: 4_850_000,
        totalInvested: 12_750_000,
        totalEarnings: 1_832_500,
        kycVerifiedAt: new Date('2024-12-20T09:00:00.000Z'),
        isActive: true,
        preferredLanguage: 'es',
        newsletterOptIn: true,
        riskProfile: 'moderate',
      },
    })
    demoUserId = demoUser.id
    console.log(`   ✅ Created demo user: ${demoUserEmail} (password: Maria2024!)`)
  }

  // ═══════════════════════════════════════════════════════════════
  // 4. SUPERADMIN USER
  // ═══════════════════════════════════════════════════════════════
  console.log('\n🔑 Seeding Superadmin (admin@gsp.cl)...')

  const existingAdmin = await db.user.findUnique({ where: { email: 'admin@gsp.cl' } })

  if (existingAdmin) {
    if (existingAdmin.role !== 'superadmin' || !existingAdmin.passwordHash) {
      const hashedPassword = existingAdmin.passwordHash || await bcrypt.hash('GSP@admin2024', 12)
      await db.user.update({
        where: { email: 'admin@gsp.cl' },
        data: { role: 'superadmin', kycStatus: 'verified', passwordHash: hashedPassword, name: existingAdmin.name || 'GSP Superadmin' },
      })
      console.log('   🔄 Updated existing admin to superadmin')
    } else {
      console.log('   ⏭️  Superadmin already exists')
    }
  } else {
    const hashedPassword = await bcrypt.hash('GSP@admin2024', 12)
    await db.user.create({
      data: {
        id: 'usr_admin_001',
        email: 'admin@gsp.cl',
        passwordHash: hashedPassword,
        name: 'GSP Superadmin',
        role: 'superadmin',
        kycStatus: 'verified',
        isActive: true,
        preferredLanguage: 'es',
      },
    })
    console.log('   ✅ Created superadmin: admin@gsp.cl / GSP@admin2024')
  }

  // ═══════════════════════════════════════════════════════════════
  // 5. INVESTMENTS
  // ═══════════════════════════════════════════════════════════════
  console.log('\n💰 Seeding Investments...')

  const investmentsData = [
    {
      slug: 'centro-logistico-santiago-norte',
      quantity: 10,
      pricePerUnit: 250_000,
      totalAmount: 2_500_000,
      status: 'active',
      completedAt: new Date('2024-07-10T14:30:00.000Z'),
      createdAt: new Date('2024-07-08T09:15:00.000Z'),
    },
    {
      slug: 'micro-data-center-valparaiso',
      quantity: 25,
      pricePerUnit: 185_000,
      totalAmount: 4_625_000,
      status: 'active',
      completedAt: new Date('2024-09-05T11:00:00.000Z'),
      createdAt: new Date('2024-09-02T16:20:00.000Z'),
    },
    {
      slug: 'bodega-e-commerce-maipu-hub',
      quantity: 47,
      pricePerUnit: 120_000,
      totalAmount: 5_640_000,
      status: 'active',
      completedAt: new Date('2024-11-15T10:45:00.000Z'),
      createdAt: new Date('2024-11-12T08:30:00.000Z'),
    },
  ]

  const investmentIdBySlug: Record<string, string> = {}
  let investmentsCreated = 0

  for (const invData of investmentsData) {
    const assetId = assetIdBySlug[invData.slug]
    if (!assetId) {
      console.log(`   ⚠️  Skipping investment: asset ${invData.slug} not found`)
      continue
    }

    // Check if investment already exists
    const existingInv = await db.investment.findFirst({
      where: { userId: demoUserId, assetId },
    })

    if (existingInv) {
      await db.investment.update({
        where: { id: existingInv.id },
        data: {
          quantity: invData.quantity,
          pricePerUnit: invData.pricePerUnit,
          totalAmount: invData.totalAmount,
          status: invData.status,
          completedAt: invData.completedAt,
        },
      })
      investmentIdBySlug[invData.slug] = existingInv.id
      console.log(`   🔄 Updated investment: ${invData.slug}`)
    } else {
      const inv = await db.investment.create({
        data: {
          userId: demoUserId,
          assetId,
          quantity: invData.quantity,
          pricePerUnit: invData.pricePerUnit,
          totalAmount: invData.totalAmount,
          status: invData.status,
          completedAt: invData.completedAt,
          createdAt: invData.createdAt,
        },
      })
      investmentIdBySlug[invData.slug] = inv.id
      console.log(`   ✅ Created investment: ${invData.slug}`)
    }
    investmentsCreated++
  }
  console.log(`   📊 Investments: ${investmentsCreated} processed`)

  // ═══════════════════════════════════════════════════════════════
  // 6. TRANSACTIONS
  // ═══════════════════════════════════════════════════════════════
  console.log('\n💳 Seeding Transactions...')

  const transactionsData = [
    { type: 'deposit', amount: 5_000_000, currency: 'CLP', status: 'completed', description: 'Depósito inicial via transferencia bancaria', createdAt: new Date('2024-07-05T10:00:00.000Z') },
    { type: 'purchase', amount: 2_500_000, currency: 'CLP', status: 'completed', description: 'Compra de 10 fracciones – Centro Logístico Santiago Norte', investmentSlug: 'centro-logistico-santiago-norte', createdAt: new Date('2024-07-08T09:15:00.000Z') },
    { type: 'deposit', amount: 5_000_000, currency: 'CLP', status: 'completed', description: 'Depósito via transferencia bancaria', createdAt: new Date('2024-08-28T14:30:00.000Z') },
    { type: 'purchase', amount: 4_625_000, currency: 'CLP', status: 'completed', description: 'Compra de 25 fracciones – Micro Data Center Valparaíso', investmentSlug: 'micro-data-center-valparaiso', createdAt: new Date('2024-09-02T16:20:00.000Z') },
    { type: 'dividend', amount: 86_250, currency: 'CLP', status: 'completed', description: 'Dividendo Q3 2024 – Centro Logístico Santiago Norte', createdAt: new Date('2024-10-01T08:00:00.000Z') },
    { type: 'dividend', amount: 191_094, currency: 'CLP', status: 'completed', description: 'Dividendo Q4 2024 – Micro Data Center Valparaíso', createdAt: new Date('2024-12-01T08:00:00.000Z') },
    { type: 'deposit', amount: 6_000_000, currency: 'CLP', status: 'completed', description: 'Depósito via transferencia bancaria', createdAt: new Date('2024-11-10T09:00:00.000Z') },
    { type: 'purchase', amount: 5_640_000, currency: 'CLP', status: 'completed', description: 'Compra de 47 fracciones – Bodega E-Commerce Maipú Hub', investmentSlug: 'bodega-e-commerce-maipu-hub', createdAt: new Date('2024-11-12T08:30:00.000Z') },
    { type: 'dividend', amount: 70_500, currency: 'CLP', status: 'pending', description: 'Dividendo Q1 2025 – Bodega E-Commerce Maipú Hub', createdAt: new Date('2025-01-15T08:00:00.000Z') },
    { type: 'dividend', amount: 86_250, currency: 'CLP', status: 'completed', description: 'Dividendo Q1 2025 – Centro Logístico Santiago Norte', createdAt: new Date('2025-01-15T08:00:00.000Z') },
  ]

  // Clear existing transactions for this user and re-seed
  const existingTxCount = await db.transaction.count({ where: { userId: demoUserId } })
  if (existingTxCount > 0) {
    await db.transaction.deleteMany({ where: { userId: demoUserId } })
    console.log(`   🗑️  Cleared ${existingTxCount} existing transactions`)
  }

  for (const txData of transactionsData) {
    const { investmentSlug, ...txFields } = txData
    await db.transaction.create({
      data: {
        ...txFields,
        userId: demoUserId,
        investmentId: investmentSlug ? investmentIdBySlug[investmentSlug] : null,
      },
    })
  }
  console.log(`   ✅ Transactions: ${transactionsData.length} created`)

  // ═══════════════════════════════════════════════════════════════
  // 7. DIVIDEND PAYMENTS
  // ═══════════════════════════════════════════════════════════════
  console.log('\n💵 Seeding Dividend Payments...')

  const dividendsData = [
    {
      amount: 86_250, perFraction: 8_625, fractions: 10,
      periodStart: new Date('2024-07-01T00:00:00.000Z'), periodEnd: new Date('2024-09-30T23:59:59.000Z'),
      paymentDate: new Date('2024-10-01T08:00:00.000Z'), status: 'paid',
      investmentSlug: 'centro-logistico-santiago-norte', assetSlug: 'centro-logistico-santiago-norte',
      createdAt: new Date('2024-10-01T08:00:00.000Z'),
    },
    {
      amount: 191_094, perFraction: 7_643.76, fractions: 25,
      periodStart: new Date('2024-09-01T00:00:00.000Z'), periodEnd: new Date('2024-11-30T23:59:59.000Z'),
      paymentDate: new Date('2024-12-01T08:00:00.000Z'), status: 'paid',
      investmentSlug: 'micro-data-center-valparaiso', assetSlug: 'micro-data-center-valparaiso',
      createdAt: new Date('2024-12-01T08:00:00.000Z'),
    },
    {
      amount: 70_500, perFraction: 1_500, fractions: 47,
      periodStart: new Date('2024-11-01T00:00:00.000Z'), periodEnd: new Date('2025-01-31T23:59:59.000Z'),
      paymentDate: null, status: 'pending',
      investmentSlug: 'bodega-e-commerce-maipu-hub', assetSlug: 'bodega-e-commerce-maipu-hub',
      createdAt: new Date('2025-01-15T08:00:00.000Z'),
    },
    {
      amount: 86_250, perFraction: 8_625, fractions: 10,
      periodStart: new Date('2024-10-01T00:00:00.000Z'), periodEnd: new Date('2024-12-31T23:59:59.000Z'),
      paymentDate: new Date('2025-01-15T08:00:00.000Z'), status: 'paid',
      investmentSlug: 'centro-logistico-santiago-norte', assetSlug: 'centro-logistico-santiago-norte',
      createdAt: new Date('2025-01-15T08:00:00.000Z'),
    },
  ]

  // Clear existing dividends for this user and re-seed
  const existingDivCount = await db.dividendPayment.count({ where: { userId: demoUserId } })
  if (existingDivCount > 0) {
    await db.dividendPayment.deleteMany({ where: { userId: demoUserId } })
    console.log(`   🗑️  Cleared ${existingDivCount} existing dividend payments`)
  }

  for (const divData of dividendsData) {
    const { investmentSlug, assetSlug, ...divFields } = divData
    await db.dividendPayment.create({
      data: {
        ...divFields,
        userId: demoUserId,
        investmentId: investmentIdBySlug[investmentSlug],
        assetId: assetIdBySlug[assetSlug],
      },
    })
  }
  console.log(`   ✅ Dividend Payments: ${dividendsData.length} created`)

  // ═══════════════════════════════════════════════════════════════
  // 8. LIQUIDITY POOL
  // ═══════════════════════════════════════════════════════════════
  console.log('\n🌊 Seeding Liquidity Pool...')

  const existingPool = await db.liquidityPool.findFirst()

  if (existingPool) {
    await db.liquidityPool.update({
      where: { id: existingPool.id },
      data: {
        totalReserve: 450_000_000,
        totalAssets: 6,
        activeRequests: 3,
        utilizationRate: 42.5,
        monthlyContribution: 15_000_000,
        autoReplenish: true,
      },
    })
    console.log('   🔄 Updated liquidity pool')
  } else {
    await db.liquidityPool.create({
      data: {
        totalReserve: 450_000_000,
        totalAssets: 6,
        activeRequests: 3,
        utilizationRate: 42.5,
        monthlyContribution: 15_000_000,
        autoReplenish: true,
      },
    })
    console.log('   ✅ Created liquidity pool')
  }

  // ═══════════════════════════════════════════════════════════════
  // 9. NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════
  console.log('\n🔔 Seeding Notifications...')

  const notificationsData = [
    { type: 'dividend', title: 'Dividendo Recibido', message: 'Has recibido $86.250 CLP de dividendos por tu inversión en Centro Logístico Santiago Norte.', read: false, createdAt: new Date('2025-01-15T08:00:00.000Z') },
    { type: 'system', title: 'Nuevo Activo Disponible', message: 'Se ha publicado un nuevo activo: Bodega E-Commerce Maipú Hub. ¡Invierte desde $120.000!', read: false, createdAt: new Date('2025-01-14T10:00:00.000Z') },
    { type: 'kyc', title: 'Verificación Completada', message: 'Tu verificación de identidad ha sido aprobada exitosamente. Ya puedes acceder a todas las funcionalidades de la plataforma.', read: true, createdAt: new Date('2024-12-20T09:00:00.000Z') },
    { type: 'dividend', title: 'Dividendo Programado', message: 'Se ha programado un dividendo de $70.500 CLP por tu inversión en Bodega E-Commerce Maipú Hub.', read: false, createdAt: new Date('2025-01-14T14:00:00.000Z') },
    { type: 'system', title: 'Actualización de Plataforma', message: 'Hemos mejorado nuestro sistema de pagos. Ahora las transferencias son más rápidas y seguras.', read: true, createdAt: new Date('2024-11-15T12:00:00.000Z') },
  ]

  // Clear existing notifications for this user and re-seed
  const existingNotifCount = await db.notification.count({ where: { userId: demoUserId } })
  if (existingNotifCount > 0) {
    await db.notification.deleteMany({ where: { userId: demoUserId } })
    console.log(`   🗑️  Cleared ${existingNotifCount} existing notifications`)
  }

  for (const notif of notificationsData) {
    await db.notification.create({
      data: { ...notif, userId: demoUserId },
    })
  }
  console.log(`   ✅ Notifications: ${notificationsData.length} created`)

  // ═══════════════════════════════════════════════════════════════
  // 10. TESTIMONIALS
  // ═══════════════════════════════════════════════════════════════
  console.log('\n⭐ Seeding Testimonials...')

  const testimonialsData = [
    { name: 'Carolina Muñoz', role: 'Ingeniera Comercial', quote: 'Llevaba años queriendo invertir en bienes raíces pero no tenía el capital suficiente. Con GSP pude diversificar en 4 activos diferentes desde mi primera inversión. Los dividendos mensuales son una grata sorpresa.', rating: 5, investmentAmount: 2_500_000, assetName: 'Centro Logístico Santiago Norte', isFeatured: true, isVerified: true, sortOrder: 1, status: 'approved' },
    { name: 'Roberto Fuentes', role: 'Emprendedor', quote: 'Lo que más me gustó fue la transparencia. Puedo ver exactamente cuánto genera cada activo, los contratos de arriendo, y los estados financieros. Nada de cajas negras.', rating: 5, investmentAmount: 5_000_000, assetName: 'Micro Data Center Valparaíso', isFeatured: true, isVerified: true, sortOrder: 2, status: 'approved' },
    { name: 'Matías Sánchez', role: 'Profesor Universitario', quote: 'Como académico de finanzas, valoro mucho la estructura de costos. Pasar de 15% a 3% hace una diferencia enorme en el retorno real del inversor. Eso es innovación real.', rating: 5, investmentAmount: 1_000_000, assetName: 'Residencial Providencia Sky', isFeatured: false, isVerified: true, sortOrder: 3, status: 'approved' },
    { name: 'Daniela Sepúlveda', role: 'Diseñadora UX', quote: 'La experiencia de usar la plataforma es increíble. En 10 minutos ya tenía mi cuenta verificada y mi primera inversión hecha. La Salida Express me da tranquilidad de saber que puedo salir cuando necesite.', rating: 4, investmentAmount: 850_000, assetName: 'Residencial Providencia Sky', isFeatured: true, isVerified: true, sortOrder: 4, status: 'approved' },
    { name: 'Felipe Araya', role: 'Arquitecto', quote: 'Invertí en el parque solar y ha superado mis expectativas. Los dividendos trimestrales son puntuales y el rendimiento supera lo que ofrecen los fondos mutuos de renta fija.', rating: 5, investmentAmount: 3_200_000, assetName: 'Parque Solar Atacama III', isFeatured: false, isVerified: true, sortOrder: 5, status: 'approved' },
  ]

  let testimonialsCreated = 0
  for (const t of testimonialsData) {
    const existing = await db.testimonial.findFirst({ where: { name: t.name, role: t.role } })
    if (!existing) {
      await db.testimonial.create({ data: t })
      testimonialsCreated++
    }
  }
  console.log(`   ✅ Testimonials: ${testimonialsCreated} created (${testimonialsData.length - testimonialsCreated} already existed)`)

  // ═══════════════════════════════════════════════════════════════
  // 11. FAQs
  // ═══════════════════════════════════════════════════════════════
  console.log('\n❓ Seeding FAQs...')

  const faqsData = [
    { question: '¿Qué es GSP?', answer: 'GSP es una plataforma chilena de inversión fraccionaria que te permite invertir en activos inmobiliarios y de infraestructura desde $120.000. Nos diferenciamos por tener los costos operativos más bajos del mercado (3%) y un fondo de liquidez propio para que puedas salir cuando lo necesites.', category: 'inversion', sortOrder: 1 },
    { question: '¿Cómo funciona la inversión fraccionaria?', answer: 'GSP adquiere activos inmobiliarios y de infraestructura (data centers, parques solares, bodegas logísticas) y los divide en fracciones. Cada fracción representa una parte proporcional del activo. Al invertir, recibes dividendos mensuales según la renta generada y participas de la apreciación del activo.', category: 'inversion', sortOrder: 2 },
    { question: '¿Cuál es la inversión mínima?', answer: 'Puedes comenzar a invertir desde $120.000 CLP (aprox. $120 USD). No hay montos máximos de inversión. Cada activo tiene su propio precio por fracción y puedes adquirir múltiples fracciones del mismo o diferentes activos.', category: 'inversion', sortOrder: 3 },
    { question: '¿Qué es la Salida Express?', answer: 'La Salida Express es nuestro fondo de liquidez propio que te permite vender tus fracciones a valor contable en solo 48 horas. A diferencia de otras plataformas donde tu dinero queda atrapado por años, en GSP tienes liquidez inmediata sin penalizaciones ni comisiones adicionales.', category: 'liquidez', sortOrder: 1 },
    { question: '¿Cuánto tiempo toma recuperar mi inversión?', answer: 'Puedes solicitar la Salida Express en cualquier momento y recibir el dinero en 48 horas hábiles. Alternativamente, puedes mantener tu inversión a largo plazo y recibir dividendos mensuales + plusvalía al momento de la venta del activo.', category: 'liquidez', sortOrder: 2 },
    { question: '¿Es seguro invertir en GSP?', answer: 'Sí. GSP opera bajo supervisión de la CMF (Comisión para el Mercado Financiero) de Chile. Todos los activos tienen escrituras registradas, estados financieros auditados trimestralmente, y los fondos de los inversores están custodiados por entidades reguladas.', category: 'seguridad', sortOrder: 1 },
    { question: '¿Cómo se protegen mis datos?', answer: 'Utilizamos encriptación de extremo a extremo (E2E) y contamos con certificación SOC 2. Tus datos personales y financieros están protegidos con los más altos estándares de seguridad de la industria.', category: 'seguridad', sortOrder: 2 },
    { question: '¿Qué documentos necesito para registrarme?', answer: 'Solo necesitas tu cédula de identidad o pasaporte, RUT, y una cuenta bancaria chilena. El proceso de verificación KYC toma menos de 5 minutos y se aprueba generalmente en 24 horas hábiles.', category: 'cuentas', sortOrder: 1 },
    { question: '¿Puedo tener más de una inversión activa?', answer: '¡Por supuesto! Puedes diversificar tu portafolio invirtiendo en múltiples activos simultáneamente. Te recomendamos diversificar entre diferentes tipos de activos para optimizar el riesgo-retorno de tu inversión.', category: 'cuentas', sortOrder: 2 },
    { question: '¿Cómo se calculan los dividendos?', answer: 'Los dividendos se calculan mensualmente según la renta neta del activo (ingresos por arriendo menos costos operativos). Tu dividendo es proporcional a la cantidad de fracciones que posees. Los dividendos se depositan directamente en tu cuenta bancaria registrada.', category: 'inversion', sortOrder: 4 },
    { question: '¿Qué tipos de activos puedo encontrar?', answer: 'GSP ofrece 5 clases de activos: Inmuebles residenciales y comerciales, Micro Data Centers, Logística de última milla, Energía Solar (parques solares) y Minería (derechos mineros y apoyo logístico).', category: 'inversion', sortOrder: 5 },
    { question: '¿Existen costos ocultos?', answer: 'No. GSP cobra una comisión total del 3% que incluye administración, gestión de activos, auditoría, tecnología y custodia. Todos los costos están transparentados en la plataforma. No cobramos comisiones de entrada ni salida adicionales.', category: 'tributacion', sortOrder: 1 },
  ]

  let faqsCreated = 0
  for (const faq of faqsData) {
    const existing = await db.fAQ.findFirst({ where: { question: faq.question } })
    if (!existing) {
      await db.fAQ.create({ data: faq })
      faqsCreated++
    }
  }
  console.log(`   ✅ FAQs: ${faqsCreated} created (${faqsData.length - faqsCreated} already existed)`)

  // ═══════════════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ═══════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(50))
  console.log('📊 FINAL DATABASE COUNTS')
  console.log('═'.repeat(50))

  const counts = await Promise.all([
    db.asset.count(),
    db.user.count(),
    db.investment.count(),
    db.transaction.count(),
    db.dividendPayment.count(),
    db.notification.count(),
    db.liquidityPool.count(),
    db.assetType.count(),
    db.testimonial.count(),
    db.fAQ.count(),
    db.siteSetting.count(),
  ])

  console.log(`   Assets:             ${counts[0]}`)
  console.log(`   Users:              ${counts[1]}`)
  console.log(`   Investments:        ${counts[2]}`)
  console.log(`   Transactions:       ${counts[3]}`)
  console.log(`   Dividend Payments:  ${counts[4]}`)
  console.log(`   Notifications:      ${counts[5]}`)
  console.log(`   Liquidity Pools:    ${counts[6]}`)
  console.log(`   Asset Types:        ${counts[7]}`)
  console.log(`   Testimonials:       ${counts[8]}`)
  console.log(`   FAQs:               ${counts[9]}`)
  console.log(`   Site Settings:      ${counts[10]}`)
  console.log('═'.repeat(50))
  console.log('✅ Seed completed successfully!')
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
