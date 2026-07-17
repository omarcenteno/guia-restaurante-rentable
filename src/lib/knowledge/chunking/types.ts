import type { KnowledgeCategory, KnowledgeDocument, KnowledgeFileType, KnowledgeTag } from "../documentTypes";

export type ChunkStrategyName = "fixed" | "paragraph" | "heading";

export interface ChunkOptions {
  strategy: ChunkStrategyName;
  fixedSize: number;
}

export interface ChunkReference {
  documentId: string;
  position: number;
  start: number;
  end: number;
}

export interface ChunkMetadata {
  category: KnowledgeCategory;
  tags: KnowledgeTag[];
  fileName: string;
  fileType: KnowledgeFileType;
  strategy: ChunkStrategyName;
  headingLevel: number | null;
  generatedAt: string;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  text: string;
  category: KnowledgeCategory;
  position: number;
  length: number;
  estimatedTokens: number;
  chapter: string | null;
  title: string;
  path: string[];
  reference: ChunkReference;
  metadata: ChunkMetadata;
}

export interface ChunkStatistics {
  count: number;
  averageLength: number;
  estimatedTokens: number;
  longestChunk: number;
  shortestChunk: number;
}

export interface ChunkResult {
  documentId: string;
  strategy: ChunkStrategyName;
  options: ChunkOptions;
  chunks: KnowledgeChunk[];
  statistics: ChunkStatistics;
  generatedAt: string;
}

export interface ChunkDraft {
  text: string;
  start: number;
  end: number;
  chapter: string | null;
  title: string;
  path: string[];
  headingLevel: number | null;
}

export interface ChunkStrategy {
  readonly id: ChunkStrategyName;
  readonly label: string;
  split(document: KnowledgeDocument, options: ChunkOptions): ChunkDraft[];
}
