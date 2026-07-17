import { useState } from "react";
import {
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_STATUSES,
  type KnowledgeDocument,
  type KnowledgeDocumentDraft,
  type KnowledgeDocumentStatus
} from "@/lib/knowledgeLibrary";

interface DocumentEditorProps {
  document: KnowledgeDocument;
  onCancel: () => void;
  onSave: (draft: KnowledgeDocumentDraft) => void;
}

export function DocumentEditor({ document, onCancel, onSave }: DocumentEditorProps) {
  const [draft, setDraft] = useState({
    title: document.title,
    description: document.description,
    category: document.category,
    tags: document.tags.join(", "),
    author: document.author,
    version: String(document.version),
    status: document.status,
    content: document.content
  });

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-navy/55 p-4" role="presentation">
      <form
        className="scrollbar max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-md bg-white p-5 shadow-editorial"
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-editor-title"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            ...draft,
            tags: draft.tags.split(","),
            version: Math.max(1, Number.parseInt(draft.version, 10) || 1)
          });
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-ink/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-terracotta">{document.id}</p>
            <h2 id="document-editor-title" className="mt-2 text-2xl font-semibold text-navy">Editar documento</h2>
          </div>
          <button type="button" className="focus-ring rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold text-navy transition hover:bg-cream" onClick={onCancel}>Cerrar</button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <EditorField label="Título" value={draft.title} onChange={(value) => setDraft((current) => ({ ...current, title: value }))} />
          <EditorField label="Autor" value={draft.author} onChange={(value) => setDraft((current) => ({ ...current, author: value }))} />
          <label className="text-sm font-semibold text-navy">
            Categoría
            <select className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 bg-white px-3 font-normal text-ink" value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as KnowledgeDocumentDraft["category"] }))}>
              {KNOWLEDGE_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-navy">
            Estado
            <select className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 bg-white px-3 font-normal text-ink" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as KnowledgeDocumentStatus }))}>
              {KNOWLEDGE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <EditorField label="Versión" value={draft.version} type="number" onChange={(value) => setDraft((current) => ({ ...current, version: value }))} />
          <EditorField label="Etiquetas separadas por comas" value={draft.tags} onChange={(value) => setDraft((current) => ({ ...current, tags: value }))} />
          <EditorArea label="Descripción" value={draft.description} onChange={(value) => setDraft((current) => ({ ...current, description: value }))} />
          <EditorArea label="Contenido" value={draft.content} tall onChange={(value) => setDraft((current) => ({ ...current, content: value }))} />
        </div>

        <div className="mt-5 flex justify-end gap-3 border-t border-ink/10 pt-4">
          <button type="button" className="focus-ring rounded-md border border-ink/15 px-4 py-3 text-sm font-semibold text-navy transition hover:bg-cream" onClick={onCancel}>Cancelar</button>
          <button className="focus-ring rounded-md bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy/90">Guardar cambios</button>
        </div>
      </form>
    </div>
  );
}

function EditorField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="text-sm font-semibold text-navy">
      {label}
      <input className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 px-3 font-normal text-ink" required type={type} min={type === "number" ? 1 : undefined} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function EditorArea({ label, value, onChange, tall = false }: { label: string; value: string; onChange: (value: string) => void; tall?: boolean }) {
  return (
    <label className="text-sm font-semibold text-navy md:col-span-2">
      {label}
      <textarea className={`focus-ring mt-2 w-full rounded-md border border-ink/15 px-3 py-3 font-normal leading-7 text-ink ${tall ? "min-h-72" : "min-h-24"}`} required value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
