import {
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_SORTS,
  KNOWLEDGE_STATUSES,
  type KnowledgeSort
} from "@/lib/knowledgeLibrary";

interface LibraryFiltersProps {
  query: string;
  category: string;
  status: string;
  favoritesOnly: boolean;
  sort: KnowledgeSort;
  resultCount: number;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onFavoritesChange: (value: boolean) => void;
  onSortChange: (value: KnowledgeSort) => void;
  onClear: () => void;
}

export function LibraryFilters({
  query,
  category,
  status,
  favoritesOnly,
  sort,
  resultCount,
  onQueryChange,
  onCategoryChange,
  onStatusChange,
  onFavoritesChange,
  onSortChange,
  onClear
}: LibraryFiltersProps) {
  const hasFilters = Boolean(query || category !== "Todas" || status !== "Todos" || favoritesOnly || sort !== "Más recientes");

  return (
    <section className="rounded-md border border-ink/10 bg-white/80 p-4 shadow-sm" aria-label="Buscar y filtrar documentos">
      <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_repeat(3,minmax(150px,auto))]">
        <label className="text-sm font-semibold text-navy">
          Buscar
          <input
            className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 bg-white px-3 font-normal text-ink"
            type="search"
            placeholder="Título, descripción, etiqueta, categoría o autor"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <label className="text-sm font-semibold text-navy">
          Categoría
          <select className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 bg-white px-3 font-normal text-ink" value={category} onChange={(event) => onCategoryChange(event.target.value)}>
            {["Todas", ...KNOWLEDGE_CATEGORIES].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-navy">
          Estado
          <select className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 bg-white px-3 font-normal text-ink" value={status} onChange={(event) => onStatusChange(event.target.value)}>
            {["Todos", ...KNOWLEDGE_STATUSES].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-navy">
          Ordenar
          <select className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 bg-white px-3 font-normal text-ink" value={sort} onChange={(event) => onSortChange(event.target.value as KnowledgeSort)}>
            {KNOWLEDGE_SORTS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-3">
        <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm font-semibold text-navy">
          <input className="focus-ring h-4 w-4 accent-navy" type="checkbox" checked={favoritesOnly} onChange={(event) => onFavoritesChange(event.target.checked)} />
          Solo favoritos
        </label>
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink/60" aria-live="polite">{resultCount} {resultCount === 1 ? "documento" : "documentos"}</span>
          {hasFilters ? <button className="focus-ring rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold text-navy transition hover:border-gold/60 hover:bg-cream" onClick={onClear}>Limpiar</button> : null}
        </div>
      </div>
    </section>
  );
}
