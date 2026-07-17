import type { KnowledgeFileType } from "../documentTypes";
import { DEFAULT_CHUNK_OPTIONS } from "./chunkEngine";
import type { ChunkOptions } from "./types";

const STORAGE_KEY = "grr-knowledge-chunk-options-v1";

const defaultForType = (fileType: KnowledgeFileType): ChunkOptions => ({
  ...DEFAULT_CHUNK_OPTIONS,
  strategy: fileType === "markdown" ? "heading" : "paragraph"
});

export function loadChunkOptions(documentId: string, fileType: KnowledgeFileType): ChunkOptions {
  if (typeof window === "undefined") return defaultForType(fileType);
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, ChunkOptions>;
    return stored[documentId] ?? defaultForType(fileType);
  } catch {
    return defaultForType(fileType);
  }
}

export function saveChunkOptions(documentId: string, options: ChunkOptions): void {
  if (typeof window === "undefined") return;
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, ChunkOptions>;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, [documentId]: options }));
  } catch {
    // Chunk options are non-critical and can be regenerated from defaults.
  }
}
