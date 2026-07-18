import type { ContextBudgetOptions, ContextChunk } from "./Types";
import { estimateTokens } from "./TokenEstimator";

function sentenceSplit(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/u).map((sentence) => sentence.trim()).filter(Boolean);
}

function compressText(text: string, targetTokens: number): string {
  const sentences = sentenceSplit(text);
  if (!sentences.length) return text.slice(0, Math.max(120, targetTokens * 4)).trim();
  const selected: string[] = [];
  let tokens = 0;
  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence);
    if (tokens + sentenceTokens > targetTokens && selected.length) break;
    selected.push(sentence);
    tokens += sentenceTokens;
  }
  return selected.join(" ").trim() || sentences[0];
}

export function compressChunks(chunks: ContextChunk[], budget: ContextBudgetOptions): ContextChunk[] {
  return chunks.map((chunk) => {
    if (chunk.finalTokens <= budget.minChunkTokens) return chunk;
    const targetTokens = Math.max(budget.minChunkTokens, Math.floor(chunk.finalTokens * budget.compressionRatio));
    const text = compressText(chunk.text, targetTokens);
    const finalTokens = estimateTokens(text);
    return {
      ...chunk,
      text,
      finalTokens,
      compressed: finalTokens < chunk.estimatedTokens
    };
  });
}
