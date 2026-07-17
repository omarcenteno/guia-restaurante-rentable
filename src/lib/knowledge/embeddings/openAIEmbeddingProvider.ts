import "server-only";

import { AIProviderError, AIProviderNotConnectedError } from "@/lib/ai/errors";
import { DEFAULT_EMBEDDING_DIMENSIONS, DEFAULT_EMBEDDING_MODEL } from "./constants";
import type { EmbeddingProvider } from "./types";

const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";

function isEmbeddingPayload(value: unknown): value is { data: Array<{ embedding: number[] }> } {
  return typeof value === "object"
    && value !== null
    && Array.isArray((value as { data?: unknown }).data)
    && (value as { data: unknown[] }).data.every((item) => typeof item === "object" && item !== null && Array.isArray((item as { embedding?: unknown }).embedding));
}

function providerErrorForStatus(status: number, cause?: unknown): AIProviderError {
  if (status === 401 || status === 403) return new AIProviderError("OpenAI rechazó las credenciales de embeddings.", "PROVIDER_UNAUTHORIZED", false, status, cause);
  if (status === 429) return new AIProviderError("OpenAI alcanzó temporalmente el límite de embeddings.", "PROVIDER_RATE_LIMIT", true, status, cause);
  return new AIProviderError("OpenAI no pudo generar embeddings.", "PROVIDER_ERROR", status >= 500, status, cause);
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly id = "openai" as const;
  readonly model: string;
  readonly dimensions: number;

  constructor(options: { model?: string; dimensions?: number } = {}) {
    this.model = options.model ?? process.env.OPENAI_EMBEDDING_MODEL?.trim() ?? DEFAULT_EMBEDDING_MODEL;
    this.dimensions = options.dimensions ?? DEFAULT_EMBEDDING_DIMENSIONS;
  }

  async embed(texts: string[], options: { signal?: AbortSignal } = {}): Promise<number[][]> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new AIProviderNotConnectedError();
    if (!texts.length) return [];

    let lastError: unknown;
    for (let attempt = 0; attempt <= 2; attempt += 1) {
      try {
        const response = await fetch(OPENAI_EMBEDDINGS_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ model: this.model, input: texts, encoding_format: "float" }),
          signal: options.signal
        });
        const payload = await response.json().catch(() => null) as unknown;
        if (!response.ok) throw providerErrorForStatus(response.status, payload);
        if (!isEmbeddingPayload(payload)) throw new AIProviderError("OpenAI devolvió embeddings inválidos.", "PROVIDER_ERROR", false, response.status, payload);
        return payload.data.map((item) => item.embedding);
      } catch (error) {
        const normalized = error instanceof AIProviderError ? error : new AIProviderError("No fue posible conectar con OpenAI embeddings.", "PROVIDER_ERROR", true, undefined, error);
        lastError = normalized;
        if (!normalized.retryable || attempt === 2) throw normalized;
        await sleep(300 * 2 ** attempt);
      }
    }

    throw lastError instanceof Error ? lastError : new AIProviderError("No fue posible generar embeddings.", "PROVIDER_ERROR", false);
  }
}
