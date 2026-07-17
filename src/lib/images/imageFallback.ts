import { IMAGE_PLACEMENTS, IMAGE_TEMPLATES } from "./imageTemplates";
import type { ImagePromptInput, ImagePromptRecord, ImageProvider } from "./imageTypes";

export function createImagePromptFallback(input: ImagePromptInput, provider: ImageProvider): ImagePromptRecord {
  const placement = IMAGE_PLACEMENTS[input.publicationType];
  const template = IMAGE_TEMPLATES.Premium;
  const createdAt = new Date().toISOString();
  return {
    id: `visual-fallback-${Date.now()}-${provider}`,
    createdAt,
    provider,
    type: input.publicationType,
    template: "Premium",
    versionId: input.versionId,
    variation: input.variation ?? 1,
    prompt: `Imagen editorial premium sobre ${input.topic}. Composición limpia con espacio para el hook “${input.hook}”. Paleta azul marino, blanco, dorado y terracota. Formato ${placement.dimensions}. ${placement.safeArea}`,
    negativePrompt: "texto ilegible, marcas de agua, stock genérico, diseño saturado, riqueza rápida",
    aspectRatio: placement.aspectRatio,
    style: template.style,
    lighting: template.lighting,
    composition: template.composition,
    safeArea: placement.safeArea
  };
}
