'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from 'react'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type Locale = 'es' | 'en'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  loading: boolean
}

// ─── Translation Maps ──────────────────────────────────────────────────────────

type TranslationMap = Record<string, string>
type LocaleMap = Record<Locale, TranslationMap>

const translations: LocaleMap = {
  es: {
    // ── NAV ─────────────────────────────────────────────────────────────────
    'nav.home': 'Inicio',
    'nav.marketplace': 'Marketplace',
    'nav.portfolio': 'Mi Portafolio',
    'nav.admin': 'Admin',
    'nav.adminPanel': 'Panel de Administración',
    'nav.notifications': 'Notificaciones',
    'nav.dashboard': 'Panel',
    'nav.settings': 'Configuración',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Registrarse',
    'nav.logout': 'Cerrar Sesión',
    'nav.profile': 'Mi Perfil',
    'nav.kyc': 'Verificación KYC',
    'nav.liquidity': 'Liquidez',
    'nav.langSwitch': 'EN',
    'nav.menu': 'Menú',
    'nav.secondaryMarket': 'Mercado Secundario',
    'nav.reports': 'Reportes',

    // ── HOME PAGE ───────────────────────────────────────────────────────────
    'home.hero.title': 'Invierte en activos inmobiliarios desde $120.000',
    'home.hero.subtitle':
      'Accede a inversiones fraccionadas en propiedades premium con rendimientos verificados y liquidez inmediata.',
    'home.hero.cta': 'Explora Activos',
    'home.hero.ctaSecondary': 'Ver Marketplace',
    'home.liquidity.title': 'Liquidez inmediata con Salida Express',
    'home.liquidity.subtitle':
      'Retira tu inversión cuando lo necesites. Nuestro pool de liquidez garantiza salida en menos de 48 horas.',
    'home.costs.title': 'Costos operativos del 3% vs 15% del mercado',
    'home.costs.subtitle':
      'Mantén más ganancias. Nuestras tarifas son hasta 5 veces más bajas que los fondos inmobiliarios tradicionales.',
    'home.featured.title': 'Activos Destacados',
    'home.featured.viewAll': 'Ver todos los activos',
    'home.annualYield': 'Rendimiento Anual',
    'home.fundsRaised': 'Fondos Recolectados',
    'home.viewDetails': 'Ver Detalle',
    'home.cta.title': 'Comienza a invertir hoy',
    'home.cta.subtitle':
      'Únete a miles de inversores que ya están generando rendimientos con activos inmobiliarios fraccionados.',
    'home.cta.button': 'Crear Cuenta',
    'home.cta.login': 'Ya tengo cuenta',
    'home.whyGsp': 'Por qué GALAXY',
    'home.whyGsp.subtitle':
      'La plataforma líder en inversión inmobiliaria fraccionada.',
    'home.whyGsp.verified': 'Activos verificados',
    'home.whyGsp.verifiedDesc':
      'Cada propiedad es auditada por firmas de terceros antes de ser listada.',
    'home.whyGsp.returns': 'Rendimientos reales',
    'home.whyGsp.returnsDesc':
      'Historial comprobado de rendimientos por encima del promedio del mercado.',
    'home.whyGsp.liquidity': 'Liquidez inmediata',
    'home.whyGsp.liquidityDesc':
      'Pool de liquidez propio que permite retirar tu inversión en cualquier momento.',
    'home.whyGsp.lowCosts': 'Bajos costos operativos',
    'home.whyGsp.lowCostsDesc':
      'Solo el 3% de costos operativos frente al 15% promedio de la industria.',
    'home.whyGsp.security': 'Seguridad legal',
    'home.whyGsp.securityDesc':
      'Marco regulatorio completo con protección al inversor garantizada.',
    'home.whyGsp.transparency': 'Transparencia total',
    'home.whyGsp.transparencyDesc':
      'Reportes financieros trimestrales y acceso a toda la documentación del activo.',
    'home.testimonials.title': 'Testimonios',
    'home.testimonials.subtitle': 'Lo que dicen nuestros inversores',
    'home.stats.investors': 'Inversores activos',
    'home.stats.invested': 'Total invertido',
    'home.stats.assets': 'Activos listados',
    'home.stats.dividends': 'Dividendos distribuidos',
    'home.trust.badge1': 'Regulados por',
    'home.trust.badge2': 'Auditoría trimestral',
    'home.trust.badge3': 'Datos encriptados',
    'home.trust.badge4': 'Fondos segregados',

    // ── MARKETPLACE ─────────────────────────────────────────────────────────
    'marketplace.title': 'Marketplace',
    'marketplace.subtitle': 'Descubre activos de inversión con rendimientos verificados',
    'marketplace.all': 'Todos',
    'marketplace.realEstate': 'Inmuebles',
    'marketplace.dataCenters': 'Data Centers',
    'marketplace.logistics': 'Logística',
    'marketplace.solarEnergy': 'Energía Solar',
    'marketplace.mining': 'Minería',
    'marketplace.filter': 'Filtrar',
    'marketplace.sortBy': 'Ordenar por',
    'marketplace.sort.yield': 'Mayor rendimiento',
    'marketplace.sort.priceLow': 'Menor precio',
    'marketplace.sort.priceHigh': 'Mayor precio',
    'marketplace.sort.newest': 'Más recientes',
    'marketplace.sort.funded': 'Mayor financiamiento',
    'marketplace.pricePerFraction': 'Precio por Fracción',
    'marketplace.invest': 'Invertir',
    'marketplace.viewDetails': 'Ver Detalle',
    'marketplace.noResults': 'No se encontraron activos',
    'marketplace.noResultsDesc': 'Intenta ajustar los filtros para encontrar más opciones.',
    'marketplace.resultsCount': '{count} activos encontrados',
    'marketplace.availableFractions': 'Fracciones disponibles',
    'marketplace.funded': 'Financiado',
    'marketplace.minInvestment': 'Inversión mínima',
    'marketplace.annualYield': 'Rendimiento anual',
    'marketplace.location': 'Ubicación',
    'marketplace.type': 'Tipo de activo',
    'marketplace.searchPlaceholder': 'Buscar activos...',
    'marketplace.filters.title': 'Filtros',
    'marketplace.filters.reset': 'Limpiar filtros',
    'marketplace.filters.apply': 'Aplicar filtros',
    'marketplace.filters.priceRange': 'Rango de precio',
    'marketplace.filters.yieldRange': 'Rango de rendimiento',
    'marketplace.filters.status': 'Estado',

    // ── ASSET DETAIL ────────────────────────────────────────────────────────
    'asset.overview': 'Resumen',
    'asset.details': 'Detalles',
    'asset.financials': 'Finanzas',
    'asset.documents': 'Documentos',
    'asset.gallery': 'Galería',
    'asset.cashFlow': 'Flujo de Caja',
    'asset.investNow': 'Invertir Ahora',
    'asset.addToPortfolio': 'Agregar a Portafolio',
    'asset.totalValue': 'Valor Total',
    'asset.availableFractions': 'Fracciones Disponibles',
    'asset.minimumInvestment': 'Inversión Mínima',
    'asset.fundedPercentage': 'Financiado',
    'asset.annualYield': 'Rendimiento Anual',
    'asset.projectedAppreciation': 'Apreciación Proyectada',
    'asset.totalReturn': 'Retorno Total Proyectado',
    'asset.leaseStatus': 'Estado del Arrendamiento',
    'asset.monthlyRent': 'Renta Mensual',
    'asset.tenant': 'Arrendatario',
    'asset.totalArea': 'Área Total',
    'asset.units': 'Unidades',
    'asset.yearBuilt': 'Año de Construcción',
    'asset.landUse': 'Uso de Suelo',
    'asset.operationalCosts': 'Costos Operativos',
    'asset.highlights': 'Aspectos Destacados',
    'asset.description': 'Descripción',
    'asset.location': 'Ubicación',
    'asset.similarAssets': 'Activos Similares',
    'asset.investmentSummary': 'Resumen de Inversión',
    'asset.howItWorks': 'Cómo Funciona',
    'asset.risks': 'Riesgos',
    'asset.faq': 'Preguntas Frecuentes',
    'asset.backToMarketplace': 'Volver al Marketplace',
    'asset.expressExit': 'Salida Express',
    'asset.expressExitDesc': 'Disponible para retiro en 48 horas',
    'asset.investors': 'inversores',

    // ── DASHBOARD ───────────────────────────────────────────────────────────
    'dashboard.title': 'Mi Portafolio',
    'dashboard.overview': 'Resumen',
    'dashboard.availableBalance': 'Balance Disponible',
    'dashboard.totalInvested': 'Total Invertido',
    'dashboard.totalEarnings': 'Ganancias Totales',
    'dashboard.myInvestments': 'Mis Inversiones',
    'dashboard.transactions': 'Transacciones',
    'dashboard.dividends': 'Dividendos',
    'dashboard.portfolioPerformance': 'Rendimiento del Portafolio',
    'dashboard.recentActivity': 'Actividad Reciente',
    'dashboard.noInvestments': 'No tienes inversiones aún',
    'dashboard.noInvestmentsDesc': 'Explora el marketplace para encontrar activos que se ajusten a tus objetivos.',
    'dashboard.goToMarketplace': 'Ir al Marketplace',
    'dashboard.deposit': 'Depositar',
    'dashboard.withdraw': 'Retirar',
    'dashboard.investment': 'Inversión',
    'dashboard.date': 'Fecha',
    'dashboard.amount': 'Monto',
    'dashboard.status': 'Estado',
    'dashboard.status.completed': 'Completada',
    'dashboard.status.pending': 'Pendiente',
    'dashboard.status.cancelled': 'Cancelada',
    'dashboard.status.processing': 'Procesando',
    'dashboard.dividendPayment': 'Pago de Dividendo',
    'dashboard.period': 'Período',
    'dashboard.perFraction': 'Por Fracción',
    'dashboard.fractions': 'Fracciones',
    'dashboard.paymentDate': 'Fecha de Pago',
    'dashboard.noDividends': 'Sin dividendos aún',
    'dashboard.noDividendsDesc': 'Los dividendos se distribuyen trimestralmente según los activos en tu portafolio.',
    'dashboard.noTransactions': 'Sin transacciones',
    'dashboard.totalDividends': 'Total Dividendos',
    'dashboard.notifications': 'Notificaciones',
    'dashboard.markAllRead': 'Marcar todo como leído',
    'dashboard.noNotifications': 'No hay notificaciones',

    // ── ADMIN ───────────────────────────────────────────────────────────────
    'admin.panel': 'Panel General',
    'admin.dashboard': 'Dashboard',
    'admin.assets': 'Activos',
    'admin.users': 'Usuarios',
    'admin.investments': 'Inversiones',
    'admin.liquidity': 'Liquidez',
    'admin.content': 'Contenido',
    'admin.blog': 'Blog',
    'admin.faq': 'FAQ',
    'admin.testimonials': 'Testimonios',
    'admin.legal': 'Legal',
    'admin.promotions': 'Promociones',
    'admin.team': 'Equipo',
    'admin.emails': 'Emails',
    'admin.settings': 'Configuración',
    'admin.financial': 'Financiero',
    'admin.overview.title': 'Panel General',
    'admin.overview.totalAssets': 'Total Activos',
    'admin.overview.totalUsers': 'Total Usuarios',
    'admin.overview.totalInvested': 'Total Invertido',
    'admin.overview.activeInvestments': 'Inversiones Activas',
    'admin.overview.pendingKYC': 'KYC Pendientes',
    'admin.overview.monthlyRevenue': 'Ingresos Mensuales',
    'admin.overview.platformFees': 'Comisiones de Plataforma',
    'admin.assets.title': 'Gestión de Activos',
    'admin.assets.add': 'Agregar Activo',
    'admin.assets.edit': 'Editar Activo',
    'admin.assets.delete': 'Eliminar Activo',
    'admin.assets.active': 'Activos',
    'admin.assets.draft': 'Borradores',
    'admin.assets.archived': 'Archivados',
    'admin.users.title': 'Gestión de Usuarios',
    'admin.users.add': 'Agregar Usuario',
    'admin.users.verified': 'Verificados',
    'admin.users.pending': 'Pendientes',
    'admin.users.suspended': 'Suspendidos',
    'admin.users.totalBalance': 'Balance Total',
    'admin.investments.title': 'Gestión de Inversiones',
    'admin.investments.pending': 'Pendientes',
    'admin.investments.completed': 'Completadas',
    'admin.investments.cancelled': 'Canceladas',
    'admin.liquidity.title': 'Pool de Liquidez',
    'admin.liquidity.reserve': 'Reserva Total',
    'admin.liquidity.utilization': 'Tasa de Uso',
    'admin.liquidity.requests': 'Solicitudes Activas',
    'admin.liquidity.contribution': 'Contribución Mensual',
    'admin.liquidity.autoReplenish': 'Auto-reposición',
    'admin.blog.title': 'Gestión de Blog',
    'admin.blog.add': 'Nuevo Artículo',
    'admin.blog.edit': 'Editar Artículo',
    'admin.blog.published': 'Publicados',
    'admin.blog.drafts': 'Borradores',
    'admin.faq.title': 'Gestión de FAQ',
    'admin.faq.add': 'Agregar Pregunta',
    'admin.faq.edit': 'Editar Pregunta',
    'admin.testimonials.title': 'Gestión de Testimonios',
    'admin.testimonials.add': 'Agregar Testimonio',
    'admin.testimonials.edit': 'Editar Testimonio',
    'admin.legal.title': 'Documentos Legales',
    'admin.legal.add': 'Agregar Documento',
    'admin.promotions.title': 'Gestión de Promociones',
    'admin.promotions.add': 'Nueva Promoción',
    'admin.team.title': 'Gestión de Equipo',
    'admin.team.add': 'Agregar Miembro',
    'admin.emails.title': 'Plantillas de Email',
    'admin.emails.add': 'Nueva Plantilla',

    // ── FAQ ─────────────────────────────────────────────────────────────────
    'faq.title': 'Preguntas Frecuentes',
    'faq.subtitle': 'Encuentra respuestas a las dudas más comunes sobre nuestra plataforma.',
    'faq.searchPlaceholder': 'Buscar en preguntas frecuentes...',
    'faq.noResults': 'No se encontraron resultados',
    'faq.general': 'General',
    'faq.investments': 'Inversiones',
    'faq.liquidity': 'Liquidez',
    'faq.security': 'Seguridad',
    'faq.legal': 'Legal',
    'faq.account': 'Mi Cuenta',

    // ── SETTINGS ────────────────────────────────────────────────────────────
    'settings.title': 'Configuración',
    'settings.profile': 'Perfil',
    'settings.security': 'Seguridad',
    'settings.notifications': 'Notificaciones',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.theme.light': 'Claro',
    'settings.theme.dark': 'Oscuro',
    'settings.theme.system': 'Sistema',
    'settings.name': 'Nombre',
    'settings.email': 'Correo Electrónico',
    'settings.phone': 'Teléfono',
    'settings.changePassword': 'Cambiar Contraseña',
    'settings.currentPassword': 'Contraseña Actual',
    'settings.newPassword': 'Nueva Contraseña',
    'settings.confirmPassword': 'Confirmar Contraseña',
    'settings.twoFactor': 'Autenticación de Dos Factores',
    'settings.twoFactorEnable': 'Habilitar 2FA',
    'settings.emailNotifications': 'Notificaciones por Email',
    'settings.pushNotifications': 'Notificaciones Push',
    'settings.deleteAccount': 'Eliminar Cuenta',
    'settings.save': 'Guardar Cambios',

    // ── KYC ─────────────────────────────────────────────────────────────────
    'kyc.title': 'Verificación de Identidad',
    'kyc.subtitle': 'Completa tu verificación para desbloquear todas las funcionalidades de inversión.',
    'kyc.personalInfo': 'Información Personal',
    'kyc.idVerification': 'Verificación de Documento',
    'kyc.addressProof': 'Comprobante de Domicilio',
    'kyc.submit': 'Enviar Verificación',
    'kyc.pending': 'Verificación en Proceso',
    'kyc.pendingDesc':
      'Tu verificación está siendo revisada. Recibirás una notificación cuando esté lista.',
    'kyc.verified': 'Verificación Completada',
    'kyc.rejected': 'Verificación Rechazada',
    'kyc.resubmit': 'Reenviar Documentos',
    'kyc.firstName': 'Nombre',
    'kyc.lastName': 'Apellido',
    'kyc.birthDate': 'Fecha de Nacimiento',
    'kyc.nationality': 'Nacionalidad',
    'kyc.idType': 'Tipo de Documento',
    'kyc.idNumber': 'Número de Documento',
    'kyc.idFront': 'Frente del Documento',
    'kyc.idBack': 'Dorso del Documento',
    'kyc.selfie': 'Selfie con Documento',
    'kyc.address': 'Dirección',
    'kyc.city': 'Ciudad',
    'kyc.country': 'País',
    'kyc.zipCode': 'Código Postal',

    // ── LIQUIDITY ───────────────────────────────────────────────────────────
    'liquidity.title': 'Salida Express',
    'liquidity.subtitle':
      'Retira tu inversión cuando lo necesites a través de nuestro pool de liquidez.',
    'liquidity.requestWithdrawal': 'Solicitar Retiro',
    'liquidity.availablePool': 'Pool Disponible',
    'liquidity.processingTime': 'Tiempo de Procesamiento',
    'liquidity.processingTimeValue': '24-48 horas',
    'liquidity.fee': 'Comisión',
    'liquidity.feeValue': '0.5%',
    'liquidity.selectInvestment': 'Seleccionar Inversión',
    'liquidity.amount': 'Monto a Retirar',
    'liquidity.maxAmount': 'Monto máximo disponible',
    'liquidity.estimatedReceive': 'Estimado a Recibir',
    'liquidity.confirm': 'Confirmar Retiro',
    'liquidity.history': 'Historial de Retiros',
    'liquidity.noHistory': 'Sin retiros anteriores',

    // ── COMMON ──────────────────────────────────────────────────────────────
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.create': 'Crear',
    'common.search': 'Buscar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.confirm': 'Confirmar',
    'common.close': 'Cerrar',
    'common.viewMore': 'Ver más',
    'common.submit': 'Enviar',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.back': 'Volver',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.ok': 'Aceptar',
    'common.all': 'Todos',
    'common.none': 'Ninguno',
    'common.or': 'o',
    'common.and': 'y',
    'common.of': 'de',
    'common.per': 'por',
    'common.noData': 'No hay datos disponibles',
    'common.retry': 'Reintentar',
    'common.download': 'Descargar',
    'common.upload': 'Subir',
    'common.preview': 'Vista previa',
    'common.copy': 'Copiar',
    'common.copied': 'Copiado',
    'common.share': 'Compartir',
    'common.print': 'Imprimir',
    'common.export': 'Exportar',
    'common.import': 'Importar',
    'common.refresh': 'Actualizar',
    'common.required': 'Requerido',
    'common.optional': 'Opcional',
    'common.currency': 'USD',
    'common.percentage': '%',
    'common.confirmDelete': '¿Estás seguro de que deseas eliminar esto?',
    'common.confirmAction': '¿Estás seguro?',
    'common.actionIrreversible': 'Esta acción no se puede deshacer.',
    'common.unexpectedError': 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
    'common.noResults': 'No se encontraron resultados',
    'common.showing': 'Mostrando',
    'common.to': 'a',
    'common.of_total': 'de {total}',

    // ── FOOTER ──────────────────────────────────────────────────────────────
    'footer.rights': 'Derechos reservados',
    'footer.terms': 'Términos y Condiciones',
    'footer.privacy': 'Política de Privacidad',
    'footer.contact': 'Contacto',
    'footer.about': 'Nosotros',
    'footer.investors': 'Inversores',
    'footer.resources': 'Recursos',
    'footer.learn': 'Aprender',
    'footer.helpCenter': 'Centro de Ayuda',
    'footer.blog': 'Blog',
    'footer.community': 'Comunidad',
    'footer.socialMedia': 'Redes Sociales',
    'footer.newsletter': 'Newsletter',
    'footer.newsletterPlaceholder': 'Tu correo electrónico',
    'footer.newsletterButton': 'Suscribirse',
    'footer.newsletterDesc': 'Recibe las últimas novedades y oportunidades de inversión.',
    'footer.riskWarning':
      'La inversión en activos inmobiliarios conlleva riesgos. Rendimientos pasados no garantizan resultados futuros.',
    'footer.company': 'Empresa',
    'footer.legal': 'Legal',
    'footer.support': 'Soporte',

    // ── AUTH ────────────────────────────────────────────────────────────────
    'auth.login': 'Iniciar Sesión',
    'auth.register': 'Crear Cuenta',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.resetPassword': 'Restablecer Contraseña',
    'auth.noAccount': '¿No tienes cuenta?',
    'auth.hasAccount': '¿Ya tienes cuenta?',
    'auth.termsAgree': 'Acepto los Términos y Condiciones',
    'auth.privacyAgree': 'y la Política de Privacidad',
    'auth.loginWith': 'Iniciar sesión con',
    'auth.google': 'Google',
    'auth.orContinueWith': 'o continuar con',
    'auth.welcome': 'Bienvenido de vuelta',
    'auth.welcomeDesc': 'Ingresa a tu cuenta para continuar invirtiendo.',
    'auth.createAccount': 'Crea tu cuenta',
    'auth.createAccountDesc':
      'Regístrate para empezar a invertir en activos inmobiliarios fraccionados.',
    'auth.name': 'Nombre completo',
    'auth.phone': 'Teléfono',

    // ── HOW IT WORKS ─────────────────────────────────────────────────────────
    'home.howItWorks.label': 'Cómo Funciona',
    'home.howItWorks.title': 'Cómo Invertir en 4 Pasos',
    'home.howItWorks.subtitle': 'Proceso simple y seguro para comenzar a invertir en activos inmobiliarios fraccionados.',
    'home.howItWorks.step1.title': 'Elige tu Activo',
    'home.howItWorks.step1.description': 'Explora nuestro marketplace y selecciona activos inmobiliarios verificados que se ajusten a tus objetivos.',
    'home.howItWorks.step2.title': 'Define tu Inversión',
    'home.howItWorks.step2.description': 'Elige la cantidad de fracciones y el monto a invertir. Desde $50 USD por fracción.',
    'home.howItWorks.step3.title': 'Confirma y Paga',
    'home.howItWorks.step3.description': 'Procesa tu pago de forma segura con Stripe. Recibirás confirmación inmediata.',
    'home.howItWorks.step4.title': 'Recibe Dividendos',
    'home.howItWorks.step4.description': 'Gana dividendos trimestrales y sigue el rendimiento de tu inversión en tiempo real.',
  },

  en: {
    // ── NAV ─────────────────────────────────────────────────────────────────
    'nav.home': 'Home',
    'nav.marketplace': 'Marketplace',
    'nav.portfolio': 'My Portfolio',
    'nav.admin': 'Admin',
    'nav.adminPanel': 'Admin Panel',
    'nav.notifications': 'Notifications',
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Settings',
    'nav.login': 'Log In',
    'nav.register': 'Sign Up',
    'nav.logout': 'Log Out',
    'nav.profile': 'My Profile',
    'nav.kyc': 'KYC Verification',
    'nav.liquidity': 'Liquidity',
    'nav.langSwitch': 'ES',
    'nav.menu': 'Menu',
    'nav.secondaryMarket': 'Secondary Market',
    'nav.reports': 'Reports',

    // ── HOME PAGE ───────────────────────────────────────────────────────────
    'home.hero.title': 'Invest in real estate assets from $120,000',
    'home.hero.subtitle':
      'Access fractional investments in premium properties with verified returns and immediate liquidity.',
    'home.hero.cta': 'Explore Assets',
    'home.hero.ctaSecondary': 'View Marketplace',
    'home.liquidity.title': 'Immediate liquidity with Express Exit',
    'home.liquidity.subtitle':
      'Withdraw your investment when you need it. Our liquidity pool guarantees exit in under 48 hours.',
    'home.costs.title': 'Operating costs of 3% vs 15% market average',
    'home.costs.subtitle':
      'Keep more earnings. Our fees are up to 5 times lower than traditional real estate funds.',
    'home.featured.title': 'Featured Assets',
    'home.featured.viewAll': 'View all assets',
    'home.annualYield': 'Annual Yield',
    'home.fundsRaised': 'Funds Raised',
    'home.viewDetails': 'View Details',
    'home.cta.title': 'Start investing today',
    'home.cta.subtitle':
      'Join thousands of investors already earning returns with fractional real estate assets.',
    'home.cta.button': 'Create Account',
    'home.cta.login': 'I already have an account',
    'home.whyGsp': 'Why GALAXY',
    'home.whyGsp.subtitle':
      'The leading fractional real estate investment platform.',
    'home.whyGsp.verified': 'Verified assets',
    'home.whyGsp.verifiedDesc':
      'Every property is audited by third-party firms before being listed.',
    'home.whyGsp.returns': 'Real returns',
    'home.whyGsp.returnsDesc':
      'Proven track record of returns above market average.',
    'home.whyGsp.liquidity': 'Immediate liquidity',
    'home.whyGsp.liquidityDesc':
      'Our own liquidity pool allows you to withdraw your investment at any time.',
    'home.whyGsp.lowCosts': 'Low operating costs',
    'home.whyGsp.lowCostsDesc':
      'Only 3% in operating costs compared to the 15% industry average.',
    'home.whyGsp.security': 'Legal security',
    'home.whyGsp.securityDesc':
      'Complete regulatory framework with guaranteed investor protection.',
    'home.whyGsp.transparency': 'Full transparency',
    'home.whyGsp.transparencyDesc':
      'Quarterly financial reports and access to all asset documentation.',
    'home.testimonials.title': 'Testimonials',
    'home.testimonials.subtitle': 'What our investors say',
    'home.stats.investors': 'Active investors',
    'home.stats.invested': 'Total invested',
    'home.stats.assets': 'Listed assets',
    'home.stats.dividends': 'Distributed dividends',
    'home.trust.badge1': 'Regulated by',
    'home.trust.badge2': 'Quarterly audit',
    'home.trust.badge3': 'Encrypted data',
    'home.trust.badge4': 'Segregated funds',

    // ── MARKETPLACE ─────────────────────────────────────────────────────────
    'marketplace.title': 'Marketplace',
    'marketplace.subtitle': 'Discover investment assets with verified returns',
    'marketplace.all': 'All',
    'marketplace.realEstate': 'Real Estate',
    'marketplace.dataCenters': 'Data Centers',
    'marketplace.logistics': 'Logistics',
    'marketplace.solarEnergy': 'Solar Energy',
    'marketplace.mining': 'Mining',
    'marketplace.filter': 'Filter',
    'marketplace.sortBy': 'Sort by',
    'marketplace.sort.yield': 'Highest yield',
    'marketplace.sort.priceLow': 'Lowest price',
    'marketplace.sort.priceHigh': 'Highest price',
    'marketplace.sort.newest': 'Newest',
    'marketplace.sort.funded': 'Most funded',
    'marketplace.pricePerFraction': 'Price per Fraction',
    'marketplace.invest': 'Invest',
    'marketplace.viewDetails': 'View Details',
    'marketplace.noResults': 'No assets found',
    'marketplace.noResultsDesc': 'Try adjusting the filters to find more options.',
    'marketplace.resultsCount': '{count} assets found',
    'marketplace.availableFractions': 'Available fractions',
    'marketplace.funded': 'Funded',
    'marketplace.minInvestment': 'Minimum investment',
    'marketplace.annualYield': 'Annual yield',
    'marketplace.location': 'Location',
    'marketplace.type': 'Asset type',
    'marketplace.searchPlaceholder': 'Search assets...',
    'marketplace.filters.title': 'Filters',
    'marketplace.filters.reset': 'Clear filters',
    'marketplace.filters.apply': 'Apply filters',
    'marketplace.filters.priceRange': 'Price range',
    'marketplace.filters.yieldRange': 'Yield range',
    'marketplace.filters.status': 'Status',

    // ── ASSET DETAIL ────────────────────────────────────────────────────────
    'asset.overview': 'Overview',
    'asset.details': 'Details',
    'asset.financials': 'Financials',
    'asset.documents': 'Documents',
    'asset.gallery': 'Gallery',
    'asset.cashFlow': 'Cash Flow',
    'asset.investNow': 'Invest Now',
    'asset.addToPortfolio': 'Add to Portfolio',
    'asset.totalValue': 'Total Value',
    'asset.availableFractions': 'Available Fractions',
    'asset.minimumInvestment': 'Minimum Investment',
    'asset.fundedPercentage': 'Funded',
    'asset.annualYield': 'Annual Yield',
    'asset.projectedAppreciation': 'Projected Appreciation',
    'asset.totalReturn': 'Total Projected Return',
    'asset.leaseStatus': 'Lease Status',
    'asset.monthlyRent': 'Monthly Rent',
    'asset.tenant': 'Tenant',
    'asset.totalArea': 'Total Area',
    'asset.units': 'Units',
    'asset.yearBuilt': 'Year Built',
    'asset.landUse': 'Land Use',
    'asset.operationalCosts': 'Operational Costs',
    'asset.highlights': 'Highlights',
    'asset.description': 'Description',
    'asset.location': 'Location',
    'asset.similarAssets': 'Similar Assets',
    'asset.investmentSummary': 'Investment Summary',
    'asset.howItWorks': 'How It Works',
    'asset.risks': 'Risks',
    'asset.faq': 'Frequently Asked Questions',
    'asset.backToMarketplace': 'Back to Marketplace',
    'asset.expressExit': 'Express Exit',
    'asset.expressExitDesc': 'Available for withdrawal in 48 hours',
    'asset.investors': 'investors',

    // ── DASHBOARD ───────────────────────────────────────────────────────────
    'dashboard.title': 'My Portfolio',
    'dashboard.overview': 'Overview',
    'dashboard.availableBalance': 'Available Balance',
    'dashboard.totalInvested': 'Total Invested',
    'dashboard.totalEarnings': 'Total Earnings',
    'dashboard.myInvestments': 'My Investments',
    'dashboard.transactions': 'Transactions',
    'dashboard.dividends': 'Dividends',
    'dashboard.portfolioPerformance': 'Portfolio Performance',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.noInvestments': 'You have no investments yet',
    'dashboard.noInvestmentsDesc':
      'Explore the marketplace to find assets that match your goals.',
    'dashboard.goToMarketplace': 'Go to Marketplace',
    'dashboard.deposit': 'Deposit',
    'dashboard.withdraw': 'Withdraw',
    'dashboard.investment': 'Investment',
    'dashboard.date': 'Date',
    'dashboard.amount': 'Amount',
    'dashboard.status': 'Status',
    'dashboard.status.completed': 'Completed',
    'dashboard.status.pending': 'Pending',
    'dashboard.status.cancelled': 'Cancelled',
    'dashboard.status.processing': 'Processing',
    'dashboard.dividendPayment': 'Dividend Payment',
    'dashboard.period': 'Period',
    'dashboard.perFraction': 'Per Fraction',
    'dashboard.fractions': 'Fractions',
    'dashboard.paymentDate': 'Payment Date',
    'dashboard.noDividends': 'No dividends yet',
    'dashboard.noDividendsDesc':
      'Dividends are distributed quarterly based on the assets in your portfolio.',
    'dashboard.noTransactions': 'No transactions',
    'dashboard.totalDividends': 'Total Dividends',
    'dashboard.notifications': 'Notifications',
    'dashboard.markAllRead': 'Mark all as read',
    'dashboard.noNotifications': 'No notifications',

    // ── ADMIN ───────────────────────────────────────────────────────────────
    'admin.panel': 'Dashboard',
    'admin.dashboard': 'Dashboard',
    'admin.assets': 'Assets',
    'admin.users': 'Users',
    'admin.investments': 'Investments',
    'admin.liquidity': 'Liquidity',
    'admin.content': 'Content',
    'admin.blog': 'Blog',
    'admin.faq': 'FAQ',
    'admin.testimonials': 'Testimonials',
    'admin.legal': 'Legal',
    'admin.promotions': 'Promotions',
    'admin.team': 'Team',
    'admin.emails': 'Emails',
    'admin.settings': 'Settings',
    'admin.financial': 'Financial',
    'admin.overview.title': 'Dashboard',
    'admin.overview.totalAssets': 'Total Assets',
    'admin.overview.totalUsers': 'Total Users',
    'admin.overview.totalInvested': 'Total Invested',
    'admin.overview.activeInvestments': 'Active Investments',
    'admin.overview.pendingKYC': 'Pending KYC',
    'admin.overview.monthlyRevenue': 'Monthly Revenue',
    'admin.overview.platformFees': 'Platform Fees',
    'admin.assets.title': 'Asset Management',
    'admin.assets.add': 'Add Asset',
    'admin.assets.edit': 'Edit Asset',
    'admin.assets.delete': 'Delete Asset',
    'admin.assets.active': 'Active',
    'admin.assets.draft': 'Drafts',
    'admin.assets.archived': 'Archived',
    'admin.users.title': 'User Management',
    'admin.users.add': 'Add User',
    'admin.users.verified': 'Verified',
    'admin.users.pending': 'Pending',
    'admin.users.suspended': 'Suspended',
    'admin.users.totalBalance': 'Total Balance',
    'admin.investments.title': 'Investment Management',
    'admin.investments.pending': 'Pending',
    'admin.investments.completed': 'Completed',
    'admin.investments.cancelled': 'Cancelled',
    'admin.liquidity.title': 'Liquidity Pool',
    'admin.liquidity.reserve': 'Total Reserve',
    'admin.liquidity.utilization': 'Utilization Rate',
    'admin.liquidity.requests': 'Active Requests',
    'admin.liquidity.contribution': 'Monthly Contribution',
    'admin.liquidity.autoReplenish': 'Auto-replenish',
    'admin.blog.title': 'Blog Management',
    'admin.blog.add': 'New Article',
    'admin.blog.edit': 'Edit Article',
    'admin.blog.published': 'Published',
    'admin.blog.drafts': 'Drafts',
    'admin.faq.title': 'FAQ Management',
    'admin.faq.add': 'Add Question',
    'admin.faq.edit': 'Edit Question',
    'admin.testimonials.title': 'Testimonials Management',
    'admin.testimonials.add': 'Add Testimonial',
    'admin.testimonials.edit': 'Edit Testimonial',
    'admin.legal.title': 'Legal Documents',
    'admin.legal.add': 'Add Document',
    'admin.promotions.title': 'Promotions Management',
    'admin.promotions.add': 'New Promotion',
    'admin.team.title': 'Team Management',
    'admin.team.add': 'Add Member',
    'admin.emails.title': 'Email Templates',
    'admin.emails.add': 'New Template',

    // ── FAQ ─────────────────────────────────────────────────────────────────
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Find answers to the most common questions about our platform.',
    'faq.searchPlaceholder': 'Search in FAQs...',
    'faq.noResults': 'No results found',
    'faq.general': 'General',
    'faq.investments': 'Investments',
    'faq.liquidity': 'Liquidity',
    'faq.security': 'Security',
    'faq.legal': 'Legal',
    'faq.account': 'My Account',

    // ── SETTINGS ────────────────────────────────────────────────────────────
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.security': 'Security',
    'settings.notifications': 'Notifications',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.theme.system': 'System',
    'settings.name': 'Name',
    'settings.email': 'Email',
    'settings.phone': 'Phone',
    'settings.changePassword': 'Change Password',
    'settings.currentPassword': 'Current Password',
    'settings.newPassword': 'New Password',
    'settings.confirmPassword': 'Confirm Password',
    'settings.twoFactor': 'Two-Factor Authentication',
    'settings.twoFactorEnable': 'Enable 2FA',
    'settings.emailNotifications': 'Email Notifications',
    'settings.pushNotifications': 'Push Notifications',
    'settings.deleteAccount': 'Delete Account',
    'settings.save': 'Save Changes',

    // ── KYC ─────────────────────────────────────────────────────────────────
    'kyc.title': 'Identity Verification',
    'kyc.subtitle':
      'Complete your verification to unlock all investment features.',
    'kyc.personalInfo': 'Personal Information',
    'kyc.idVerification': 'Document Verification',
    'kyc.addressProof': 'Proof of Address',
    'kyc.submit': 'Submit Verification',
    'kyc.pending': 'Verification In Progress',
    'kyc.pendingDesc':
      'Your verification is being reviewed. You will receive a notification when it is ready.',
    'kyc.verified': 'Verification Complete',
    'kyc.rejected': 'Verification Rejected',
    'kyc.resubmit': 'Resubmit Documents',
    'kyc.firstName': 'First Name',
    'kyc.lastName': 'Last Name',
    'kyc.birthDate': 'Date of Birth',
    'kyc.nationality': 'Nationality',
    'kyc.idType': 'Document Type',
    'kyc.idNumber': 'Document Number',
    'kyc.idFront': 'Document Front',
    'kyc.idBack': 'Document Back',
    'kyc.selfie': 'Selfie with Document',
    'kyc.address': 'Address',
    'kyc.city': 'City',
    'kyc.country': 'Country',
    'kyc.zipCode': 'Zip Code',

    // ── LIQUIDITY ───────────────────────────────────────────────────────────
    'liquidity.title': 'Express Exit',
    'liquidity.subtitle':
      'Withdraw your investment when you need it through our liquidity pool.',
    'liquidity.requestWithdrawal': 'Request Withdrawal',
    'liquidity.availablePool': 'Available Pool',
    'liquidity.processingTime': 'Processing Time',
    'liquidity.processingTimeValue': '24-48 hours',
    'liquidity.fee': 'Fee',
    'liquidity.feeValue': '0.5%',
    'liquidity.selectInvestment': 'Select Investment',
    'liquidity.amount': 'Amount to Withdraw',
    'liquidity.maxAmount': 'Maximum available amount',
    'liquidity.estimatedReceive': 'Estimated to Receive',
    'liquidity.confirm': 'Confirm Withdrawal',
    'liquidity.history': 'Withdrawal History',
    'liquidity.noHistory': 'No previous withdrawals',

    // ── COMMON ──────────────────────────────────────────────────────────────
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.viewMore': 'View more',
    'common.submit': 'Submit',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.back': 'Back',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.all': 'All',
    'common.none': 'None',
    'common.or': 'or',
    'common.and': 'and',
    'common.of': 'of',
    'common.per': 'per',
    'common.noData': 'No data available',
    'common.retry': 'Retry',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.preview': 'Preview',
    'common.copy': 'Copy',
    'common.copied': 'Copied',
    'common.share': 'Share',
    'common.print': 'Print',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.refresh': 'Refresh',
    'common.required': 'Required',
    'common.optional': 'Optional',
    'common.currency': 'USD',
    'common.percentage': '%',
    'common.confirmDelete': 'Are you sure you want to delete this?',
    'common.confirmAction': 'Are you sure?',
    'common.actionIrreversible': 'This action cannot be undone.',
    'common.unexpectedError': 'An unexpected error occurred. Please try again.',
    'common.noResults': 'No results found',
    'common.showing': 'Showing',
    'common.to': 'to',
    'common.of_total': 'of {total}',

    // ── FOOTER ──────────────────────────────────────────────────────────────
    'footer.rights': 'All rights reserved',
    'footer.terms': 'Terms & Conditions',
    'footer.privacy': 'Privacy Policy',
    'footer.contact': 'Contact',
    'footer.about': 'About',
    'footer.investors': 'Investors',
    'footer.resources': 'Resources',
    'footer.learn': 'Learn',
    'footer.helpCenter': 'Help Center',
    'footer.blog': 'Blog',
    'footer.community': 'Community',
    'footer.socialMedia': 'Social Media',
    'footer.newsletter': 'Newsletter',
    'footer.newsletterPlaceholder': 'Your email address',
    'footer.newsletterButton': 'Subscribe',
    'footer.newsletterDesc':
      'Get the latest news and investment opportunities.',
    'footer.riskWarning':
      'Investing in real estate assets involves risks. Past returns do not guarantee future results.',
    'footer.company': 'Company',
    'footer.legal': 'Legal',
    'footer.support': 'Support',

    // ── AUTH ────────────────────────────────────────────────────────────────
    'auth.login': 'Log In',
    'auth.register': 'Create Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot your password?',
    'auth.resetPassword': 'Reset Password',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.termsAgree': 'I agree to the Terms & Conditions',
    'auth.privacyAgree': 'and Privacy Policy',
    'auth.loginWith': 'Log in with',
    'auth.google': 'Google',
    'auth.orContinueWith': 'or continue with',
    'auth.welcome': 'Welcome back',
    'auth.welcomeDesc': 'Sign in to your account to continue investing.',
    'auth.createAccount': 'Create your account',
    'auth.createAccountDesc':
      'Sign up to start investing in fractional real estate assets.',
    'auth.name': 'Full name',
    'auth.phone': 'Phone',

    // ── HOW IT WORKS ─────────────────────────────────────────────────────────
    'home.howItWorks.label': 'How It Works',
    'home.howItWorks.title': 'How to Invest in 4 Steps',
    'home.howItWorks.subtitle': 'Simple and secure process to start investing in fractional real estate assets.',
    'home.howItWorks.step1.title': 'Choose Your Asset',
    'home.howItWorks.step1.description': 'Explore our marketplace and select verified real estate assets that match your goals.',
    'home.howItWorks.step2.title': 'Define Your Investment',
    'home.howItWorks.step2.description': 'Choose the number of fractions and the amount to invest. From $50 USD per fraction.',
    'home.howItWorks.step3.title': 'Confirm and Pay',
    'home.howItWorks.step3.description': 'Process your payment securely with Stripe. Receive instant confirmation.',
    'home.howItWorks.step4.title': 'Receive Dividends',
    'home.howItWorks.step4.description': 'Earn quarterly dividends and track your investment performance in real time.',
  },
}

// ─── Translation Resolver ──────────────────────────────────────────────────────

/**
 * Resolves a dot-notation key against a translation map.
 * e.g. t('nav.home') → translations[locale]['nav.home']
 *
 * Returns the key itself if no translation is found (for debugging).
 */
function resolve(
  key: string,
  map: TranslationMap,
): string {
  return map[key] ?? key
}

// ─── Context ───────────────────────────────────────────────────────────────────

const I18nContext = createContext<I18nContextValue | null>(null)

// ─── DB Translation Fetcher ──────────────────────────────────────────────────

/**
 * Fetch translations from the database for a given locale.
 * Returns a flat { key: value } object, or an empty object on failure.
 */
async function fetchDbTranslations(locale: string): Promise<Record<string, string>> {
  try {
    const res = await fetch(`/api/translations?locale=${locale}`)
    if (!res.ok) return {}
    return await res.json()
  } catch {
    return {}
  }
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function I18nProvider({
  children,
  defaultLocale = 'es',
}: {
  children: ReactNode
  defaultLocale?: Locale
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)
  const [dbOverrides, setDbOverrides] = useState<TranslationMap>({})
  const [loading, setLoading] = useState(true)
  const fetchedLocales = useRef<Set<string>>(new Set())

  // Merge DB translations with hardcoded fallbacks (DB takes priority)
  const mergedMap = useMemo<TranslationMap>(() => {
    const base = { ...translations[locale] }
    for (const [key, value] of Object.entries(dbOverrides)) {
      base[key] = value
    }
    return base
  }, [locale, dbOverrides])

  // Fetch DB translations when locale changes
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      const dbMap = await fetchDbTranslations(locale)
      if (!cancelled) {
        setDbOverrides(dbMap)
        fetchedLocales.current.add(locale)
        setLoading(false)
      }
    }

    load()

    return () => { cancelled = true }
  }, [locale])

  const t = useCallback(
    (key: string): string => {
      return resolve(key, mergedMap)
    },
    [mergedMap],
  )

  const handleSetLocale = useCallback((next: Locale) => {
    setLocale(next)
  }, [])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: handleSetLocale,
      t,
      loading,
    }),
    [locale, handleSetLocale, t, loading],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error(
      'useTranslation must be used within an <I18nProvider>. ' +
        'Wrap your app with <I18nProvider> in the root layout.',
    )
  }
  return ctx
}

// ─── Helpers (optional utilities) ──────────────────────────────────────────────

/** Get the alternate locale (es ↔ en) */
export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'es' ? 'en' : 'es'
}

/** Locale display labels */
export const localeLabels: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
}

/** Available locales for iteration */
export const availableLocales: Locale[] = ['es', 'en']
