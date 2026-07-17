import type { ChunkDraft, ChunkStrategy } from "./types";

export const fixedSizeStrategy: ChunkStrategy = {
  id: "fixed",
  label: "Fixed",
  split(document, options): ChunkDraft[] {
    const size = Math.min(10_000, Math.max(100, Math.round(options.fixedSize)));
    const chunks: ChunkDraft[] = [];

    for (let start = 0; start < document.content.length; start += size) {
      const raw = document.content.slice(start, start + size);
      const text = raw.trim();
      if (!text) continue;
      const leadingWhitespace = raw.length - raw.trimStart().length;
      chunks.push({
        text,
        start: start + leadingWhitespace,
        end: start + leadingWhitespace + text.length,
        chapter: null,
        title: document.title,
        path: [document.title],
        headingLevel: null
      });
    }

    return chunks;
  }
};
