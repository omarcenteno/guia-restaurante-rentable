import type { KnowledgeChunk } from "./types";

export interface EmbeddingResult {
  chunkId: string;
  vector: number[];
  dimensions: number;
  model: string;
}

export interface EmbeddingProvider {
  embed(chunks: KnowledgeChunk[]): Promise<EmbeddingResult[]>;
}

export interface VectorStore {
  upsert(results: EmbeddingResult[], chunks: KnowledgeChunk[]): Promise<void>;
  removeByDocument(documentId: string): Promise<void>;
}

export interface SearchResult {
  chunk: KnowledgeChunk;
  score: number;
}

export interface SearchProvider {
  search(query: string, options?: { limit?: number; category?: string }): Promise<SearchResult[]>;
}
