import { StorageNamespace } from "./storageNamespace";
import { defaultWorkspace } from "./workspaceDefaults";

const workspaceAreaForLegacyKey = (legacyKey: string): string => {
  if (legacyKey === "grr-knowledge-library-v1") return StorageNamespace.knowledge(defaultWorkspace.id, "library");
  if (legacyKey === "grr-knowledge-chunk-options-v1") return StorageNamespace.knowledge(defaultWorkspace.id, "chunk-options");
  if (legacyKey === "grr-production") return StorageNamespace.production(defaultWorkspace.id, "items");
  if (legacyKey === "grr-content") return StorageNamespace.calendar(defaultWorkspace.id, "content");
  if (legacyKey === "grr-hooks") return StorageNamespace.setting(defaultWorkspace.id, "hooks");
  if (legacyKey === "grr-templates") return StorageNamespace.setting(defaultWorkspace.id, "templates");
  if (legacyKey === "grr-brand") return StorageNamespace.setting(defaultWorkspace.id, "brand");
  if (legacyKey === "grr-brand-book") return StorageNamespace.setting(defaultWorkspace.id, "brand-book");
  if (legacyKey === "grr-offer") return StorageNamespace.setting(defaultWorkspace.id, "offer");
  if (legacyKey === "grr-current-user") return StorageNamespace.preference(defaultWorkspace.id, "current-user");
  return "";
};

const legacyKeys = [
  "grr-knowledge-library-v1",
  "grr-knowledge-chunk-options-v1",
  "grr-production",
  "grr-content",
  "grr-hooks",
  "grr-templates",
  "grr-brand",
  "grr-brand-book",
  "grr-offer",
  "grr-current-user"
];

export function migrateWorkspaceData(workspaceId: string): void {
  if (typeof window === "undefined") return;
  const migrationKey = StorageNamespace.migrationKey(workspaceId);
  const currentVersion = Number(window.localStorage.getItem(migrationKey) ?? "0");
  if (currentVersion >= StorageNamespace.migrationVersion) return;

  legacyKeys.forEach((legacyKey) => {
    const target = workspaceAreaForLegacyKey(legacyKey).replace(StorageNamespace.root(defaultWorkspace.id), StorageNamespace.root(workspaceId));
    const previousScoped = StorageNamespace.legacyScopedKey(workspaceId, legacyKey);
    const value = window.localStorage.getItem(target)
      ?? window.localStorage.getItem(previousScoped)
      ?? (workspaceId === defaultWorkspace.id ? window.localStorage.getItem(legacyKey) : null);
    if (value !== null && window.localStorage.getItem(target) === null) window.localStorage.setItem(target, value);
  });

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (workspaceId !== defaultWorkspace.id || !key?.startsWith("grr-ai-studio-versions-v1:")) continue;
    const publicationId = key.replace("grr-ai-studio-versions-v1:", "");
    const target = StorageNamespace.version(workspaceId, publicationId);
    if (window.localStorage.getItem(target) === null) window.localStorage.setItem(target, window.localStorage.getItem(key) ?? "[]");
  }

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(`grr-workspace:${workspaceId}:grr-ai-studio-versions-v1:`)) continue;
    const publicationId = key.replace(`grr-workspace:${workspaceId}:grr-ai-studio-versions-v1:`, "");
    const target = StorageNamespace.version(workspaceId, publicationId);
    if (window.localStorage.getItem(target) === null) window.localStorage.setItem(target, window.localStorage.getItem(key) ?? "[]");
  }

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (workspaceId !== defaultWorkspace.id || !key?.startsWith("grr-production-history-")) continue;
    const publicationId = key.replace("grr-production-history-", "");
    const target = StorageNamespace.productionHistory(workspaceId, publicationId);
    if (window.localStorage.getItem(target) === null) window.localStorage.setItem(target, window.localStorage.getItem(key) ?? "[]");
  }

  window.localStorage.setItem(migrationKey, String(StorageNamespace.migrationVersion));
}
