import type { SearchResult as VectorSearchResult } from "@/lib/knowledge/embeddings";
import type { ContextSearchResult } from "@/lib/rag/context";

export type RetrievalPriority = string | number;
export type RetrievalDocumentType = "sop" | "template" | "checklist" | "brand" | "offer" | "faq" | "ebook" | "note" | "document" | string;

export interface RetrievalMetadata {
  workspace: string;
  category?: string;
  tags: string[];
  priority: RetrievalPriority;
  documentType: RetrievalDocumentType;
  language?: string;
  version?: string | number;
}

export interface RetrievalFilter {
  workspace: string;
  categories?: string[];
  tags?: string[];
  priorities?: RetrievalPriority[];
  documentTypes?: RetrievalDocumentType[];
  languages?: string[];
  versions?: Array<string | number>;
}

export interface HybridSearchResult {
  id: string;
  documentId: string;
  chunkId: string;
  title: string;
  text: string;
  rank: number;
  embeddingScore: number;
  metadata: RetrievalMetadata;
  estimatedTokens?: number;
  path?: string[];
  source: VectorSearchResult | ContextSearchResult;
}

export interface RankingWeights {
  embeddingSimilarity: number;
  tagMatch: number;
  priority: number;
  documentType: number;
}

export interface RankingSignals {
  embeddingSimilarity: number;
  tagMatch: number;
  priority: number;
  documentType: number;
}

export interface RankedRetrievalResult extends HybridSearchResult {
  score: number;
  signals: RankingSignals;
}

export interface HybridRetrievalQuery {
  query: string;
  workspace: string;
  tags?: string[];
  category?: string;
  documentType?: RetrievalDocumentType;
  language?: string;
  version?: string | number;
  topK?: number;
}

export interface HybridRetrieverOptions {
  similarityTopK: number;
  outputTopK: number;
  weights: RankingWeights;
}

export interface RetrievalPipelineInput {
  query: HybridRetrievalQuery;
  searchResults: Array<VectorSearchResult | ContextSearchResult>;
  options?: Partial<HybridRetrieverOptions>;
}

export interface RetrievalMetrics {
  inputResults: number;
  filteredResults: number;
  rankedResults: number;
  outputResults: number;
  averageScore: number;
  durationMs: number;
}

export interface RetrievalPipelineResult {
  query: HybridRetrievalQuery;
  results: RankedRetrievalResult[];
  metrics: RetrievalMetrics;
}
