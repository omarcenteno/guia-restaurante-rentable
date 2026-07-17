import type { KnowledgeCategory, KnowledgeDocument, KnowledgeDocumentStatus } from "./types";

interface SeedDocument {
  title: string;
  description: string;
  category: KnowledgeCategory;
  tags: string[];
  status?: KnowledgeDocumentStatus;
  author?: string;
  version?: number;
  usageCount?: number;
  content: string;
}

const seeds: SeedDocument[] = [
  {
    title: "Cómo calcular Food Cost",
    description: "Método práctico para medir el costo real de cada plato y proteger el margen.",
    category: "Food Cost",
    tags: ["costos", "recetas", "rentabilidad"],
    usageCount: 48,
    content: "El Food Cost compara el costo de los ingredientes utilizados con las ventas de alimentos. Calcula primero el costo de cada receta con cantidades y precios actualizados.\n\nFórmula: costo de alimentos vendidos / ventas de alimentos x 100. Analiza variaciones por merma, porciones, compras y cambios de precio. Revisa semanalmente los productos de mayor impacto."
  },
  {
    title: "Plantilla de receta estándar",
    description: "Estructura para documentar ingredientes, rendimiento, porción y costo por plato.",
    category: "Plantillas",
    tags: ["receta", "porciones", "costeo"],
    status: "Publicado",
    usageCount: 42,
    content: "Registra nombre de la receta, rendimiento total, tamaño de porción, ingredientes, unidad de compra, cantidad utilizada y costo unitario.\n\nIncluye procedimiento, foto de referencia, equipo necesario, alérgenos, tiempo de preparación y fecha de última actualización. El costo por porción debe alimentar el precio sugerido del menú."
  },
  {
    title: "Control semanal de inventario",
    description: "Rutina para contar existencias, detectar desviaciones y reducir desperdicio.",
    category: "Operación",
    tags: ["inventario", "merma", "compras"],
    usageCount: 39,
    content: "Realiza el conteo el mismo día, a la misma hora y con las áreas organizadas. Cuenta por ubicación y utiliza siempre la misma unidad.\n\nCompara inventario inicial más compras menos inventario final contra el consumo teórico. Investiga diferencias materiales y asigna responsables para cada corrección."
  },
  {
    title: "Prime Cost: lectura y control",
    description: "Guía para controlar conjuntamente costo de alimentos y mano de obra.",
    category: "Finanzas",
    tags: ["prime cost", "labor cost", "food cost"],
    usageCount: 37,
    content: "El Prime Cost suma el costo de ventas y el costo total de mano de obra. Es el indicador operativo que más rápido muestra si el restaurante conserva margen.\n\nRevísalo cada semana, compáralo con presupuesto y ventas, y separa la variación entre precio, volumen, productividad y desperdicio."
  },
  {
    title: "Punto de equilibrio",
    description: "Cálculo de las ventas mínimas necesarias para cubrir costos fijos y variables.",
    category: "Finanzas",
    tags: ["break even", "ventas", "presupuesto"],
    usageCount: 35,
    content: "Clasifica los costos fijos mensuales y calcula el margen de contribución promedio. Divide los costos fijos entre el porcentaje de contribución para obtener las ventas de equilibrio.\n\nConvierte el resultado a ventas semanales, diarias y número de tickets para que el equipo pueda usarlo como meta operativa."
  },
  {
    title: "Presupuesto de apertura",
    description: "Mapa de inversión inicial, capital de trabajo y reserva para contingencias.",
    category: "Apertura",
    tags: ["inversión", "capital", "apertura"],
    usageCount: 31,
    content: "Separa obra, equipos, mobiliario, permisos, depósitos, inventario inicial, tecnología, marketing y honorarios profesionales.\n\nAñade capital de trabajo para cubrir nómina, renta, servicios y compras durante los primeros meses. Mantén una reserva de contingencia y valida cada supuesto con cotizaciones."
  },
  {
    title: "Flujo de caja de 13 semanas",
    description: "Plantilla de previsión para anticipar necesidades de efectivo a corto plazo.",
    category: "Finanzas",
    tags: ["cash flow", "tesorería", "pagos"],
    status: "Archivado",
    usageCount: 28,
    content: "Proyecta por semana el saldo inicial, cobros, ventas, pagos a proveedores, nómina, renta, impuestos y otros egresos.\n\nActualiza lo real contra lo proyectado y desplaza el horizonte cada semana. Las diferencias ayudan a corregir compras, calendario de pagos y necesidades de financiamiento."
  },
  {
    title: "Checklist de apertura diaria",
    description: "Secuencia verificable para abrir el restaurante listo para recibir clientes.",
    category: "Checklists",
    tags: ["apertura", "turno", "FOH"],
    usageCount: 46,
    content: "Verifica seguridad, temperaturas, limpieza, iluminación, música, baños, estaciones, caja, reservas, especialidades y reunión previa al turno.\n\nCada tarea debe tener responsable, hora límite y evidencia cuando aplique. El gerente confirma excepciones antes de abrir puertas."
  },
  {
    title: "Checklist de cierre diario",
    description: "Control de caja, limpieza, inventario y seguridad al finalizar la jornada.",
    category: "Checklists",
    tags: ["cierre", "seguridad", "caja"],
    usageCount: 44,
    content: "Incluye arqueo y cierre de POS, almacenamiento seguro, rotación y etiquetado, temperaturas, limpieza de equipos, basura, gas, puertas y alarma.\n\nRegistra incidentes, faltantes y tareas pendientes para el equipo de apertura."
  },
  {
    title: "Checklist antes de inaugurar",
    description: "Validación final de permisos, equipos, equipo humano y experiencia del cliente.",
    category: "Apertura",
    tags: ["inauguración", "permisos", "pruebas"],
    usageCount: 33,
    content: "Confirma inspecciones, licencias, seguros, contratos, POS, internet, equipos, proveedores, inventario, contratación, capacitación y material de marca.\n\nRealiza servicios de prueba, mide tiempos y corrige fallas antes de anunciar la fecha oficial."
  },
  {
    title: "Proceso de compras",
    description: "Flujo desde la requisición hasta la aprobación, recepción y pago.",
    category: "Operación",
    tags: ["compras", "proveedores", "aprobación"],
    usageCount: 29,
    content: "Define par levels, días de pedido, proveedores autorizados y niveles de aprobación. Cada orden debe relacionarse con una necesidad operativa y un precio validado.\n\nCompara orden, recepción y factura antes del pago. Documenta sustituciones y diferencias."
  },
  {
    title: "Matriz de proveedores",
    description: "Comparador de precio, calidad, servicio, crédito y confiabilidad.",
    category: "Plantillas",
    tags: ["proveedores", "precios", "evaluación"],
    usageCount: 25,
    content: "Registra productos, contactos, días de entrega, mínimos, términos, precios y alternativas. Evalúa calidad, puntualidad, exactitud y respuesta ante incidencias.\n\nEvita depender de una sola fuente para insumos críticos y revisa la matriz trimestralmente."
  },
  {
    title: "Manual FOH",
    description: "Estándares para recepción, servicio, caja y experiencia del cliente.",
    category: "SOP",
    tags: ["FOH", "servicio", "capacitación"],
    usageCount: 34,
    content: "Documenta presentación personal, secuencia de servicio, conocimiento del menú, comunicación con cocina, venta sugestiva, manejo de pagos y despedida.\n\nIncluye expectativas observables, responsables y método de evaluación para cada puesto de sala."
  },
  {
    title: "Manual BOH",
    description: "Estándares de preparación, línea, inocuidad, limpieza y cierre de cocina.",
    category: "SOP",
    tags: ["BOH", "cocina", "inocuidad"],
    usageCount: 32,
    content: "Define mise en place, recetas, porciones, tiempos, temperaturas, rotación FIFO, comunicación de línea y limpieza.\n\nCada estación debe tener lista de apertura, producción, servicio y cierre con criterios claros de aceptación."
  },
  {
    title: "SOP recepción de mercancía",
    description: "Procedimiento para validar cantidad, calidad, temperatura y documentación.",
    category: "SOP",
    tags: ["recepción", "calidad", "inventario"],
    usageCount: 27,
    content: "Recibe únicamente en horarios definidos y compara la entrega con la orden. Revisa empaque, temperatura, fechas, peso y calidad antes de firmar.\n\nRegistra rechazos, toma evidencia y almacena de inmediato respetando la cadena de frío."
  },
  {
    title: "SOP manejo de quejas",
    description: "Protocolo para escuchar, resolver y aprender de una experiencia negativa.",
    category: "Atención al Cliente",
    tags: ["quejas", "recuperación", "servicio"],
    usageCount: 30,
    content: "Escucha sin interrumpir, reconoce el impacto, ofrece una solución proporcional y confirma que el cliente quedó atendido.\n\nRegistra causa, acción y responsable. Analiza recurrencias semanalmente para corregir procesos, no solo casos individuales."
  },
  {
    title: "Permisos para restaurantes en Florida",
    description: "Mapa inicial de licencias e inspecciones comunes para operar en Florida.",
    category: "Permisos",
    tags: ["Florida", "licencias", "inspecciones"],
    usageCount: 41,
    content: "La ruta depende del concepto, ubicación, alcohol, construcción y tipo de servicio. Verifica uso de suelo, registro comercial, permisos de obra y fuego, licencia sanitaria y requisitos fiscales.\n\nConfirma siempre con la ciudad, el condado y las agencias estatales aplicables antes de comprometer fechas o inversión."
  },
  {
    title: "Ruta general de licencias en Estados Unidos",
    description: "Marco para investigar requisitos federales, estatales, de condado y ciudad.",
    category: "Permisos",
    tags: ["USA", "licencias", "compliance"],
    status: "Borrador",
    usageCount: 21,
    content: "Organiza la investigación por entidad legal, impuestos, uso de suelo, construcción, salud, fuego, alcohol, letreros, música y empleo.\n\nCrea una matriz con autoridad, requisito, dependencia, costo, fecha y responsable. Los requisitos cambian según jurisdicción."
  },
  {
    title: "Contratación de personal",
    description: "Proceso estructurado para atraer, evaluar y seleccionar candidatos.",
    category: "Recursos Humanos",
    tags: ["reclutamiento", "entrevista", "equipo"],
    usageCount: 26,
    content: "Define resultados esperados y competencias antes de publicar la vacante. Utiliza preguntas consistentes, prueba práctica cuando aplique y referencias.\n\nEvalúa disponibilidad, actitud de servicio, habilidades y compatibilidad con el ritmo del concepto. Documenta la decisión."
  },
  {
    title: "Onboarding de siete días",
    description: "Plan de incorporación para reducir errores y acelerar la autonomía.",
    category: "Recursos Humanos",
    tags: ["onboarding", "capacitación", "desempeño"],
    usageCount: 24,
    content: "Día uno: cultura, seguridad y expectativas. Días dos a cuatro: observación, práctica guiada y conocimiento de producto. Días cinco a siete: ejecución supervisada y evaluación.\n\nAsigna entrenador, objetivos diarios y una lista de competencias por puesto."
  },
  {
    title: "Labor Cost y productividad",
    description: "Guía para programar personal según demanda sin deteriorar el servicio.",
    category: "Labor Cost",
    tags: ["nómina", "productividad", "horarios"],
    usageCount: 38,
    content: "Mide costo laboral total, horas trabajadas, ventas por hora y transacciones por hora. Programa con base en pronóstico por franja, no solo en un porcentaje mensual.\n\nAjusta entradas, salidas y descansos según la demanda real, respetando la legislación laboral aplicable."
  },
  {
    title: "Ingeniería de menú",
    description: "Clasificación de platos por popularidad y contribución para tomar decisiones.",
    category: "Menús",
    tags: ["menú", "margen", "popularidad"],
    usageCount: 36,
    content: "Cruza popularidad con margen de contribución y clasifica los platos en estrellas, caballos de batalla, acertijos y perros.\n\nProtege las estrellas, mejora el margen de los populares, da visibilidad a los rentables y reconsidera los que no venden ni aportan."
  },
  {
    title: "Ficha técnica de menú",
    description: "Documento maestro para asegurar consistencia culinaria y financiera.",
    category: "Menús",
    tags: ["ficha técnica", "alérgenos", "precio"],
    usageCount: 22,
    content: "Incluye descripción comercial, receta vinculada, foto, montaje, alérgenos, sustituciones permitidas, costo, precio, margen y tiempo objetivo.\n\nLa ficha conecta cocina, servicio, compras, entrenamiento y comunicación del menú."
  },
  {
    title: "Google Business Profile",
    description: "Rutina para optimizar presencia local, reseñas y conversión a visitas.",
    category: "Marketing",
    tags: ["Google", "SEO local", "reseñas"],
    usageCount: 43,
    content: "Completa categoría, descripción, horarios, menú, reservas, atributos, fotos reales y enlaces. Publica novedades y responde reseñas con contexto.\n\nMide llamadas, solicitudes de dirección, clics y términos de búsqueda para mejorar la ficha cada mes."
  },
  {
    title: "Instagram para restaurantes",
    description: "Sistema editorial centrado en producto, confianza y conversión local.",
    category: "Redes Sociales",
    tags: ["Instagram", "contenido", "restaurantes"],
    usageCount: 40,
    content: "Combina producto apetecible, personas, procesos, prueba social y ofertas. Cada pieza debe tener un objetivo y una acción clara.\n\nGraba contenido real del restaurante, responde comentarios y utiliza métricas de guardados, visitas al perfil y acciones locales."
  },
  {
    title: "Calendario de promociones",
    description: "Plan anual para coordinar temporadas, ofertas y capacidad operativa.",
    category: "Ventas",
    tags: ["promociones", "calendario", "demanda"],
    usageCount: 23,
    content: "Mapea feriados, eventos locales, temporadas de producto y semanas históricamente lentas. Define objetivo, audiencia, oferta, canal y capacidad para cada promoción.\n\nEvita descuentos improvisados: calcula margen, límite, duración y mecanismo de medición antes de publicar."
  },
  {
    title: "Plan de marketing de 90 días",
    description: "Hoja de ruta trimestral con objetivos, campañas, canales y métricas.",
    category: "Marketing",
    tags: ["plan", "campañas", "KPI"],
    status: "Borrador",
    usageCount: 20,
    content: "Define un objetivo comercial por trimestre y tradúcelo a campañas mensuales. Asigna audiencia, mensaje, oferta, canal, presupuesto, responsable y KPI.\n\nRevisa resultados semanalmente y mueve recursos hacia las acciones que generan visitas, repetición y ventas rentables."
  },
  {
    title: "Guion de venta sugestiva",
    description: "Preguntas y recomendaciones naturales para elevar el ticket promedio.",
    category: "Ventas",
    tags: ["ticket promedio", "servicio", "upselling"],
    usageCount: 19,
    content: "La venta sugestiva parte de escuchar. Recomienda una bebida, complemento o postre relacionado con la elección del cliente y explica brevemente el valor.\n\nEvita recitar una lista. Practica situaciones frecuentes y mide aceptación, ticket y satisfacción por turno."
  },
  {
    title: "Estándar de atención al cliente",
    description: "Momentos clave y conductas observables para una experiencia consistente.",
    category: "Atención al Cliente",
    tags: ["hospitalidad", "experiencia", "estándares"],
    usageCount: 18,
    content: "Define saludo, tiempo de primera atención, conocimiento del menú, seguimiento, resolución y despedida. Cada estándar debe poder observarse y entrenarse.\n\nMide tiempos, comentarios, reseñas y recuperación de incidentes para convertir la hospitalidad en un sistema repetible."
  },
  {
    title: "Voz de marca de Restaurante Rentable",
    description: "Principios para comunicar con claridad, autoridad práctica y cercanía latina.",
    category: "Branding",
    tags: ["voz", "tono", "marca"],
    status: "Publicado",
    usageCount: 45,
    content: "La voz es directa, profesional y cercana. Enseña desde la experiencia, explica números sin complicarlos y reconoce la realidad del emprendedor latino en Estados Unidos.\n\nEvita promesas fáciles, clichés y tecnicismos sin contexto. Prioriza acciones concretas, rentabilidad sostenible y decisiones informadas."
  }
];

export const initialKnowledgeDocuments: KnowledgeDocument[] = seeds.map((seed, index) => {
  const date = new Date(Date.UTC(2026, 5, 3 + index, 12));
  const createdAt = date.toISOString();
  const id = `kb-${String(index + 1).padStart(3, "0")}`;
  const fileName = `${seed.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}.md`;
  const wordCount = seed.content.trim().split(/\s+/u).length;

  return {
    id,
    title: seed.title,
    description: seed.description,
    category: seed.category,
    tags: seed.tags,
    createdAt,
    updatedAt: createdAt,
    author: seed.author ?? "Equipo GRR",
    version: seed.version ?? 1,
    status: seed.status ?? "Publicado",
    favorite: false,
    usageCount: seed.usageCount ?? 0,
    content: seed.content,
    previewContent: seed.content,
    metadata: {
      fileName,
      fileType: "markdown",
      mimeType: "text/markdown",
      size: new TextEncoder().encode(seed.content).byteLength,
      lastModified: createdAt,
      wordCount,
      pageCount: null,
      source: "mock",
      parseStatus: "ready"
    },
    retrieval: {
      eligible: true,
      documentKey: `grr-knowledge/${id}`,
      chunkStrategy: "paragraph"
    }
  };
});
