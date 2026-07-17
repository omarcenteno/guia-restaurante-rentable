import type { KnowledgeContext } from "@/lib/knowledge";
import { estimateTokens } from "./tokenCounter";
import type { GenerationRequest, PromptContext, PromptResult } from "./types";

export function buildPrompt(context: KnowledgeContext, request: GenerationRequest): PromptResult {
  const language = request.language?.trim() || "español latino para Estados Unidos";
  const tone = context.brand.tone;
  const audience = context.buyerPersona.profile;
  const objective = request.goal?.trim() || request.objective?.trim() || request.publication?.objective || "Autoridad";
  const hook = request.hook?.trim() || request.publication?.hook || context.hooks.primary;
  const length = request.length || "medium";
  const topic = request.topic || request.publication?.topic || request.publication?.title || "Rentabilidad de restaurantes independientes";
  const platform = request.platform?.trim() || (request.type === "email" ? "Email" : request.type === "blog" ? "Blog web" : "Instagram");
  const selectedCta = request.publication?.cta || context.ctas.primary;
  const formatInstructions: Record<string, string> = {
    reel: "El Reel dura de 20 a 45 segundos. reel debe incluir hook, guion hablado, textos breves en pantalla, B-roll realizable y CTA.",
    carousel: "El carrusel debe tener de 5 a 8 slides: portada, problema, explicación, solución práctica y CTA. Cada slide comunica una sola idea.",
    story: "story debe contener exactamente 3 historias independientes. Incluye una encuesta de dos opciones cuando aporte interacción real.",
    email: "Escribe un email consultivo: title funciona como asunto, hook como apertura y caption como cuerpo completo con CTA final.",
    blog: "caption debe ser un artículo de 600 a 1000 palabras, con subtítulos claros, SEO básico natural, ejemplos útiles y CTA final.",
    "lead-magnet": "Crea un lead magnet accionable: título específico, promesa creíble, pasos o checklist aplicable y CTA final.",
    post: "Crea un post educativo con una idea central, explicación concreta, ejemplo operativo y CTA.",
    "instagram-post": "Crea un post educativo con una idea central, explicación concreta, ejemplo operativo y CTA.",
    cta: "El foco principal es un CTA natural, específico y coherente con la intención de compra.",
    landing: "caption debe estructurar una landing: problema, solución, beneficios, oferta, objeciones, garantía y CTA."
  };
  const system = [
    `Actúa como consultor senior de restaurantes y estratega de contenido de ${context.brand.name}.`,
    "Tienes experiencia práctica en apertura de restaurantes independientes en Estados Unidos, administración, food cost, labor cost, ingeniería de menú, permisos, marketing, rentabilidad, operaciones y experiencia del cliente.",
    "Escribe para emprendedores y operadores latinos. Usa criterio de negocio, ejemplos concretos y vocabulario natural; evita contenido genérico.",
    `Voz: ${context.brand.voice}`,
    `Tono: ${tone}`,
    `Personalidad y estilo: ${context.brand.personality}`,
    `Audiencia: ${audience}`,
    `Oferta: ${context.offer.mainProduct} · ${context.offer.price} · Garantía ${context.offer.guarantee}`,
    `Promesa: ${context.offer.promise}`,
    `Idioma de salida: ${language}`,
    `Palabras recomendadas: ${context.brand.recommendedWords.join(", ")}`,
    `Palabras prohibidas: ${context.brand.forbiddenWords.join(", ")}`,
    "El copy debe sonar humano, latino, claro, persuasivo y profesional. Vende mediante claridad y utilidad, sin presión ni exageración.",
    "Evita clichés y frases reconocibles de IA como: en el mundo actual, lleva tu negocio al siguiente nivel, descubre el secreto, no te pierdas, revoluciona y transforma tu vida.",
    "No inventes cifras, leyes, testimonios ni garantías. Cuando un requisito dependa del estado, condado o ciudad, indícalo con precisión.",
    `Usa este CTA oficial, sin sustituirlo por uno genérico: ${selectedCta}`,
    "Responde únicamente con un objeto JSON que cumpla el esquema solicitado, sin Markdown ni comentarios adicionales."
  ].join("\n");
  const user = [
    `Tipo de contenido: ${request.type}`,
    `Plataforma: ${platform}`,
    `Tema: ${topic}`,
    `Objetivo: ${objective}`,
    `Pilar: ${request.pillar || request.publication?.pillar || context.pillars[0]}`,
    `Hook de referencia: ${hook}`,
    `Longitud: ${length}`,
    `CTA obligatorio: ${selectedCta}`,
    formatInstructions[request.type] || formatInstructions["instagram-post"],
    request.regenerate ? "Esta es una regeneración: cambia el ángulo, la estructura y la redacción. No reutilices el texto de una generación anterior." : "",
    request.variationId ? `Identificador único de variación: ${request.variationId}` : "",
    request.instructions ? `Instrucciones adicionales: ${request.instructions}` : "",
    `Frameworks disponibles: ${context.prompts.copywritingFrameworks.join(" | ")}`,
    "Devuelve contenido específico, útil y listo para editar. Los hashtags deben ser relevantes, únicos y un máximo de 10.",
    "Completa siempre todas las propiedades: title, hook, caption, cta, hashtags, imagePrompt, story, carousel y reel.",
    "Aunque el formato principal sea uno solo, entrega también adaptaciones útiles en story, carousel y reel.",
    "story es un arreglo de exactamente 3 objetos. carousel es un arreglo de 5 a 10 slides. reel es un objeto estructurado."
  ].filter(Boolean).join("\n");
  const prompt = `${system}\n\n--- SOLICITUD ---\n${user}`;
  return { system, user, prompt, estimatedTokens: estimateTokens(prompt) };
}

function promptBase(context: PromptContext) {
  return [
    `Marca: ${context.brandName}`,
    `Publicación: ${context.publication.title}`,
    `Formato: ${context.publication.format}`,
    `Pilar: ${context.publication.pillar}`,
    `Objetivo: ${context.publication.objective}`,
    `Audiencia: ${context.audience}`,
    `Oferta: ${context.offer}`,
    `Promesa: ${context.promise}`,
    `Voz: ${context.voice}`,
    `Tono: ${context.tone}`,
    `Hook de referencia: ${context.primaryHook}`,
    `CTA seleccionado: ${context.selectedCta}`,
    `Frameworks disponibles: ${context.frameworks.join(" | ")}`,
    `Evitar: ${context.forbiddenWords.join(", ")}`,
    `Preferir: ${context.recommendedWords.join(", ")}`
  ].join("\n");
}

export function buildHookPrompt(context: PromptContext) {
  return `${promptBase(context)}\n\nCrea un hook claro, específico y creíble que detenga el scroll. Devuelve únicamente el hook.`;
}

export function buildCopyPrompt(context: PromptContext) {
  return `${promptBase(context)}\n\nEscribe el copy de Instagram. Enseña una idea práctica, usa párrafos breves y evita promesas exageradas.`;
}

export function buildCtaPrompt(context: PromptContext) {
  return `${promptBase(context)}\n\nUsa un CTA coherente con el objetivo. Devuelve únicamente el CTA.`;
}

export function buildHashtagsPrompt(context: PromptContext) {
  return `${promptBase(context)}\n\nGenera entre 5 y 8 hashtags relevantes para hispanos que operan o quieren abrir restaurantes en Estados Unidos.`;
}

export function buildImagePrompt(context: PromptContext) {
  return `${promptBase(context)}\n\nCrea un prompt visual editorial para una imagen de Instagram. Debe sentirse premium, realista y sobria.`;
}

export function buildReelPrompt(context: PromptContext) {
  return `${promptBase(context)}\n\nCrea un prompt de producción para un Reel de 20 a 45 segundos: apertura, escenas, texto en pantalla, ritmo y cierre.`;
}

export function buildPublicationPrompt(context: PromptContext) {
  return [
    "Genera una publicación completa de Instagram utilizando únicamente el contexto de marca proporcionado.",
    buildHookPrompt(context),
    buildCopyPrompt(context),
    buildCtaPrompt(context),
    buildHashtagsPrompt(context),
    buildImagePrompt(context),
    buildReelPrompt(context),
    "Devuelve: título, hook, copy, CTA, hashtags, prompt de imagen y prompt de Reel."
  ].join("\n\n---\n\n");
}
