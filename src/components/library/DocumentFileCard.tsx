import type { KnowledgeMetadata } from "@/lib/knowledgeLibrary";

const typeLabels: Record<KnowledgeMetadata["fileType"], string> = {
  pdf: "PDF",
  docx: "DOCX",
  markdown: "MD",
  txt: "TXT",
  json: "JSON"
};

const formatBytes = (bytes: number) => {
  if (bytes < 1_024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
};

const formatDate = (value: string) => new Intl.DateTimeFormat("es-US", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));

export function DocumentFileCard({ metadata }: { metadata: KnowledgeMetadata }) {
  return (
    <article className="mt-5 rounded-md border border-ink/10 bg-cream p-4" aria-label={`Archivo ${metadata.fileName}`}>
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-navy text-xs font-bold text-gold" aria-hidden="true">{typeLabels[metadata.fileType]}</span>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-semibold text-navy">{metadata.fileName}</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 text-xs sm:grid-cols-4">
            <FileInfo label="Peso" value={formatBytes(metadata.size)} />
            <FileInfo label="Palabras" value={metadata.wordCount.toLocaleString("es-US")} />
            <FileInfo label="Páginas" value={metadata.pageCount ? String(metadata.pageCount) : "No aplica"} />
            <FileInfo label="Modificado" value={formatDate(metadata.lastModified)} />
          </dl>
        </div>
      </div>
    </article>
  );
}

function FileInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold uppercase tracking-[0.12em] text-ink/45">{label}</dt>
      <dd className="mt-1 font-semibold text-navy">{value}</dd>
    </div>
  );
}
