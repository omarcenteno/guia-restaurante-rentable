import type { ChunkOptions, ChunkStrategyName, KnowledgeChunk } from "./chunking/types";

export const KNOWLEDGE_CATEGORIES = [
  "Operación",
  "Finanzas",
  "Marketing",
  "Apertura",
  "Menús",
  "Food Cost",
  "Labor Cost",
  "Permisos",
  "Recursos Humanos",
  "Ventas",
  "Atención al Cliente",
  "SOP",
  "Plantillas",
  "Checklists",
  "Branding",
  "Redes Sociales"
] as const;

export const KNOWLEDGE_STATUSES = ["Borrador", "Publicado", "Archivado"] as const;
export const KNOWLEDGE_FILE_TYPES = ["pdf", "docx", "markdown", "txt", "json"] as const;

export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];
export type KnowledgeDocumentStatus = (typeof KNOWLEDGE_STATUSES)[number];
export type KnowledgeFileType = (typeof KNOWLEDGE_FILE_TYPES)[number];
export type KnowledgeTag = string;

export interface KnowledgeMetadata {
  fileName: string;
  fileType: KnowledgeFileType;
  mimeType: string;
  size: number;
  lastModified: string;
  wordCount: number;
  pageCount: number | null;
  source: "mock" | "upload";
  parseStatus: "ready" | "error";
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  description: string;
  category: KnowledgeCategory;
  tags: KnowledgeTag[];
  createdAt: string;
  updatedAt: string;
  author: string;
  version: number;
  status: KnowledgeDocumentStatus;
  favorite: boolean;
  usageCount: number;
  content: string;
  previewContent: string;
  metadata: KnowledgeMetadata;
  retrieval: {
    eligible: boolean;
    documentKey: string;
    chunkStrategy: ChunkStrategyName;
  };
}

export interface KnowledgeDocumentDraft {
  title: string;
  description: string;
  category: KnowledgeCategory;
  tags: KnowledgeTag[];
  author: string;
  version: number;
  status: KnowledgeDocumentStatus;
  content: string;
}

export interface RetrievalDocument {
  id: string;
  documentKey: string;
  title: string;
  category: KnowledgeCategory;
  tags: KnowledgeTag[];
  content: string;
  chunks: KnowledgeChunk[];
  metadata: KnowledgeMetadata & {
    author: string;
    version: number;
    updatedAt: string;
    status: KnowledgeDocumentStatus;
  };
}

export interface ParsedKnowledgeFile {
  content: string;
  previewContent: string;
  fileType: KnowledgeFileType;
  mimeType: string;
  wordCount: number;
  pageCount: number | null;
  warnings: string[];
}

export interface DocumentParser {
  readonly id: string;
  readonly supportedTypes: readonly KnowledgeFileType[];
  canParse(file: File): boolean;
  parse(file: File): Promise<ParsedKnowledgeFile>;
}

export interface KnowledgeProvider {
  list(): Promise<KnowledgeDocument[]>;
  get(documentId: string): Promise<KnowledgeDocument | null>;
  save(document: KnowledgeDocument, file?: File): Promise<void>;
  remove(documentId: string): Promise<void>;
  getFile(documentId: string): Promise<Blob | null>;
  duplicateFile(sourceDocumentId: string, targetDocumentId: string): Promise<void>;
}

export interface KnowledgeIndex {
  createChunks(document: KnowledgeDocument, options?: Partial<ChunkOptions>): KnowledgeChunk[];
  toRetrievalDocument(document: KnowledgeDocument): RetrievalDocument;
}

export type { KnowledgeChunk } from "./chunking/types";
