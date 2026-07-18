import type { HybridSearchResult, RetrievalFilter, RetrievalMetadata } from "./types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function toSet(values: string[] | undefined): Set<string> | null {
  const normalized = (values ?? []).map(normalize).filter(Boolean);
  return normalized.length ? new Set(normalized) : null;
}

function hasOverlap(left: string[], right: Set<string> | null): boolean {
  if (!right) return true;
  return left.some((value) => right.has(normalize(value)));
}

function valueMatches(value: string | number | undefined, allowed: Set<string> | null): boolean {
  if (!allowed) return true;
  if (value === undefined || value === null) return false;
  return allowed.has(normalize(String(value)));
}

export function metadataMatches(metadata: RetrievalMetadata, filter: RetrievalFilter): boolean {
  if (normalize(metadata.workspace) !== normalize(filter.workspace)) return false;
  const categories = toSet(filter.categories);
  const tags = toSet(filter.tags);
  const priorities = toSet(filter.priorities?.map(String));
  const documentTypes = toSet(filter.documentTypes?.map(String));
  const languages = toSet(filter.languages);
  const versions = toSet(filter.versions?.map(String));

  return valueMatches(metadata.category, categories)
    && hasOverlap(metadata.tags, tags)
    && valueMatches(String(metadata.priority), priorities)
    && valueMatches(metadata.documentType, documentTypes)
    && valueMatches(metadata.language, languages)
    && valueMatches(metadata.version, versions);
}

export function filterByMetadata(results: HybridSearchResult[], filter: RetrievalFilter): HybridSearchResult[] {
  return results.filter((result) => metadataMatches(result.metadata, filter));
}
