import type { KnowledgeContext } from "@/lib/knowledge";
import { createMockResponse } from "./mockResponses";
import type { GeneratedPublicationPayload, GenerationRequest, Publication } from "./types";

function fallbackPublication(request: GenerationRequest): Publication {
  if (request.publication) return request.publication;
  const numericId = Date.now().toString().slice(-6);
  return {
    id: `AI-${numericId}`,
    number: Number(numericId),
    title: request.topic || "Contenido para un restaurante rentable",
    format: request.type,
    pillar: request.pillar || "Antes de abrir",
    objective: request.goal || request.objective || "Autoridad",
    topic: request.topic || "Gestión restaurantera",
    hook: request.hook
  };
}

export function createGenerationFallback(request: GenerationRequest, knowledge: KnowledgeContext): GeneratedPublicationPayload {
  const publication = fallbackPublication(request);
  const mock = createMockResponse(publication, knowledge);
  const caption = request.type === "blog" ? createFallbackBlog(publication, mock.cta, knowledge) : mock.copy;
  return {
    title: mock.title,
    hook: mock.hook,
    caption,
    cta: mock.cta,
    hashtags: Array.from(new Set(mock.hashtags.split(/\s+/).filter(Boolean))).slice(0, 10),
    imagePrompt: mock.imagePrompt,
    story: [
      { frame: 1, headline: mock.hook, body: "Antes de invertir, convierte tu idea en una decisión que puedas medir.", pollQuestion: "¿Ya validaste tu concepto?", pollOptions: ["Sí", "Todavía no"], cta: "" },
      { frame: 2, headline: "Revisa el riesgo", body: `Analiza ${publication.topic.toLowerCase()} con ventas, costos y capacidad operativa reales.`, pollQuestion: "", pollOptions: [], cta: "" },
      { frame: 3, headline: "Decide con números", body: knowledge.offer.promise, pollQuestion: "", pollOptions: [], cta: mock.cta }
    ],
    carousel: [
      { slide: 1, title: mock.hook, body: "Una buena idea necesita evidencia antes de recibir una inversión grande." },
      { slide: 2, title: "El problema", body: "Muchos conceptos avanzan basados en entusiasmo, sin validar demanda, costos ni operación." },
      { slide: 3, title: "Primero valida", body: `Convierte ${publication.topic.toLowerCase()} en preguntas que puedas responder con datos.` },
      { slide: 4, title: "Después calcula", body: "Prueba precio, volumen, costo por plato, mano de obra y punto de equilibrio antes de comprometer capital." },
      { slide: 5, title: "Toma una decisión", body: mock.cta }
    ],
    reel: {
      hook: mock.hook,
      script: `${mock.hook} Antes de comprometer capital, revisa ${publication.topic.toLowerCase()} con datos reales. Define qué vas a vender, a quién, a qué precio y cuánto debe dejar cada venta. Una decisión medida hoy puede evitar un error costoso mañana.`,
      onScreenText: [mock.hook, "Valida demanda", "Calcula costos", "Decide con números"],
      bRoll: ["Propietario revisando ventas y costos en una hoja de cálculo", "Toma cerrada de un menú con precios", "Operación real durante el servicio"],
      cta: mock.cta
    }
  };
}

function createFallbackBlog(publication: Publication, cta: string, knowledge: KnowledgeContext): string {
  return `## ${publication.title}

Abrir o mejorar un restaurante independiente en Estados Unidos exige algo más importante que entusiasmo: una forma ordenada de convertir decisiones operativas en números. ${publication.topic} no debe tratarse como una idea aislada. Afecta la inversión, el flujo de caja, la capacidad del equipo y la experiencia que recibe el cliente. Por eso conviene analizarlo antes de comprometer dinero o cambiar una operación que ya está funcionando.

## Empieza por definir la decisión

Una pregunta amplia produce respuestas vagas. En lugar de preguntar si el concepto "va a funcionar", define qué necesitas decidir. Puede ser validar una ubicación, ajustar un precio, reducir el food cost, contratar una posición o elegir un formato de servicio. Escribe la decisión, el plazo y el resultado mínimo que justificaría avanzar. Esa claridad evita confundir movimiento con progreso.

Para un restaurante nuevo, la validación debe incluir cliente, oferta y operación. ¿Quién compra? ¿Qué problema resuelve la propuesta? ¿Con qué frecuencia podría regresar ese cliente? ¿El menú puede producirse con consistencia durante una hora pico? Una respuesta positiva en redes sociales no reemplaza ventas reales ni demuestra que el modelo sea rentable.

## Conecta ventas con costos

Las ventas son solo una parte de la ecuación. Cada producto necesita un costo de receta actualizado, un precio coherente con el mercado y un margen suficiente para contribuir a renta, mano de obra, seguros, tecnología, marketing y utilidad. Revisa el food cost por plato, pero también el margen de contribución: un porcentaje atractivo puede esconder pocos dólares disponibles para cubrir gastos fijos.

Haz el mismo ejercicio con labor cost. No basta con dividir nómina entre ventas al final del mes. Observa qué puestos necesita cada turno, cuántas horas requiere la producción, dónde aparecen tiempos muertos y qué volumen puede atender el equipo sin deteriorar servicio o calidad. El objetivo no es recortar personal de forma automática, sino diseñar una operación que pueda sostener la promesa al cliente.

## Prueba antes de escalar

Cuando sea posible, crea una prueba pequeña. Un pop-up, catering, mercado local, menú limitado o cocina compartida permite observar ticket promedio, productos más vendidos, tiempos de preparación y comentarios de clientes. Define antes de la prueba qué medirás. Si cambias precios, menú y mensaje al mismo tiempo, no sabrás qué produjo el resultado.

Documenta ventas por producto, desperdicio, horas de trabajo, devoluciones y preguntas frecuentes. Después compara los resultados con tus supuestos. La utilidad de una prueba no está en confirmar que tenías razón; está en mostrar qué debe corregirse antes de asumir una renta, comprar equipo o ampliar el equipo.

## Revisa el punto de equilibrio

Convierte los costos fijos mensuales y el margen de contribución esperado en una meta de ventas. Luego baja esa meta a semanas, días y turnos. Pregunta cuántos tickets exige, cuál tendría que ser el ticket promedio y si el local, la cocina y el mercado pueden soportar ese volumen. Este cálculo no predice el futuro, pero revela rápidamente cuando una expectativa no cabe en la capacidad real del negocio.

Incluye capital de trabajo y contingencia. Permisos, obra, inspecciones y contratación pueden tardar más de lo previsto, y los primeros meses rara vez operan con eficiencia plena. Una reserva no corrige un modelo débil, pero evita que una demora normal se convierta en una crisis de caja.

## Decide con un criterio escrito

Termina el análisis con tres opciones: avanzar, ajustar o detener. Para cada una, anota la evidencia que la activaría. Por ejemplo: avanzar si la prueba alcanza cierto volumen y margen; ajustar si existe demanda pero el tiempo de producción es alto; detener si el precio aceptado por el cliente no cubre los costos. Este criterio protege la decisión frente a la presión emocional y ayuda a explicar el siguiente paso a socios o inversionistas.

${knowledge.offer.promise} No necesitas eliminar toda la incertidumbre. Necesitas identificar los riesgos que puedes medir, probar las suposiciones más costosas y conservar suficiente caja para operar mientras aprendes.

## Siguiente paso

${cta}`;
}
