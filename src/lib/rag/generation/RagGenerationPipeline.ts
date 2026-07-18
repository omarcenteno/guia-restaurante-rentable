import "server-only";

import type { KnowledgeContext } from "@/lib/knowledge";
import { getWorkspaceEmbeddingEngine } from "@/lib/knowledge/embeddings/server";
import { getAIProvider } from "@/lib/ai/providerRegistry";
import { buildPrompt } from "@/lib/ai/promptBuilder";
import { estimateTokens } from "@/lib/ai/tokenCounter";
import type {
  AIGenerationRagMetrics,
  AIProvider,
  AIProviderClient,
  AIProviderResult,
  GenerationRequest,
  PromptResult
} from "@/lib/ai/types";
import { contextEngine, type ContextEngineResult } from "@/lib/rag/context";

export interface RagGenerationPipelineInput {
  workspaceId: string;
  knowledge: KnowledgeContext;
  request: GenerationRequest;
  provider: AIProvider;
  model: string;
  temperature?: number;
  timeoutMs: number;
  maxRetries: number;
  signal?: AbortSignal;
}

export interface RagGenerationPipelineResult {
  providerClient: AIProviderClient;
  providerResult: AIProviderResult;
  prompt: PromptResult;
  metrics: AIGenerationRagMetrics;
  context?: ContextEngineResult;
}

export class RagGenerationPipelineError extends Error {
  constructor(
    message: string,
    readonly prompt: PromptResult,
    readonly metrics: AIGenerationRagMetrics,
    readonly cause: unknown
  ) {
    super(message);
    this.name = "RagGenerationPipelineError";
  }
}

function nowMs(): number {
  return Date.now();
}

function developmentInfo(message: string, details: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") console.info(`[GRR RAG][pipeline] ${message}`, details);
}

function buildSearchQuery(request: GenerationRequest): string {
  return [
    request.topic,
    request.publication?.topic,
    request.publication?.title,
    request.goal,
    request.objective,
    request.publication?.objective,
    request.publication?.pillar,
    request.hook,
    request.publication?.hook,
    request.type
  ].filter(Boolean).join(" · ");
}

function appendContextToPrompt(prompt: PromptResult, context: ContextEngineResult | undefined): PromptResult {
  if (!context || !context.chunks.length || !context.prompt.context.trim()) return prompt;
  const contextBlock = [
    "--- CONTEXTO RAG RECUPERADO ---",
    "Usa este contexto como referencia prioritaria cuando sea relevante. No cites el contexto literalmente si no aporta claridad.",
    context.prompt.context
  ].join("\n\n");
  const user = `${prompt.user}\n\n${contextBlock}`;
  const finalPrompt = `${prompt.system}\n\n--- SOLICITUD ---\n${user}`;
  return {
    ...prompt,
    user,
    prompt: finalPrompt,
    estimatedTokens: estimateTokens(finalPrompt)
  };
}

function compressionRatio(context: ContextEngineResult | undefined): number {
  if (!context || context.metrics.estimatedTokens <= 0) return 0;
  return Number((context.metrics.finalTokens / context.metrics.estimatedTokens).toFixed(4));
}

export async function runRagGenerationPipeline(input: RagGenerationPipelineInput): Promise<RagGenerationPipelineResult> {
  const totalStartedAt = nowMs();
  const workspaceId = input.workspaceId.trim() || "grr";
  const searchQuery = buildSearchQuery(input.request);

  const promptStartedAt = nowMs();
  const basePrompt = buildPrompt(input.knowledge, { ...input.request, workspaceId });
  let promptMs = nowMs() - promptStartedAt;

  let searchMs = 0;
  let builderMs = 0;
  let context: ContextEngineResult | undefined;

  try {
    const engine = getWorkspaceEmbeddingEngine(workspaceId);
    const diagnostics = engine.diagnostics();
    if (diagnostics.embeddingCount > 0 && searchQuery.trim()) {
      const searchStartedAt = nowMs();
      const results = await engine.search(searchQuery, 8);
      searchMs = nowMs() - searchStartedAt;

      const builderStartedAt = nowMs();
      context = contextEngine.build({
        searchResults: results,
        options: {
          query: searchQuery,
          task: `Generar ${input.request.type} para ${input.request.publication?.title ?? input.request.topic ?? "GRR OS"}`,
          maxChunks: 8,
          scoreThreshold: 0,
          budget: {
            maxTokens: 1800,
            reservedPromptTokens: basePrompt.estimatedTokens,
            compressionRatio: 0.72
          }
        }
      });
      builderMs = nowMs() - builderStartedAt;
    } else {
      developmentInfo("Sin embeddings disponibles; se usará prompt tradicional", { workspaceId, embeddingCount: diagnostics.embeddingCount });
    }
  } catch (error) {
    developmentInfo("Contexto RAG omitido por fallback seguro", {
      workspaceId,
      error: error instanceof Error ? error.message : "Error desconocido"
    });
    context = undefined;
  }

  const promptMergeStartedAt = nowMs();
  const prompt = appendContextToPrompt(basePrompt, context);
  promptMs += nowMs() - promptMergeStartedAt;

  const metrics: AIGenerationRagMetrics = {
    workspaceId,
    contextChunks: context?.metrics.chunksUsed ?? 0,
    contextTokens: context?.metrics.finalTokens ?? 0,
    contextCompression: compressionRatio(context),
    documentsUsed: context?.metrics.documentsUsed ?? 0,
    searchMs,
    builderMs,
    promptMs,
    totalMs: nowMs() - totalStartedAt,
    fallbackUsed: !context || context.chunks.length === 0,
    promptIncludesContext: Boolean(context?.chunks.length)
  };

  const providerClient = getAIProvider(input.provider);
  let providerResult: AIProviderResult;
  try {
    providerResult = await providerClient.generate({
      model: input.model,
      prompt,
      temperature: input.temperature,
      timeoutMs: input.timeoutMs,
      maxRetries: input.maxRetries,
      signal: input.signal
    });
  } catch (error) {
    metrics.totalMs = nowMs() - totalStartedAt;
    developmentInfo("Proveedor falló después de construir contexto", { ...metrics });
    throw new RagGenerationPipelineError("No fue posible completar la generación RAG.", prompt, metrics, error);
  }

  metrics.totalMs = nowMs() - totalStartedAt;
  developmentInfo("Pipeline completado", { ...metrics });
  return { providerClient, providerResult, prompt, metrics, context };
}
