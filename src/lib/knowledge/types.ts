export interface BrandContext {
  name: string;
  history: string;
  mission: string;
  vision: string;
  values: string[];
  personality: string;
  tone: string;
  voice: string;
  recommendedWords: string[];
  forbiddenWords: string[];
}

export interface Offer {
  mainProduct: string;
  price: string;
  guarantee: string;
  benefits: string[];
  promise: string;
}

export interface Hook {
  text: string;
  category?: string;
  pillar?: string;
  format?: string;
}

export interface CTA {
  text: string;
  type?: "follow" | "sale" | "save" | "comment" | "share" | "authority";
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Prompt {
  name: string;
  purpose: string;
  template: string;
}

export interface Template {
  name: string;
  format?: string;
  structure: string[];
}

export interface Chapter {
  title: string;
  subchapters: string[];
}

export interface AudienceContext {
  profile: string;
  problems: string[];
  desires: string[];
  objections: string[];
  pains: string[];
  transformation: string;
}

export interface EbookContext {
  title: string;
  chapters: Chapter[];
  templates: string[];
  calculators: string[];
}

export interface HooksContext {
  primary: string;
  all: string[];
}

export interface CTAsContext {
  primary: string;
  all: string[];
}

export interface PromptsContext {
  copywritingFrameworks: string[];
  contentTemplates: string[];
}

export interface KnowledgeContext {
  brand: BrandContext;
  offer: Offer;
  buyerPersona: AudienceContext;
  ebook: EbookContext;
  hooks: HooksContext;
  prompts: PromptsContext;
  faq: FAQ[];
  templates: Template[];
  ctas: CTAsContext;
  pillars: string[];
}

export type BrandKnowledge = BrandContext;
export type OfferKnowledge = Offer;
export type AudienceKnowledge = AudienceContext;
export type EbookKnowledge = EbookContext;
export type BookKnowledge = EbookContext;
export type EbookChapter = Chapter;
export type BookChapter = Chapter;
export type HooksKnowledge = HooksContext;
export type CtaKnowledge = CTAsContext;
export type FaqItem = FAQ;
export type PromptKnowledge = PromptsContext;
