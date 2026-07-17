import type { KnowledgeChunk, KnowledgeDocument } from "../documentTypes";
import { chunkDocument } from "../chunking";
import { EMBEDDING_BATCH_SIZE } from "./constants";
import { EmbeddingCache } from "./embeddingCache";
import { EmbeddingQueue } from "./embeddingQueue";
import { hashText } from "./hash";
import { SimilaritySearch } from "./similaritySearch";
import type { Embedding, EmbeddingDiagnostics, EmbeddingGenerationSummary, EmbeddingProvider, SearchResult, VectorChunk, VectorDocument } from "./types";
import { VectorIndex } from "./vectorIndex";

export function toVectorChunk(chunk: KnowledgeChunk): VectorChunk {
  return {
    id: chunk.id,
    documentId: chunk.documentId,
    text: chunk.text,
    title: chunk.title,
    category: chunk.category,
    path: [...chunk.path],
    estimatedTokens: chunk.estimatedTokens,
    metadata: { ...chunk.metadata, tags: [...chunk.metadata.tags] }
  };
}

export function toVectorDocument(document: KnowledgeDocument, chunks = chunkDocument(document, { strategy: document.retrieval.chunkStrategy }).chunks): VectorDocument {
  return {
    id: document.id,
    title: document.title,
    category: document.category,
    tags: [...document.tags],
    chunks: chunks.map(toVectorChunk)
  };
}

function createEmbedding(chunk: KnowledgeChunk, vector: number[], provider: EmbeddingProvider): Embedding {
  const sourceHash = hashText(chunk.text);
  return {
    id: `${chunk.id}-${provider.model}-${sourceHash}`,
    vector,
    metadata: {
      documentId: chunk.documentId,
      chunkId: chunk.id,
      category: chunk.category,
      tags: [...chunk.metadata.tags],
      title: chunk.title,
      model: provider.model,
      provider: provider.id,
      dimensions: vector.length,
      generatedAt: new Date().toISOString(),
      sourceHash
    }
  };
}

function cacheKey(chunk: KnowledgeChunk, provider: EmbeddingProvider): string {
  return `${provider.id}:${provider.model}:${chunk.id}:${hashText(chunk.text)}`;
}

export class EmbeddingEngine {
  private readonly durations: number[] = [];
  private lastUpdatedAt: string | null = null;
  private status: EmbeddingDiagnostics["status"] = "idle";

  constructor(
    private readonly provider: EmbeddingProvider,
    private readonly cache = new EmbeddingCache(),
    private readonly queue = new EmbeddingQueue(),
    private readonly index = new VectorIndex()
  ) {}

  diagnostics(documentCount = 0, chunkCount = this.index.chunkCount()): EmbeddingDiagnostics {
    return {
      documentCount,
      chunkCount,
      embeddingCount: this.index.count(),
      averageGenerationMs: this.durations.length ? Math.round(this.durations.reduce((total, value) => total + value, 0) / this.durations.length) : 0,
      model: this.provider.model,
      provider: this.provider.id,
      status: this.status,
      lastUpdatedAt: this.lastUpdatedAt
    };
  }

  async generateForDocuments(documents: KnowledgeDocument[], options: { replaceDocumentIds?: string[]; signal?: AbortSignal } = {}): Promise<EmbeddingGenerationSummary> {
    const startedAt = Date.now();
    this.status = "generating";
    const replaceIds = new Set(options.replaceDocumentIds ?? []);
    let deleted = 0;
    replaceIds.forEach((documentId) => {
      deleted += this.index.deleteDocument(documentId);
      this.cache.deleteByDocument(documentId);
    });

    const chunks = documents.flatMap((document) => chunkDocument(document, { strategy: document.retrieval.chunkStrategy }).chunks);
    const records: Array<{ chunk: VectorChunk; embedding: Embedding }> = [];
    let generated = 0;
    let updated = 0;

    try {
      for (let start = 0; start < chunks.length; start += EMBEDDING_BATCH_SIZE) {
        const batch = chunks.slice(start, start + EMBEDDING_BATCH_SIZE);
        const missing: KnowledgeChunk[] = [];
        batch.forEach((chunk) => {
          const key = cacheKey(chunk, this.provider);
          const cached = this.cache.get(key);
          if (cached) {
            records.push({ chunk: toVectorChunk(chunk), embedding: cached });
            updated += 1;
          } else {
            this.queue.enqueue(key, chunk);
            this.queue.mark(key, "generating");
            missing.push(chunk);
          }
        });
        if (!missing.length) continue;
        const vectors = await this.provider.embed(missing.map((chunk) => chunk.text), { signal: options.signal });
        missing.forEach((chunk, index) => {
          const key = cacheKey(chunk, this.provider);
          const embedding = createEmbedding(chunk, vectors[index] ?? [], this.provider);
          this.cache.set(key, embedding, chunk.text);
          this.queue.mark(key, "ready");
          records.push({ chunk: toVectorChunk(chunk), embedding });
          generated += 1;
        });
      }
      this.index.upsertMany(records);
      this.status = "ready";
    } catch (error) {
      this.status = "error";
      throw error;
    } finally {
      const duration = Date.now() - startedAt;
      this.durations.push(duration);
      if (this.durations.length > 50) this.durations.shift();
      this.lastUpdatedAt = new Date().toISOString();
    }

    return {
      ...this.diagnostics(documents.length, chunks.length),
      generated,
      updated,
      deleted,
      searchPreview: []
    };
  }

  deleteDocument(documentId: string, documentCount = 0): EmbeddingGenerationSummary {
    const deleted = this.index.deleteDocument(documentId);
    this.cache.deleteByDocument(documentId);
    this.lastUpdatedAt = new Date().toISOString();
    this.status = this.index.count() ? "ready" : "idle";
    return {
      ...this.diagnostics(documentCount),
      generated: 0,
      updated: 0,
      deleted,
      searchPreview: []
    };
  }

  clear(documentCount = 0): EmbeddingGenerationSummary {
    const deleted = this.index.clear();
    this.cache.clear();
    this.queue.clear();
    this.status = "idle";
    this.lastUpdatedAt = new Date().toISOString();
    return {
      ...this.diagnostics(documentCount, 0),
      generated: 0,
      updated: 0,
      deleted,
      searchPreview: []
    };
  }

  async search(query: string, topK = 5): Promise<SearchResult[]> {
    return new SimilaritySearch(this.index, this.provider).search(query, topK);
  }
}
