import type { KnowledgeChunk, KnowledgeDocument } from "../documentTypes";

export type EmbeddingProviderId = "openai" | "deterministic";
export type EmbeddingStatus = "idle" | "generating" | "ready" | "error";

export interface EmbeddingMetadata {
  documentId: string;
  chunkId: string;
  category: KnowledgeChunk["category"];
  tags: string[];
  title: string;
  model: string;
  provider: EmbeddingProviderId;
  dimensions: number;
  generatedAt: string;
  sourceHash: string;
}

export interface Embedding {
  id: string;
  vector: number[];
  metadata: EmbeddingMetadata;
}

export interface VectorChunk {
  id: string;
  documentId: string;
  text: string;
  title: string;
  category: KnowledgeChunk["category"];
  path: string[];
  estimatedTokens: number;
  metadata: KnowledgeChunk["metadata"];
}

export interface VectorDocument {
  id: string;
  title: string;
  category: KnowledgeDocument["category"];
  tags: string[];
  chunks: VectorChunk[];
}

export interface SearchResult {
  chunk: VectorChunk;
  embedding: Embedding;
  score: number;
  rank: number;
}

export interface EmbeddingRequest {
  chunk: KnowledgeChunk;
  model?: string;
}

export interface EmbeddingProvider {
  readonly id: EmbeddingProviderId;
  readonly model: string;
  readonly dimensions: number;
  embed(texts: string[], options?: { signal?: AbortSignal }): Promise<number[][]>;
}

export interface EmbeddingQueueItem {
  id: string;
  chunk: KnowledgeChunk;
  status: EmbeddingStatus;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
}

export interface EmbeddingDiagnostics {
  documentCount: number;
  chunkCount: number;
  embeddingCount: number;
  averageGenerationMs: number;
  model: string;
  provider: EmbeddingProviderId;
  status: EmbeddingStatus;
  lastUpdatedAt: string | null;
}

export interface EmbeddingGenerationSummary extends EmbeddingDiagnostics {
  generated: number;
  updated: number;
  deleted: number;
  searchPreview: SearchResult[];
}

export interface EmbeddingCacheRecord {
  embedding: Embedding;
  text: string;
  cachedAt: string;
}

export interface SearchProvider {
  search(query: string, topK?: number): Promise<SearchResult[]>;
  similarity(left: number[], right: number[]): number;
  topK(results: SearchResult[], topK: number): SearchResult[];
}
