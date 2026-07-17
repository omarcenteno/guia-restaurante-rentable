import "server-only";

import { openAIClient } from "./openaiClient";
import type { AIProviderRequest } from "./types";

export function generateFromOpenAI(request: AIProviderRequest) {
  return openAIClient.generate(request);
}
