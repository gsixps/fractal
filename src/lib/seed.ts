import { db } from '@/lib/db'

const ASSET_TYPES = ['real_estate', 'micro_datacenter', 'last_mile_logistics', 'solar_energy', 'mining'] as const

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
    fullDescription: `## Centro Logístico Santiago Norte

Ubicado en el corazón del corredor industrial de Quilicura, este centro de distribución de última milla representa una oportunidad excepcional en el sector logístico chileno.

### ¿Por qué invertir?

El e-commerce en Chile creció un **340%** desde 2019, generando una demanda insatisfecha de espacios de última milla. Este activo está estratégicamente posicionado a minutos de la autopista Américo Vespucio y cuenta con acceso directo a las principales rutas de distribución.

### Características del activo

- **12 módulos independientes** de 375 m² cada uno
- **Certificación LEED Gold** en eficiencia energética
- **Sistema de seguridad** con vigilancia 24/7 y control de acceso biométrico
- **Andenes de carga** nivelados con Dock Levelers hidráulicos
- **Estacionamiento** para 40 vehículos y 6 espacios de carga pesada

### Estructura del arriendo

El contrato actual con LogiChile SpA extiende hasta febrero de 2029, con reajuste anual según IPC + 1%. El yielding neto considera todos los costos operativos ya deducidos, ofreciendo una renta pasiva verdaderamente transparente.

### Nuestra ventaja operativa

A diferencia del mercado que cobra entre **12% y 18%** en costos operativos, GSP mantiene una estructura de apenas **3%** gracias a nuestra automatización completa de gestión:
- Property management automatizado con IA
- Conciliación financiera en tiempo real
- Gestión documental 100% digital
- Reportes automáticos para inversores`,
    highlights: JSON.stringify([
      'Zona de mayor crecimiento logístico de Chile',
      'Contrato de arriendo a 5 años con empresa AAA',
      'Certificación LEED Gold',
      'Costos operativos del 3% vs 15% del mercado',
      'Retorno total estimado: 17% anual',
    ]),
    badge: 'En Arriendo',
    operationalCosts: 712800000,
    operationalCostsPct: 3.0,
    images: [
      { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop', alt: 'Centro logístico - Vista aérea', sortOrder: 0, isCover: true },
      { url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop', alt: 'Interior bodega', sortOrder: 1, isCover: false },
      { url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=600&fit=crop', alt: 'Módulo logístico', sortOrder: 2, isCover: false },
      { url: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&h=600&fit=crop', alt: 'Andenes de carga', sortOrder: 3, isCover: false },
    ],
    documents: [
      { title: 'Escritura SpA', documentType: 'escritura_spa', fileUrl: '#' },
      { title: 'Informe de Tasación 2024', documentType: 'tasacion', fileUrl: '#' },
      { title: 'Estudio de Títulos', documentType: 'estudio_titulos', fileUrl: '#' },
      { title: 'Contrato de Administración', documentType: 'contrato_admin', fileUrl: '#' },
      { title: 'Estado Financiero Q1 2025', documentType: 'estado_financiero', fileUrl: '#' },
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
    shortDescription: 'Micro data center Tier II con infraestructura redundante y contratos de hosting a 7 años. Demanda creciente por nube local.',
    fullDescription: `## Micro Data Center Valparaíso

Un centro de datos de última generación ubicado estratégicamente en Valparaíso, el segundo hub tecnológico de Chile.

### Oportunidad única

La demanda de centros de datos en Chile crece un **25% anual** impulsada por la regulación de soberanía de datos. Este micro data center ofrece exposición al sector tecnológico con el respaldo de contratos de arriendo a largo plazo.

### Infraestructura

- **Tier II certificado** con uptime del 99.74%
- **Sistema de enfriamiento** N+1 con eficiencia PUE de 1.3
- **Energía redundante** con UPS y generador diésel
- **Conectividad** con múltiples proveedores de fibra óptica
- **Seguridad física** perimetral y biométrica`,
    highlights: JSON.stringify([
      'Sector tecnológico de mayor crecimiento en Chile',
      'Contrato de arriendo a 7 años',
      'Certificación Tier II',
      'ROI del 21% anual',
    ]),
    badge: 'Últimos cupos',
    operationalCosts: 555000000,
    operationalCostsPct: 3.0,
    images: [
      { url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop', alt: 'Data center - Vista exterior', sortOrder: 0, isCover: true },
      { url: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&h=600&fit=crop', alt: 'Servidores', sortOrder: 1, isCover: false },
      { url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop', alt: 'Infraestructura', sortOrder: 2, isCover: false },
    ],
    documents: [
      { title: 'Escritura SpA', documentType: 'escritura_spa', fileUrl: '#' },
      { title: 'Informe de Tasación 2024', documentType: 'tasacion', fileUrl: '#' },
      { title: 'Estudio de Títulos', documentType: 'estudio_titulos', fileUrl: '#' },
      { title: 'Contrato de Administración', documentType: 'contrato_admin', fileUrl: '#' },
    ],
    cashFlowProjections: [
      { period: 'Año 1', periodType: 'yearly', grossIncome: 188160000, operationalCost: 5644800, netIncome: 182515200, appreciation: 133200000, totalReturn: 315715200, cumulativeReturn: 315715200 },
      { period: 'Año 2', periodType: 'yearly', grossIncome: 194582400, operationalCost: 5837472, netIncome: 188744928, appreciation: 142794240, totalReturn: 331539168, cumulativeReturn: 647254368 },
      { period: 'Año 3', periodType: 'yearly', grossIncome: 201273379, operationalCost: 6038201, netIncome: 195235178, appreciation: 152954208, totalReturn: 348189386, cumulativeReturn: 995443754 },
      { period: 'Año 4', periodType: 'yearly', grossIncome: 208243200, operationalCost: 6247296, netIncome: 201995904, appreciation: 163714080, totalReturn: 365709984, cumulativeReturn: 1361153738 },
      { period: 'Año 5', periodType: 'yearly', grossIncome: 215504160, operationalCost: 6465125, netIncome: 209039035, appreciation: 175101760, totalReturn: 384140795, cumulativeReturn: 1745294533 },
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
    shortDescription: 'Parque solar de 2MW en el desierto de Atacama, el lugar con mayor radiación solar del mundo. Contrato PPA a 10 años.',
    fullDescription: `## Parque Solar Atacama III

Ubicado en el desierto de Atacama — el lugar con la **mayor radiación solar del planeta** — este parque de 2MW ofrece exposición al boom de energías renovables en Chile.

### Diferenciador

Chile se comprometió a alcanzar el **100% de energía renovable** para 2040. Este activo se beneficia de contratos de compra de energía (PPA) a largo plazo con garantía estatal.

### Especificaciones técnicas

- **2MW de capacidad instalada** con paneles bifaciales
- **Irradiación solar** de 2,400 kWh/m²/año
- **Contrato PPA** a 10 años con EnergíaPlus SpA
- **Mantenimiento preventivo** incluido en contrato`,
    highlights: JSON.stringify([
      'Mayor radiación solar del mundo',
      'Contrato PPA a 10 años garantizado',
      'Sector con crecimiento obligatorio por ley',
      'Inversión en infraestructura crítica',
    ]),
    badge: 'Oportunidad',
    operationalCosts: 1560000000,
    operationalCostsPct: 3.0,
    images: [
      { url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop', alt: 'Paneles solares', sortOrder: 0, isCover: true },
      { url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&h=600&fit=crop', alt: 'Parque solar aéreo', sortOrder: 1, isCover: false },
      { url: 'https://images.unsplash.com/photo-1611270629569-8b357cb88da9?w=800&h=600&fit=crop', alt: 'Instalación solar', sortOrder: 2, isCover: false },
    ],
    documents: [
      { title: 'Escritura SpA', documentType: 'escritura_spa', fileUrl: '#' },
      { title: 'Informe de Tasación 2024', documentType: 'tasacion', fileUrl: '#' },
      { title: 'Estudio de Títulos', documentType: 'estudio_titulos', fileUrl: '#' },
      { title: 'Contrato PPA', documentType: 'contrato_admin', fileUrl: '#' },
    ],
    cashFlowProjections: [
      { period: 'Año 1', periodType: 'yearly', grossIncome: 342000000, operationalCost: 10260000, netIncome: 331740000, appreciation: 218400000, totalReturn: 550140000, cumulativeReturn: 550140000 },
      { period: 'Año 2', periodType: 'yearly', grossIncome: 348840000, operationalCost: 10465200, netIncome: 338374800, appreciation: 227616000, totalReturn: 565990800, cumulativeReturn: 1116130800 },
      { period: 'Año 3', periodType: 'yearly', grossIncome: 355816800, operationalCost: 10674504, netIncome: 345142296, appreciation: 237175040, totalReturn: 582317336, cumulativeReturn: 1698448136 },
      { period: 'Año 4', periodType: 'yearly', grossIncome: 362933136, operationalCost: 10887994, netIncome: 352045142, appreciation: 247082320, totalReturn: 599127462, cumulativeReturn: 2297575598 },
      { period: 'Año 5', periodType: 'yearly', grossIncome: 370191799, operationalCost: 11105754, netIncome: 359086045, appreciation: 257346736, totalReturn: 616432781, cumulativeReturn: 2914008379 },
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
    shortDescription: 'Edificio residencial premium en Providencia con 8 departamentos de alto estándar. Ubicación inmejorable junto al metro Pedro Aguirre Cerda.',
    fullDescription: `## Residencial Providencia Sky

Edificio residencial de lujo en una de las comunas más cotizadas de Santiago, con excelente conectividad y demanda de arriendo consistente.

### Ubicación privilegiada

A metros de la estación Pedro Aguirre Cerda del Metro, rodeado de universidades, comercio y servicios. Providencia mantiene una **tasa de ocupación del 97%** en el segmento residencial premium.

### Características

- **8 departamentos** de 1 y 2 dormitorios
- **Terminaciones premium**: piso flotante, cocina americana, balcones
- **Amenidades**: gimnasio, laundry, terraza comunitaria
- **Estacionamiento subterráneo** bicicletas`,
    highlights: JSON.stringify([
      'Ubicación premium en Providencia',
      'Tasa de ocupación del 97%',
      'Cerca del metro',
      'Plusvalía histórica del 6.5% anual',
    ]),
    badge: 'En Arriendo',
    operationalCosts: 480000000,
    operationalCostsPct: 3.0,
    images: [
      { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop', alt: 'Edificio residencial', sortOrder: 0, isCover: true },
      { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop', alt: 'Interior apartamento', sortOrder: 1, isCover: false },
      { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', alt: 'Vista panorámica', sortOrder: 2, isCover: false },
      { url: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=600&fit=crop', alt: 'Sala de estar', sortOrder: 3, isCover: false },
    ],
    documents: [
      { title: 'Escritura SpA', documentType: 'escritura_spa', fileUrl: '#' },
      { title: 'Informe de Tasación 2024', documentType: 'tasacion', fileUrl: '#' },
      { title: 'Estudio de Títulos', documentType: 'estudio_titulos', fileUrl: '#' },
      { title: 'Contrato de Administración', documentType: 'contrato_admin', fileUrl: '#' },
    ],
    cashFlowProjections: [
      { period: 'Año 1', periodType: 'yearly', grossIncome: 106800000, operationalCost: 3204000, netIncome: 103596000, appreciation: 104000000, totalReturn: 207596000, cumulativeReturn: 207596000 },
      { period: 'Año 2', periodType: 'yearly', grossIncome: 110004000, operationalCost: 3300120, netIncome: 106703880, appreciation: 110760000, totalReturn: 217463880, cumulativeReturn: 425059880 },
      { period: 'Año 3', periodType: 'yearly', grossIncome: 113304120, operationalCost: 3399124, netIncome: 109905000, appreciation: 117959000, totalReturn: 227864000, cumulativeReturn: 652923880 },
      { period: 'Año 4', periodType: 'yearly', grossIncome: 116703244, operationalCost: 3501097, netIncome: 113202147, appreciation: 125725280, totalReturn: 238927427, cumulativeReturn: 891851307 },
      { period: 'Año 5', periodType: 'yearly', grossIncome: 120204341, operationalCost: 3606130, netIncome: 116598211, appreciation: 133974422, totalReturn: 250572633, cumulativeReturn: 1142423940 },
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
    shortDescription: 'Complejo de apoyo minero con contratos de arriendo a 8 años. Exposición al boom del litio y cobre en el norte de Chile.',
    fullDescription: `## Complejo Minero Atacama Norte

Complejo logístico-minero con infraestructura para apoyo a operaciones extractivas en el corredor del litio chileno.

### Contexto de mercado

Chile posee las **mayores reservas de litio del mundo** (41%) y es el segundo productor de cobre. La demanda global de minerales críticos para la transición energética impulsa una necesidad creciente de infraestructura de apoyo.

### Infraestructura

- **Campamento operativo** para 200 personas
- **Talleres mecánicos** y áreas de mantención
- **Almacenes** de materiales y equipos
- **Planta de tratamiento** de aguas
- **Conexión vial** directa a Ruta 5 Norte`,
    highlights: JSON.stringify([
      'Exposición al boom del litio y cobre',
      'Contrato de arriendo a 8 años',
      'Infraestructura para 200 personas',
      'Retorno total del 22.7% anual',
    ]),
    badge: 'Oportunidad',
    operationalCosts: 2550000000,
    operationalCostsPct: 3.0,
    images: [
      { url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&h=600&fit=crop', alt: 'Operación minera', sortOrder: 0, isCover: true },
      { url: 'https://images.unsplash.com/photo-1578496479531-32e296d5c6e8?w=800&h=600&fit=crop', alt: 'Maquinaria pesada', sortOrder: 1, isCover: false },
      { url: 'https://images.unsplash.com/photo-1599894019799-8cf418a8fc4d?w=800&h=600&fit=crop', alt: 'Campamento', sortOrder: 2, isCover: false },
    ],
    documents: [
      { title: 'Escritura SpA', documentType: 'escritura_spa', fileUrl: '#' },
      { title: 'Informe de Tasación 2024', documentType: 'tasacion', fileUrl: '#' },
      { title: 'Estudio de Títulos', documentType: 'estudio_titulos', fileUrl: '#' },
      { title: 'Contrato de Arriendo', documentType: 'contrato_admin', fileUrl: '#' },
    ],
    cashFlowProjections: [
      { period: 'Año 1', periodType: 'yearly', grossIncome: 762000000, operationalCost: 22860000, netIncome: 739140000, appreciation: 722500000, totalReturn: 1461640000, cumulativeReturn: 1461640000 },
      { period: 'Año 2', periodType: 'yearly', grossIncome: 787380000, operationalCost: 23621400, netIncome: 763758600, appreciation: 783912500, totalReturn: 1547671100, cumulativeReturn: 3009311100 },
      { period: 'Año 3', periodType: 'yearly', grossIncome: 813435600, operationalCost: 24403068, netIncome: 789032532, appreciation: 850544062, totalReturn: 1639576594, cumulativeReturn: 4648887694 },
      { period: 'Año 4', periodType: 'yearly', grossIncome: 840185028, operationalCost: 25205551, netIncome: 814979477, appreciation: 922840308, totalReturn: 1737819785, cumulativeReturn: 6386707479 },
      { period: 'Año 5', periodType: 'yearly', grossIncome: 867653419, operationalCost: 26029603, netIncome: 841623816, appreciation: 1001381774, totalReturn: 1843005590, cumulativeReturn: 8229713069 },
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
    shortDescription: 'Hub de fulfillment para e-commerce en Maipú. Contrato con operador logístico líder de la región.',
    fullDescription: `## Bodega E-Commerce Maipú Hub

Hub logístico diseñado específicamente para operaciones de e-commerce y fulfillment, ubicado en la comuna de Maipú con acceso directo a las principales rutas de distribución.`,
    highlights: JSON.stringify([
      'Operador logístico líder regional',
      'Diseñado para e-commerce',
      'Entrada desde $120.000',
    ]),
    badge: 'En Arriendo',
    operationalCosts: 360000000,
    operationalCostsPct: 3.0,
    images: [
      { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop', alt: 'Bodega logística', sortOrder: 0, isCover: true },
      { url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop', alt: 'Interior bodega', sortOrder: 1, isCover: false },
    ],
    documents: [
      { title: 'Escritura SpA', documentType: 'escritura_spa', fileUrl: '#' },
      { title: 'Informe de Tasación', documentType: 'tasacion', fileUrl: '#' },
      { title: 'Estudio de Títulos', documentType: 'estudio_titulos', fileUrl: '#' },
    ],
    cashFlowProjections: [
      { period: 'Año 1', periodType: 'yearly', grossIncome: 93600000, operationalCost: 2808000, netIncome: 90792000, appreciation: 60000000, totalReturn: 150792000, cumulativeReturn: 150792000 },
      { period: 'Año 2', periodType: 'yearly', grossIncome: 96408000, operationalCost: 2892240, netIncome: 93515760, appreciation: 63000000, totalReturn: 156515760, cumulativeReturn: 307307760 },
      { period: 'Año 3', periodType: 'yearly', grossIncome: 99300240, operationalCost: 2979007, netIncome: 96321233, appreciation: 66150000, totalReturn: 162471233, cumulativeReturn: 469778993 },
      { period: 'Año 4', periodType: 'yearly', grossIncome: 102279247, operationalCost: 3068377, netIncome: 99210870, appreciation: 69457500, totalReturn: 168668370, cumulativeReturn: 638447363 },
      { period: 'Año 5', periodType: 'yearly', grossIncome: 105347625, operationalCost: 3160429, netIncome: 102187196, appreciation: 72930375, totalReturn: 175117571, cumulativeReturn: 813564934 },
    ],
  },
]

export async function seedDatabase() {
  // Check if already seeded
  const existingAssets = await db.asset.count()
  if (existingAssets > 0) {
    return { message: 'Database already seeded', count: existingAssets }
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
      },
    })

    // Create sample dividend payments
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

  return { message: 'Database seeded successfully', count: DEMO_ASSETS.length }
}
