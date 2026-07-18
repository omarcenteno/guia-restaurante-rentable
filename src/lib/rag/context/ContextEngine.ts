import { resolveContextBudget } from "./ContextBudget";
import { buildContext } from "./ContextBuilder";
import type { ContextEngineInput, ContextEngineResult } from "./Types";

export class ContextEngine {
  build(input: ContextEngineInput): ContextEngineResult {
    const budget = resolveContextBudget(input.options.budget);
    const built = buildContext(input.searchResults, { ...input.options, budget });
    return {
      ...built,
      budget
    };
  }
}

export const contextEngine = new ContextEngine();
