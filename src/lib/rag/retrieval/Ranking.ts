import type { HybridRetrievalQuery, HybridSearchResult, RankedRetrievalResult, RankingSignals, RankingWeights, RetrievalPriority } from "./types";

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  embeddingSimilarity: 0.4,
  tagMatch: 0.3,
  priority: 0.15,
  documentType: 0.15
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function priorityScore(priority: RetrievalPriority): number {
  if (typeof priority === "number") return clampScore(priority);
  const normalized = normalize(priority);
  if (normalized === "critical" || normalized === "critica" || normalized === "crítica") return 1;
  if (normalized === "high" || normalized === "alta") return 0.82;
  if (normalized === "medium" || normalized === "media") return 0.55;
  if (normalized === "low" || normalized === "baja") return 0.28;
  return 0.45;
}

function tagMatchScore(resultTags: string[], queryTags: string[] | undefined): number {
  const querySet = new Set((queryTags ?? []).map(normalize).filter(Boolean));
  if (!querySet.size) return 0.5;
  const resultSet = new Set(resultTags.map(normalize).filter(Boolean));
  const matches = [...querySet].filter((tag) => resultSet.has(tag)).length;
  return matches / querySet.size;
}

function documentTypeScore(resultType: string, requestedType: string | undefined): number {
  if (!requestedType) return 0.5;
  return normalize(resultType) === normalize(requestedType) ? 1 : 0;
}

function signalsFor(result: HybridSearchResult, query: HybridRetrievalQuery): RankingSignals {
  return {
    embeddingSimilarity: clampScore(result.embeddingScore),
    tagMatch: clampScore(tagMatchScore(result.metadata.tags, query.tags)),
    priority: priorityScore(result.metadata.priority),
    documentType: clampScore(documentTypeScore(result.metadata.documentType, query.documentType))
  };
}

function weightedScore(signals: RankingSignals, weights: RankingWeights): number {
  const score = signals.embeddingSimilarity * weights.embeddingSimilarity
    + signals.tagMatch * weights.tagMatch
    + signals.priority * weights.priority
    + signals.documentType * weights.documentType;
  return Number(clampScore(score).toFixed(6));
}

export function rankHybridResults(results: HybridSearchResult[], query: HybridRetrievalQuery, weights: RankingWeights = DEFAULT_RANKING_WEIGHTS): RankedRetrievalResult[] {
  return results
    .map((result) => {
      const signals = signalsFor(result, query);
      return {
        ...result,
        signals,
        score: weightedScore(signals, weights)
      };
    })
    .sort((left, right) => right.score - left.score || right.embeddingScore - left.embeddingScore)
    .map((result, index) => ({ ...result, rank: index + 1 }));
}
