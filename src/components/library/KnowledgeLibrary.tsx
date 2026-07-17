"use client";

import { useEffect, useMemo, useState } from "react";
import { deleteKnowledgeFile, duplicateKnowledgeFile, getKnowledgeFile, parseKnowledgeFile, saveKnowledgeFile } from "@/lib/knowledge";
import {
  createKnowledgeDocumentFromFile,
  duplicateKnowledgeDocument,
  initialKnowledgeDocuments,
  loadKnowledgeDocuments,
  saveKnowledgeDocuments,
  updateKnowledgeDocument,
  type KnowledgeDocument,
  type KnowledgeDocumentDraft,
  type KnowledgeSort
} from "@/lib/knowledgeLibrary";
import { downloadBlob } from "@/lib/storage";
import { DocumentDetail } from "./DocumentDetail";
import { DocumentList } from "./DocumentList";
import { EmbeddingDiagnosticsPanel } from "./EmbeddingDiagnosticsPanel";
import { LibraryFilters } from "./LibraryFilters";
import { UploadDocumentPanel } from "./UploadDocumentPanel";

interface KnowledgeLibraryProps {
  flash: (message: string) => void;
}

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function KnowledgeLibrary({ flash }: KnowledgeLibraryProps) {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(initialKnowledgeDocuments);
  const [selectedId, setSelectedId] = useState(initialKnowledgeDocuments[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [status, setStatus] = useState("Todos");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState<KnowledgeSort>("Más recientes");
  const [uploading, setUploading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadKnowledgeDocuments();
    setDocuments(stored);
    setSelectedId(stored[0]?.id ?? "");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveKnowledgeDocuments(documents);
  }, [documents, hydrated]);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = normalize(query);
    const filtered = documents.filter((document) => {
      const searchText = normalize([document.title, document.description, document.category, document.author, document.metadata.fileName, document.metadata.fileType, ...document.tags].join(" "));
      return (!normalizedQuery || searchText.includes(normalizedQuery))
        && (category === "Todas" || document.category === category)
        && (status === "Todos" || document.status === status)
        && (!favoritesOnly || document.favorite);
    });

    return filtered.sort((a, b) => {
      if (sort === "Más usados") return b.usageCount - a.usageCount;
      if (sort === "Título A-Z") return a.title.localeCompare(b.title, "es");
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [category, documents, favoritesOnly, query, sort, status]);

  const selectedDocument = documents.find((document) => document.id === selectedId) ?? null;
  const publishedCount = documents.filter((document) => document.status === "Publicado").length;
  const favoriteCount = documents.filter((document) => document.favorite).length;
  const categoryCount = new Set(documents.map((document) => document.category)).size;

  const selectDocument = (id: string) => {
    setSelectedId(id);
    setDocuments((current) => current.map((document) => document.id === id ? { ...document, usageCount: document.usageCount + 1 } : document));
  };

  const replaceSelected = (updater: (document: KnowledgeDocument) => KnowledgeDocument) => {
    setDocuments((current) => current.map((document) => document.id === selectedId ? updater(document) : document));
  };

  const editSelected = (draft: KnowledgeDocumentDraft) => {
    replaceSelected((document) => updateKnowledgeDocument(document, draft));
    flash("Documento actualizado.");
  };

  const duplicateSelected = async () => {
    if (!selectedDocument) return;
    try {
      const duplicate = duplicateKnowledgeDocument(selectedDocument);
      await duplicateKnowledgeFile(selectedDocument.id, duplicate.id);
      setDocuments((current) => [duplicate, ...current]);
      setSelectedId(duplicate.id);
      flash("Documento duplicado como borrador.");
    } catch {
      flash("No fue posible duplicar el archivo.");
    }
  };

  const archiveSelected = () => {
    replaceSelected((document) => ({ ...document, status: "Archivado", updatedAt: new Date().toISOString() }));
    flash("Documento archivado.");
  };

  const deleteSelected = async () => {
    try {
      await deleteKnowledgeFile(selectedId);
      const remaining = documents.filter((document) => document.id !== selectedId);
      setDocuments(remaining);
      setSelectedId(remaining[0]?.id ?? "");
      flash("Documento eliminado.");
    } catch {
      flash("No fue posible eliminar el archivo.");
    }
  };

  const downloadSelected = async () => {
    if (!selectedDocument) return;
    try {
      const storedFile = await getKnowledgeFile(selectedDocument.id);
      const blob = storedFile ?? new Blob([selectedDocument.content], { type: selectedDocument.metadata.mimeType });
      downloadBlob(selectedDocument.metadata.fileName, blob);
      flash("Descarga preparada.");
    } catch {
      flash("No fue posible descargar el archivo.");
    }
  };

  const uploadDocument = async (file: File) => {
    const maxSize = 25 * 1_024 * 1_024;
    if (file.size > maxSize) {
      flash("El archivo supera el límite de 25 MB.");
      return;
    }

    setUploading(true);
    try {
      const parsed = await parseKnowledgeFile(file);
      const document = createKnowledgeDocumentFromFile(file, parsed);
      await saveKnowledgeFile(document.id, file);
      setDocuments((current) => [document, ...current]);
      setSelectedId(document.id);
      clearFilters();
      flash(parsed.warnings.length ? "Documento importado con observaciones." : "Documento importado correctamente.");
    } catch (error) {
      flash(error instanceof Error ? error.message : "No fue posible procesar el documento.");
    } finally {
      setUploading(false);
    }
  };

  const toggleFavorite = () => {
    if (!selectedDocument) return;
    replaceSelected((document) => ({ ...document, favorite: !document.favorite, updatedAt: new Date().toISOString() }));
    flash(selectedDocument.favorite ? "Documento retirado de favoritos." : "Documento marcado como favorito.");
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("Todas");
    setStatus("Todos");
    setFavoritesOnly(false);
    setSort("Más recientes");
  };

  return (
    <div className="grid gap-5">
      <section className="border-b border-ink/10 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-terracotta">Knowledge Hub</p>
        <div className="mt-2 flex flex-col justify-between gap-4 2xl:flex-row 2xl:items-end">
          <div>
            <h1 className="text-3xl font-semibold text-navy">Biblioteca Inteligente</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">Conocimiento operativo de Guía Restaurante Rentable, organizado para consulta y preparado como contexto futuro.</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
            <Metric label="Documentos" value={documents.length} />
            <Metric label="Publicados" value={publishedCount} />
            <Metric label="Favoritos" value={favoriteCount} />
            <Metric label="Categorías" value={categoryCount} />
          </dl>
        </div>
      </section>

      <UploadDocumentPanel uploading={uploading} onUpload={uploadDocument} />

      <EmbeddingDiagnosticsPanel documents={documents} selectedDocument={selectedDocument} flash={flash} />

      <LibraryFilters
        query={query}
        category={category}
        status={status}
        favoritesOnly={favoritesOnly}
        sort={sort}
        resultCount={filteredDocuments.length}
        onQueryChange={setQuery}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
        onFavoritesChange={setFavoritesOnly}
        onSortChange={setSort}
        onClear={clearFilters}
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(320px,0.82fr)_minmax(520px,1.18fr)]">
        <DocumentList documents={filteredDocuments} selectedId={selectedId} onSelect={selectDocument} />
        <div className="xl:sticky xl:top-5 xl:max-h-[calc(100vh-2.5rem)] xl:overflow-y-auto">
          <DocumentDetail
            document={selectedDocument}
            onEdit={editSelected}
            onDuplicate={() => void duplicateSelected()}
            onArchive={archiveSelected}
            onDelete={deleteSelected}
            onDownload={downloadSelected}
            onFavorite={toggleFavorite}
          />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.12em] text-ink/45">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-navy">{value}</dd>
    </div>
  );
}
