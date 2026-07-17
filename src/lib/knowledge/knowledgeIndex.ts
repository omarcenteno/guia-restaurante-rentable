import { chunkDocument } from "./chunking";
import type { KnowledgeChunk, KnowledgeDocument, KnowledgeIndex, RetrievalDocument } from "./documentTypes";
import type { ChunkOptions } from "./chunking";

export const knowledgeIndex: KnowledgeIndex = {
  createChunks(document: KnowledgeDocument, options?: Partial<ChunkOptions>): KnowledgeChunk[] {
    return chunkDocument(document, options).chunks;
  },

  toRetrievalDocument(document: KnowledgeDocument): RetrievalDocument {
    return {
      id: document.id,
      documentKey: document.retrieval.documentKey,
      title: document.title,
      category: document.category,
      tags: [...document.tags],
      content: document.content,
      chunks: this.createChunks(document),
      metadata: {
        ...document.metadata,
        author: document.author,
        version: document.version,
        updatedAt: document.updatedAt,
        status: document.status
      }
    };
  }
};
