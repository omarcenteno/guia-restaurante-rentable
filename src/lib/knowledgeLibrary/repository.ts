import { knowledgeIndex } from "@/lib/knowledge/knowledgeIndex";
import type { ChunkStrategyName } from "@/lib/knowledge/chunking";
import { loadActiveWorkspaceId, workspaceStorageKey } from "@/lib/workspaces";
import { initialKnowledgeDocuments } from "./mockDocuments";
import type { KnowledgeDocument, KnowledgeDocumentDraft, ParsedKnowledgeFile, RetrievalDocument } from "./types";

const STORAGE_KEY = "grr-knowledge-library-v1";

const countWords = (text: string) => text.trim() ? text.trim().split(/\s+/u).length : 0;
const legacyFileName = (document: Pick<KnowledgeDocument, "id" | "title">) => `${document.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || document.id}.md`;
const normalizeChunkStrategy = (value: unknown): ChunkStrategyName => value === "fixed" || value === "heading" || value === "paragraph" ? value : "paragraph";

const cloneInitialDocuments = () => initialKnowledgeDocuments.map((document) => ({
  ...document,
  tags: [...document.tags],
  metadata: { ...document.metadata },
  retrieval: { ...document.retrieval, chunkStrategy: normalizeChunkStrategy(document.retrieval.chunkStrategy) }
}));

const isKnowledgeDocument = (value: unknown): value is KnowledgeDocument => {
  if (!value || typeof value !== "object") return false;
  const document = value as Partial<KnowledgeDocument>;
  return typeof document.id === "string" && typeof document.title === "string" && typeof document.content === "string" && Array.isArray(document.tags);
};

const normalizeDocument = (document: KnowledgeDocument): KnowledgeDocument => ({
  ...document,
  tags: [...document.tags],
  previewContent: document.previewContent ?? document.content,
  metadata: document.metadata ?? {
    fileName: legacyFileName(document),
    fileType: "markdown",
    mimeType: "text/markdown",
    size: new TextEncoder().encode(document.content).byteLength,
    lastModified: document.updatedAt,
    wordCount: countWords(document.content),
    pageCount: null,
    source: "mock",
    parseStatus: "ready"
  },
  retrieval: { ...document.retrieval }
});

export function loadKnowledgeDocuments(): KnowledgeDocument[] {
  if (typeof window === "undefined") return cloneInitialDocuments();

  try {
    const scopedKey = workspaceStorageKey(loadActiveWorkspaceId(), STORAGE_KEY);
    const raw = window.localStorage.getItem(scopedKey) ?? window.localStorage.getItem(STORAGE_KEY);
    if (raw && !window.localStorage.getItem(scopedKey)) window.localStorage.setItem(scopedKey, raw);
    if (!raw) return cloneInitialDocuments();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(isKnowledgeDocument) ? parsed.map(normalizeDocument) : cloneInitialDocuments();
  } catch {
    return cloneInitialDocuments();
  }
}

export function saveKnowledgeDocuments(documents: KnowledgeDocument[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(workspaceStorageKey(loadActiveWorkspaceId(), STORAGE_KEY), JSON.stringify(documents));
  } catch {
    // The original file remains in IndexedDB even if browser metadata storage is full.
  }
}

export function updateKnowledgeDocument(document: KnowledgeDocument, draft: KnowledgeDocumentDraft): KnowledgeDocument {
  return {
    ...document,
    ...draft,
    tags: Array.from(new Set(draft.tags.map((tag) => tag.trim()).filter(Boolean))),
    updatedAt: new Date().toISOString(),
    previewContent: draft.content,
    metadata: {
      ...document.metadata,
      wordCount: countWords(draft.content)
    }
  };
}

export function duplicateKnowledgeDocument(document: KnowledgeDocument): KnowledgeDocument {
  const timestamp = Date.now();
  const id = `kb-${timestamp}`;
  const now = new Date().toISOString();

  return {
    ...document,
    id,
    title: `${document.title} (copia)`,
    tags: [...document.tags],
    createdAt: now,
    updatedAt: now,
    version: 1,
    status: "Borrador",
    favorite: false,
    usageCount: 0,
    metadata: { ...document.metadata },
    retrieval: {
      ...document.retrieval,
      documentKey: `grr-knowledge/${id}`
    }
  };
}

export function createKnowledgeDocumentFromFile(file: File, parsed: ParsedKnowledgeFile): KnowledgeDocument {
  const now = new Date().toISOString();
  const id = `kb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const title = file.name.replace(/\.(pdf|docx|md|markdown|txt|json)$/i, "").replace(/[-_]+/g, " ").trim() || "Documento importado";

  return {
    id,
    title,
    description: `Documento ${parsed.fileType.toUpperCase()} importado a la Biblioteca Inteligente.`,
    category: "Operación",
    tags: [parsed.fileType],
    createdAt: now,
    updatedAt: now,
    author: "Equipo GRR",
    version: 1,
    status: "Borrador",
    favorite: false,
    usageCount: 0,
    content: parsed.content,
    previewContent: parsed.previewContent,
    metadata: {
      fileName: file.name,
      fileType: parsed.fileType,
      mimeType: parsed.mimeType,
      size: file.size,
      lastModified: new Date(file.lastModified || Date.now()).toISOString(),
      wordCount: parsed.wordCount,
      pageCount: parsed.pageCount,
      source: "upload",
      parseStatus: "ready"
    },
    retrieval: {
      eligible: true,
      documentKey: `grr-knowledge/${id}`,
      chunkStrategy: "paragraph"
    }
  };
}

export function buildRetrievalDocument(document: KnowledgeDocument): RetrievalDocument {
  return knowledgeIndex.toRetrievalDocument(document);
}
