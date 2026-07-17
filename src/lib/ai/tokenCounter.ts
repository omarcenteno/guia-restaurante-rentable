import type { TokenUsage } from "./types";

export function estimateTokens(text: string): number {
  const normalized = text.trim();
  if (!normalized) return 0;
  const words = normalized.split(/\s+/).length;
  const characterEstimate = Math.ceil(normalized.length / 4);
  const wordEstimate = Math.ceil(words * 1.35);
  return Math.max(characterEstimate, wordEstimate);
}

export function estimateTokenUsage(prompt: string, output: string): TokenUsage {
  const promptTokens = estimateTokens(prompt);
  const completionTokens = estimateTokens(output);
  return { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens, estimated: true };
}
