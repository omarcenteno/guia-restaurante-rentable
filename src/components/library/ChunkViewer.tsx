import { useEffect, useState } from "react";
import {
  chunkDocument,
  loadChunkOptions,
  saveChunkOptions,
  type ChunkOptions,
  type ChunkResult,
  type ChunkStrategyName
} from "@/lib/knowledge/chunking";
import type { KnowledgeDocument } from "@/lib/knowledgeLibrary";

const strategyLabels: Record<ChunkStrategyName, string> = {
  fixed: "Fixed",
  paragraph: "Paragraph",
  heading: "Heading"
};

export function ChunkViewer({ document, onClose }: { document: KnowledgeDocument; onClose: () => void }) {
  const initialOptions = loadChunkOptions(document.id, document.metadata.fileType);
  const [options, setOptions] = useState<ChunkOptions>(initialOptions);
  const [result, setResult] = useState<ChunkResult>(() => chunkDocument(document, initialOptions));
  const [expandedId, setExpandedId] = useState(result.chunks[0]?.id ?? "");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const nextOptions = loadChunkOptions(document.id, document.metadata.fileType);
    const nextResult = chunkDocument(document, nextOptions);
    setOptions(nextOptions);
    setResult(nextResult);
    setExpandedId(nextResult.chunks[0]?.id ?? "");
  }, [document]);

  const regenerate = () => {
    const nextResult = chunkDocument(document, options);
    setResult(nextResult);
    setExpandedId(nextResult.chunks[0]?.id ?? "");
    saveChunkOptions(document.id, options);
    setNotice("Chunks regenerados.");
    window.setTimeout(() => setNotice(""), 1800);
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-navy/55 p-4" role="presentation">
      <section className="scrollbar max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-md bg-white shadow-editorial" role="dialog" aria-modal="true" aria-labelledby="chunk-viewer-title">
        <header className="sticky top-0 z-10 flex flex-col justify-between gap-4 border-b border-ink/10 bg-white p-5 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">Knowledge Chunking Engine</p>
            <h2 id="chunk-viewer-title" className="mt-2 text-2xl font-semibold text-navy">Chunks de {document.title}</h2>
            <p className="mt-2 text-sm text-ink/60">{document.metadata.fileName}</p>
          </div>
          <button type="button" className="focus-ring rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold text-navy transition hover:bg-cream" onClick={onClose}>Cerrar</button>
        </header>

        <div className="border-b border-ink/10 p-5">
          <div className="grid gap-3 md:grid-cols-[minmax(180px,0.8fr)_minmax(160px,0.6fr)_auto] md:items-end">
            <label className="text-sm font-semibold text-navy">
              Estrategia
              <select className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 bg-white px-3 font-normal text-ink" value={options.strategy} onChange={(event) => setOptions((current) => ({ ...current, strategy: event.target.value as ChunkStrategyName }))}>
                {(Object.keys(strategyLabels) as ChunkStrategyName[]).map((strategy) => <option key={strategy} value={strategy}>{strategyLabels[strategy]}</option>)}
              </select>
            </label>
            <label className={`text-sm font-semibold text-navy ${options.strategy === "paragraph" ? "opacity-55" : ""}`}>
              Tamaño máximo
              <input className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 px-3 font-normal text-ink disabled:bg-ink/5" type="number" min={100} max={10000} step={100} disabled={options.strategy === "paragraph"} value={options.fixedSize} onChange={(event) => setOptions((current) => ({ ...current, fixedSize: Math.min(10000, Math.max(100, Number(event.target.value) || 100)) }))} />
            </label>
            <button type="button" className="focus-ring min-h-11 rounded-md bg-navy px-4 text-sm font-semibold text-white transition hover:bg-navy/90" onClick={regenerate}>Regenerar chunks</button>
          </div>
          <p className="mt-2 min-h-5 text-xs font-semibold text-teal" aria-live="polite">{notice}</p>

          <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-ink/10 pt-4 lg:grid-cols-5">
            <Statistic label="Cantidad" value={result.statistics.count} />
            <Statistic label="Promedio" value={`${result.statistics.averageLength} caracteres`} />
            <Statistic label="Tokens estimados" value={result.statistics.estimatedTokens} />
            <Statistic label="Más largo" value={`${result.statistics.longestChunk} caracteres`} />
            <Statistic label="Más corto" value={`${result.statistics.shortestChunk} caracteres`} />
          </dl>
        </div>

        <div className="grid gap-3 p-5">
          {result.chunks.length ? result.chunks.map((chunk) => {
            const expanded = expandedId === chunk.id;
            return (
              <article key={chunk.id} className="rounded-md border border-ink/10 bg-white">
                <button type="button" className="focus-ring flex w-full flex-col justify-between gap-3 p-4 text-left transition hover:bg-cream sm:flex-row sm:items-center" aria-expanded={expanded} onClick={() => setExpandedId(expanded ? "" : chunk.id)}>
                  <span>
                    <strong className="block text-sm text-navy">Chunk {chunk.position + 1}</strong>
                    <span className="mt-1 block text-xs text-ink/55">{chunk.title} · {chunk.path.join(" / ")}</span>
                  </span>
                  <span className="flex shrink-0 gap-3 text-xs font-semibold text-ink/55">
                    <span>{chunk.length} caracteres</span>
                    <span>{chunk.estimatedTokens} tokens</span>
                  </span>
                </button>
                {expanded ? (
                  <div className="border-t border-ink/10 p-4">
                    <p className="whitespace-pre-wrap border-l-2 border-gold/50 pl-4 text-sm leading-7 text-ink/75">{chunk.text}</p>
                    <dl className="mt-4 grid gap-3 rounded-md bg-cream p-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                      <ChunkInfo label="Categoría" value={chunk.category} />
                      <ChunkInfo label="Capítulo" value={chunk.chapter ?? "Sin capítulo"} />
                      <ChunkInfo label="Path" value={chunk.path.join(" / ")} />
                      <ChunkInfo label="Posición" value={`${chunk.reference.start}-${chunk.reference.end}`} />
                      <ChunkInfo label="Archivo" value={chunk.metadata.fileName} />
                      <ChunkInfo label="Tipo" value={chunk.metadata.fileType.toUpperCase()} />
                      <ChunkInfo label="Estrategia" value={strategyLabels[chunk.metadata.strategy]} />
                      <ChunkInfo label="ID" value={chunk.id} />
                    </dl>
                  </div>
                ) : null}
              </article>
            );
          }) : <p className="rounded-md border border-dashed border-ink/20 p-8 text-center text-sm text-ink/60">Este documento no contiene texto para generar chunks.</p>}
        </div>
      </section>
    </div>
  );
}

function Statistic({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-navy">{value}</dd>
    </div>
  );
}

function ChunkInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-semibold uppercase tracking-[0.1em] text-ink/45">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-navy">{value}</dd>
    </div>
  );
}
