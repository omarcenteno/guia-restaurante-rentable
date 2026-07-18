import { fitChunksToBudget, resolveContextBudget } from "./ContextBudget";
import { compressChunks } from "./ContextCompressor";
import { assemblePrompt } from "./PromptAssembler";
import { normalizeSearchResults, rankResults, removeDuplicateResults, toContextChunks } from "./ContextRanker";
import type { BuiltContext, ContextBuildOptions, ContextMetrics, SearchResultLike } from "./Types";

function metricsFor(input: {
  chunks: BuiltContext["chunks"];
  estimatedTokens: number;
  finalTokens: number;
  durationMs: number;
}): ContextMetrics {
  const documents = new Set(input.chunks.map((chunk) => chunk.documentId));
  return {
    documentsUsed: documents.size,
    chunksUsed: input.chunks.length,
    estimatedTokens: input.estimatedTokens,
    finalTokens: input.finalTokens,
    durationMs: input.durationMs,
    averageScore: input.chunks.length ? Number((input.chunks.reduce((total, chunk) => total + chunk.score, 0) / input.chunks.length).toFixed(4)) : 0
  };
}

export function buildContext(searchResults: SearchResultLike[], options: ContextBuildOptions): BuiltContext & { duplicatedRemoved: number } {
  const startedAt = Date.now();
  const budget = resolveContextBudget(options.budget);
  const normalized = normalizeSearchResults(searchResults);
  const { results: uniqueResults, removed } = removeDuplicateResults(normalized);
  const ranked = rankResults(uniqueResults, {
    scoreThreshold: options.scoreThreshold ?? 0,
    maxChunks: options.maxChunks ?? 12
  });
  const chunks = toContextChunks(ranked);
  const estimatedTokens = chunks.reduce((total, chunk) => total + chunk.estimatedTokens, 0);
  const compressed = compressChunks(chunks, budget);
  const fitted = fitChunksToBudget(compressed, budget);
  const prompt = assemblePrompt({
    query: options.query,
    task: options.task ?? "Responder usando contexto recuperado",
    systemInstruction: options.systemInstruction,
    chunks: fitted
  });
  const finalTokens = fitted.reduce((total, chunk) => total + chunk.finalTokens, 0);
  return {
    query: options.query,
    task: options.task ?? "Responder usando contexto recuperado",
    chunks: fitted,
    prompt,
    duplicatedRemoved: removed,
    metrics: metricsFor({
      chunks: fitted,
      estimatedTokens,
      finalTokens,
      durationMs: Date.now() - startedAt
    })
  };
}
