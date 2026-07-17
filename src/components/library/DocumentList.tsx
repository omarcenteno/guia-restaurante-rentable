import type { KnowledgeDocument } from "@/lib/knowledgeLibrary";
import { DocumentStatusBadge } from "./DocumentStatusBadge";

interface DocumentListProps {
  documents: KnowledgeDocument[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const formatDate = (value: string) => new Intl.DateTimeFormat("es-US", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));

export function DocumentList({ documents, selectedId, onSelect }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-ink/20 bg-white/60 px-5 py-12 text-center">
        <h3 className="text-lg font-semibold text-navy">Sin resultados</h3>
        <p className="mt-2 text-sm text-ink/60">Ajusta la búsqueda o los filtros para encontrar documentos.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-2" aria-label="Documentos de la biblioteca">
      {documents.map((document) => (
        <li key={document.id}>
          <button
            type="button"
            aria-current={selectedId === document.id ? "true" : undefined}
            className={`focus-ring w-full rounded-md border p-4 text-left transition ${selectedId === document.id ? "border-gold/60 bg-white shadow-sm" : "border-ink/10 bg-white/70 hover:border-gold/40 hover:bg-white hover:shadow-sm"}`}
            onClick={() => onSelect(document.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-terracotta">{document.category}</p>
                <h3 className="mt-2 text-base font-semibold leading-6 text-navy">{document.title}</h3>
              </div>
              <span className="shrink-0 text-lg leading-none text-gold" aria-label={document.favorite ? "Favorito" : "No favorito"}>{document.favorite ? "★" : ""}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/65">{document.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <DocumentStatusBadge status={document.status} />
              <span className="text-xs text-ink/55">v{document.version}</span>
              <span className="text-xs text-ink/55">{formatDate(document.updatedAt)}</span>
              <span className="ml-auto text-xs text-ink/55">{document.usageCount} usos</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
