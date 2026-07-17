export { DEFAULT_EMBEDDING_DIMENSIONS, DEFAULT_EMBEDDING_MODEL, EMBEDDING_BATCH_SIZE } from "./constants";
export { DeterministicEmbeddingProvider } from "./deterministicEmbeddingProvider";
export { EmbeddingCache } from "./embeddingCache";
export { EmbeddingEngine, toVectorChunk, toVectorDocument } from "./embeddingEngine";
export { EmbeddingQueue } from "./embeddingQueue";
export { cosineSimilarity, SimilaritySearch } from "./similaritySearch";
export { VectorIndex } from "./vectorIndex";
export type {
  Embedding,
  EmbeddingDiagnostics,
  EmbeddingGenerationSummary,
  EmbeddingMetadata,
  EmbeddingProvider,
  EmbeddingProviderId,
  EmbeddingQueueItem,
  EmbeddingRequest,
  EmbeddingStatus,
  SearchProvider,
  SearchResult,
  VectorChunk,
  VectorDocument
} from "./types";
