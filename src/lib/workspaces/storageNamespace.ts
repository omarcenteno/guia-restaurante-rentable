export type WorkspaceStorageArea = "knowledge" | "production" | "calendar" | "versions" | "settings" | "embeddings" | "preferences" | "assets";

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

export const StorageNamespace = {
  migrationVersion: 2,
  root(workspaceId: string): string {
    return `workspace/${workspaceId}`;
  },
  area(workspaceId: string, area: WorkspaceStorageArea): string {
    return `${this.root(workspaceId)}/${area}`;
  },
  key(workspaceId: string, area: WorkspaceStorageArea, path = "data"): string {
    return `${this.area(workspaceId, area)}/${trimSlashes(path)}`;
  },
  migrationKey(workspaceId: string): string {
    return this.key(workspaceId, "settings", "migration-version");
  },
  legacyScopedKey(workspaceId: string, legacyKey: string): string {
    return `grr-workspace:${workspaceId}:${legacyKey}`;
  },
  setting(workspaceId: string, key: string): string {
    return this.key(workspaceId, "settings", key);
  },
  preference(workspaceId: string, key: string): string {
    return this.key(workspaceId, "preferences", key);
  },
  knowledge(workspaceId: string, key = "library"): string {
    return this.key(workspaceId, "knowledge", key);
  },
  production(workspaceId: string, key = "items"): string {
    return this.key(workspaceId, "production", key);
  },
  productionHistory(workspaceId: string, publicationId: string): string {
    return this.key(workspaceId, "production", `history/${publicationId}`);
  },
  calendar(workspaceId: string, key = "content"): string {
    return this.key(workspaceId, "calendar", key);
  },
  version(workspaceId: string, publicationId: string): string {
    return this.key(workspaceId, "versions", publicationId);
  },
  versionsRoot(workspaceId: string): string {
    return this.area(workspaceId, "versions");
  },
  embeddings(workspaceId: string, key = "index"): string {
    return this.key(workspaceId, "embeddings", key);
  }
};
