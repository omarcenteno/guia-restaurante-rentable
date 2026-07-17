import { getKnowledgeContext } from "@/lib/knowledge";
import { getSectionBody } from "@/lib/knowledge/brand";
import { createImagePromptFallback } from "./imageFallback";
import { getImageProvider, IMAGE_PROVIDERS } from "./imageProviders";
import { IMAGE_PLACEMENTS, IMAGE_TEMPLATES, selectImageTemplate } from "./imageTemplates";
import type { ImagePromptBrief, ImagePromptInput, ImagePromptRecord, ImageProvider } from "./imageTypes";

const compositionVariations = [
  "foco humano a la izquierda y espacio editorial a la derecha",
  "vista cenital de herramientas operativas con un punto focal claro",
  "primer plano documental con profundidad y contexto al fondo",
  "composición diagonal dinámica con retícula editorial estable"
];

function compactText(value: string, maxLength = 360): string {
  const normalized = value.replace(/^[-\s]+/gm, "").replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength).replace(/\s+\S*$/, "")}…` : normalized;
}

function joinPromptFragments(...values: string[]): string {
  return values
    .map((value) => value.trim().replace(/[.!?…]+$/, ""))
    .filter(Boolean)
    .join(". ");
}

function positiveVisualStyle(value: string): string {
  return compactText(value.split(/La marca nunca debe parecer:|No usar:/i)[0], 280);
}

function visualContext() {
  const knowledge = getKnowledgeContext();
  const palette = getSectionBody("Paleta de Colores").match(/#[0-9A-Fa-f]{6}/g) ?? ["#0E1B2B", "#FFFFFF", "#C7A45A", "#B66A4A"];
  const typography = compactText((getSectionBody("Tipografías") || "Playfair Display para titulares e Inter para texto").split("Usar:")[0], 180);
  const visualStyle = [positiveVisualStyle(getSectionBody("Identidad Visual")), positiveVisualStyle(getSectionBody("Estilo Fotográfico"))].filter(Boolean).join(". ");
  return { knowledge, palette: Array.from(new Set(palette)), typography, visualStyle };
}

export function buildImageBrief(input: ImagePromptInput): ImagePromptBrief {
  const { knowledge, palette, typography, visualStyle } = visualContext();
  const templateName = input.template ?? selectImageTemplate(input.publicationType, input.topic);
  const template = IMAGE_TEMPLATES[templateName] ?? IMAGE_TEMPLATES.Premium;
  const placement = IMAGE_PLACEMENTS[input.publicationType];
  const variation = Math.max(1, input.variation ?? 1);
  return {
    objective: input.objective,
    topic: input.topic,
    hook: input.hook,
    cta: input.cta,
    brand: knowledge.brand.name,
    offer: compactText(joinPromptFragments(knowledge.offer.mainProduct, knowledge.offer.promise), 280),
    audience: compactText(knowledge.buyerPersona.profile.split("Secundario:")[0], 320),
    tone: compactText(knowledge.brand.tone, 260),
    style: joinPromptFragments(template.style, visualStyle),
    composition: `${template.composition}; ${compositionVariations[(variation - 1) % compositionVariations.length]}; variante creativa ${variation}`,
    lighting: template.lighting,
    palette,
    typography,
    elements: template.elements,
    emotion: template.emotion,
    aspectRatio: placement.aspectRatio,
    dimensions: placement.dimensions,
    safeArea: placement.safeArea,
    textSpace: placement.textSpace,
    negativeElements: [...template.negativeElements, ...knowledge.brand.forbiddenWords],
    template: template.name,
    variation
  };
}

function createRecord(input: ImagePromptInput, provider: ImageProvider, brief: ImagePromptBrief): ImagePromptRecord {
  const result = getImageProvider(provider).format(brief);
  return { ...result, id: `visual-${Date.now()}-${brief.variation}-${provider}`, createdAt: new Date().toISOString(), type: input.publicationType, template: brief.template, versionId: input.versionId, variation: brief.variation };
}

export function buildImagePrompts(input: ImagePromptInput): ImagePromptRecord[] {
  try {
    const brief = buildImageBrief(input);
    return IMAGE_PROVIDERS.map(({ id }) => {
      try {
        return createRecord(input, id, brief);
      } catch {
        return createImagePromptFallback(input, id);
      }
    });
  } catch {
    return IMAGE_PROVIDERS.map(({ id }) => createImagePromptFallback(input, id));
  }
}
