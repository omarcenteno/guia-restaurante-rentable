import type { KnowledgeDocumentStatus } from "@/lib/knowledgeLibrary";

const statusStyles: Record<KnowledgeDocumentStatus, string> = {
  Borrador: "border-gold/35 bg-gold/10 text-navy",
  Publicado: "border-teal/30 bg-teal/10 text-teal",
  Archivado: "border-ink/15 bg-ink/5 text-ink/60"
};

export function DocumentStatusBadge({ status }: { status: KnowledgeDocumentStatus }) {
  return <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusStyles[status]}`}>{status}</span>;
}
