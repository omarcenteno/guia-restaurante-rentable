import { HybridRetriever } from "./HybridRetriever";
import type { RetrievalMetrics, RetrievalPipelineInput, RetrievalPipelineResult } from "./types";

function metricsFor(input: {
  inputResults: number;
  filteredResults: number;
  durationMs: number;
  averageScore: number;
}): RetrievalMetrics {
  return {
    inputResults: input.inputResults,
    filteredResults: input.filteredResults,
    rankedResults: input.filteredResults,
    outputResults: input.filteredResults,
    averageScore: input.averageScore,
    durationMs: input.durationMs
  };
}

export class RetrievalPipeline {
  constructor(private readonly retriever = new HybridRetriever()) {}

  run(input: RetrievalPipelineInput): RetrievalPipelineResult {
    const startedAt = Date.now();
    const results = this.retriever.retrieve(input);
    const averageScore = results.length
      ? Number((results.reduce((total, result) => total + result.score, 0) / results.length).toFixed(6))
      : 0;
    return {
      query: input.query,
      results,
      metrics: metricsFor({
        inputResults: input.searchResults.length,
        filteredResults: results.length,
        averageScore,
        durationMs: Date.now() - startedAt
      })
    };
  }
}

export const retrievalPipeline = new RetrievalPipeline();
