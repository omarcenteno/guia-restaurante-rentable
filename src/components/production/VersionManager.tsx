"use client";

import { useMemo, useState } from "react";
import { generationSearchText, generationVideoPrompt, type StudioGenerationVersion, type StudioVersionStatus } from "@/lib/ai/studioVersions";

type VersionFilter = "Todos" | "Reels" | "Carruseles" | "Stories" | "Blogs" | "Posts" | "Lead Magnets";
type VersionSort = "Más reciente" | "Más antiguo" | "Favoritas" | "Más utilizadas";
type ExportFormat = "md" | "docx" | "json" | "txt";

const typeByFilter: Partial<Record<VersionFilter, string>> = { Reels: "reel", Carruseles: "carousel", Stories: "story", Blogs: "blog", Posts: "post", "Lead Magnets": "lead-magnet" };
const statuses: StudioVersionStatus[] = ["Borrador", "En revisión", "Aprobado", "Publicado"];

function relativeTime(value: string): string {
  const seconds = Math.round((Date.parse(value) - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  return formatter.format(Math.round(hours / 24), "day");
}

function formatDuration(milliseconds: number): string {
  if (!milliseconds) return "Sin registro";
  return milliseconds < 1000 ? `${milliseconds} ms` : `${(milliseconds / 1000).toFixed(1)} s`;
}

export function VersionManager({ versions, activeId, busyLabel, onOpen, onCompare, onRestore, onFavorite, onDuplicate, onRemove, onStatus, onCopy, onExport }: {
  versions: StudioGenerationVersion[];
  activeId: string | null;
  busyLabel?: string | null;
  onOpen: (version: StudioGenerationVersion) => void;
  onCompare: (version: StudioGenerationVersion) => void;
  onRestore: (version: StudioGenerationVersion) => void;
  onFavorite: (version: StudioGenerationVersion) => void;
  onDuplicate: (version: StudioGenerationVersion) => void;
  onRemove: (version: StudioGenerationVersion) => void;
  onStatus: (version: StudioGenerationVersion, status: StudioVersionStatus) => void;
  onCopy: (version: StudioGenerationVersion, markdown: boolean) => void;
  onExport: (version: StudioGenerationVersion, format: ExportFormat) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<VersionFilter>("Todos");
  const [sort, setSort] = useState<VersionSort>("Más reciente");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState("Todas");
  const tags = useMemo(() => Array.from(new Set(versions.flatMap((version) => version.tags))).sort((a, b) => a.localeCompare(b, "es")), [versions]);
  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    const type = typeByFilter[filter];
    return [...versions]
      .filter((version) => (!type || version.type === type)
        && (!favoriteOnly || version.favorite)
        && (tagFilter === "Todas" || version.tags.includes(tagFilter))
        && (!normalizedQuery || generationSearchText(version).includes(normalizedQuery)))
      .sort((a, b) => sort === "Más antiguo"
        ? Date.parse(a.createdAt) - Date.parse(b.createdAt)
        : sort === "Favoritas"
          ? Number(b.favorite) - Number(a.favorite) || Date.parse(b.createdAt) - Date.parse(a.createdAt)
          : sort === "Más utilizadas"
            ? b.useCount - a.useCount || Date.parse(b.createdAt) - Date.parse(a.createdAt)
            : Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [favoriteOnly, filter, query, sort, tagFilter, versions]);
  const active = versions.find((version) => version.id === activeId);

  return (
    <section id="studio-history" data-testid="version-manager" className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-terracotta">Versionado</p><h3 className="mt-1 text-xl font-semibold text-navy">Historial</h3><p className="mt-1 text-xs text-ink/50">{versions.length} versiones</p></div>{busyLabel ? <span className="text-xs font-semibold text-terracotta" role="status">{busyLabel}</span> : null}</div>
      {active ? <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" className="focus-ring rounded-md border border-gold/50 px-2 py-2 text-xs font-semibold text-navy transition-colors" onClick={() => onFavorite(active)}>{active.favorite ? "★ Favorita" : "☆ Favorita"}</button><button type="button" className="focus-ring rounded-md border border-ink/15 px-2 py-2 text-xs font-semibold text-navy transition-colors" onClick={() => onCompare(active)}>Comparar versiones</button></div> : null}

      <div className="mt-4 grid gap-2">
        <input aria-label="Buscar historial" className="focus-ring min-h-10 w-full rounded-md border border-ink/15 px-3 text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar título, hook, copy, CTA…" />
        <select aria-label="Filtrar tipo" className="focus-ring min-h-10 rounded-md border border-ink/15 bg-white px-3 text-sm" value={filter} onChange={(event) => setFilter(event.target.value as VersionFilter)}>{(["Todos", "Reels", "Carruseles", "Stories", "Blogs", "Posts", "Lead Magnets"] as VersionFilter[]).map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Filtrar etiqueta" className="focus-ring min-h-10 rounded-md border border-ink/15 bg-white px-3 text-sm" value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}><option>Todas</option>{tags.map((tag) => <option key={tag}>{tag}</option>)}</select>
        <select aria-label="Ordenar historial" className="focus-ring min-h-10 rounded-md border border-ink/15 bg-white px-3 text-sm" value={sort} onChange={(event) => setSort(event.target.value as VersionSort)}>{(["Más reciente", "Más antiguo", "Favoritas", "Más utilizadas"] as VersionSort[]).map((value) => <option key={value}>{value}</option>)}</select>
        <label className="flex min-h-10 items-center gap-2 rounded-md border border-ink/10 px-3 text-sm text-navy"><input type="checkbox" checked={favoriteOnly} onChange={(event) => setFavoriteOnly(event.target.checked)} />Mostrar solo favoritas</label>
      </div>

      <div className="mt-4 max-h-[34rem] overflow-y-auto">
        {visible.length ? visible.map((version) => <article key={version.id} className={`border-t py-3 ${version.id === activeId ? "border-gold" : "border-ink/10"}`}>
          <button type="button" className="focus-ring w-full text-left" onClick={() => onOpen(version)}>
            <span className="flex items-center justify-between gap-2"><span className="font-semibold text-navy">{version.favorite ? "★ " : ""}Versión {version.versionNumber}</span>{version.id === activeId ? <span className="text-xs font-semibold text-terracotta">Actual</span> : null}</span>
            <span className="mt-1 block text-xs text-ink/55">{relativeTime(version.createdAt)} · {new Date(version.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
            <span className="mt-1 block text-xs text-ink/55">{version.provider} · {version.model}</span>
            <span className="mt-1 block text-xs text-ink/55">IA {formatDuration(version.generationDurationMs)}{version.user ? ` · ${version.user}` : ""}</span>
            {version.source === "restored" ? <span className="mt-1 block text-xs font-semibold text-terracotta">Restaurada desde versión {version.restoredFromVersion}</span> : null}
            {version.tags.length ? <span className="mt-2 flex flex-wrap gap-1">{version.tags.map((tag) => <span key={tag} className="rounded-sm bg-gold/15 px-1.5 py-0.5 text-[11px] text-navy">{tag}</span>)}</span> : null}
          </button>
          <select aria-label={`Estado de versión ${version.versionNumber}`} className="focus-ring mt-2 min-h-9 w-full rounded-md border border-ink/15 bg-white px-2 text-xs" value={version.status} onChange={(event) => onStatus(version, event.target.value as StudioVersionStatus)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
          <div className="mt-2 grid grid-cols-3 gap-1"><button type="button" aria-label={`${version.favorite ? "Quitar favorita" : "Marcar favorita"} versión ${version.versionNumber}`} className="focus-ring rounded-md border border-ink/15 px-2 py-1 text-xs" onClick={() => onFavorite(version)}>{version.favorite ? "★" : "☆"}</button><button type="button" className="focus-ring rounded-md border border-ink/15 px-2 py-1 text-xs" onClick={() => onCompare(version)}>Comparar</button><button type="button" className="focus-ring rounded-md border border-ink/15 px-2 py-1 text-xs" onClick={() => onRestore(version)}>Restaurar</button><button type="button" className="focus-ring rounded-md border border-ink/15 px-2 py-1 text-xs" onClick={() => onDuplicate(version)}>Duplicar</button><button type="button" className="focus-ring rounded-md border border-ink/15 px-2 py-1 text-xs" onClick={() => onCopy(version, false)}>Copiar</button><button type="button" className="focus-ring rounded-md border border-terracotta/40 px-2 py-1 text-xs text-terracotta" onClick={() => onRemove(version)}>Eliminar</button></div>
        </article>) : <p className="border-t border-ink/10 py-4 text-sm text-ink/60">No hay versiones que coincidan con los filtros.</p>}
      </div>

      {active ? <div className="mt-4 border-t border-ink/10 pt-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-terracotta">Acciones</p><div className="mt-2 grid grid-cols-2 gap-2"><button type="button" className="focus-ring col-span-2 rounded-md border border-gold/50 px-2 py-2 text-xs font-semibold text-navy" onClick={() => onCopy(active, false)}>Copiar publicación completa</button><button type="button" className="focus-ring rounded-md border border-ink/15 px-2 py-2 text-xs text-navy" onClick={() => onCopy(active, true)}>Copiar Markdown</button><button type="button" className="focus-ring rounded-md border border-ink/15 px-2 py-2 text-xs text-navy" onClick={() => onExport(active, "md")}>Exportar Markdown</button><button type="button" className="focus-ring rounded-md border border-ink/15 px-2 py-2 text-xs text-navy" onClick={() => onExport(active, "docx")}>Exportar DOCX</button><button type="button" className="focus-ring rounded-md border border-ink/15 px-2 py-2 text-xs text-navy" onClick={() => onExport(active, "json")}>Exportar JSON</button><button type="button" className="focus-ring col-span-2 rounded-md border border-ink/15 px-2 py-2 text-xs text-navy" onClick={() => onExport(active, "txt")}>Exportar TXT</button></div></div> : null}
    </section>
  );
}

export function VersionMetadataPanel({ version, onNotesChange, onTagsChange }: { version: StudioGenerationVersion; onNotesChange: (notes: string) => void; onTagsChange: (tags: string[]) => void }) {
  const [tagDraft, setTagDraft] = useState("");
  const addTag = () => {
    const nextTag = tagDraft.trim();
    if (!nextTag || version.tags.some((tag) => tag.toLocaleLowerCase("es") === nextTag.toLocaleLowerCase("es"))) return;
    onTagsChange([...version.tags, nextTag]);
    setTagDraft("");
  };
  return <section className="rounded-md border border-ink/10 bg-white p-4 shadow-sm" data-testid="version-metadata"><div><p className="text-xs uppercase tracking-[0.2em] text-terracotta">Colaboración</p><h3 className="mt-1 text-xl font-semibold text-navy">Notas internas y etiquetas</h3></div><label className="mt-4 block text-sm font-semibold text-navy">Notas<textarea aria-label="Notas internas de la versión" className="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink/15 bg-white p-3 font-normal leading-6" value={version.notes} onChange={(event) => onNotesChange(event.target.value)} placeholder="Cambiar imagen, agregar CTA, usar para anuncio…" /></label><div className="mt-4"><p className="text-sm font-semibold text-navy">Etiquetas</p><div className="mt-2 flex flex-wrap gap-2">{version.tags.map((tag) => <button key={tag} type="button" className="focus-ring rounded-md border border-gold/40 px-2 py-1 text-xs text-navy" title={`Eliminar ${tag}`} onClick={() => onTagsChange(version.tags.filter((value) => value !== tag))}>{tag} ×</button>)}</div><div className="mt-2 flex gap-2"><input aria-label="Nueva etiqueta" className="focus-ring min-h-10 min-w-0 flex-1 rounded-md border border-ink/15 px-3 text-sm" value={tagDraft} onChange={(event) => setTagDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag(); } }} placeholder="Ventas, Ads, Prioridad Alta…" /><button type="button" className="focus-ring rounded-md border border-gold/50 px-3 py-2 text-sm font-semibold text-navy" onClick={addTag}>Agregar</button></div></div></section>;
}

function mostUsed(values: string[]): string {
  if (!values.length) return "Sin datos";
  const counts = values.reduce<Record<string, number>>((result, value) => ({ ...result, [value]: (result[value] ?? 0) + 1 }), {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export function StudioStatistics({ versions }: { versions: StudioGenerationVersion[] }) {
  const statistics = useMemo(() => {
    const publications = new Set(versions.map((version) => version.publicationId)).size;
    const generated = versions.filter((version) => version.source === "generated");
    const averageTime = generated.length ? generated.reduce((total, version) => total + version.generationDurationMs, 0) / generated.length : 0;
    const latest = versions.reduce<string | null>((result, version) => !result || Date.parse(version.updatedAt) > Date.parse(result) ? version.updatedAt : result, null);
    return { publications, total: versions.length, average: publications ? versions.length / publications : 0, averageTime, provider: mostUsed(generated.map((version) => version.provider)), model: mostUsed(generated.map((version) => version.model)), latest };
  }, [versions]);
  const rows = [["Publicaciones creadas", statistics.publications.toLocaleString("es-ES")], ["Versiones generadas", statistics.total.toLocaleString("es-ES")], ["Promedio de generaciones", statistics.average.toFixed(1)], ["Tiempo promedio IA", formatDuration(statistics.averageTime)], ["Proveedor utilizado", statistics.provider], ["Modelo utilizado", statistics.model], ["Última edición", statistics.latest ? relativeTime(statistics.latest) : "Sin actividad"]];
  return <section className="rounded-md border border-ink/10 bg-white p-4 shadow-sm" data-testid="studio-statistics"><h3 className="text-lg font-semibold text-navy">Estadísticas</h3>{rows.map(([label, value]) => <div key={label} className="mt-3 border-t border-ink/10 pt-2"><p className="text-xs uppercase tracking-[0.14em] text-terracotta">{label}</p><p className="mt-1 break-words text-sm font-semibold text-navy">{value}</p></div>)}</section>;
}

function highlightedWords(text: string, comparison: string, changedClass: string) {
  const comparisonWords = new Set(comparison.toLocaleLowerCase("es").split(/\s+/));
  return text.split(/(\s+)/).map((word, index) => comparisonWords.has(word.toLocaleLowerCase("es")) || !word.trim() ? <span key={`${word}-${index}`}>{word}</span> : <mark key={`${word}-${index}`} className={changedClass}>{word}</mark>);
}

function comparisonFields(version: StudioGenerationVersion) {
  return [
    ["Hook", version.content.hook],
    ["Copy", version.content.caption],
    ["CTA", version.content.cta],
    ["Hashtags", version.content.hashtags.join(" ")],
    ["Prompt", version.content.imagePrompt],
    ["Imagen", version.visualPrompts[0] ? `${version.visualPrompts[0].provider} · ${version.visualPrompts[0].prompt}` : "Sin prompt visual adicional"],
    ["Video", generationVideoPrompt(version)]
  ] as const;
}

export function VersionComparison({ previous, current, onClose }: { previous: StudioGenerationVersion; current: StudioGenerationVersion; onClose: () => void }) {
  const previousFields = comparisonFields(previous);
  const currentFields = comparisonFields(current);
  return <div className="fixed inset-0 z-[70] overflow-y-auto bg-navy/70 p-4" data-testid="version-comparison"><div className="mx-auto max-w-6xl rounded-md bg-cream p-5 shadow-editorial"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-terracotta">Comparar versiones</p><h3 className="mt-1 text-2xl font-semibold text-navy">Versión {previous.versionNumber} y versión {current.versionNumber}</h3></div><button type="button" className="focus-ring rounded-md border border-ink/15 px-3 py-2" onClick={onClose}>Cerrar</button></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm font-semibold text-navy"><div>Versión {previous.versionNumber}</div><div>Versión {current.versionNumber}</div></div><div className="mt-2 grid gap-4">{previousFields.map(([label, previousValue], index) => { const currentValue = currentFields[index][1]; return <section key={label} className="rounded-md border border-ink/10 bg-white p-4"><h4 className="text-xs uppercase tracking-[0.16em] text-terracotta">{label}</h4><div className="mt-3 grid gap-4 lg:grid-cols-2"><div className="whitespace-pre-wrap text-sm leading-6 text-ink/75">{highlightedWords(previousValue, currentValue, "bg-terracotta/20 text-ink")}</div><div className="whitespace-pre-wrap border-t border-gold/30 pt-3 text-sm leading-6 text-ink/75 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">{highlightedWords(currentValue, previousValue, "bg-gold/40 text-ink")}</div></div></section>; })}</div></div></div>;
}
