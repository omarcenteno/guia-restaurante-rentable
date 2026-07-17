import { getAudience, getBrand, initialBrandSections, pillars } from "./brand";
import { getCtas } from "./ctas";
import { getEbook } from "./ebook";
import { getFaq } from "./faq";
import { getHooks, initialHooks } from "./hooks";
import { getOffer, initialOffer } from "./offer";
import { getPrompts } from "./prompts";
import { formats, funnels, getTemplates, goals, initialContent, initialTemplates, series, statuses } from "./templates";
import type { KnowledgeContext } from "./types";

export function getKnowledgeContext(): KnowledgeContext {
  return {
    brand: getBrand(),
    offer: getOffer(),
    buyerPersona: getAudience(),
    ebook: getEbook(),
    hooks: getHooks(),
    prompts: getPrompts(),
    faq: getFaq(),
    templates: getTemplates(),
    ctas: getCtas(),
    pillars: [...pillars]
  };
}

export const knowledgeEngine = { getContext: getKnowledgeContext };

export { getAudience, getBrand, getCtas, getEbook, getEbook as getBook, getFaq, getHooks, getOffer, getPrompts, getPrompts as getPromptKnowledge, getTemplates };
export type * from "./types";
export { detectKnowledgeFileType, documentParsers, knowledgeFileAccept, parseKnowledgeFile } from "./documentParser";
export { deleteKnowledgeFile, duplicateKnowledgeFile, getKnowledgeFile, saveKnowledgeFile } from "./fileStorage";
export { knowledgeIndex } from "./knowledgeIndex";
export { chunkDocument, chunkStrategies, DEFAULT_CHUNK_OPTIONS, estimateChunkTokens, loadChunkOptions, saveChunkOptions } from "./chunking";
export type { ChunkMetadata, ChunkOptions, ChunkReference, ChunkResult, ChunkStatistics, ChunkStrategy, ChunkStrategyName, EmbeddingProvider, EmbeddingResult, SearchProvider, SearchResult, VectorStore } from "./chunking";
export { DeterministicEmbeddingProvider, EmbeddingCache, EmbeddingEngine, EmbeddingQueue, SimilaritySearch, VectorIndex } from "./embeddings";
export type { Embedding, EmbeddingDiagnostics, EmbeddingGenerationSummary, EmbeddingMetadata, EmbeddingProvider as KnowledgeEmbeddingProvider, EmbeddingProviderId, EmbeddingQueueItem, EmbeddingRequest, EmbeddingStatus, SearchProvider as KnowledgeSearchProvider, SearchResult as VectorSearchResult, VectorChunk, VectorDocument } from "./embeddings";
export { KNOWLEDGE_CATEGORIES, KNOWLEDGE_FILE_TYPES, KNOWLEDGE_STATUSES } from "./documentTypes";
export type { DocumentParser, KnowledgeCategory, KnowledgeChunk, KnowledgeDocument, KnowledgeDocumentDraft, KnowledgeDocumentStatus, KnowledgeFileType, KnowledgeIndex, KnowledgeMetadata, KnowledgeProvider, KnowledgeTag, ParsedKnowledgeFile, RetrievalDocument } from "./documentTypes";
export { formats, funnels, goals, initialBrandSections, initialContent, initialHooks, initialOffer, initialTemplates, pillars, series, statuses };
