import type { KnowledgeContext } from "@/lib/knowledge";
import type { GeneratedContent, Publication } from "./types";

const lessons = [
  "validar demanda, ticket promedio y costos antes de comprometer capital",
  "responder con datos qué vendes, a quién y por qué te elegirán",
  "separar el reconocimiento de tu comida de la viabilidad del negocio",
  "probar el concepto con ventas reales antes de firmar una renta",
  "comprar equipo después de definir menú, volumen y proceso",
  "usar pop-ups, catering, mercados y cocinas compartidas para validar",
  "elegir el modelo operativo que mejor encaje con capital y demanda",
  "alinear una buena idea con una operación que pueda sostenerla",
  "revisar plazo, incrementos, permisos y salida antes de firmar",
  "calcular renta base, CAM, seguros, impuestos y mantenimiento",
  "entender los cargos NNN antes de comparar dos locales",
  "detectar restricciones, baja visibilidad y costos ocultos del local",
  "investigar el historial del espacio y las causas de cierres anteriores",
  "medir tráfico por día, hora, dirección y perfil de cliente",
  "convertir el punto de equilibrio mensual en una meta diaria",
  "presupuestar obra, equipos, permisos, inventario y capital de trabajo",
  "reservar contingencia para cambios de obra y retrasos inevitables",
  "incluir depósitos, profesionales, licencias y preapertura",
  "proteger la operación con capital de trabajo desde el primer día",
  "definir una reserva según costos fijos y tiempo de estabilización",
  "distinguir ventas altas de una caja saludable y una utilidad real",
  "leer utilidad y liquidez como indicadores distintos",
  "revisar validación, presupuesto, permisos y reserva antes de invertir",
  "identificar el riesgo que más preocupa al futuro restaurantero",
  "diferenciar una idea atractiva de un negocio medible",
  "resolver dudas prácticas sobre abrir un restaurante en Estados Unidos",
  "evaluar preparación financiera, operativa y comercial",
  "presentar la guía como un sistema práctico para decidir mejor",
  "usar plantillas para controlar costos, caja y punto de equilibrio",
  "invertir primero en claridad para reducir errores de miles de dólares"
];

export function createMockResponse(publication: Publication, knowledge: KnowledgeContext): GeneratedContent {
  const lesson = lessons[(Math.max(1, publication.number) - 1) % lessons.length];
  const hook = publication.hook || (publication.format === "Stories"
    ? "Antes de seguir: ¿ya puedes responder esto sobre tu restaurante?"
    : `${publication.title}: el dato que debes revisar antes de invertir.`);
  const selectedCta = publication.cta || selectCta(publication.objective, knowledge);
  const benefit = knowledge.offer.benefits[0] ?? "tomar decisiones con mayor claridad";
  return {
    title: publication.title,
    hook,
    copy: `${hook}\n\n${knowledge.brand.name} parte de una idea simple: abrir un restaurante exige más que una buena idea. Necesitas ${lesson}.\n\nCuando conviertes las suposiciones en números y procesos, puedes ${benefit.toLowerCase()} y detectar riesgos antes de comprometer tu inversión.\n\n${knowledge.offer.promise}`,
    cta: selectedCta,
    hashtags: "#GuiaRestauranteRentable #RestaurantesUSA #EmprendedoresLatinos #AbrirRestaurante #NegocioRestaurantero #RestauranteRentable",
    imagePrompt: `Fotografía editorial realista para ${knowledge.brand.name} sobre "${publication.title}". Restaurante profesional en Estados Unidos, emprendedor hispano revisando datos y documentos, composición sobria con espacio para titular, alto contraste, azul marino, blanco y acentos dorados, estética premium, sin texto generado y sin usar ${knowledge.brand.forbiddenWords.slice(0, 4).join(", ")}.`,
    reelPrompt: `Reel vertical 9:16 de 30 segundos para ${knowledge.brand.name} sobre "${publication.title}". Abrir con el hook en los primeros 3 segundos, mostrar restaurante real y revisión de números, explicar cómo ${lesson}, usar subtítulos legibles y cerrar con: ${selectedCta}`
  };
}

export function selectCta(objective: string, knowledge: KnowledgeContext) {
  if (objective === "Conversión") return knowledge.ctas.all.find((cta) => cta.includes("guía completa")) ?? knowledge.ctas.primary;
  if (objective === "Alcance") return knowledge.ctas.all.find((cta) => cta.includes("Compártelo")) ?? knowledge.ctas.primary;
  return knowledge.ctas.all.find((cta) => cta.includes("Guarda")) ?? knowledge.ctas.primary;
}
