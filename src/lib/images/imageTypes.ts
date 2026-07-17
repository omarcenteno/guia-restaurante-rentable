export type ImageProvider = "gpt-image" | "dall-e" | "midjourney" | "flux" | "ideogram";

export type ImageContentType =
  | "instagram-post"
  | "carousel"
  | "story"
  | "reel-cover"
  | "thumbnail"
  | "lead-magnet"
  | "ebook-mockup"
  | "banner"
  | "ad";

export type ImageTemplateName = "Premium" | "Minimalista" | "Corporativo" | "Restaurante" | "Finanzas" | "Tecnología" | "Educación";

export interface ImageTemplate {
  name: ImageTemplateName;
  style: string;
  composition: string;
  lighting: string;
  elements: string[];
  emotion: string;
  negativeElements: string[];
}

export interface ImagePromptInput {
  topic: string;
  hook: string;
  publicationType: ImageContentType;
  cta: string;
  objective: string;
  versionId: string;
  template?: ImageTemplateName;
  variation?: number;
}

export interface ImagePromptBrief {
  objective: string;
  topic: string;
  hook: string;
  cta: string;
  brand: string;
  offer: string;
  audience: string;
  tone: string;
  style: string;
  composition: string;
  lighting: string;
  palette: string[];
  typography: string;
  elements: string[];
  emotion: string;
  aspectRatio: string;
  dimensions: string;
  safeArea: string;
  textSpace: string;
  negativeElements: string[];
  template: ImageTemplateName;
  variation: number;
}

export interface ImagePromptResult {
  provider: ImageProvider;
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
  style: string;
  lighting: string;
  composition: string;
  safeArea: string;
}

export interface ImagePromptRecord extends ImagePromptResult {
  id: string;
  createdAt: string;
  type: ImageContentType;
  template: ImageTemplateName;
  versionId: string;
  variation: number;
}

export interface ImageProviderAdapter {
  id: ImageProvider;
  label: string;
  format: (brief: ImagePromptBrief) => ImagePromptResult;
}
