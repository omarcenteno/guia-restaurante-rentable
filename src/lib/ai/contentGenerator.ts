import type { KnowledgeContext } from "@/lib/knowledge";
import { initialProductionItems } from "@/lib/productionData";
import { createGenerationFallback } from "./fallback";
import { buildContext } from "./knowledgeProvider";
import { selectCta } from "./mockResponses";
import { buildPublicationPrompt } from "./promptBuilder";
import { parseGeneratedContent, parseGeneratedPublication, toGeneratedContent } from "./responseParser";
import { estimateTokenUsage } from "./tokenCounter";
import type { AIGenerationApiResponse, AIGenerationMeta, GeneratedContent, GeneratedPublicationPayload, GenerationType, PromptContext, Publication } from "./types";

export interface PublicationGenerationContext {
  knowledge: KnowledgeContext;
  promptContext: PromptContext;
  prompt: string;
}

function normalizePublicationId(publicationId: string) {
  const match = publicationId.match(/(\d+)$/);
  return match ? `PROD-${match[1].padStart(3, "0")}` : publicationId.toUpperCase();
}

function findPublication(publicationId: string): Publication | undefined {
  const id = normalizePublicationId(publicationId);
  const item = initialProductionItems.find((publication) => publication.id === id);
  if (!item) return undefined;
  return {
    id: item.id,
    number: item.numero,
    title: item.titulo,
    format: item.formato,
    pillar: item.pilar,
    objective: item.objetivo,
    topic: item.tema,
    hook: item.hook,
    cta: item.cta
  };
}

function generationTypeFor(publication: Publication): GenerationType {
  const format = publication.format.trim().toLowerCase();
  if (format.includes("reel")) return "reel";
  if (format.includes("carrusel") || format.includes("carousel")) return "carousel";
  if (format.includes("stor")) return "story";
  if (format.includes("email")) return "email";
  if (format.includes("blog")) return "blog";
  if (format.includes("lead")) return "lead-magnet";
  return "post";
}

function platformFor(type: GenerationType): string {
  if (type === "email") return "Email";
  if (type === "blog") return "Blog web";
  if (type === "lead-magnet") return "Lead magnet descargable";
  return "Instagram";
}

function createClientRequestId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  return `generation-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getPublicationGenerationContext(publication: Publication): PublicationGenerationContext {
  const knowledge = buildContext();
  const promptContext: PromptContext = {
    publication,
    brandName: knowledge.brand.name,
    voice: knowledge.brand.voice,
    tone: knowledge.brand.tone,
    audience: knowledge.buyerPersona.profile,
    offer: `${knowledge.offer.mainProduct} · ${knowledge.offer.price} · Garantía ${knowledge.offer.guarantee}`,
    promise: knowledge.offer.promise,
    primaryHook: publication.hook || knowledge.hooks.primary,
    selectedCta: publication.cta || selectCta(publication.objective, knowledge),
    forbiddenWords: knowledge.brand.forbiddenWords,
    recommendedWords: knowledge.brand.recommendedWords,
    frameworks: knowledge.prompts.copywritingFrameworks
  };
  return { knowledge, promptContext, prompt: buildPublicationPrompt(promptContext) };
}

export interface PublicationGenerationOptions {
  regenerate?: boolean;
  workspaceId?: string;
}

export interface PublicationGenerationResult extends GeneratedContent {
  generated: GeneratedPublicationPayload;
  meta: AIGenerationMeta;
  type: GenerationType;
}

const CLIENT_REQUEST_TIMEOUT_MS = 60000;
let activeGenerationController: AbortController | null = null;

function developmentLog(message: string, details: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") console.info(`[GRR AI][frontend] ${message}`, details);
}

function developmentError(message: string, details: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") console.error(`[GRR AI][frontend] ${message}`, details);
}

export function cancelPublicationGeneration(): void {
  activeGenerationController?.abort();
  activeGenerationController = null;
}

export async function generatePublication(
  publicationId: string,
  currentPublication?: Publication,
  options: PublicationGenerationOptions = {}
): Promise<PublicationGenerationResult> {
  const publication = currentPublication ?? findPublication(publicationId);
  if (!publication) throw new Error(`No existe información para ${publicationId}.`);
  const knowledge = buildContext();
  const type = generationTypeFor(publication);
  cancelPublicationGeneration();
  const controller = new AbortController();
  activeGenerationController = controller;
  const variationId = createClientRequestId();
  const startedAt = Date.now();
  let timedOut = false;
  let outcome = "pending";
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, CLIENT_REQUEST_TIMEOUT_MS);
  developmentLog("Petición iniciada", { publicationId, type, variationId, regenerate: options.regenerate === true });
  try {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        workspaceId: options.workspaceId,
        publication,
        hook: publication.hook,
        topic: publication.topic,
        goal: publication.objective,
        language: "español",
        platform: platformFor(type),
        length: type === "blog" ? "long" : "medium",
        regenerate: options.regenerate === true,
        variationId
      }),
      signal: controller.signal
    });
    const responseText = await response.text();
    let payload: AIGenerationApiResponse;
    try {
      payload = JSON.parse(responseText) as AIGenerationApiResponse;
    } catch (error) {
      throw new Error("La API interna de IA devolvió una respuesta inválida.", { cause: error });
    }
    developmentLog("JSON recibido", { variationId, status: response.status, payload });
    if (!response.ok) {
      const apiError = payload as unknown as { error?: { message?: string } };
      throw new Error(apiError.error?.message || "La API interna de IA no respondió correctamente.");
    }
    const generated = parseGeneratedPublication(payload.generated);
    outcome = payload.meta.fallbackUsed ? "fallback" : "success";
    developmentLog("JSON procesado", { variationId, requestId: payload.meta.requestId, provider: payload.meta.provider, model: payload.meta.model });
    return { ...parseGeneratedContent(payload.content), generated, meta: payload.meta, type };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError" && !timedOut) {
      outcome = "cancelled";
      throw error;
    }
    outcome = "fallback";
    developmentError("Se utilizó el fallback local", {
      variationId,
      timedOut,
      error: error instanceof Error ? error.message : "Error desconocido"
    });
    const generated = createGenerationFallback({ type, publication }, knowledge);
    const content = toGeneratedContent(generated);
    const usage = estimateTokenUsage("", JSON.stringify(generated));
    return {
      ...content,
      generated,
      type,
      meta: {
        requestId: createClientRequestId(),
        provider: "mock",
        model: "grr-fallback-v1",
        usage,
        durationMs: 0,
        fallbackUsed: true
      }
    };
  } finally {
    clearTimeout(timeout);
    if (activeGenerationController === controller) activeGenerationController = null;
    developmentLog("Petición finalizada", { variationId, outcome, durationMs: Date.now() - startedAt });
  }
}
