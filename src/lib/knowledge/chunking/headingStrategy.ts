import type { ChunkDraft, ChunkStrategy } from "./types";

interface Section {
  lines: string[];
  start: number;
  chapter: string | null;
  title: string;
  path: string[];
  headingLevel: number | null;
}

export const headingStrategy: ChunkStrategy = {
  id: "heading",
  label: "Heading",
  split(document, options): ChunkDraft[] {
    const lines = document.content.replace(/\r\n/g, "\n").split("\n");
    const sections: Section[] = [];
    const hierarchy: string[] = [];
    let cursor = 0;
    let current: Section = {
      lines: [],
      start: 0,
      chapter: null,
      title: document.title,
      path: [document.title],
      headingLevel: null
    };

    const flush = () => {
      if (current.lines.join("\n").trim()) sections.push(current);
    };

    for (const line of lines) {
      const heading = /^(#{1,3})\s+(.+?)\s*$/u.exec(line);
      if (heading) {
        flush();
        const level = heading[1].length;
        const headingTitle = heading[2].trim();
        hierarchy[level - 1] = headingTitle;
        hierarchy.length = level;
        current = {
          lines: [line],
          start: cursor,
          chapter: hierarchy[0] ?? headingTitle,
          title: headingTitle,
          path: [...hierarchy],
          headingLevel: level
        };
      } else {
        current.lines.push(line);
      }
      cursor += line.length + 1;
    }
    flush();

    if (!sections.some((section) => section.headingLevel !== null)) {
      const fallback = document.content.split(/\n\s*\n+/u).map((text) => text.trim()).filter(Boolean);
      let fallbackCursor = 0;
      return fallback.map((text) => {
        const start = document.content.indexOf(text, fallbackCursor);
        const safeStart = start >= 0 ? start : fallbackCursor;
        fallbackCursor = safeStart + text.length;
        return { text, start: safeStart, end: safeStart + text.length, chapter: null, title: document.title, path: [document.title], headingLevel: null };
      });
    }

    const maxSize = Math.min(10_000, Math.max(100, Math.round(options.fixedSize)));
    return sections.flatMap((section) => {
      const sectionText = section.lines.join("\n").trim();
      if (sectionText.length <= maxSize) return [{ ...section, text: sectionText, end: section.start + sectionText.length }];
      const parts: ChunkDraft[] = [];
      for (let offset = 0; offset < sectionText.length; offset += maxSize) {
        const text = sectionText.slice(offset, offset + maxSize).trim();
        if (!text) continue;
        parts.push({
          text,
          start: section.start + offset,
          end: section.start + offset + text.length,
          chapter: section.chapter,
          title: section.title,
          path: [...section.path],
          headingLevel: section.headingLevel
        });
      }
      return parts;
    });
  }
};
