import type { AIModel } from "./types";

export const AI_MODELS: readonly AIModel[] = [
  { id: "grr-mock-v1", name: "GRR Mock Generator", provider: "mock", contextWindow: 32000, maxOutputTokens: 4096, enabled: true },
  { id: "gpt-5.5", name: "GPT-5.5", provider: "openai", contextWindow: 1050000, maxOutputTokens: 128000, enabled: true }
];

export const DEFAULT_AI_MODEL_ID = "grr-mock-v1";

export function getAIModel(modelId = DEFAULT_AI_MODEL_ID): AIModel | undefined {
  return AI_MODELS.find((model) => model.id === modelId);
}
