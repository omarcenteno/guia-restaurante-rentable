import type { GenerationHistoryItem } from "./types";

const MAX_HISTORY_ITEMS = 100;
const history: GenerationHistoryItem[] = [];

function cloneHistoryItem(item: GenerationHistoryItem): GenerationHistoryItem {
  return structuredClone(item);
}

export function recordGeneration(item: GenerationHistoryItem): GenerationHistoryItem {
  history.unshift(cloneHistoryItem(item));
  if (history.length > MAX_HISTORY_ITEMS) history.length = MAX_HISTORY_ITEMS;
  return cloneHistoryItem(item);
}

export function getGenerationHistory(): GenerationHistoryItem[] {
  return history.map(cloneHistoryItem);
}

export function clearGenerationHistory(): void {
  history.length = 0;
}
