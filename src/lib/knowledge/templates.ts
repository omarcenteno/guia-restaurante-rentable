import type { ContentItem, Format, Pillar, ScriptTemplate } from "@/lib/types";
import type { Template } from "./types";

export const series = ["Errores que cuestan miles", "Antes de firmar", "Restaurante Rentable responde", "Un minuto de Food Cost", "¿Qué haría Omar?", "Historias de restaurante", "Restaurante en USA", "Plantilla de la semana"];
export const formats: Format[] = ["Reel", "Carrusel", "Story", "Stories", "Post", "Email", "Blog", "Lead magnet"];
export const statuses = ["Idea", "Priorizado", "Guion", "Diseño", "Revisión", "Programado", "Publicado", "Reutilizar"] as const;
export const goals = ["Alcance", "Autoridad", "Conexión", "Conversión", "Interacción", "Comunidad"] as const;
export const funnels = ["Descubrimiento", "Consideración", "Conversión", "Retención"] as const;

const today = new Date("2026-07-10T12:00:00");
const iso = (offset: number) => {
  const date = new Date(today);
  date.setDate(today.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const emptyMetrics = { reach: 0, plays: 0, likes: 0, comments: 0, saves: 0, shares: 0, profileVisits: 0, newFollowers: 0, linkClicks: 0, leads: 0, sales: 0, revenue: 0, adCost: 0 };

const makeContent = (item: Partial<ContentItem> & Pick<ContentItem, "id" | "title" | "format" | "pillar" | "status">): ContentItem => ({
  topic: item.title,
  series: "Restaurante en USA",
  goal: "Autoridad",
  funnel: "Consideración",
  hook: "Esto parece pequeño, pero cambia tus números.",
  centralIdea: "Convertir una decisión operativa en una explicación simple con números claros.",
  script: "Hook. Contexto. Error común. Número clave. Acción práctica. CTA.",
  copy: "Guardar esta idea antes de invertir más dinero en tu restaurante.",
  cta: "Síguenos para aprender a abrir y operar un restaurante rentable en Estados Unidos.",
  hashtags: "#restaurante #restauranteusa #negociolatino #foodbusiness #emprenderenusa",
  supportStories: "Encuesta, ejemplo rápido y caja de preguntas.",
  pinnedComment: "¿Quieres la plantilla para calcularlo? Responde PLANTILLA.",
  ebookChapter: "Capítulo por asignar",
  createdAt: iso(-7),
  scheduledAt: "",
  publishedAt: "",
  postUrl: "",
  owner: "Omar",
  difficulty: "Media",
  priority: "Media",
  notes: "",
  metrics: { ...emptyMetrics },
  ...item
});

export const initialContent: ContentItem[] = [
  makeContent({
    id: "GRR-001",
    title: "El error que hace quebrar a la mayoría de los restaurantes",
    topic: "Validación de negocio",
    format: "Reel",
    goal: "Alcance",
    pillar: "Antes de abrir",
    series: "Errores que cuestan miles",
    funnel: "Descubrimiento",
    hook: "La mayoría de los restaurantes no fracasa por la comida.",
    centralIdea: "Muchos emprendedores invierten antes de validar si realmente tienen un negocio.",
    status: "Publicado",
    publishedAt: iso(-6),
    postUrl: "https://instagram.com/guia_restaurante_rentable",
    ebookChapter: "Capítulo 1: Antes de invertir",
    metrics: { reach: 18400, plays: 22100, likes: 921, comments: 84, saves: 388, shares: 146, profileVisits: 520, newFollowers: 188, linkClicks: 74, leads: 22, sales: 7, revenue: 329, adCost: 0 }
  }),
  makeContent({
    id: "GRR-002",
    title: "5 preguntas que debes responder antes de invertir un solo dólar",
    topic: "Decisión de inversión",
    format: "Carrusel",
    goal: "Autoridad",
    pillar: "Antes de abrir",
    series: "Antes de firmar",
    hook: "Antes de firmar un lease, responde estas cinco preguntas.",
    centralIdea: "¿Qué vendes exactamente? ¿A quién le vendes? ¿Por qué te elegirán? ¿Cómo ganarás dinero? ¿Es operable?",
    status: "Idea",
    ebookChapter: "Capítulo 2: Modelo de negocio"
  }),
  ...[
    ["Idea vs. negocio", "Reel", "Antes de abrir", "Programado", 1],
    ["Punto de equilibrio sin confusión", "Carrusel", "Finanzas", "Programado", 2],
    ["Food Cost en menos de un minuto", "Reel", "Menú rentable", "Programado", 3],
    ["Prime Cost: el número que manda", "Post", "Finanzas", "Programado", 4],
    ["Ubicación: tráfico no es demanda", "Reel", "Antes de abrir", "Programado", 5],
    ["Contratar sin sistema te cuesta margen", "Carrusel", "Operación", "Programado", 6],
    ["Instagram no salva un mal concepto", "Reel", "Marketing", "Programado", 7],
    ["Plantilla semanal: cálculo de food cost", "Story", "Plantillas", "Programado", 8],
    ["Operación: checklist antes de abrir", "Carrusel", "Operación", "Programado", 9],
    ["Oferta del ebook Restaurante Rentable", "Post", "Marketing", "Programado", 10],
    ["Ghost kitchen: cuándo sí y cuándo no", "Reel", "Casos reales", "Programado", 11],
    ["Cafetería rentable: ticket promedio", "Carrusel", "Finanzas", "Programado", 12],
    ["Segunda ubicación: señales reales", "Reel", "Escalabilidad", "Programado", 13],
    ["Historias: preguntas sobre abrir en USA", "Story", "Antes de abrir", "Programado", 14]
  ].map(([title, format, pillar, status, offset], index) => makeContent({
    id: `GRR-${String(index + 3).padStart(3, "0")}`,
    title: String(title),
    format: format as Format,
    pillar: pillar as Pillar,
    status: status as ContentItem["status"],
    scheduledAt: iso(Number(offset)),
    goal: index % 4 === 0 ? "Conversión" : index % 3 === 0 ? "Conexión" : "Autoridad",
    priority: index < 5 ? "Alta" : "Media"
  }))
];

export const initialTemplates: ScriptTemplate[] = [
  ["Reel de 30 segundos", "Reel", ["Hook", "Problema", "Número clave", "Acción", "CTA"]],
  ["Reel de 45 segundos", "Reel", ["Hook", "Contexto", "Error", "Ejemplo", "Acción", "CTA"]],
  ["Reel de 60 segundos", "Reel", ["Hook", "Historia", "Diagnóstico", "Marco", "Ejemplo", "CTA"]],
  ["Carrusel de 5 slides", "Carrusel", ["Portada", "Problema", "Tres puntos", "Resumen", "CTA"]],
  ["Carrusel de 7 slides", "Carrusel", ["Portada", "Contexto", "Error", "Número", "Proceso", "Checklist", "CTA"]],
  ["Story de 3 pantallas", "Story", ["Pregunta", "Micro enseñanza", "Respuesta/CTA"]],
  ["Story de 5 pantallas", "Story", ["Situación", "Encuesta", "Dato", "Ejemplo", "CTA"]],
  ["Publicación de venta", "Post", ["Dolor", "Promesa", "Qué incluye", "Prueba", "Garantía", "CTA"]],
  ["Publicación educativa", "Post", ["Idea central", "Explicación", "Aplicación", "CTA suave"]],
  ["Caso práctico", "Carrusel", ["Caso", "Error", "Números", "Decisión", "Resultado", "Lección"]]
].map(([name, format, fields], index) => ({
  id: `TPL-${index + 1}`,
  name: name as string,
  format: format as Format,
  fields: fields as string[],
  structure: (fields as string[]).map((field, fieldIndex) => `${fieldIndex + 1}. ${field}: escribir aquí`).join("\n")
}));

export function getTemplates(): Template[] {
  return initialTemplates.map((template) => ({ name: template.name, format: template.format, structure: [...template.fields] }));
}
