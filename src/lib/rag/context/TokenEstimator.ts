export function estimateTokens(text: string): number {
  const clean = text.trim();
  if (!clean) return 0;
  const words = clean.split(/\s+/u).filter(Boolean).length;
  const punctuation = (clean.match(/[.,;:!?¿¡()[\]{}]/g) ?? []).length;
  return Math.max(1, Math.ceil(clean.length / 4), Math.ceil(words * 1.25 + punctuation * 0.15));
}

export function estimateManyTokens(values: string[]): number {
  return values.reduce((total, value) => total + estimateTokens(value), 0);
}
