import { useEffect, useState } from "react";
import type { KnowledgeDocument, KnowledgeDocumentDraft } from "@/lib/knowledgeLibrary";
import { ChunkViewer } from "./ChunkViewer";
import { DocumentEditor } from "./DocumentEditor";
import { DocumentFileCard } from "./DocumentFileCard";
import { DocumentPreview } from "./DocumentPreview";
import { DocumentStatusBadge } from "./DocumentStatusBadge";

interface DocumentDetailProps {
  document: KnowledgeDocument | null;
  onEdit: (draft: KnowledgeDocumentDraft) => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => Promise<void>;
  onDownload: () => Promise<void>;
  onFavorite: () => void;
}

const formatDate = (value: string) => new Intl.DateTimeFormat("es-US", { dateStyle: "long" }).format(new Date(value));

export function DocumentDetail({ document, onEdit, onDuplicate, onArchive, onDelete, onDownload, onFavorite }: DocumentDetailProps) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [viewingChunks, setViewingChunks] = useState(false);

  useEffect(() => {
    setEditing(false);
    setConfirmingDelete(false);
    setViewingChunks(false);
  }, [document?.id]);

  if (!document) {
    return (
      <section className="grid min-h-96 place-items-center rounded-md border border-dashed border-ink/20 bg-white/60 p-8 text-center">
        <div>
          <h2 className="text-xl font-semibold text-navy">Selecciona un documento</h2>
          <p className="mt-2 text-sm text-ink/60">Aquí aparecerán su información y vista previa.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-ink/10 bg-white shadow-sm" aria-labelledby="knowledge-document-title">
      <div className="border-b border-ink/10 p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">{document.category}</p>
            <h2 id="knowledge-document-title" className="mt-2 text-2xl font-semibold leading-tight text-navy">{document.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/65">{document.description}</p>
          </div>
          <button
            type="button"
            className={`focus-ring min-h-11 shrink-0 rounded-md border px-3 text-sm font-semibold transition ${document.favorite ? "border-gold bg-gold/10 text-navy" : "border-ink/15 text-ink/65 hover:border-gold/60 hover:text-navy"}`}
            aria-pressed={document.favorite}
            onClick={onFavorite}
          >
            {document.favorite ? "★ Favorito" : "☆ Marcar favorito"}
          </button>
        </div>

        <dl className="mt-5 grid gap-3 border-t border-ink/10 pt-4 sm:grid-cols-2 xl:grid-cols-4">
          <Info label="Estado"><DocumentStatusBadge status={document.status} /></Info>
          <Info label="Versión">v{document.version}</Info>
          <Info label="Autor">{document.author}</Info>
          <Info label="Fecha">{formatDate(document.updatedAt)}</Info>
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          {document.tags.map((tag) => <span key={tag} className="rounded-md border border-gold/25 bg-cream px-2 py-1 text-xs font-semibold text-navy">{tag}</span>)}
        </div>
        <DocumentFileCard metadata={document.metadata} />
      </div>

      <DocumentPreview document={document} />

      <div className="flex flex-wrap gap-2 border-t border-ink/10 p-4">
        <button className="focus-ring rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90" onClick={() => setEditing(true)}>Editar</button>
        <button className="focus-ring rounded-md border border-gold/45 px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-cream" onClick={() => setViewingChunks(true)}>Ver chunks</button>
        <button className="focus-ring rounded-md border border-gold/45 px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-cream" onClick={() => void onDownload()}>Descargar</button>
        <button className="focus-ring rounded-md border border-gold/45 px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-cream" onClick={onDuplicate}>Duplicar</button>
        <button className="focus-ring rounded-md border border-ink/15 px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-cream" disabled={document.status === "Archivado"} onClick={onArchive}>{document.status === "Archivado" ? "Archivado" : "Archivar"}</button>
        {confirmingDelete ? (
          <>
            <button className="focus-ring rounded-md bg-terracotta px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-terracotta/90" onClick={() => void onDelete()}>Confirmar eliminación</button>
            <button className="focus-ring rounded-md border border-ink/15 px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-cream" onClick={() => setConfirmingDelete(false)}>Cancelar</button>
          </>
        ) : <button className="focus-ring rounded-md border border-terracotta/40 px-4 py-2.5 text-sm font-semibold text-terracotta transition hover:bg-terracotta/5" onClick={() => setConfirmingDelete(true)}>Eliminar archivo</button>}
      </div>

      {editing ? <DocumentEditor document={document} onCancel={() => setEditing(false)} onSave={(draft) => { onEdit(draft); setEditing(false); }} /> : null}
      {viewingChunks ? <ChunkViewer document={document} onClose={() => setViewingChunks(false)} /> : null}
    </section>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{label}</dt>
      <dd className="mt-2 text-sm font-semibold text-navy">{children}</dd>
    </div>
  );
}
