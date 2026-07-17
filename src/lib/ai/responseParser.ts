import { AIResponseParseError } from "./errors";
import type {
  CarouselSlide,
  GeneratedAsset,
  GeneratedContent,
  GeneratedPublicationPayload,
  ReelContent,
  StoryFrame
} from "./types";

const storyFrameSchema = {
  type: "object",
  properties: {
    frame: { type: "integer", description: "Número de historia, del 1 al 3." },
    headline: { type: "string", description: "Titular breve de la historia." },
    body: { type: "string", description: "Texto principal de la historia." },
    pollQuestion: { type: "string", description: "Pregunta de encuesta o cadena vacía si no aplica." },
    pollOptions: { type: "array", items: { type: "string" }, maxItems: 2, description: "Dos opciones de encuesta o arreglo vacío." },
    cta: { type: "string", description: "Acción específica o cadena vacía si no aplica." }
  },
  required: ["frame", "headline", "body", "pollQuestion", "pollOptions", "cta"],
  additionalProperties: false
} as const;

const carouselSlideSchema = {
  type: "object",
  properties: {
    slide: { type: "integer", description: "Número consecutivo del slide." },
    title: { type: "string", description: "Título breve del slide." },
    body: { type: "string", description: "Explicación concreta y legible del slide." }
  },
  required: ["slide", "title", "body"],
  additionalProperties: false
} as const;

const reelSchema = {
  type: "object",
  properties: {
    hook: { type: "string", description: "Hook verbal para los primeros tres segundos." },
    script: { type: "string", description: "Guion hablado completo del Reel." },
    onScreenText: { type: "array", items: { type: "string" }, description: "Textos breves que aparecerán en pantalla." },
    bRoll: { type: "array", items: { type: "string" }, description: "Planos de apoyo sugeridos y realizables." },
    cta: { type: "string", description: "Cierre hablado alineado al CTA oficial." }
  },
  required: ["hook", "script", "onScreenText", "bRoll", "cta"],
  additionalProperties: false
} as const;

const generatedPublicationProperties = {
  title: { type: "string", description: "Título breve y específico de la publicación." },
  hook: { type: "string", description: "Apertura que detiene el scroll sin exageraciones." },
  caption: { type: "string", description: "Copy completo listo para editar y publicar." },
  cta: { type: "string", description: "Llamado a la acción tomado del contexto de marca." },
  hashtags: { type: "array", items: { type: "string" }, maxItems: 10, description: "Hasta diez hashtags relevantes, sin repetir." },
  imagePrompt: { type: "string", description: "Prompt editorial para producir una imagen de apoyo." },
  story: { type: "array", items: storyFrameSchema, minItems: 3, maxItems: 3, description: "Tres historias independientes." },
  carousel: { type: "array", items: carouselSlideSchema, minItems: 5, maxItems: 10, description: "Carrusel de cinco a diez slides." },
  reel: reelSchema
} as const;

export const GENERATED_PUBLICATION_JSON_SCHEMA = {
  type: "json_schema",
  name: "grr_generated_publication",
  strict: true,
  schema: {
    type: "object",
    properties: generatedPublicationProperties,
    required: Object.keys(generatedPublicationProperties),
    additionalProperties: false
  }
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AIResponseParseError(`La respuesta no incluye un campo válido: ${field}.`);
  }
  return value.trim();
}

function requireNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new AIResponseParseError(`La respuesta no incluye un campo numérico válido: ${field}.`);
  }
  return value;
}

function stringArray(value: unknown, field: string, allowEmpty = false): string[] {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    throw new AIResponseParseError(`La respuesta no incluye una lista válida: ${field}.`);
  }
  const values = value.map((item, index) => requireString(item, `${field}[${index}]`));
  return Array.from(new Set(values));
}

function parseJsonValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const normalized = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(normalized) as unknown;
  } catch (error) {
    throw new AIResponseParseError("La respuesta de IA no contiene JSON válido.", error);
  }
}

function parseStoryFrame(value: unknown, index: number): StoryFrame {
  if (!isRecord(value)) throw new AIResponseParseError(`La historia ${index + 1} no es válida.`);
  return {
    frame: requireNumber(value.frame, `story[${index}].frame`),
    headline: requireString(value.headline, `story[${index}].headline`),
    body: requireString(value.body, `story[${index}].body`),
    pollQuestion: typeof value.pollQuestion === "string" ? value.pollQuestion.trim() : "",
    pollOptions: stringArray(value.pollOptions, `story[${index}].pollOptions`, true).slice(0, 2),
    cta: typeof value.cta === "string" ? value.cta.trim() : ""
  };
}

function parseCarouselSlide(value: unknown, index: number): CarouselSlide {
  if (!isRecord(value)) throw new AIResponseParseError(`El slide ${index + 1} no es válido.`);
  return {
    slide: requireNumber(value.slide, `carousel[${index}].slide`),
    title: requireString(value.title, `carousel[${index}].title`),
    body: requireString(value.body, `carousel[${index}].body`)
  };
}

function parseReel(value: unknown): ReelContent {
  if (!isRecord(value)) throw new AIResponseParseError("La estructura del Reel no es válida.");
  return {
    hook: requireString(value.hook, "reel.hook"),
    script: requireString(value.script, "reel.script"),
    onScreenText: stringArray(value.onScreenText, "reel.onScreenText"),
    bRoll: stringArray(value.bRoll, "reel.bRoll"),
    cta: requireString(value.cta, "reel.cta")
  };
}

export function parseGeneratedContent(value: unknown): GeneratedContent {
  if (!isRecord(value)) throw new AIResponseParseError("La respuesta de contenido no es un objeto válido.");
  return {
    title: requireString(value.title, "title"),
    hook: requireString(value.hook, "hook"),
    copy: requireString(value.copy, "copy"),
    cta: requireString(value.cta, "cta"),
    hashtags: requireString(value.hashtags, "hashtags"),
    imagePrompt: requireString(value.imagePrompt, "imagePrompt"),
    reelPrompt: requireString(value.reelPrompt, "reelPrompt")
  };
}

export function parseGeneratedAsset(value: unknown): GeneratedAsset {
  if (!isRecord(value)) throw new AIResponseParseError("La respuesta generada no es un objeto válido.");
  const sections = value.sections;
  return {
    title: requireString(value.title, "title"),
    body: requireString(value.body, "body"),
    cta: typeof value.cta === "string" ? value.cta : undefined,
    hashtags: typeof value.hashtags === "string" ? value.hashtags : undefined,
    sections: Array.isArray(sections) && sections.every((section) => typeof section === "string") ? sections : undefined
  };
}

export function parseGeneratedPublication(value: unknown): GeneratedPublicationPayload {
  const parsed = parseJsonValue(value);
  if (!isRecord(parsed)) throw new AIResponseParseError("La respuesta estructurada no es un objeto válido.");
  if (!Array.isArray(parsed.story) || parsed.story.length !== 3) {
    throw new AIResponseParseError("La respuesta debe incluir exactamente tres historias.");
  }
  if (!Array.isArray(parsed.carousel) || parsed.carousel.length < 5 || parsed.carousel.length > 10) {
    throw new AIResponseParseError("La respuesta debe incluir entre cinco y diez slides.");
  }
  const hashtags = stringArray(parsed.hashtags, "hashtags").slice(0, 10);
  return {
    title: requireString(parsed.title, "title"),
    hook: requireString(parsed.hook, "hook"),
    caption: requireString(parsed.caption, "caption"),
    cta: requireString(parsed.cta, "cta"),
    hashtags,
    imagePrompt: requireString(parsed.imagePrompt, "imagePrompt"),
    story: parsed.story.map(parseStoryFrame),
    carousel: parsed.carousel.map(parseCarouselSlide),
    reel: parseReel(parsed.reel)
  };
}

function formatReel(value: ReelContent): string {
  return [
    `Hook: ${value.hook}`,
    `Guion: ${value.script}`,
    `Texto en pantalla:\n${value.onScreenText.map((line) => `- ${line}`).join("\n")}`,
    `B-roll sugerido:\n${value.bRoll.map((shot) => `- ${shot}`).join("\n")}`,
    `CTA: ${value.cta}`
  ].join("\n\n");
}

export function toGeneratedContent(value: GeneratedPublicationPayload): GeneratedContent {
  return {
    title: value.title,
    hook: value.hook,
    copy: value.caption,
    cta: value.cta,
    hashtags: value.hashtags.join(" "),
    imagePrompt: value.imagePrompt,
    reelPrompt: formatReel(value.reel)
  };
}
