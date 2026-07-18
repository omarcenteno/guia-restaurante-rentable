import "server-only";

import { EmbeddingEngine } from "./embeddingEngine";
import { OpenAIEmbeddingProvider } from "./openAIEmbeddingProvider";

export { OpenAIEmbeddingProvider } from "./openAIEmbeddingProvider";

const engines = new Map<string, EmbeddingEngine>();

export function getWorkspaceEmbeddingEngine(workspaceId: string): EmbeddingEngine {
  const normalizedWorkspaceId = workspaceId.trim() || "grr";
  const existing = engines.get(normalizedWorkspaceId);
  if (existing) return existing;
  const engine = new EmbeddingEngine(new OpenAIEmbeddingProvider());
  engines.set(normalizedWorkspaceId, engine);
  return engine;
}
