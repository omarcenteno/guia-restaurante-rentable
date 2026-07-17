import type { ChunkDraft, ChunkStrategy } from "./types";

export const paragraphStrategy: ChunkStrategy = {
  id: "paragraph",
  label: "Paragraph",
  split(document): ChunkDraft[] {
    const paragraphs = document.content.split(/\n\s*\n+/u);
    const chunks: ChunkDraft[] = [];
    let cursor = 0;

    for (const paragraph of paragraphs) {
      const text = paragraph.trim();
      if (!text) continue;
      const start = document.content.indexOf(text, cursor);
      const safeStart = start >= 0 ? start : cursor;
      chunks.push({
        text,
        start: safeStart,
        end: safeStart + text.length,
        chapter: null,
        title: document.title,
        path: [document.title],
        headingLevel: null
      });
      cursor = safeStart + text.length;
    }

    return chunks;
  }
};
