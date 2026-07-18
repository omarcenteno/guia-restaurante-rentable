import type { ContextBudgetOptions, ContextChunk } from "./Types";

export const DEFAULT_CONTEXT_BUDGET: ContextBudgetOptions = {
  maxTokens: 8000,
  reservedPromptTokens: 1600,
  minChunkTokens: 80,
  compressionRatio: 0.55
};

export function resolveContextBudget(options: Partial<ContextBudgetOptions> = {}): ContextBudgetOptions {
  return {
    maxTokens: Math.max(1000, options.maxTokens ?? DEFAULT_CONTEXT_BUDGET.maxTokens),
    reservedPromptTokens: Math.max(0, options.reservedPromptTokens ?? DEFAULT_CONTEXT_BUDGET.reservedPromptTokens),
    minChunkTokens: Math.max(20, options.minChunkTokens ?? DEFAULT_CONTEXT_BUDGET.minChunkTokens),
    compressionRatio: Math.min(0.95, Math.max(0.2, options.compressionRatio ?? DEFAULT_CONTEXT_BUDGET.compressionRatio))
  };
}

export function availableContextTokens(budget: ContextBudgetOptions): number {
  return Math.max(budget.minChunkTokens, budget.maxTokens - budget.reservedPromptTokens);
}

export function fitChunksToBudget(chunks: ContextChunk[], budget: ContextBudgetOptions): ContextChunk[] {
  const available = availableContextTokens(budget);
  let used = 0;
  const selected: ContextChunk[] = [];
  for (const chunk of chunks) {
    if (used + chunk.finalTokens > available && selected.length) continue;
    if (used + chunk.finalTokens > available && chunk.finalTokens > available) continue;
    selected.push(chunk);
    used += chunk.finalTokens;
  }
  return selected;
}
