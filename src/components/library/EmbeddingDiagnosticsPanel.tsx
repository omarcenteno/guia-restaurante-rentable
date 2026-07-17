"use client";

import { useEffect, useMemo, useState } from "react";
import type { EmbeddingGenerationSummary, KnowledgeDocument } from "@/lib/knowledge";

type VectorSearchResult = {
  chunk: {
    id: string;
    documentId: string;
    text: string;
    title: string;
    category: string;
  };
  score: number;
  rank: number;
};

type EmbeddingAction = "diagnostics" | "generate" | "regenerate" | "delete" | "clear" | "search";

type EmbeddingApiResponse = {
  ok: boolean;
  summary?: EmbeddingGenerationSummary;
  results?: VectorSearchResult[];
  error?: {
    code: string;
    message: string;
  };
};

interface EmbeddingDiagnosticsPanelProps {
  documents: KnowledgeDocument[];
  selectedDocument: KnowledgeDocument | null;
  flash: (message: string) => void;
}

const initialSummary: EmbeddingGenerationSummary = {
  documentCount: 0,
  chunkCount: 0,
  embeddingCount: 0,
  averageGenerationMs: 0,
  model: "text-embedding-3-small",
  provider: "openai",
  status: "idle",
  lastUpdatedAt: null,
  generated: 0,
  updated: 0,
  deleted: 0,
  searchPreview: []
};

const statusLabels: Record<EmbeddingGenerationSummary["status"], string> = {
  idle: "Sin generar",
  generating: "Generando",
  ready: "Listo",
  error: "Error"
};

export function EmbeddingDiagnosticsPanel({ documents, selectedDocument, flash }: EmbeddingDiagnosticsPanelProps) {
  const [summary, setSummary] = useState<EmbeddingGenerationSummary>(initialSummary);
  const [runningAction, setRunningAction] = useState<EmbeddingAction | null>(null);
  const [query, setQuery] = useState("food cost");
  const [results, setResults] = useState<VectorSearchResult[]>([]);
  const selectedLabel = selectedDocument?.title ?? "documento seleccionado";

  const payloadDocuments = useMemo(() => documents.map((document) => ({
    ...document,
    tags: [...document.tags],
    metadata: { ...document.metadata },
    retrieval: { ...document.retrieval }
  })), [documents]);

  const runAction = async (action: EmbeddingAction) => {
    setRunningAction(action);
    try {
      const response = await fetch("/api/knowledge/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          documents: payloadDocuments,
          documentId: selectedDocument?.id,
          query,
          topK: 5
        })
      });
      const data = await response.json().catch(() => null) as EmbeddingApiResponse | null;
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message ?? "No fue posible procesar embeddings.");
      if (data.summary) setSummary(data.summary);
      if (data.results) setResults(data.results);
      const messages: Record<EmbeddingAction, string> = {
        diagnostics: "Diagnóstico actualizado.",
        generate: "Embeddings generados.",
        regenerate: `Embeddings regenerados para ${selectedLabel}.`,
        delete: `Embeddings eliminados para ${selectedLabel}.`,
        clear: "Índice vectorial limpiado.",
        search: "Búsqueda semántica ejecutada."
      };
      flash(messages[action]);
    } catch (error) {
      flash(error instanceof Error ? error.message : "No fue posible procesar embeddings.");
    } finally {
      setRunningAction(null);
    }
  };

  useEffect(() => {
    void runAction("diagnostics");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents.length]);

  return (
    <section className="rounded-md border border-ink/10 bg-white p-5 shadow-sm" aria-labelledby="embedding-diagnostics-title">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">Vector Index</p>
          <h2 id="embedding-diagnostics-title" className="mt-2 text-xl font-semibold text-navy">Diagnóstico de embeddings</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">Índice temporal en memoria preparado para búsqueda semántica futura.</p>
        </div>
        <span className="inline-flex min-h-9 items-center rounded-md border border-gold/35 bg-cream px-3 text-sm font-semibold text-navy">{statusLabels[summary.status]}</span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Documentos" value={summary.documentCount} />
        <Metric label="Chunks" value={summary.chunkCount} />
        <Metric label="Embeddings" value={summary.embeddingCount} />
        <Metric label="Promedio" value={`${summary.averageGenerationMs} ms`} />
        <Metric label="Modelo" value={summary.model} />
        <Metric label="Proveedor" value={summary.provider} />
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <ActionButton disabled={runningAction !== null} busy={runningAction === "generate"} onClick={() => void runAction("generate")}>Generar embeddings</ActionButton>
        <ActionButton disabled={runningAction !== null || !selectedDocument} busy={runningAction === "regenerate"} onClick={() => void runAction("regenerate")}>Regenerar embeddings</ActionButton>
        <ActionButton disabled={runningAction !== null || !selectedDocument} busy={runningAction === "delete"} onClick={() => void runAction("delete")}>Eliminar embeddings</ActionButton>
        <ActionButton disabled={runningAction !== null} busy={runningAction === "clear"} onClick={() => void runAction("clear")}>Limpiar índice</ActionButton>
      </div>

      <div className="mt-5 grid gap-3 border-t border-ink/10 pt-4 lg:grid-cols-[minmax(220px,0.6fr)_1fr]">
        <label className="text-sm font-semibold text-navy">
          Probar búsqueda
          <input
            className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 bg-white px-3 font-normal text-ink"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="flex items-end">
          <ActionButton disabled={runningAction !== null || summary.embeddingCount === 0} busy={runningAction === "search"} onClick={() => void runAction("search")}>Buscar en índice</ActionButton>
        </div>
      </div>

      {results.length ? (
        <div className="mt-4 grid gap-2">
          {results.map((result) => (
            <div key={`${result.chunk.id}-${result.rank}`} className="rounded-md border border-ink/10 bg-cream/45 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-sm text-navy">#{result.rank} {result.chunk.title}</strong>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{Math.round(result.score * 100)}% similitud</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-ink/65">{result.chunk.text.slice(0, 220)}{result.chunk.text.length > 220 ? "..." : ""}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ActionButton({ busy, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      type="button"
      className="focus-ring rounded-md border border-gold/45 px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {busy ? "Procesando..." : children}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.12em] text-ink/45">{label}</dt>
      <dd className="mt-1 truncate text-sm font-semibold text-navy" title={String(value)}>{value}</dd>
    </div>
  );
}
