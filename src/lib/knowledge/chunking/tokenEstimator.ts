export function estimateChunkTokens(text: string): number {
  if (!text.trim()) return 0;
  const characterEstimate = text.length / 4;
  const wordEstimate = text.trim().split(/\s+/u).length * 1.3;
  return Math.max(1, Math.ceil(Math.max(characterEstimate, wordEstimate)));
}
