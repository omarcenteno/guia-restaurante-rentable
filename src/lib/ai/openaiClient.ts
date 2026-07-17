import "server-only";

import { AIProviderError, AIProviderNotConnectedError } from "./errors";
import { GENERATED_PUBLICATION_JSON_SCHEMA } from "./responseParser";
import type { AIProviderClient, AIProviderRequest, AIProviderResult, TokenUsage } from "./types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

function developmentLog(message: string, details: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") console.info(`[GRR AI][openai] ${message}`, details);
}

function developmentWarning(message: string, details: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") console.warn(`[GRR AI][openai] ${message}`, details);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractOutputText(payload: unknown): string {
  if (!isRecord(payload)) throw new AIProviderError("OpenAI devolvió una respuesta vacía.", "PROVIDER_ERROR", false);
  if (typeof payload.output_text === "string" && payload.output_text.trim()) return payload.output_text;
  if (!Array.isArray(payload.output)) throw new AIProviderError("OpenAI no devolvió contenido utilizable.", "PROVIDER_ERROR", false);

  const text = payload.output
    .flatMap((item) => isRecord(item) && Array.isArray(item.content) ? item.content : [])
    .map((content) => isRecord(content) && typeof content.text === "string" ? content.text : "")
    .filter(Boolean)
    .join("\n");

  if (!text) throw new AIProviderError("OpenAI no devolvió contenido utilizable.", "PROVIDER_ERROR", false);
  return text;
}

function extractUsage(payload: unknown): TokenUsage {
  const usage = isRecord(payload) && isRecord(payload.usage) ? payload.usage : {};
  const promptTokens = typeof usage.input_tokens === "number" ? usage.input_tokens : 0;
  const completionTokens = typeof usage.output_tokens === "number" ? usage.output_tokens : 0;
  const totalTokens = typeof usage.total_tokens === "number" ? usage.total_tokens : promptTokens + completionTokens;
  return { promptTokens, completionTokens, totalTokens, estimated: false };
}

function providerErrorForStatus(status: number, cause?: unknown): AIProviderError {
  if (status === 401 || status === 403) {
    return new AIProviderError("OpenAI rechazó las credenciales configuradas.", "PROVIDER_UNAUTHORIZED", false, status, cause);
  }
  if (status === 429) {
    return new AIProviderError("OpenAI alcanzó temporalmente su límite de solicitudes.", "PROVIDER_RATE_LIMIT", true, status, cause);
  }
  const retryable = status === 408 || status === 409 || status === 425 || status >= 500;
  return new AIProviderError("OpenAI no pudo completar la generación.", "PROVIDER_ERROR", retryable, status, cause);
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

class OpenAIResponsesClient implements AIProviderClient {
  readonly id = "openai" as const;

  async generate(request: AIProviderRequest): Promise<AIProviderResult> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new AIProviderNotConnectedError();

    const body: Record<string, unknown> = {
      model: request.model,
      input: [
        { role: "system", content: request.prompt.system },
        { role: "user", content: request.prompt.user }
      ],
      text: { format: GENERATED_PUBLICATION_JSON_SCHEMA },
      max_output_tokens: 6000,
      store: false
    };
    if (typeof request.temperature === "number") body.temperature = request.temperature;

    let lastError: unknown;
    const startedAt = Date.now();
    const deadline = startedAt + request.timeoutMs;
    developmentLog("Petición iniciada", { model: request.model, timeoutMs: request.timeoutMs, maxRetries: request.maxRetries });

    for (let attempt = 0; attempt <= request.maxRetries; attempt += 1) {
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) {
        throw new AIProviderError("OpenAI tardó demasiado en responder.", "PROVIDER_TIMEOUT", false, undefined, lastError);
      }
      const controller = new AbortController();
      const abortFromRequest = () => controller.abort();
      if (request.signal?.aborted) controller.abort();
      request.signal?.addEventListener("abort", abortFromRequest, { once: true });
      const timeout = setTimeout(() => controller.abort(), remainingMs);
      try {
        const response = await fetch(OPENAI_RESPONSES_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        const payload = await response.json().catch(() => null) as unknown;
        developmentLog("Respuesta JSON recibida", { attempt: attempt + 1, status: response.status, durationMs: Date.now() - startedAt, payload });
        if (!response.ok) throw providerErrorForStatus(response.status, payload);
        const rawContent = extractOutputText(payload);
        const usage = extractUsage(payload);
        const model = isRecord(payload) && typeof payload.model === "string" ? payload.model : request.model;
        developmentLog("Respuesta procesada", { attempt: attempt + 1, model, usage, outputCharacters: rawContent.length, durationMs: Date.now() - startedAt });
        return {
          rawContent,
          model,
          usage
        };
      } catch (error) {
        const normalized = request.signal?.aborted
          ? new AIProviderError("La generación fue cancelada.", "PROVIDER_ERROR", false, undefined, error)
          : error instanceof AIProviderError
          ? error
          : error instanceof Error && error.name === "AbortError"
            ? new AIProviderError("OpenAI tardó demasiado en responder.", "PROVIDER_TIMEOUT", true, undefined, error)
            : new AIProviderError("No fue posible conectar con OpenAI.", "PROVIDER_ERROR", true, undefined, error);
        lastError = normalized;
        developmentWarning("Intento finalizado con error", { attempt: attempt + 1, code: normalized.code, retryable: normalized.retryable, durationMs: Date.now() - startedAt });
        if (!normalized.retryable || attempt === request.maxRetries) throw normalized;
        const retryDelay = 250 * 2 ** attempt;
        if (Date.now() + retryDelay >= deadline) {
          throw new AIProviderError("OpenAI tardó demasiado en responder.", "PROVIDER_TIMEOUT", false, undefined, normalized);
        }
        await sleep(retryDelay);
      } finally {
        clearTimeout(timeout);
        request.signal?.removeEventListener("abort", abortFromRequest);
      }
    }

    throw lastError instanceof Error ? lastError : new AIProviderError("OpenAI no pudo completar la generación.", "PROVIDER_ERROR", false);
  }
}

export const openAIClient: AIProviderClient = new OpenAIResponsesClient();
