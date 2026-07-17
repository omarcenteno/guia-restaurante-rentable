import type { Embedding, EmbeddingCacheRecord } from "./types";

export class EmbeddingCache {
  private readonly records = new Map<string, EmbeddingCacheRecord>();

  get(key: string): Embedding | null {
    return this.records.get(key)?.embedding ?? null;
  }

  set(key: string, embedding: Embedding, text: string): void {
    this.records.set(key, { embedding, text, cachedAt: new Date().toISOString() });
  }

  delete(key: string): void {
    this.records.delete(key);
  }

  deleteByDocument(documentId: string): number {
    let deleted = 0;
    for (const [key, record] of this.records.entries()) {
      if (record.embedding.metadata.documentId === documentId) {
        this.records.delete(key);
        deleted += 1;
      }
    }
    return deleted;
  }

  clear(): number {
    const deleted = this.records.size;
    this.records.clear();
    return deleted;
  }

  size(): number {
    return this.records.size;
  }
}
