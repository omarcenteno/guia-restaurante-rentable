import { DEFAULT_EMBEDDING_DIMENSIONS, DEFAULT_EMBEDDING_MODEL } from "./constants";
import { hashText } from "./hash";
import type { EmbeddingProvider } from "./types";

function vectorForText(text: string, dimensions: number): number[] {
  const vector = Array.from({ length: dimensions }, () => 0);
  const words = text.toLowerCase().split(/[^a-z0-9áéíóúñü]+/i).filter(Boolean);
  const source = words.length ? words : [text || "empty"];
  source.forEach((word, index) => {
    const hash = parseInt(hashText(`${word}:${index}`), 36);
    const slot = Math.abs(hash) % dimensions;
    vector[slot] += 1 + (word.length % 7) / 10;
  });
  const magnitude = Math.sqrt(vector.reduce((total, value) => total + value ** 2, 0)) || 1;
  return vector.map((value) => value / magnitude);
}

export class DeterministicEmbeddingProvider implements EmbeddingProvider {
  readonly id = "deterministic" as const;
  readonly model = DEFAULT_EMBEDDING_MODEL;
  readonly dimensions: number;

  constructor(dimensions = DEFAULT_EMBEDDING_DIMENSIONS) {
    this.dimensions = dimensions;
  }

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((text) => vectorForText(text, this.dimensions));
  }
}
