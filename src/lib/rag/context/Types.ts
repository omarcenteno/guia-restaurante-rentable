import type { SearchResult as VectorSearchResult, VectorChunk } from "@/lib/knowledge/embeddings";

export type ContextSourceType = "knowledge" | "brand" | "production" | "manual";

export interface ContextSearchResult {
  id: string;
  documentId: string;
  chunkId: string;
  title: string;
  text: string;
  score: number;
  rank: number;
  sourceType: ContextSourceType;
  category?: string;
  path?: string[];
  tags?: string[];
  estimatedTokens?: number;
  metadata?: Record<string, unknown>;
}

export interface ContextChunk {
  id: string;
  documentId: string;
  chunkId: string;
  title: string;
  text: string;
  originalText: string;
  score: number;
  rank: number;
  sourceType: ContextSourceType;
  category?: string;
  path: string[];
  tags: string[];
  estimatedTokens: number;
  finalTokens: number;
  compressed: boolean;
  metadata: Record<string, unknown>;
}

export interface ContextBudgetOptions {
  maxTokens: number;
  reservedPromptTokens: number;
  minChunkTokens: number;
  compressionRatio: number;
}

export interface ContextBuildOptions {
  query: string;
  task?: string;
  systemInstruction?: string;
  maxChunks?: number;
  budget?: Partial<ContextBudgetOptions>;
  scoreThreshold?: number;
}

export interface ContextMetrics {
  documentsUsed: number;
  chunksUsed: number;
  estimatedTokens: number;
  finalTokens: number;
  durationMs: number;
  averageScore: number;
}

export interface ContextPromptSection {
  id: string;
  title: string;
  body: string;
  tokens: number;
}

export interface ContextPrompt {
  system: string;
  user: string;
  context: string;
  sections: ContextPromptSection[];
  tokens: number;
}

export interface BuiltContext {
  query: string;
  task: string;
  chunks: ContextChunk[];
  prompt: ContextPrompt;
  metrics: ContextMetrics;
}

export interface ContextEngineInput {
  searchResults: Array<ContextSearchResult | VectorSearchResult>;
  options: ContextBuildOptions;
}

export interface ContextEngineResult extends BuiltContext {
  duplicatedRemoved: number;
  budget: ContextBudgetOptions;
}

export interface ContextRankerOptions {
  scoreThreshold: number;
  maxChunks: number;
}

export type SearchResultLike = ContextSearchResult | VectorSearchResult;

export function isVectorSearchResult(value: SearchResultLike): value is VectorSearchResult {
  return typeof value === "object" && value !== null && "chunk" in value && typeof (value as { chunk?: unknown }).chunk === "object";
}

export function vectorChunkToContextResult(result: VectorSearchResult): ContextSearchResult {
  const chunk = result.chunk as VectorChunk;
  return {
    id: result.embedding?.id ?? chunk.id,
    documentId: chunk.documentId,
    chunkId: chunk.id,
    title: chunk.title,
    text: chunk.text,
    score: result.score,
    rank: result.rank,
    sourceType: "knowledge",
    category: chunk.category,
    path: chunk.path,
    tags: chunk.metadata.tags,
    estimatedTokens: chunk.estimatedTokens,
    metadata: {
      fileName: chunk.metadata.fileName,
      fileType: chunk.metadata.fileType,
      embeddingModel: result.embedding?.metadata.model
    }
  };
}
