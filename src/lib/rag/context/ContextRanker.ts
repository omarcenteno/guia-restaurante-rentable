import type { ContextChunk, ContextRankerOptions, ContextSearchResult, SearchResultLike } from "./Types";
import { isVectorSearchResult, vectorChunkToContextResult } from "./Types";
import { estimateTokens } from "./TokenEstimator";

function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").replace(/\s+/g, " ").trim();
}

function dedupeKey(result: ContextSearchResult): string {
  return `${result.documentId}:${normalizeText(result.text).slice(0, 400)}`;
}

export function normalizeSearchResults(results: SearchResultLike[]): ContextSearchResult[] {
  return results.map((result) => isVectorSearchResult(result) ? vectorChunkToContextResult(result) : result);
}

export function removeDuplicateResults(results: ContextSearchResult[]): { results: ContextSearchResult[]; removed: number } {
  const seen = new Set<string>();
  const unique: ContextSearchResult[] = [];
  for (const result of results) {
    const key = dedupeKey(result);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(result);
  }
  return { results: unique, removed: results.length - unique.length };
}

export function rankResults(results: ContextSearchResult[], options: ContextRankerOptions): ContextSearchResult[] {
  return [...results]
    .filter((result) => result.score >= options.scoreThreshold)
    .sort((left, right) => right.score - left.score || left.rank - right.rank || left.title.localeCompare(right.title, "es"))
    .slice(0, options.maxChunks);
}

export function toContextChunks(results: ContextSearchResult[]): ContextChunk[] {
  return results.map((result, index) => {
    const estimatedTokens = result.estimatedTokens ?? estimateTokens(result.text);
    return {
      id: result.id,
      documentId: result.documentId,
      chunkId: result.chunkId,
      title: result.title,
      text: result.text,
      originalText: result.text,
      score: result.score,
      rank: index + 1,
      sourceType: result.sourceType,
      category: result.category,
      path: result.path ?? [result.title],
      tags: result.tags ?? [],
      estimatedTokens,
      finalTokens: estimatedTokens,
      compressed: false,
      metadata: result.metadata ?? {}
    };
  });
}
