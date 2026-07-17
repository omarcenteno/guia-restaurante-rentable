import type { KnowledgeDocument } from "../documentTypes";
import { estimateChunkTokens } from "./tokenEstimator";
import { fixedSizeStrategy } from "./fixedSizeStrategy";
import { headingStrategy } from "./headingStrategy";
import { paragraphStrategy } from "./paragraphStrategy";
import type { ChunkOptions, ChunkResult, ChunkStrategy, ChunkStrategyName, KnowledgeChunk } from "./types";

export const DEFAULT_CHUNK_OPTIONS: ChunkOptions = { strategy: "paragraph", fixedSize: 1_000 };

export const chunkStrategies: Record<ChunkStrategyName, ChunkStrategy> = {
  fixed: fixedSizeStrategy,
  paragraph: paragraphStrategy,
  heading: headingStrategy
};

const hashText = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  return hash.toString(36);
};

export function chunkDocument(document: KnowledgeDocument, requestedOptions: Partial<ChunkOptions> = {}): ChunkResult {
  const options: ChunkOptions = {
    strategy: requestedOptions.strategy ?? DEFAULT_CHUNK_OPTIONS.strategy,
    fixedSize: requestedOptions.fixedSize ?? DEFAULT_CHUNK_OPTIONS.fixedSize
  };
  const generatedAt = new Date().toISOString();
  const drafts = chunkStrategies[options.strategy].split(document, options);
  const chunks: KnowledgeChunk[] = drafts.map((draft, position) => ({
    id: `${document.id}-${options.strategy}-${position + 1}-${hashText(draft.text)}`,
    documentId: document.id,
    text: draft.text,
    category: document.category,
    position,
    length: draft.text.length,
    estimatedTokens: estimateChunkTokens(draft.text),
    chapter: draft.chapter,
    title: draft.title,
    path: [...draft.path],
    reference: {
      documentId: document.id,
      position,
      start: draft.start,
      end: draft.end
    },
    metadata: {
      category: document.category,
      tags: [...document.tags],
      fileName: document.metadata.fileName,
      fileType: document.metadata.fileType,
      strategy: options.strategy,
      headingLevel: draft.headingLevel,
      generatedAt
    }
  }));
  const lengths = chunks.map((chunk) => chunk.length);

  return {
    documentId: document.id,
    strategy: options.strategy,
    options,
    chunks,
    generatedAt,
    statistics: {
      count: chunks.length,
      averageLength: chunks.length ? Math.round(lengths.reduce((total, length) => total + length, 0) / chunks.length) : 0,
      estimatedTokens: chunks.reduce((total, chunk) => total + chunk.estimatedTokens, 0),
      longestChunk: lengths.length ? Math.max(...lengths) : 0,
      shortestChunk: lengths.length ? Math.min(...lengths) : 0
    }
  };
}
