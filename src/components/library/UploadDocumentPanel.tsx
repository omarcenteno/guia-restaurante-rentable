import { useRef, useState } from "react";
import { knowledgeFileAccept } from "@/lib/knowledge";

interface UploadDocumentPanelProps {
  uploading: boolean;
  onUpload: (file: File) => Promise<void>;
}

export function UploadDocumentPanel({ uploading, onUpload }: UploadDocumentPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file || uploading) return;
    await onUpload(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section
      className={`rounded-md border border-dashed p-4 transition ${dragging ? "border-gold bg-gold/10" : "border-ink/20 bg-white/60"}`}
      aria-label="Subir documento"
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={(event) => { event.preventDefault(); if (event.currentTarget === event.target) setDragging(false); }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        void handleFile(event.dataTransfer.files[0]);
      }}
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-navy">Documentos del negocio</h2>
          <p className="mt-1 text-sm leading-6 text-ink/60">Arrastra un archivo PDF, DOCX, Markdown, TXT o JSON.</p>
        </div>
        <button
          type="button"
          className="focus-ring min-h-11 rounded-md bg-navy px-4 text-sm font-semibold text-white transition hover:bg-navy/90 disabled:cursor-wait disabled:opacity-60"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Procesando documento..." : "Subir documento"}
        </button>
      </div>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept={knowledgeFileAccept}
        disabled={uploading}
        aria-label="Seleccionar documento"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
    </section>
  );
}
