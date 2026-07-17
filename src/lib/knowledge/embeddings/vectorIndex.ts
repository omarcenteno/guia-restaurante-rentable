import type { Embedding, SearchResult, VectorChunk } from "./types";

export class VectorIndex {
  private readonly chunks = new Map<string, VectorChunk>();
  private readonly embeddings = new Map<string, Embedding>();

  upsert(chunk: VectorChunk, embedding: Embedding): void {
    this.chunks.set(chunk.id, chunk);
    this.embeddings.set(chunk.id, embedding);
  }

  upsertMany(records: Array<{ chunk: VectorChunk; embedding: Embedding }>): void {
    records.forEach((record) => this.upsert(record.chunk, record.embedding));
  }

  deleteChunk(chunkId: string): boolean {
    const removedChunk = this.chunks.delete(chunkId);
    const removedEmbedding = this.embeddings.delete(chunkId);
    return removedChunk || removedEmbedding;
  }

  deleteDocument(documentId: string): number {
    let deleted = 0;
    for (const chunk of this.chunks.values()) {
      if (chunk.documentId === documentId && this.deleteChunk(chunk.id)) deleted += 1;
    }
    return deleted;
  }

  clear(): number {
    const deleted = this.embeddings.size;
    this.chunks.clear();
    this.embeddings.clear();
    return deleted;
  }

  count(): number {
    return this.embeddings.size;
  }

  chunkCount(): number {
    return this.chunks.size;
  }

  entries(): Array<{ chunk: VectorChunk; embedding: Embedding }> {
    return [...this.embeddings.entries()].flatMap(([chunkId, embedding]) => {
      const chunk = this.chunks.get(chunkId);
      return chunk ? [{ chunk, embedding }] : [];
    });
  }

  search(queryVector: number[], topK: number, similarity: (left: number[], right: number[]) => number): SearchResult[] {
    return this.entries()
      .map(({ chunk, embedding }) => ({ chunk, embedding, score: similarity(queryVector, embedding.vector), rank: 0 }))
      .sort((left, right) => right.score - left.score)
      .slice(0, topK)
      .map((result, index) => ({ ...result, rank: index + 1 }));
  }
}
