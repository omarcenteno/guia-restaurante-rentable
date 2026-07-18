import type { KnowledgeFileType } from "../documentTypes";
import { loadActiveWorkspaceId, StorageNamespace } from "@/lib/workspaces";
import { defaultWorkspace } from "@/lib/workspaces/workspaceDefaults";
import { DEFAULT_CHUNK_OPTIONS } from "./chunkEngine";
import type { ChunkOptions } from "./types";

const STORAGE_KEY = "grr-knowledge-chunk-options-v1";

const defaultForType = (fileType: KnowledgeFileType): ChunkOptions => ({
  ...DEFAULT_CHUNK_OPTIONS,
  strategy: fileType === "markdown" ? "heading" : "paragraph"
});

export function loadChunkOptions(documentId: string, fileType: KnowledgeFileType, workspaceId = loadActiveWorkspaceId()): ChunkOptions {
  if (typeof window === "undefined") return defaultForType(fileType);
  try {
    const scopedKey = StorageNamespace.knowledge(workspaceId, "chunk-options");
    const previousScopedKey = StorageNamespace.legacyScopedKey(workspaceId, STORAGE_KEY);
    const raw = window.localStorage.getItem(scopedKey) ?? window.localStorage.getItem(previousScopedKey) ?? (workspaceId === defaultWorkspace.id ? window.localStorage.getItem(STORAGE_KEY) : null) ?? "{}";
    if (raw !== "{}" && !window.localStorage.getItem(scopedKey)) window.localStorage.setItem(scopedKey, raw);
    const stored = JSON.parse(raw) as Record<string, ChunkOptions>;
    return stored[documentId] ?? defaultForType(fileType);
  } catch {
    return defaultForType(fileType);
  }
}

export function saveChunkOptions(documentId: string, options: ChunkOptions, workspaceId = loadActiveWorkspaceId()): void {
  if (typeof window === "undefined") return;
  try {
    const scopedKey = StorageNamespace.knowledge(workspaceId, "chunk-options");
    const stored = JSON.parse(window.localStorage.getItem(scopedKey) ?? "{}") as Record<string, ChunkOptions>;
    window.localStorage.setItem(scopedKey, JSON.stringify({ ...stored, [documentId]: options }));
  } catch {
    // Chunk options are non-critical and can be regenerated from defaults.
  }
}
