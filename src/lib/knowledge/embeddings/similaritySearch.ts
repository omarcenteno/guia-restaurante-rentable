import type { EmbeddingProvider, SearchProvider, SearchResult } from "./types";
import { VectorIndex } from "./vectorIndex";

export function cosineSimilarity(left: number[], right: number[]): number {
  const length = Math.min(left.length, right.length);
  if (!length) return 0;
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }
  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
  return denominator ? dot / denominator : 0;
}

export class SimilaritySearch implements SearchProvider {
  constructor(private readonly index: VectorIndex, private readonly provider: EmbeddingProvider) {}

  async search(query: string, topK = 5): Promise<SearchResult[]> {
    const [queryVector] = await this.provider.embed([query]);
    return this.index.search(queryVector, topK, this.similarity);
  }

  similarity(left: number[], right: number[]): number {
    return cosineSimilarity(left, right);
  }

  topK(results: SearchResult[], topK: number): SearchResult[] {
    return [...results].sort((left, right) => right.score - left.score).slice(0, topK).map((result, index) => ({ ...result, rank: index + 1 }));
  }
}
