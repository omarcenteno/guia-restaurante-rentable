import type { KnowledgeContext } from "@/lib/knowledge";
import { AIModelError, normalizeAIError } from "./errors";
import { recordGeneration } from "./generationHistory";
import { buildContext } from "./knowledgeProvider";
import { createMockResponse } from "./mockResponses";
import { DEFAULT_AI_MODEL_ID, getAIModel } from "./models";
import { buildPrompt } from "./promptBuilder";
import { parseGeneratedAsset, parseGeneratedContent } from "./responseParser";
import { estimateTokenUsage } from "./tokenCounter";
import type { GeneratedAsset, GeneratedContent, GenerationRequest, GenerationResponse, GenerationType, PromptResult, Publication } from "./types";

export type GenerationOptions = Omit<GenerationRequest, "type">;

let generationSequence = 0;

function createGenerationId() {
  generationSequence += 1;
  return `ai-${Date.now()}-${generationSequence}`;
}

function resolvePublication(request: GenerationRequest): Publication {
  if (request.publication) return request.publication;
  return {
    id: `AI-${Date.now()}`,
    number: 1,
    title: request.topic || "Contenido para un restaurante rentable",
    format: request.type,
    pillar: request.pillar || "Antes de abrir",
    objective: request.objective || "Autoridad",
    topic: request.topic || "Gestión restaurantera"
  };
}

function createMockAsset(request: GenerationRequest, context: KnowledgeContext): GeneratedAsset {
  const title = request.topic || request.publication?.title || `Contenido ${request.type}`;
  const cta = request.publication?.cta || context.ctas.primary;
  const body = `Contenido simulado de tipo ${request.type} para ${context.brand.name}. Tema: ${title}. Objetivo: ${request.objective || request.publication?.objective || "Autoridad"}.`;
  const sections = request.type === "carousel"
    ? ["Portada", "Problema", "Idea principal", "Aplicación", "CTA"]
    : request.type === "landing"
      ? ["Hero", "Problema", "Beneficios", "Oferta", "FAQ", "CTA"]
      : request.type === "email"
        ? ["Asunto", "Apertura", "Contenido", "CTA"]
        : undefined;
  return { title, body, cta, sections };
}

async function executeGeneration<TOutput>(
  request: GenerationRequest,
  factory: (context: KnowledgeContext) => unknown,
  parser: (value: unknown) => TOutput
): Promise<GenerationResponse<TOutput>> {
  const id = createGenerationId();
  const startedAt = Date.now();
  const createdAt = new Date().toISOString();
  const modelId = request.modelId || DEFAULT_AI_MODEL_ID;
  let promptResult: PromptResult | undefined;

  try {
    const model = getAIModel(modelId);
    if (!model) throw new AIModelError(`No existe el modelo ${modelId}.`, "MODEL_NOT_FOUND");
    if (!model.enabled) throw new AIModelError(`El modelo ${modelId} no está habilitado.`, "MODEL_DISABLED");

    const context = buildContext();
    promptResult = buildPrompt(context, request);
    const output = parser(factory(context));
    const durationMs = Date.now() - startedAt;
    const usage = estimateTokenUsage(promptResult.prompt, JSON.stringify(output));
    recordGeneration({ id, date: createdAt, type: request.type, prompt: promptResult.prompt, model: model.id, durationMs, estimatedTokens: usage.totalTokens, status: "success" });
    return { id, type: request.type, output, prompt: promptResult, model, usage, durationMs, status: "success", createdAt };
  } catch (error) {
    const normalized = normalizeAIError(error);
    recordGeneration({ id, date: createdAt, type: request.type, prompt: promptResult?.prompt ?? "", model: modelId, durationMs: Date.now() - startedAt, estimatedTokens: promptResult?.estimatedTokens ?? 0, status: "error", error: normalized.message });
    throw normalized;
  }
}

function generateAsset(type: GenerationType, options: GenerationOptions = {}) {
  const request: GenerationRequest = { ...options, type };
  return executeGeneration(request, (context) => createMockAsset(request, context), parseGeneratedAsset);
}

export function generateInstagramPost(options: GenerationOptions = {}): Promise<GenerationResponse<GeneratedContent>> {
  const request: GenerationRequest = { ...options, type: "instagram-post" };
  return executeGeneration(request, (context) => createMockResponse(resolvePublication(request), context), parseGeneratedContent);
}

export function generateCarousel(options: GenerationOptions = {}) { return generateAsset("carousel", options); }
export function generateReel(options: GenerationOptions = {}) { return generateAsset("reel", options); }
export function generateStory(options: GenerationOptions = {}) { return generateAsset("story", options); }
export function generateCTA(options: GenerationOptions = {}) { return generateAsset("cta", options); }
export function generateEmail(options: GenerationOptions = {}) { return generateAsset("email", options); }
export function generateLanding(options: GenerationOptions = {}) { return generateAsset("landing", options); }

export const aiClient = { generateInstagramPost, generateCarousel, generateReel, generateStory, generateCTA, generateEmail, generateLanding };
