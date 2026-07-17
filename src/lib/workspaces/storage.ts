import type { Workspace } from "./types";
import { defaultWorkspace } from "./workspaceDefaults";

export const ACTIVE_WORKSPACE_KEY = "grr-active-workspace";
export const WORKSPACE_STORAGE_PREFIX = "grr-workspace";

export function workspaceStorageKey(workspaceId: string, key: string): string {
  return `${WORKSPACE_STORAGE_PREFIX}:${workspaceId}:${key}`;
}

export function loadActiveWorkspaceId(fallback = defaultWorkspace.id): string {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(ACTIVE_WORKSPACE_KEY) || fallback;
}

export function saveActiveWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
}

export function loadWorkspaceLocal<T>(workspace: Pick<Workspace, "id">, legacyKey: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const scopedKey = workspaceStorageKey(workspace.id, legacyKey);
  try {
    const scopedRaw = window.localStorage.getItem(scopedKey);
    if (scopedRaw) return JSON.parse(scopedRaw) as T;
    const legacyRaw = window.localStorage.getItem(legacyKey);
    if (legacyRaw) {
      window.localStorage.setItem(scopedKey, legacyRaw);
      return JSON.parse(legacyRaw) as T;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function saveWorkspaceLocal<T>(workspace: Pick<Workspace, "id">, legacyKey: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(workspaceStorageKey(workspace.id, legacyKey), JSON.stringify(value));
}
