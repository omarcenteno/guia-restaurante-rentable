import type { SearchResult as VectorSearchResult, VectorChunk } from "@/lib/knowledge/embeddings";
import type { ContextSearchResult } from "@/lib/rag/context";
import { filterByMetadata } from "./MetadataFilter";
import { DEFAULT_RANKING_WEIGHTS, rankHybridResults } from "./Ranking";
import type {
  HybridRetrievalQuery,
  HybridRetrieverOptions,
  HybridSearchResult,
  RankedRetrievalResult,
  RetrievalFilter,
  RetrievalMetadata,
  RetrievalPriority,
  RetrievalPipelineInput
} from "./types";

const DEFAULT_OPTIONS: HybridRetrieverOptions = {
  similarityTopK: 20,
  outputTopK: 6,
  weights: DEFAULT_RANKING_WEIGHTS
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];
}

function asPriority(value: unknown): RetrievalPriority {
  return asString(value) ?? "medium";
}

function isVectorSearchResult(value: VectorSearchResult | ContextSearchResult): value is VectorSearchResult {
  return isRecord(value) && "chunk" in value && isRecord(value.chunk);
}

function metadataFromVector(result: VectorSearchResult, workspace: string): RetrievalMetadata {
  const chunk = result.chunk as VectorChunk;
  const metadata = chunk.metadata as unknown as Record<string, unknown>;
  return {
    workspace: asString(metadata.workspace) ?? workspace,
    category: chunk.category,
    tags: asStringArray(metadata.tags),
    priority: asPriority(metadata.priority),
    documentType: asString(metadata.documentType) ?? asString(metadata.fileType) ?? "document",
    language: asString(metadata.language),
    version: asString(metadata.version) ?? undefined
  };
}

function metadataFromContext(result: ContextSearchResult, workspace: string): RetrievalMetadata {
  const metadata = result.metadata ?? {};
  return {
    workspace: asString(metadata.workspace) ?? workspace,
    category: result.category ?? asString(metadata.category),
    tags: result.tags ?? asStringArray(metadata.tags),
    priority: asPriority(metadata.priority),
    documentType: asString(metadata.documentType) ?? asString(metadata.fileType) ?? "document",
    language: asString(metadata.language),
    version: asString(metadata.version) ?? undefined
  };
}

function normalizeResult(result: VectorSearchResult | ContextSearchResult, query: HybridRetrievalQuery): HybridSearchResult {
  if (isVectorSearchResult(result)) {
    return {
      id: result.embedding?.id ?? result.chunk.id,
      documentId: result.chunk.documentId,
      chunkId: result.chunk.id,
      title: result.chunk.title,
      text: result.chunk.text,
      rank: result.rank,
      embeddingScore: result.score,
      metadata: metadataFromVector(result, query.workspace),
      estimatedTokens: result.chunk.estimatedTokens,
      path: result.chunk.path,
      source: result
    };
  }

  return {
    id: result.id,
    documentId: result.documentId,
    chunkId: result.chunkId,
    title: result.title,
    text: result.text,
    rank: result.rank,
    embeddingScore: result.score,
    metadata: metadataFromContext(result, query.workspace),
    estimatedTokens: result.estimatedTokens,
    path: result.path,
    source: result
  };
}

function filterFor(query: HybridRetrievalQuery): RetrievalFilter {
  return {
    workspace: query.workspace,
    categories: query.category ? [query.category] : undefined,
    tags: query.tags,
    documentTypes: query.documentType ? [query.documentType] : undefined,
    languages: query.language ? [query.language] : undefined,
    versions: query.version === undefined ? undefined : [query.version]
  };
}

function mergeOptions(options: Partial<HybridRetrieverOptions> | undefined): HybridRetrieverOptions {
  return {
    similarityTopK: options?.similarityTopK ?? DEFAULT_OPTIONS.similarityTopK,
    outputTopK: options?.outputTopK ?? DEFAULT_OPTIONS.outputTopK,
    weights: { ...DEFAULT_OPTIONS.weights, ...options?.weights }
  };
}

export class HybridRetriever {
  retrieve(input: RetrievalPipelineInput): RankedRetrievalResult[] {
    const options = mergeOptions(input.options);
    const candidates = input.searchResults
      .slice(0, options.similarityTopK)
      .map((result) => normalizeResult(result, input.query));
    const filtered = filterByMetadata(candidates, filterFor(input.query));
    return rankHybridResults(filtered, input.query, options.weights).slice(0, input.query.topK ?? options.outputTopK);
  }
}

export const hybridRetriever = new HybridRetriever();
