import type { ImageContentType, ImageTemplate, ImageTemplateName } from "./imageTypes";

export const IMAGE_TEMPLATES: Record<ImageTemplateName, ImageTemplate> = {
  Premium: { name: "Premium", style: "editorial premium, sobrio, ejecutivo y fotorealista", composition: "jerarquía visual clara, imagen dominante y amplio espacio negativo", lighting: "luz editorial suave, contraste controlado y reflejos dorados discretos", elements: ["operación restaurantera real", "documentos de negocio", "detalles materiales premium"], emotion: "confianza, control y claridad", negativeElements: ["lujo ostentoso", "poses artificiales", "decoración saturada"] },
  Minimalista: { name: "Minimalista", style: "minimalismo editorial de alto contraste", composition: "un solo punto focal, retícula limpia y mucho aire", lighting: "luz natural uniforme y sombras suaves", elements: ["un objeto principal", "superficie limpia", "detalle operativo"], emotion: "calma y enfoque", negativeElements: ["fondos recargados", "muchos objetos", "efectos decorativos"] },
  Corporativo: { name: "Corporativo", style: "corporativo contemporáneo, confiable y humano", composition: "estructura modular, líneas precisas y balance asimétrico", lighting: "iluminación profesional neutra con profundidad moderada", elements: ["equipo de trabajo real", "indicadores", "entorno profesional"], emotion: "credibilidad y liderazgo", negativeElements: ["stock photo genérica", "apretones de manos", "sonrisas exageradas"] },
  Restaurante: { name: "Restaurante", style: "fotografía documental gastronómica y operativa, realista y premium", composition: "acción auténtica en primer plano con contexto de cocina profesional", lighting: "luz cálida de restaurante equilibrada con luz ambiental neutra", elements: ["cocina profesional", "personal trabajando", "servicio real", "ingredientes e inventario"], emotion: "dominio operativo y oficio", negativeElements: ["platos irreales", "chef caricaturizado", "cocina doméstica"] },
  Finanzas: { name: "Finanzas", style: "editorial financiero claro, tangible y sin clichés", composition: "números y documentos como apoyo, persona tomando una decisión como foco", lighting: "luz lateral limpia, contraste alto y sombras precisas", elements: ["hoja de costos", "calculadora", "menú", "gráfica legible sin cifras inventadas"], emotion: "control, prudencia y capacidad de decisión", negativeElements: ["billetes volando", "monedas apiladas", "riqueza rápida"] },
  Tecnología: { name: "Tecnología", style: "tecnología aplicada a operaciones, limpia y realista", composition: "interfaz o dispositivo integrado naturalmente en el entorno", lighting: "luz fría controlada con acentos cálidos de marca", elements: ["tablet operativa", "dashboard", "sistema POS", "datos estructurados"], emotion: "eficiencia y modernidad", negativeElements: ["hologramas", "código abstracto", "futurismo de ciencia ficción"] },
  Educación: { name: "Educación", style: "editorial educativo práctico, claro y guardable", composition: "concepto principal acompañado por herramientas y pasos visuales", lighting: "luz natural brillante, limpia y accesible", elements: ["guía", "checklist", "plantilla", "persona aprendiendo o planificando"], emotion: "claridad, progreso y seguridad", negativeElements: ["aula escolar", "iconos infantiles", "infografía saturada"] }
};

export const IMAGE_PLACEMENTS: Record<ImageContentType, { aspectRatio: string; dimensions: string; safeArea: string; textSpace: string }> = {
  "instagram-post": { aspectRatio: "1:1", dimensions: "1080x1080", safeArea: "Mantener titulares y elementos esenciales dentro del 80% central; margen mínimo de 108 px.", textSpace: "Reservar 35% del lienzo para un hook de máximo 10 a 14 palabras." },
  carousel: { aspectRatio: "4:5", dimensions: "1080x1350", safeArea: "Mantener texto dentro de 864x1080 px centrales y continuidad visual entre slides.", textSpace: "Reservar tercio superior o lateral izquierdo para una sola idea por slide." },
  story: { aspectRatio: "9:16", dimensions: "1080x1920", safeArea: "Dejar libres 250 px superiores y 320 px inferiores para interfaz y CTA.", textSpace: "Conservar el centro vertical para titular, encuesta o dato principal." },
  "reel-cover": { aspectRatio: "9:16", dimensions: "1080x1920", safeArea: "El foco y el texto deben funcionar también en recorte 1:1; usar zona central de 1080x1080.", textSpace: "Hook grande centrado, máximo 10 palabras, sin elementos críticos en bordes." },
  thumbnail: { aspectRatio: "16:9", dimensions: "1280x720", safeArea: "Margen de seguridad de 64 px y rostro u objeto fuera de la esquina inferior derecha.", textSpace: "Reservar 40% lateral para un título corto de alto contraste." },
  "lead-magnet": { aspectRatio: "3:4", dimensions: "1500x2000", safeArea: "Margen editorial de 10% y área inferior libre para subtítulo o sello.", textSpace: "Reservar mitad superior para título, promesa y descriptor de la herramienta." },
  "ebook-mockup": { aspectRatio: "4:5", dimensions: "1600x2000", safeArea: "Producto completo visible con 12% de aire alrededor y lomo sin recortes.", textSpace: "Texto únicamente en portada del ebook; fondo con espacio negativo." },
  banner: { aspectRatio: "1.91:1", dimensions: "1200x627", safeArea: "Safe area LinkedIn: mantener contenido crítico dentro de 1080x507 px centrales.", textSpace: "Reservar 45% de un lateral para titular y CTA breve." },
  ad: { aspectRatio: "1.9:1", dimensions: "1200x630", safeArea: "Safe area Facebook: margen mínimo de 60 px y texto lejos de controles laterales.", textSpace: "Reservar un bloque limpio para beneficio principal y CTA." }
};

export function selectImageTemplate(type: ImageContentType, topic: string): ImageTemplateName {
  const normalized = topic.toLocaleLowerCase("es");
  if (type === "ebook-mockup") return "Premium";
  if (/food cost|labor cost|costo|margen|utilidad|finanz|punto de equilibrio/.test(normalized)) return "Finanzas";
  if (/pos|software|tecnolog|automat|dashboard/.test(normalized)) return "Tecnología";
  if (type === "lead-magnet") return "Educación";
  if (type === "banner" || type === "ad") return "Corporativo";
  if (/cocina|menú|restaurante|servicio|inventario|operación/.test(normalized)) return "Restaurante";
  return "Premium";
}
