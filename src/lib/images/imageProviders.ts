import type { ImagePromptBrief, ImagePromptResult, ImageProvider, ImageProviderAdapter } from "./imageTypes";

function commonResult(provider: ImageProvider, brief: ImagePromptBrief, prompt: string, negativePrompt: string): ImagePromptResult {
  return { provider, prompt, negativePrompt, aspectRatio: brief.aspectRatio, style: brief.style, lighting: brief.lighting, composition: brief.composition, safeArea: brief.safeArea };
}

function negative(brief: ImagePromptBrief): string {
  return Array.from(new Set([...brief.negativeElements, "texto ilegible", "logos inventados", "marcas de agua", "manos deformes", "objetos flotantes", "estética de stock genérico"])).join(", ");
}

const adapters: Record<ImageProvider, ImageProviderAdapter> = {
  "gpt-image": {
    id: "gpt-image",
    label: "GPT Image",
    format: (brief) => commonResult("gpt-image", brief, `Crea una imagen ${brief.style} para ${brief.brand}. Objetivo: ${brief.objective}. Tema: ${brief.topic}. Hook que guiará la idea visual: “${brief.hook}”. Audiencia: ${brief.audience}. Oferta que respalda la pieza: ${brief.offer}. CTA de referencia, sin renderizarlo: “${brief.cta}”. Tono de marca: ${brief.tone}. Composición: ${brief.composition}. Elementos: ${brief.elements.join(", ")}. Iluminación: ${brief.lighting}. Paleta oficial: ${brief.palette.join(", ")}. Emoción: ${brief.emotion}. Formato ${brief.dimensions}, relación ${brief.aspectRatio}. ${brief.safeArea} ${brief.textSpace} Tipografía sugerida si se incorpora texto posteriormente: ${brief.typography}. No renderizar texto pequeño ni cifras inventadas; entregar una base visual profesional editable.`, negative(brief))
  },
  "dall-e": {
    id: "dall-e",
    label: "DALL·E",
    format: (brief) => commonResult("dall-e", brief, `${brief.style}. Escena principal sobre ${brief.topic} para ${brief.brand}, alineada con ${brief.offer} y el CTA “${brief.cta}”. ${brief.composition}. Incluir ${brief.elements.join(", ")}. ${brief.lighting}. Colores dominantes ${brief.palette.join(", ")}. Sensación: ${brief.emotion}. ${brief.dimensions}, ${brief.aspectRatio}. ${brief.safeArea} ${brief.textSpace} Sin texto renderizado; dejar área limpia para titular editorial.`, negative(brief))
  },
  midjourney: {
    id: "midjourney",
    label: "Midjourney",
    format: (brief) => commonResult("midjourney", brief, `${brief.topic}, visual support for ${brief.offer}, ${brief.style}, ${brief.composition}, ${brief.elements.join(", ")}, ${brief.lighting}, palette ${brief.palette.join(" ")}, ${brief.emotion}, editorial commercial photography, clear negative space for headline, safe central framing --ar ${brief.aspectRatio} --stylize 150 --no ${negative(brief)}`, negative(brief))
  },
  flux: {
    id: "flux",
    label: "Flux",
    format: (brief) => commonResult("flux", brief, `[SUBJECT] ${brief.topic}; ${brief.elements.join(", ")}. [PURPOSE] ${brief.objective}; visual concept inspired by “${brief.hook}”; support ${brief.offer}; CTA context “${brief.cta}”. [STYLE] ${brief.style}. [COMPOSITION] ${brief.composition}; ${brief.textSpace}. [LIGHTING] ${brief.lighting}. [COLOR] ${brief.palette.join(", ")}. [MOOD] ${brief.emotion}. [FORMAT] ${brief.dimensions}, ${brief.aspectRatio}. [SAFE AREA] ${brief.safeArea}. [QUALITY] realistic materials, coherent anatomy, professional editorial finish.`, negative(brief))
  },
  ideogram: {
    id: "ideogram",
    label: "Ideogram",
    format: (brief) => commonResult("ideogram", brief, `Diseño editorial ${brief.style} para ${brief.topic}, alineado con la oferta ${brief.offer} y el CTA “${brief.cta}”. Composición: ${brief.composition}. Visuales: ${brief.elements.join(", ")}. Iluminación: ${brief.lighting}. Paleta: ${brief.palette.join(", ")}. Reservar espacio limpio y legible para el titular exacto “${brief.hook}”, máximo 10 a 14 palabras visibles, tipografía ${brief.typography}, jerarquía alta y ortografía precisa. ${brief.dimensions}, relación ${brief.aspectRatio}. ${brief.safeArea} Emoción: ${brief.emotion}.`, negative(brief))
  }
};

export const IMAGE_PROVIDERS = Object.values(adapters);

export function getImageProvider(provider: ImageProvider): ImageProviderAdapter {
  return adapters[provider];
}
