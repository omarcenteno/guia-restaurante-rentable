import { buildContext } from "./knowledgeProvider";
import type { BrandContext } from "./types";

export function getBrandContext(): BrandContext {
  const context = buildContext();

  return {
    brandName: context.brand.name,
    voice: context.brand.voice,
    audience: context.buyerPersona.profile,
    offer: context.offer.mainProduct,
    promise: context.offer.promise,
    primaryCta: context.ctas.primary,
    tone: context.brand.tone,
    forbiddenWords: context.brand.forbiddenWords,
    recommendedWords: context.brand.recommendedWords
  };
}
