import type { KnowledgeChunk } from "@/lib/knowledge/documentTypes";

export { KNOWLEDGE_CATEGORIES, KNOWLEDGE_FILE_TYPES, KNOWLEDGE_STATUSES } from "@/lib/knowledge/documentTypes";
export type {
  DocumentParser,
  KnowledgeCategory,
  KnowledgeChunk,
  KnowledgeDocument,
  KnowledgeDocumentDraft,
  KnowledgeDocumentStatus,
  KnowledgeFileType,
  KnowledgeIndex,
  KnowledgeMetadata,
  KnowledgeProvider,
  KnowledgeTag,
  ParsedKnowledgeFile,
  RetrievalDocument
} from "@/lib/knowledge/documentTypes";

export const KNOWLEDGE_SORTS = ["Más recientes", "Más usados", "Título A-Z"] as const;
export type KnowledgeSort = (typeof KNOWLEDGE_SORTS)[number];
export type RetrievalChunk = KnowledgeChunk;
