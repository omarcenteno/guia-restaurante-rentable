import type { Workspace } from "./types";
import { StorageNamespace } from "./storageNamespace";
import { defaultWorkspace } from "./workspaceDefaults";

export const ACTIVE_WORKSPACE_KEY = "grr-active-workspace";
export const WORKSPACE_STORAGE_PREFIX = "grr-workspace";

export function workspaceStorageKey(workspaceId: string, key: string): string {
  if (key.startsWith("workspace/")) return key;
  return StorageNamespace.legacyScopedKey(workspaceId, key);
}

export function workspaceDataKey(workspaceId: string, key: string): string {
  return key.startsWith("workspace/") ? key : StorageNamespace.key(workspaceId, "settings", key);
}

export function loadActiveWorkspaceId(fallback = defaultWorkspace.id): string {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(ACTIVE_WORKSPACE_KEY) || fallback;
}

export function saveActiveWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
}

export function loadWorkspaceLocal<T>(workspace: Pick<Workspace, "id">, legacyKey: string, fallback: T, legacyAliases: string[] = []): T {
  if (typeof window === "undefined") return fallback;
  const scopedKey = workspaceDataKey(workspace.id, legacyKey);
  const previousScopedKey = workspaceStorageKey(workspace.id, legacyKey);
  const candidates = [scopedKey, previousScopedKey, legacyKey, ...legacyAliases.flatMap((key) => [workspaceStorageKey(workspace.id, key), key])];
  try {
    for (const candidate of candidates) {
      const raw = window.localStorage.getItem(candidate);
      if (!raw) continue;
      if (candidate !== scopedKey) window.localStorage.setItem(scopedKey, raw);
      return JSON.parse(raw) as T;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function saveWorkspaceLocal<T>(workspace: Pick<Workspace, "id">, legacyKey: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(workspaceDataKey(workspace.id, legacyKey), JSON.stringify(value));
}
