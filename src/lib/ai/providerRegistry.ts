import "server-only";

import { AIProviderNotConnectedError } from "./errors";
import { openAIClient } from "./openaiClient";
import type { AIProvider, AIProviderClient } from "./types";

const providers: Partial<Record<AIProvider, AIProviderClient>> = {
  openai: openAIClient
};

export function getAIProvider(providerId: AIProvider = "openai"): AIProviderClient {
  const provider = providers[providerId];
  if (!provider) throw new AIProviderNotConnectedError();
  return provider;
}
