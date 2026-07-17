export interface Publication {
  id: string;
  number: number;
  title: string;
  format: string;
  pillar: string;
  objective: string;
  topic: string;
  hook?: string;
  cta?: string;
}

export interface BrandContext {
  brandName: string;
  voice: string;
  audience: string;
  offer: string;
  promise: string;
  primaryCta: string;
  tone: string;
  forbiddenWords: string[];
  recommendedWords: string[];
}

export interface GeneratedContent {
  title: string;
  hook: string;
  copy: string;
  cta: string;
  hashtags: string;
  imagePrompt: string;
  reelPrompt: string;
}

export type AIProvider = "mock" | "openai" | "anthropic" | "google";
export type GenerationType =
  | "instagram-post"
  | "post"
  | "carousel"
  | "reel"
  | "story"
  | "cta"
  | "email"
  | "blog"
  | "lead-magnet"
  | "landing";
export type GenerationStatus = "success" | "error";
export type ContentLength = "short" | "medium" | "long";

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow: number;
  maxOutputTokens: number;
  enabled: boolean;
}

export interface GenerationRequest {
  type: GenerationType;
  publication?: Publication;
  brand?: string;
  hook?: string;
  topic?: string;
  goal?: string;
  objective?: string;
  pillar?: string;
  audience?: string;
  language?: string;
  platform?: string;
  tone?: string;
  length?: ContentLength;
  temperature?: number;
  instructions?: string;
  modelId?: string;
  regenerate?: boolean;
  variationId?: string;
}

export interface PromptResult {
  system: string;
  user: string;
  prompt: string;
  estimatedTokens: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimated: boolean;
}

export interface GeneratedAsset {
  title: string;
  body: string;
  cta?: string;
  hashtags?: string;
  sections?: string[];
}

export interface GenerationResponse<TOutput = GeneratedAsset> {
  id: string;
  type: GenerationType;
  output: TOutput;
  prompt: PromptResult;
  model: AIModel;
  usage: TokenUsage;
  durationMs: number;
  status: GenerationStatus;
  createdAt: string;
}

export interface GenerationHistoryItem {
  id: string;
  date: string;
  type: GenerationType;
  prompt: string;
  model: string;
  provider?: AIProvider;
  durationMs: number;
  estimatedTokens: number;
  inputTokens?: number;
  outputTokens?: number;
  fallbackUsed?: boolean;
  topic?: string;
  result?: GeneratedPublicationPayload;
  status: GenerationStatus;
  error?: string;
}

export interface StoryFrame {
  frame: number;
  headline: string;
  body: string;
  pollQuestion: string;
  pollOptions: string[];
  cta: string;
}

export interface CarouselSlide {
  slide: number;
  title: string;
  body: string;
}

export interface ReelContent {
  hook: string;
  script: string;
  onScreenText: string[];
  bRoll: string[];
  cta: string;
}

export interface GeneratedPublicationPayload {
  title: string;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
  imagePrompt: string;
  story: StoryFrame[];
  carousel: CarouselSlide[];
  reel: ReelContent;
}

export interface AIGenerationApiRequest {
  type: GenerationType;
  publication?: Publication;
  brand?: string;
  hook?: string;
  topic?: string;
  goal?: string;
  audience?: string;
  language?: string;
  platform?: string;
  tone?: string;
  length?: ContentLength;
  temperature?: number;
  regenerate?: boolean;
  variationId?: string;
}

export interface AIGenerationMeta {
  requestId: string;
  provider: AIProvider;
  model: string;
  usage: TokenUsage;
  durationMs: number;
  fallbackUsed: boolean;
}

export interface AIGenerationApiResponse {
  content: GeneratedContent;
  generated: GeneratedPublicationPayload;
  meta: AIGenerationMeta;
}

export interface AIProviderRequest {
  model: string;
  prompt: PromptResult;
  temperature?: number;
  timeoutMs: number;
  maxRetries: number;
  signal?: AbortSignal;
}

export interface AIProviderResult {
  rawContent: unknown;
  model: string;
  usage: TokenUsage;
}

export interface AIProviderClient {
  readonly id: Exclude<AIProvider, "mock">;
  generate(request: AIProviderRequest): Promise<AIProviderResult>;
}

export interface PromptContext {
  publication: Publication;
  brandName: string;
  voice: string;
  tone: string;
  audience: string;
  offer: string;
  promise: string;
  primaryHook: string;
  selectedCta: string;
  forbiddenWords: string[];
  recommendedWords: string[];
  frameworks: string[];
}
