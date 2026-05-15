import { db } from '@/lib/db'

const DEFAULT_PAGES = [
  {
    title: 'Sobre Nosotros',
    slug: 'sobre-nosotros',
    category: 'company',
    icon: 'Building2',
    sortOrder: 1,
    isPublished: true,
    excerpt: 'Conoce la misión, visión y equipo detrás de 3GSP.',
    seoTitle: 'Sobre Nosotros - 3GSP Inversión Inmobiliaria Fraccionada',
    seoDescription: 'Conoce quiénes somos, nuestra misión y el equipo que hace posible la inversión inmobiliaria fraccionada en Latinoamérica.',
    content: `
<h2>Nuestra Misión</h2>
<p>En <strong>3GSP by GALAXY LLC</strong>, creemos que la inversión inmobiliaria de calidad no debería ser exclusiva para los más ricos. Nuestra misión es <strong>democratizar el acceso a activos inmobiliarios premium</strong> a través de la tecnología blockchain y la fracción digital de propiedades.</p>

<h2>¿Quiénes Somos?</h2>
<p>Somos una plataforma fintech-regulated fundada en 2023 con presencia en Chile y Estados Unidos. Combinamos la experiencia en el mercado inmobiliario con tecnología de vanguardia para crear una experiencia de inversión transparente, segura y accesible.</p>

<h2>Nuestros Valores</h2>
<ul>
<li><strong>Transparencia total:</strong> Cada propiedad es auditada, cada transacción es verificable, y cada dividendo es rastreable.</li>
<li><strong>Accesibilidad:</strong> Invertir desde $50 USD. Sin barreras de entrada, sin complejidades.</li>
<li><strong>Seguridad:</strong> Regulados por la CMF (Chile) y compliant con estándares SEC y AML internacionales.</li>
<li><strong>Innovación:</strong> Inteligencia artificial para análisis de riesgo, evaluación de propiedades y personalización de portafolios.</li>
<li><strong>Sostenibilidad:</strong> Priorizamos propiedades con certificaciones ambientales y eficiencia energética.</li>
</ul>

<h2>Nuestro Equipo</h2>
<p>Nuestro equipo multidisciplinario combina más de 50 años de experiencia en finanzas, tecnología e inmobiliaria:</p>
<ul>
<li><strong>CEO & Fundador:</strong> Experto en fintech con trayectoria en banca de inversión.</li>
<li><strong>CTO:</strong> Arquitecto de software con experiencia en plataformas financieras a gran escala.</li>
<li><strong>Director de Inversiones:</strong> 20+ años en el mercado inmobiliario comercial de Chile y EE.UU.</li>
<li><strong>Chief Compliance Officer:</strong> Especialista en regulaciones financieras CMF/SEC.</li>
</ul>

<h2>Tecnología</h2>
<p>Nuestra infraestructura tecnológica incluye:</p>
<ul>
<li>Smart contracts para la gestión de fracciones de propiedad</li>
<li>Análisis de riesgo impulsado por inteligencia artificial (GLM-4)</li>
<li>Integración con Stripe para pagos seguros</li>
<li>Verificación KYC automatizada con IA</li>
<li>Dashboard en tiempo real para seguimiento de inversiones</li>
</ul>

<h2>Presencia Global</h2>
<p>Con oficinas en <strong>Santiago de Chile</strong> y <strong>Miami, USA</strong>, cubrimos los mercados inmobiliarios más dinámicos de Latinoamérica y Norteamérica.</p>

<h2>Números que Hablan</h2>
<ul>
<li>+2,500 inversores activos en la plataforma</li>
<li>$12M+ en activos bajo gestión</li>
<li>8.5% rendimiento promedio anual</li>
<li>6 propiedades activas en cartera</li>
<li>$500K+ en dividendos distribuidos</li>
</ul>
    `.trim(),
  },
  {
    title: 'Cómo Funciona',
    slug: 'como-funciona',
    category: 'company',
    icon: 'Settings',
    sortOrder: 2,
    isPublished: true,
    excerpt: 'Guía paso a paso para comenzar a invertir en propiedades fraccionadas.',
    seoTitle: 'Cómo Funciona - Invertir en 3GSP',
    seoDescription: 'Aprende cómo invertir en bienes raíces fraccionados con 3GSP en simples pasos. Desde el registro hasta recibir tus primeros dividendos.',
    content: `
<h2>Invertir en 4 Pasos Simples</h2>
<p>La inversión inmobiliaria fraccionada nunca fue tan fácil. Con 3GSP puedes diversificar tu portafolio en minutos:</p>

<h3>Paso 1: Crea tu Cuenta</h3>
<p>Regístrate gratis en menos de 2 minutos con tu email y contraseña. Verifica tu identidad con nuestro proceso KYC (Know Your Customer) automatizado que utiliza inteligencia artificial para una verificación rápida y segura.</p>
<p><strong>Requisitos:</strong></p>
<ul>
<li>Mayor de 18 años</li>
<li>Documento de identidad vigente (RUT para Chile, pasaporte para internacionales)</li>
<li>Cuenta bancaria para recibir dividendos</li>
</ul>

<h3>Paso 2: Explora las Oportunidades</h3>
<p>Navega nuestro marketplace de propiedades curadas. Cada activo incluye:</p>
<ul>
<li>Información detallada del inmueble (ubicación, superficie, características)</li>
<li>Análisis de rentabilidad proyectada (yield anual, apreciación)</li>
<li>Proyecciones de flujo de caja a 5 años</li>
<li>Documentación legal completa</li>
<li>Análisis de riesgo con inteligencia artificial</li>
</ul>

<h3>Paso 3: Invierte desde $50 USD</h3>
<p>Selecciona la propiedad que más te interese y elige cuántas fracciones deseas adquirir. Paga de forma segura a través de Stripe con tarjeta de crédito/débito o transferencia bancaria. Cada fracción representa una porción real de la propiedad.</p>
<p><strong>Pago seguro:</strong> Todas las transacciones están cifradas y protegidas por los estándares PCI DSS de Stripe.</p>

<h3>Paso 4: Recibe Dividendos</h3>
<p>Los dividendos se distribuyen mensual o trimestralmente según el contrato de arrendamiento de cada propiedad. Tus ganancias se acreditan automáticamente en tu balance de la plataforma, donde puedes:</p>
<ul>
<li>Reinvertirlos en nuevas oportunidades</li>
<li>Retirarlos a tu cuenta bancaria</li>
<li>Acumularlos para una inversión mayor</li>
</ul>

<h2>Tipos de Propiedades</h2>
<p>En 3GSP ofrecemos diversificación a través de diferentes tipos de activos inmobiliarios:</p>
<ul>
<li><strong>Inmuebles Comerciales:</strong> Centros logísticos, oficinas y retail</li>
<li><strong>Micro Data Centers:</strong> Infraestructura tecnológica en crecimiento</li>
<li><strong>Energía Solar:</strong> Parques solares con contratos de largo plazo</li>
<li><strong>Real Estate Residencial:</strong> Propiedades residenciales premium</li>
<li><strong>Activos Industriales:</strong> Bodegas y naves industriales</li>
</ul>

<h2>Mercado Secundario</h2>
<p>¿Necesitas liquidez? Vende tus fracciones en nuestro <strong>Mercado Secundario</strong>. Puedes publicar tus fracciones al precio que desees y otros inversores pueden adquirirlas. La plataforma gestiona toda la transferencia de forma segura.</p>

<h2>Motor de Liquidez</h2>
<p>Para mayor tranquilidad, contamos con un <strong>fondo de liquidez</strong> que permite solicitar el rescate de tus fracciones con procesamiento en 3-5 días hábiles (sujeto a disponibilidad del fondo).</p>

<h2>Seguridad y Regulación</h2>
<p>Tu inversión está protegida por:</p>
<ul>
<li>Regulación CMF (Comisión para el Mercado Financiero - Chile)</li>
<li>Compliance SEC (Securities and Exchange Commission)</li>
<li>Protocolos AML/CFT (Anti-Lavado de Dinero)</li>
<li>Auditorías trimestrales independientes</li>
<li>Seguro de títulos de propiedad</li>
</ul>

<h2>¿Tienes Preguntas?</h2>
<p>Visita nuestro <a href="/paginas/centro-de-ayuda">Centro de Ayuda</a> o contacta a nuestro equipo de soporte en <strong>contacto@3gsp.com</strong>. Estamos disponibles de lunes a viernes de 9:00 a 18:00 (hora Santiago).</p>
    `.trim(),
  },
  {
    title: 'Centro de Ayuda',
    slug: 'centro-de-ayuda',
    category: 'support',
    icon: 'HelpCircle',
    sortOrder: 3,
    isPublished: true,
    excerpt: 'Preguntas frecuentes, guías y contacto con soporte.',
    seoTitle: 'Centro de Ayuda - 3GSP Soporte',
    seoDescription: 'Encuentra respuestas a las preguntas más frecuentes sobre inversión inmobiliaria fraccionada en 3GSP.',
    content: `
<h2>Preguntas Frecuentes</h2>

<h3>¿Qué es la inversión inmobiliaria fraccionada?</h3>
<p>Es un modelo de inversión que permite a múltiples personas co-invertir en una propiedad, dividiendo el valor total en fracciones más pequeñas (tokens). Cada fracción otorga derechos proporcionales sobre los rendimientos generados por la propiedad (arriendo, plusvalía).</p>

<h3>¿Cuál es la inversión mínima?</h3>
<p>La inversión mínima en 3GSP es de <strong>$50 USD</strong>. Puedes adquirir fracciones adicionales en cualquier momento según la disponibilidad.</p>

<h3>¿Cómo se generan los rendimientos?</h3>
<p>Los rendimientos provienen de dos fuentes principales:</p>
<ul>
<li><strong>Dividendos por arriendo:</strong> Los ingresos mensuales del contrato de arrendamiento se distribuyen proporcionalmente entre los dueños de fracciones.</li>
<li><strong>Plusvalía:</strong> Cuando la propiedad se vende a un precio superior al de adquisición, las ganancias se distribuyen entre los inversionistas.</li>
</ul>

<h3>¿Es seguro invertir en 3GSP?</h3>
<p>Sí. Estamos regulados por la CMF de Chile y cumplimos con los estándares internacionales SEC y AML. Todas las propiedades son auditadas por firmas independientes, los pagos se procesan a través de Stripe (certificación PCI DSS), y contamos con seguros de título.</p>

<h3>¿Puedo vender mis fracciones?</h3>
<p>Sí, a través de dos mecanismos:</p>
<ol>
<li><strong>Mercado Secundario:</strong> Publica tus fracciones al precio que desees para que otros inversores las compren.</li>
<li><strong>Motor de Liquidez:</strong> Solicita el rescate de tus fracciones a valor de mercado, con procesamiento en 3-5 días hábiles.</li>
</ol>

<h3>¿Cuánto tiempo toma el proceso KYC?</h3>
<p>El proceso de verificación de identidad (KYC) suele completarse en <strong>menos de 24 horas</strong> gracias a nuestra tecnología de verificación automatizada con inteligencia artificial. En algunos casos puede tomar hasta 48 horas si se requiere revisión manual.</p>

<h3>¿Qué documentos necesito?</h3>
<p>Para inversores chilenos: RUT vigente. Para inversores internacionales: Pasaporte vigente y comprobante de domicilio. La plataforma te guiará paso a paso durante el proceso de verificación.</p>

<h3>¿Cómo se distribuyen los dividendos?</h3>
<p>Los dividendos se calculan y distribuyen según la frecuencia definida para cada propiedad (mensual o trimestral). Se acreditan automáticamente en tu balance de 3GSP, desde donde puedes reinvertirlos o retirarlos a tu cuenta bancaria.</p>

<h3>¿Cuáles son las comisiones?</h3>
<ul>
<li><strong>Comisión de plataforma:</strong> 1.5% sobre dividendos</li>
<li><strong>Comisión de venta en mercado secundario:</strong> 2% del monto de la transacción</li>
<li><strong>Sin comisiones de entrada ni custody</strong></li>
</ul>

<h3>¿Puedo tener acceso a la documentación de las propiedades?</h3>
<p>Sí, toda la documentación está disponible en la ficha de cada propiedad: escrituras, informes de tasación, contratos de arrendamiento, certificados de inspección, proyecciones financieras y más.</p>

<h2>Contacto</h2>
<p>Si no encuentras la respuesta a tu pregunta, puedes contactarnos por:</p>
<ul>
<li><strong>Email:</strong> contacto@3gsp.com</li>
<li><strong>Horario:</strong> Lunes a viernes, 9:00 - 18:00 (Hora Santiago, Chile)</li>
<li><strong>Chat:</strong> Utiliza nuestro chat en la plataforma para asistencia en tiempo real</li>
</ul>
    `.trim(),
  },
  {
    title: 'Términos y Condiciones',
    slug: 'terminos-y-condiciones',
    category: 'legal',
    icon: 'Scale',
    sortOrder: 4,
    isPublished: true,
    excerpt: 'Términos de uso de la plataforma 3GSP.',
    seoTitle: 'Términos y Condiciones - 3GSP',
    seoDescription: 'Lee los términos y condiciones de uso de la plataforma de inversión inmobiliaria fraccionada 3GSP.',
    content: `
<h2>1. Aceptación de los Términos</h2>
<p>Al acceder y utilizar la plataforma 3GSP (en adelante, "la Plataforma"), operada por <strong>GALAXY LLC</strong> (en adelante, "la Empresa"), usted acepta quedar vinculado por los presentes Términos y Condiciones (en adelante, "Términos"). Si no está de acuerdo con alguno de estos Términos, le rogamos que no utilice la Plataforma.</p>

<h2>2. Definiciones</h2>
<ul>
<li><strong>"Fracción":</strong> Unidad digital que representa un porcentaje de propiedad sobre un activo inmobiliario listado en la Plataforma.</li>
<li><strong>"Inversor":</strong> Persona natural o jurídica registrada en la Plataforma que ha completado el proceso KYC y ha adquirido al menos una Fracción.</li>
<li><strong>"Activo":</strong> Propiedad inmobiliaria listada en la Plataforma para inversión fraccionada.</li>
<li><strong>"Dividendo":</strong> Distribución proporcional de los ingresos generados por un Activo entre los poseedores de Fracciones.</li>
</ul>

<h2>3. Elegibilidad</h2>
<p>Para utilizar la Plataforma, usted debe:</p>
<ul>
<li>Ser mayor de 18 años de edad</li>
<li>Tener capacidad legal para contratar</li>
<li>Completar satisfactoriamente el proceso de verificación de identidad (KYC)</li>
<li>No estar sujeto a sanciones ni listas restrictivas (OFAC, ONU, etc.)</li>
</ul>

<h2>4. Registro y Seguridad de la Cuenta</h2>
<p>Usted es responsable de mantener la confidencialidad de sus credenciales de acceso. La Empresa no se hace responsable por el uso no autorizado de su cuenta. Debe notificar de inmediato cualquier acceso no autorizado a <strong>seguridad@3gsp.com</strong>.</p>

<h2>5. Proceso de Inversión</h2>
<p>Las inversiones se realizan a través de la Plataforma siguiendo estos pasos:</p>
<ol>
<li>Selección del Activo de interés</li>
<li>Definición de la cantidad de Fracciones a adquirir</li>
<li>Procesamiento del pago a través de Stripe</li>
<li>Acreditación de Fracciones en la cuenta del Inversor</li>
</ol>
<p>Las transacciones son finales una vez confirmadas. No se aceptan cancelaciones salvo error técnico debidamente comprobado.</p>

<h2>6. Dividendos y Distribuciones</h2>
<p>Los dividendos se distribuyen según la frecuencia y condiciones especificadas en la ficha de cada Activo. La Empresa retiene una comisión del 1.5% sobre los dividendos brutos como tarifa de plataforma. Los dividendos se acreditan en el balance del Inversor en un plazo de hasta 5 días hábiles posteriores al cierre del período correspondiente.</p>

<h2>7. Mercado Secundario</h2>
<p>La Plataforma ofrece un mercado secundario donde los Inversores pueden ofrecer sus Fracciones en venta. La Empresa actúa como intermediaria y aplica una comisión del 2% sobre el monto de la transacción. La Empresa no garantiza la liquidez ni el precio de venta en el mercado secundario.</p>

<h2>8. Riesgos</h2>
<p>La inversión en bienes raíces fraccionados conlleva riesgos, incluyendo pero no limitado a:</p>
<ul>
<li>Riesgo de pérdida parcial o total del capital invertido</li>
<li>Riesgo de iliquidez</li>
<li>Riesgo de vacancia del inmueble</li>
<li>Riesgo de depreciación del activo</li>
<li>Riesgo regulatorio</li>
<li>Riesgo tecnológico y de ciberseguridad</li>
</ul>
<p><strong>El rendimiento pasado no garantiza resultados futuros.</strong></p>

<h2>9. Protección de Datos</h2>
<p>El tratamiento de datos personales se rige por nuestra <a href="/paginas/politica-privacidad">Política de Privacidad</a>. Cumplimos con la Ley N° 19.628 de Protección de Datos Personales de Chile y con el GDPR para usuarios europeos.</p>

<h2>10. Propiedad Intelectual</h2>
<p>Todo el contenido de la Plataforma (textos, imágenes, logotipos, diseño, software) es propiedad de GALAXY LLC o de sus licenciantes y está protegido por las leyes de propiedad intelectual aplicables.</p>

<h2>11. Modificaciones</h2>
<p>La Empresa se reserva el derecho de modificar estos Términos en cualquier momento. Las modificaciones entrarán en vigencia a partir de su publicación en la Plataforma. El uso continuado de la Plataforma después de la publicación constituye aceptación de los Términos modificados.</p>

<h2>12. Ley Aplicable y Jurisdicción</h2>
<p>Estos Términos se rigen por las leyes de la República de Chile. Cualquier disputa se someterá a los tribunales de Santiago de Chile.</p>

<p><strong>Última actualización:</strong> Enero 2025</p>
    `.trim(),
  },
  {
    title: 'Política de Privacidad',
    slug: 'politica-privacidad',
    category: 'legal',
    icon: 'ShieldCheck',
    sortOrder: 5,
    isPublished: true,
    excerpt: 'Cómo manejamos y protegemos tus datos personales.',
    seoTitle: 'Política de Privacidad - 3GSP',
    seoDescription: 'Conoce cómo 3GSP protege tus datos personales y tu privacidad conforme a la legislación chilena e internacional.',
    content: `
<h2>1. Responsable del Tratamiento</h2>
<p><strong>GALAXY LLC</strong>, con domicilio en Santiago de Chile y Miami, USA, es responsable del tratamiento de sus datos personales conforme a la Ley N° 19.628 de Protección de Datos Personales de Chile.</p>

<h2>2. Datos que Recopilamos</h2>
<h3>2.1 Datos de Registro</h3>
<ul>
<li>Nombre completo</li>
<li>Dirección de email</li>
<li>Teléfono (opcional)</li>
<li>Contraseña (almacenada de forma encriptada)</li>
</ul>

<h3>2.2 Datos de Verificación (KYC)</h3>
<ul>
<li>Número de identificación (RUT/Pasaporte)</li>
<li>Documento de identidad (frontal y posterior)</li>
<li>Selfie para verificación biométrica</li>
<li>Comprobante de domicilio (para inversores internacionales)</li>
</ul>

<h3>2.3 Datos Financieros</h3>
<ul>
<li>Historial de transacciones</li>
<li>Información de cuenta bancaria para pagos</li>
<li>Balance e inversiones activas</li>
</ul>

<h3>2.4 Datos de Navegación</h3>
<ul>
<li>Dirección IP</li>
<li>Tipo de navegador y dispositivo</li>
<li>Páginas visitadas y tiempo de permanencia</li>
<li>Cookies (ver <a href="/paginas/politica-cookies">Política de Cookies</a>)</li>
</ul>

<h2>3. Finalidad del Tratamiento</h2>
<p>Sus datos son utilizados para:</p>
<ul>
<li>Gestionar su cuenta y perfil de inversor</li>
<li>Cumplir con obligaciones regulatorias (KYC/AML)</li>
<li>Procesar transacciones y distribuir dividendos</li>
<li>Enviar notificaciones sobre su inversión</li>
<li>Mejorar la plataforma y la experiencia del usuario</li>
<li>Comunicaciones comerciales (solo con su consentimiento)</li>
<li>Cumplir con obligaciones legales y regulatorias</li>
</ul>

<h2>4. Base Legal</h2>
<p>El tratamiento de sus datos se basa en:</p>
<ul>
<li><strong>Consentimiento:</strong> Para comunicaciones comerciales y cookies no esenciales</li>
<li><strong>Ejecución contractual:</strong> Para la prestación del servicio de inversión</li>
<li><strong>Obligación legal:</strong> Para cumplimiento regulatorio (KYC, AML, tributario)</li>
<li><strong>Interés legítimo:</strong> Para seguridad de la plataforma y prevención de fraude</li>
</ul>

<h2>5. Compartir Datos con Terceros</h2>
<p>Sus datos pueden ser compartidos con:</p>
<ul>
<li><strong>Proveedores de pago (Stripe):</strong> Para procesamiento de transacciones</li>
<li><strong>Proveedores de verificación KYC:</strong> Para verificación de identidad</li>
<li><strong>Auditores externos:</strong> Para cumplimiento regulatorio</li>
<li><strong>Autoridades regulatorias:</strong> Cuando sea requerido por ley</li>
</ul>
<p>No vendemos ni alquilamos sus datos personales a terceros con fines comerciales.</p>

<h2>6. Transferencias Internacionales</h2>
<p>En caso de transferencias internacionales de datos, nos aseguramos de que el destinatario ofrezca un nivel adecuado de protección conforme al artículo 12 de la Ley N° 19.628 y al GDPR.</p>

<h2>7. Seguridad de los Datos</h2>
<p>Implementamos medidas de seguridad técnicas y organizativas:</p>
<ul>
<li>Encriptación AES-256 para datos en reposo</li>
<li>TLS 1.3 para datos en tránsito</li>
<li>Autenticación de dos factores (2FA) disponible</li>
<li>Auditorías de seguridad periódicas</li>
<li>Control de acceso basado en roles (RBAC)</li>
<li>Monitoreo continuo de amenazas</li>
</ul>

<h2>8. Sus Derechos</h2>
<p>Usted tiene derecho a:</p>
<ul>
<li>Acceder a sus datos personales que tenemos registrados</li>
<li>Solicitar la rectificación de datos inexactos</li>
<li>Solicitar la eliminación de sus datos (sujeto a obligaciones legales)</li>
<li>Oponerse al tratamiento de sus datos</li>
<li>Solicitar la portabilidad de sus datos</li>
<li>Retirar su consentimiento en cualquier momento</li>
</ul>
<p>Para ejercer estos derechos, contacte a <strong>privacidad@3gsp.com</strong>.</p>

<h2>9. Retención de Datos</h2>
<p>Los datos se conservarán durante la vigencia de la relación contractual y durante los plazos exigidos por la legislación aplicable (hasta 10 años para datos financieros).</p>

<h2>10. Menores de Edad</h2>
<p>La Plataforma no está dirigida a menores de 18 años. No recopilamos datos de menores de forma consciente.</p>

<h2>11. Cambios a esta Política</h2>
<p>Nos reservamos el derecho de actualizar esta Política. Las modificaciones significativas serán comunicadas por email con al menos 30 días de anticipación.</p>

<p><strong>Última actualización:</strong> Enero 2025</p>
<p><strong>Contacto:</strong> privacidad@3gsp.com</p>
    `.trim(),
  },
  {
    title: 'Política de Cookies',
    slug: 'politica-cookies',
    category: 'legal',
    icon: 'Cookie',
    sortOrder: 6,
    isPublished: true,
    excerpt: 'Información sobre las cookies que utilizamos en la plataforma.',
    seoTitle: 'Política de Cookies - 3GSP',
    seoDescription: 'Conoce las cookies que utiliza 3GSP y cómo puedes gestionarlas.',
    content: `
<h2>¿Qué son las Cookies?</h2>
<p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (computador, tablet o móvil) cuando visita un sitio web. Permiten que el sitio recuerde sus acciones y preferencias durante un período de tiempo.</p>

<h2>Tipos de Cookies que Utilizamos</h2>

<h3>1. Cookies Esenciales (Necesarias)</h3>
<p>Son indispensables para el funcionamiento de la Plataforma. No pueden ser desactivadas.</p>
<ul>
<li><strong>session_id:</strong> Mantiene su sesión activa. Duración: Sesión.</li>
<li><strong>auth_token:</strong> Gestiona la autenticación segura. Duración: 7 días.</li>
<li><strong>csrf_token:</strong> Previene ataques de falsificación de solicitudes. Duración: Sesión.</li>
<li><strong>cookie_consent:</strong> Almacena su preferencia de cookies. Duración: 1 año.</li>
</ul>

<h3>2. Cookies de Rendimiento (Analíticas)</h3>
<p>Nos ayudan a entender cómo los usuarios interactúan con la Plataforma.</p>
<ul>
<li><strong>_analytics:</strong> Registra páginas visitadas y tiempo de permanencia. Duración: 2 años.</li>
<li><strong>performance_id:</strong> Mide tiempos de carga y errores. Duración: Sesión.</li>
</ul>

<h3>3. Cookies de Funcionalidad</h3>
<p>Permiten recordar preferencias del usuario.</p>
<ul>
<li><strong>language:</strong> Guarda su idioma preferido (ES/EN). Duración: 1 año.</li>
<li><strong>theme:</strong> Almacena su preferencia de tema (claro/oscuro). Duración: 1 año.</li>
<li><strong>currency:</strong> Guarda su moneda de preferencia. Duración: 1 año.</li>
</ul>

<h3>4. Cookies de Marketing</h3>
<p>Utilizadas para mostrar publicidad relevante. Solo se activan con su consentimiento.</p>
<ul>
<li><strong>_fbp, _fbc:</strong> Cookies de Meta (Facebook) para remarketing. Duración: 90 días.</li>
<li><strong>_ga, _gid:</strong> Google Analytics para análisis de tráfico. Duración: 2 años.</li>
<li><strong>_gcl_au:</strong> Google Ads para seguimiento de conversiones. Duración: 90 días.</li>
</ul>

<h2>¿Cómo Gestionar las Cookies?</h2>

<h3>A través de la Plataforma</h3>
<p>Puede modificar sus preferencias de cookies en cualquier momento a través del banner de cookies que aparece en su primera visita, o desde la configuración de su cuenta.</p>

<h3>A través del Navegador</h3>
<p>También puede gestionar cookies desde la configuración de su navegador:</p>
<ul>
<li><strong>Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies</li>
<li><strong>Firefox:</strong> Opciones &gt; Privacidad & seguridad &gt; Cookies</li>
<li><strong>Safari:</strong> Preferencias &gt; Privacidad &gt; Cookies</li>
<li><strong>Edge:</strong> Configuración &gt; Cookies y permisos del sitio</li>
</ul>

<h2>Impacto de Desactivar Cookies</h2>
<p>La desactivación de cookies esenciales impedirá el uso de la Plataforma. La desactivación de cookies analíticas o de marketing no afectará el funcionamiento pero limitará ciertas funcionalidades y personalización.</p>

<h2>Cookies de Terceros</h2>
<p>La Plataforma puede contener enlaces a sitios de terceros que utilizan sus propias cookies. No somos responsables de las prácticas de cookies de sitios externos.</p>

<h2>Actualizaciones</h2>
<p>Podemos actualizar esta Política periódicamente. Le recomendamos revisarla regularmente. Los cambios significativos serán comunicados a través de la Plataforma.</p>

<p><strong>Última actualización:</strong> Enero 2025</p>
<p><strong>Contacto:</strong> privacidad@3gsp.com</p>
    `.trim(),
  },
]

export async function seedCmsPages() {
  const results: { title: string; status: string; slug: string }[] = []

  for (const page of DEFAULT_PAGES) {
    try {
      const existing = await db.cmsPage.findUnique({ where: { slug: page.slug } })
      if (existing) {
        await db.cmsPage.update({
          where: { slug: page.slug },
          data: {
            title: page.title,
            content: page.content,
            excerpt: page.excerpt,
            category: page.category,
            icon: page.icon,
            sortOrder: page.sortOrder,
            isPublished: page.isPublished,
            seoTitle: page.seoTitle,
            seoDescription: page.seoDescription,
            lastEditedAt: new Date(),
          },
        })
        results.push({ title: page.title, status: 'updated', slug: page.slug })
      } else {
        await db.cmsPage.create({ data: page })
        results.push({ title: page.title, status: 'created', slug: page.slug })
      }
    } catch (error) {
      results.push({ title: page.title, status: 'error', slug: page.slug })
      console.error(`Error seeding page "${page.slug}":`, error)
    }
  }

  return results
}
