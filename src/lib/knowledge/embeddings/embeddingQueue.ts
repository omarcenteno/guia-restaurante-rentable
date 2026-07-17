import type { EmbeddingQueueItem, EmbeddingStatus } from "./types";

export class EmbeddingQueue {
  private readonly items = new Map<string, EmbeddingQueueItem>();

  enqueue(id: string, chunk: EmbeddingQueueItem["chunk"]): EmbeddingQueueItem {
    const item: EmbeddingQueueItem = {
      id,
      chunk,
      status: "idle",
      createdAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
      error: null
    };
    this.items.set(id, item);
    return item;
  }

  mark(id: string, status: EmbeddingStatus, error: string | null = null): void {
    const current = this.items.get(id);
    if (!current) return;
    this.items.set(id, {
      ...current,
      status,
      startedAt: status === "generating" ? new Date().toISOString() : current.startedAt,
      finishedAt: status === "ready" || status === "error" ? new Date().toISOString() : current.finishedAt,
      error
    });
  }

  list(): EmbeddingQueueItem[] {
    return [...this.items.values()];
  }

  clear(): void {
    this.items.clear();
  }
}
