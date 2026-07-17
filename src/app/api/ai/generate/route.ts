import { NextResponse } from "next/server";
import { AIError, AIResponseParseError, AIValidationError, normalizeAIError } from "@/lib/ai/errors";
import { createGenerationFallback } from "@/lib/ai/fallback";
import { recordGeneration } from "@/lib/ai/generationHistory";
import { buildContext } from "@/lib/ai/knowledgeProvider";
import { buildPrompt } from "@/lib/ai/promptBuilder";
import { getAIProvider } from "@/lib/ai/providerRegistry";
import { parseGeneratedPublication, toGeneratedContent } from "@/lib/ai/responseParser";
import { estimateTokenUsage } from "@/lib/ai/tokenCounter";
import type { AIProvider, AIGenerationApiRequest, AIGenerationApiResponse, ContentLength, GeneratedPublicationPayload, GenerationRequest, GenerationType, Publication, TokenUsage } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const generationTypes: readonly GenerationType[] = ["instagram-post", "post", "carousel", "reel", "story", "cta", "email", "blog", "lead-magnet", "landing"];
const contentLengths: readonly ContentLength[] = ["short", "medium", "long"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredString(value: unknown, field: string, maxLength = 500): string {
  if (typeof value !== "string" || !value.trim()) throw new AIValidationError(`El campo ${field} es obligatorio.`);
  if (value.length > maxLength) throw new AIValidationError(`El campo ${field} es demasiado largo.`);
  return value.trim();
}

function optionalString(value: unknown, field: string, maxLength = 4000): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new AIValidationError(`El campo ${field} no es válido.`);
  if (value.length > maxLength) throw new AIValidationError(`El campo ${field} es demasiado largo.`);
  return value.trim() || undefined;
}

function parsePublication(value: unknown): Publication | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) throw new AIValidationError("La publicación no es válida.");
  const number = typeof value.number === "number" && Number.isFinite(value.number) ? value.number : 1;
  return {
    id: requiredString(value.id, "publication.id", 100),
    number,
    title: requiredString(value.title, "publication.title"),
    format: requiredString(value.format, "publication.format", 100),
    pillar: requiredString(value.pillar, "publication.pillar", 100),
    objective: requiredString(value.objective, "publication.objective", 100),
    topic: requiredString(value.topic, "publication.topic"),
    hook: optionalString(value.hook, "publication.hook"),
    cta: optionalString(value.cta, "publication.cta")
  };
}

function parseApiRequest(value: unknown): GenerationRequest {
  if (!isRecord(value)) throw new AIValidationError("La solicitud de generación no es válida.");
  if (typeof value.type !== "string" || !generationTypes.includes(value.type as GenerationType)) {
    throw new AIValidationError("El tipo de generación no es válido.");
  }
  const publication = parsePublication(value.publication);
  const topic = optionalString(value.topic, "topic");
  if (!publication && !topic) throw new AIValidationError("Debes indicar un tema o una publicación.");

  let length: ContentLength | undefined;
  if (value.length !== undefined) {
    if (typeof value.length !== "string" || !contentLengths.includes(value.length as ContentLength)) {
      throw new AIValidationError("La longitud solicitada no es válida.");
    }
    length = value.length as ContentLength;
  }

  let temperature: number | undefined;
  if (value.temperature !== undefined) {
    if (typeof value.temperature !== "number" || !Number.isFinite(value.temperature) || value.temperature < 0 || value.temperature > 2) {
      throw new AIValidationError("La temperatura debe estar entre 0 y 2.");
    }
    temperature = value.temperature;
  }

  if (value.regenerate !== undefined && typeof value.regenerate !== "boolean") {
    throw new AIValidationError("El indicador de regeneración no es válido.");
  }

  return {
    type: value.type as GenerationType,
    publication,
    brand: optionalString(value.brand, "brand", 200),
    hook: optionalString(value.hook, "hook"),
    topic,
    goal: optionalString(value.goal, "goal", 200),
    objective: optionalString(value.goal, "goal", 200),
    audience: optionalString(value.audience, "audience"),
    language: optionalString(value.language, "language", 100),
    platform: optionalString(value.platform, "platform", 100),
    tone: optionalString(value.tone, "tone", 500),
    length,
    temperature,
    regenerate: value.regenerate === true,
    variationId: optionalString(value.variationId, "variationId", 100)
  };
}

function enforceFormatRequirements(generated: GeneratedPublicationPayload, type: GenerationType): GeneratedPublicationPayload {
  if (type === "blog") {
    const wordCount = generated.caption.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 600 || wordCount > 1000) {
      throw new AIResponseParseError("El artículo debe contener entre 600 y 1000 palabras.");
    }
  }
  return generated;
}

function environmentNumber(name: string, fallback: number, minimum: number, maximum: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;
}

function developmentLog(requestId: string, error: AIError) {
  if (process.env.NODE_ENV !== "development" || error.code === "PROVIDER_NOT_CONNECTED") return;
  console.error("[GRR AI] Se utilizó el fallback.", { requestId, code: error.code, message: error.message });
}

function developmentInfo(message: string, details: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") console.info(`[GRR AI][route] ${message}`, details);
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  developmentInfo("Petición recibida", { requestId });

  try {
    const body = await request.json().catch(() => null) as AIGenerationApiRequest | null;
    const generationRequest = parseApiRequest(body);
    developmentInfo("Petición validada", {
      requestId,
      type: generationRequest.type,
      topic: generationRequest.topic || generationRequest.publication?.topic,
      regenerate: generationRequest.regenerate === true,
      variationId: generationRequest.variationId
    });
    const knowledge = buildContext();
    const prompt = buildPrompt(knowledge, generationRequest);
    const configuredProvider = (process.env.AI_PROVIDER?.trim() || "openai") as AIProvider;
    const requestedModel = process.env.OPENAI_MODEL?.trim() || "gpt-5.5";
    const configuredTemperature = process.env.OPENAI_TEMPERATURE === undefined
      ? undefined
      : environmentNumber("OPENAI_TEMPERATURE", 1, 0, 2);
    let provider: AIProvider = configuredProvider;
    let model = requestedModel;
    let usage: TokenUsage | undefined;
    let fallbackUsed = false;
    let providerError: AIError | undefined;
    let generated: GeneratedPublicationPayload;

    try {
      const client = getAIProvider(configuredProvider);
      const result = await client.generate({
        model: requestedModel,
        prompt,
        temperature: generationRequest.temperature ?? configuredTemperature,
        timeoutMs: environmentNumber("OPENAI_TIMEOUT_MS", 45000, 1000, 120000),
        maxRetries: environmentNumber("OPENAI_MAX_RETRIES", 2, 0, 3),
        signal: request.signal
      });
      usage = result.usage;
      model = result.model;
      provider = client.id;
      generated = enforceFormatRequirements(parseGeneratedPublication(result.rawContent), generationRequest.type);
      developmentInfo("Proveedor procesado", { requestId, provider, model, usage, generatedKeys: Object.keys(generated) });
    } catch (error) {
      providerError = normalizeAIError(error);
      if (request.signal.aborted) throw providerError;
      developmentLog(requestId, providerError);
      generated = createGenerationFallback(generationRequest, knowledge);
      fallbackUsed = true;
      provider = "mock";
      model = "grr-fallback-v1";
      usage ??= estimateTokenUsage(prompt.prompt, JSON.stringify(generated));
    }

    const officialCta = generationRequest.publication?.cta || knowledge.ctas.primary;
    generated = {
      ...generated,
      cta: officialCta,
      reel: { ...generated.reel, cta: officialCta }
    };

    const durationMs = Date.now() - startedAt;
    const finalUsage = usage ?? estimateTokenUsage(prompt.prompt, JSON.stringify(generated));
    recordGeneration({
      id: requestId,
      date: new Date().toISOString(),
      type: generationRequest.type,
      prompt: prompt.prompt,
      model,
      provider,
      durationMs,
      estimatedTokens: finalUsage.totalTokens,
      inputTokens: finalUsage.promptTokens,
      outputTokens: finalUsage.completionTokens,
      fallbackUsed,
      topic: generationRequest.topic || generationRequest.publication?.topic,
      result: generated,
      status: "success",
      error: providerError?.message
    });

    const response: AIGenerationApiResponse = {
      content: toGeneratedContent(generated),
      generated,
      meta: { requestId, provider, model, usage: finalUsage, durationMs, fallbackUsed }
    };
    developmentInfo("Respuesta enviada al frontend", { requestId, status: 200, response, durationMs });
    return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const normalized = normalizeAIError(error);
    const isValidationError = normalized instanceof AIValidationError;
    if (process.env.NODE_ENV === "development" && !isValidationError) {
      console.error("[GRR AI] Error interno.", { requestId, code: normalized.code, message: normalized.message });
    }
    return NextResponse.json(
      { error: { code: normalized.code, message: isValidationError ? normalized.message : "No fue posible generar el contenido. Intenta nuevamente." } },
      { status: isValidationError ? 400 : 500, headers: { "Cache-Control": "no-store" } }
    );
  } finally {
    developmentInfo("Petición finalizada", { requestId, durationMs: Date.now() - startedAt });
  }
}
