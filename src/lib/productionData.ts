import type { ContentProductionItem, Format, Goal, Pillar, ProductionChecklist, ProductionMetrics, ProductionState } from "./types";

const baseDate = "2026-07-10";

export const productionStates: ProductionState[] = [
  "Idea",
  "Estrategia",
  "Hook",
  "Guion",
  "Copy",
  "Diseño",
  "Revisión",
  "Lista para publicar",
  "Programada",
  "Publicada",
  "Métricas registradas",
  "Reutilizar"
];

export const productionKanbanColumns = [
  "Idea",
  "En producción",
  "Revisión",
  "Lista para publicar",
  "Programada",
  "Publicada"
] as const;

export const checklistLabels: Record<keyof ProductionChecklist, string> = {
  objetivoDefinido: "Objetivo definido",
  hookAprobado: "Hook aprobado",
  guionTerminado: "Guion terminado",
  copyTerminado: "Copy terminado",
  ctaSeleccionado: "CTA seleccionado",
  hashtagsRevisados: "Hashtags revisados",
  disenoTerminado: "Diseño terminado",
  imagenCreada: "Imagen",
  videoCreado: "Video",
  identidadVisualRevisada: "Identidad visual revisada",
  ortografiaRevisada: "Ortografía revisada",
  fechaProgramada: "Fecha programada",
  storiesApoyoCreadas: "Stories de apoyo creadas",
  comentarioFijadoPreparado: "Comentario fijado preparado",
  enlacePublicacionAgregado: "Enlace de publicación agregado",
  metricasRegistradas: "Métricas registradas"
};

const emptyChecklist = (): ProductionChecklist => ({
  objetivoDefinido: false,
  hookAprobado: false,
  guionTerminado: false,
  copyTerminado: false,
  ctaSeleccionado: false,
  hashtagsRevisados: false,
    disenoTerminado: false,
    imagenCreada: false,
    videoCreado: false,
  identidadVisualRevisada: false,
  ortografiaRevisada: false,
  fechaProgramada: false,
  storiesApoyoCreadas: false,
  comentarioFijadoPreparado: false,
  enlacePublicacionAgregado: false,
  metricasRegistradas: false
});

const emptyMetrics = (): ProductionMetrics => ({
  alcance: 0,
  reproducciones: 0,
  likes: 0,
  comentarios: 0,
  guardados: 0,
  compartidos: 0,
  visitasPerfil: 0,
  nuevosSeguidores: 0,
  clicsBio: 0,
  ventas: 0,
  ingresos: 0
});

type Seed = {
  titulo: string;
  formato: Format;
  objetivo: Goal;
  pilar: Pillar;
  serie?: string;
  hook?: string;
  ideaCentral?: string;
  estado?: ProductionState;
  cta?: string;
  estructuraVisual?: string;
  notas?: string;
};

const seeds: Seed[] = [
  { titulo: "El error que hace quebrar a muchos restaurantes antes de abrir", formato: "Reel", objetivo: "Alcance", pilar: "Antes de abrir", serie: "Errores que cuestan miles", hook: "La mayoría de los restaurantes no fracasa por la comida.", ideaCentral: "Muchos emprendedores invierten antes de validar si realmente tienen un negocio.", estado: "Publicada" },
  { titulo: "5 preguntas que debes responder antes de invertir un solo dólar", formato: "Carrusel", objetivo: "Autoridad", pilar: "Antes de abrir", serie: "Antes de firmar", estructuraVisual: "1. Portada\n2. ¿Qué vendes exactamente?\n3. ¿A quién le vendes?\n4. ¿Por qué te elegirán?\n5. ¿Cómo ganarás dinero?\n6. ¿Es operable?\n7. CTA para guardar" },
  { titulo: "La peor razón para abrir un restaurante", formato: "Reel", objetivo: "Alcance", pilar: "Antes de abrir", hook: "Que todos amen tu comida no significa que tengas un negocio." },
  { titulo: "Cómo validar tu restaurante antes de rentar un local", formato: "Carrusel", objetivo: "Autoridad", pilar: "Antes de abrir" },
  { titulo: "El error de comprar equipo antes de validar", formato: "Reel", objetivo: "Alcance", pilar: "Antes de abrir" },
  { titulo: "4 formas de probar tu concepto con poco dinero", formato: "Carrusel", objetivo: "Autoridad", pilar: "Antes de abrir" },
  { titulo: "Fast casual, sit down, food truck o ghost kitchen", formato: "Carrusel", objetivo: "Autoridad", pilar: "Antes de abrir" },
  { titulo: "El modelo equivocado puede destruir una buena idea", formato: "Reel", objetivo: "Alcance", pilar: "Antes de abrir" },
  { titulo: "No firmes un contrato sin revisar esto", formato: "Reel", objetivo: "Alcance", pilar: "Antes de abrir", serie: "Antes de firmar" },
  { titulo: "La renta publicada no es la renta real", formato: "Carrusel", objetivo: "Autoridad", pilar: "Antes de abrir" },
  { titulo: "Qué significa NNN en un contrato comercial", formato: "Reel", objetivo: "Autoridad", pilar: "Antes de abrir" },
  { titulo: "5 señales de que un local puede ser una mala decisión", formato: "Carrusel", objetivo: "Autoridad", pilar: "Antes de abrir" },
  { titulo: "Investiga qué negocios estuvieron antes en ese local", formato: "Reel", objetivo: "Alcance", pilar: "Antes de abrir" },
  { titulo: "Cómo medir el tráfico real de una ubicación", formato: "Carrusel", objetivo: "Autoridad", pilar: "Antes de abrir" },
  { titulo: "Antes de abrir, calcula cuánto necesitas vender al día", formato: "Reel", objetivo: "Autoridad", pilar: "Finanzas" },
  { titulo: "¿Cuánto cuesta realmente abrir un restaurante en USA?", formato: "Carrusel", objetivo: "Autoridad", pilar: "Finanzas" },
  { titulo: "La regla del 30% de contingencia", formato: "Reel", objetivo: "Alcance", pilar: "Finanzas" },
  { titulo: "Los costos invisibles de abrir un restaurante", formato: "Carrusel", objetivo: "Autoridad", pilar: "Finanzas" },
  { titulo: "Abrir sin capital de trabajo es una crisis anunciada", formato: "Reel", objetivo: "Alcance", pilar: "Finanzas" },
  { titulo: "Cuántos meses de reserva deberías tener", formato: "Carrusel", objetivo: "Autoridad", pilar: "Finanzas" },
  { titulo: "Historia: restaurante lleno, cuenta bancaria vacía", formato: "Reel", objetivo: "Conexión", pilar: "Casos reales" },
  { titulo: "La diferencia entre utilidad y liquidez", formato: "Carrusel", objetivo: "Autoridad", pilar: "Finanzas" },
  { titulo: "Checklist: antes de invertir", formato: "Stories", objetivo: "Interacción", pilar: "Antes de abrir" },
  { titulo: "Encuesta: ¿cuál es tu mayor preocupación al abrir?", formato: "Stories", objetivo: "Comunidad", pilar: "Antes de abrir" },
  { titulo: "Quiz: idea o negocio", formato: "Stories", objetivo: "Interacción", pilar: "Antes de abrir" },
  { titulo: "Preguntas y respuestas sobre abrir en USA", formato: "Stories", objetivo: "Comunidad", pilar: "Antes de abrir" },
  { titulo: "Calcula tu nivel de preparación", formato: "Stories", objetivo: "Interacción", pilar: "Antes de abrir" },
  { titulo: "Qué incluye la Guía Restaurante Rentable", formato: "Carrusel", objetivo: "Conversión", pilar: "Oferta", cta: "Descubre la guía completa en el enlace de nuestra bio." },
  { titulo: "15 plantillas para tomar decisiones con números", formato: "Reel", objetivo: "Conversión", pilar: "Plantillas" },
  { titulo: "La inversión más pequeña antes de arriesgar miles", formato: "Carrusel", objetivo: "Conversión", pilar: "Oferta", notas: "Incluir: ebook de 122 páginas, 15 plantillas, precio de $47, garantía de 7 días, venta por Shopify y Hotmart." }
];

const priorityFor = (numero: number) => (numero >= 2 && numero <= 10 ? "Alta" : numero <= 22 ? "Media" : "Baja");

export const initialProductionItems: ContentProductionItem[] = seeds.map((seed, index) => {
  const numero = index + 1;
  const checklist = emptyChecklist();
  if (seed.estado === "Publicada") {
    checklist.objetivoDefinido = true;
    checklist.hookAprobado = true;
    checklist.guionTerminado = true;
    checklist.copyTerminado = true;
    checklist.ctaSeleccionado = true;
    checklist.hashtagsRevisados = true;
    checklist.disenoTerminado = true;
    checklist.identidadVisualRevisada = true;
    checklist.ortografiaRevisada = true;
    checklist.fechaProgramada = true;
    checklist.storiesApoyoCreadas = true;
    checklist.comentarioFijadoPreparado = true;
    checklist.enlacePublicacionAgregado = true;
  }

  return {
    id: `PROD-${String(numero).padStart(3, "0")}`,
    numero,
    titulo: seed.titulo,
    tema: "Antes de abrir tu restaurante",
    pilar: seed.pilar,
    serie: seed.serie ?? "Antes de abrir tu restaurante",
    formato: seed.formato,
    objetivo: seed.objetivo,
    etapaEmbudo: seed.objetivo === "Conversión" ? "Conversión" : seed.objetivo === "Alcance" ? "Descubrimiento" : "Consideración",
    estado: seed.estado ?? "Idea",
    prioridad: priorityFor(numero),
    dificultad: seed.formato === "Stories" ? "Baja" : "Media",
    capituloEbook: numero <= 14 ? "Antes de invertir" : numero <= 22 ? "Números antes de abrir" : "Oferta y herramientas",
    fechaCreacion: baseDate,
    fechaProgramada: seed.estado === "Publicada" ? "2026-07-09" : "",
    fechaPublicada: seed.estado === "Publicada" ? "2026-07-09" : "",
    responsable: "Omar",
    hook: seed.hook ?? "",
    ideaCentral: seed.ideaCentral ?? "",
    objetivoEstrategico: seed.objetivo === "Conversión" ? "Convertir confianza en clics y ventas del ebook." : "Construir autoridad antes de pedir una compra.",
    audienciaEspecifica: "Hispanos en Estados Unidos que quieren abrir o mejorar un restaurante.",
    problemaResuelve: "Reduce improvisación antes de invertir dinero.",
    resultadoEsperado: "Que la audiencia guarde, comparta o avance hacia el link en bio.",
    kpiPrincipal: seed.objetivo === "Conversión" ? "Ventas atribuidas" : seed.objetivo === "Alcance" ? "Alcance" : "Guardados",
    guion: "",
    estructuraVisual: seed.estructuraVisual ?? "",
    copy: "",
    cta: seed.cta ?? "Guarda esta publicación antes de tomar una decisión.",
    hashtags: "#GuiaRestauranteRentable #RestaurantesUSA #EmprendedoresLatinos #AbrirRestaurante #NegocioRestaurantero",
    historiasApoyo: "",
    comentarioFijado: "",
    promptImagen: "",
    promptVideo: "",
    notasDiseno: "",
    imagenFinal: "",
    estadoDiseno: "Pendiente",
    enlaceInstagram: seed.estado === "Publicada" ? "https://instagram.com/guia_restaurante_rentable" : "",
    notas: seed.notas ?? "",
    checklist,
    metricas: seed.estado === "Publicada" ? { ...emptyMetrics(), alcance: 18400, reproducciones: 22100, likes: 921, comentarios: 84, guardados: 388, compartidos: 146, visitasPerfil: 520, nuevosSeguidores: 188, clicsBio: 74, ventas: 7, ingresos: 329 } : emptyMetrics()
  };
});
