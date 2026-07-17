import type { KnowledgeDocument } from "@/lib/knowledgeLibrary";

export function DocumentPreview({ document }: { document: KnowledgeDocument }) {
  const title = document.metadata.fileType === "pdf" ? "Vista previa PDF · primeras páginas" : document.metadata.fileType === "docx" ? "Vista previa DOCX · texto extraído" : "Vista previa del contenido";

  return (
    <div className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-navy">{title}</h3>
        <span className="text-xs text-ink/50">{document.usageCount} usos</span>
      </div>
      {document.metadata.fileType === "json" ? (
        <pre className="scrollbar mt-4 max-h-[34rem] overflow-auto whitespace-pre-wrap rounded-md border border-ink/10 bg-ink p-4 text-xs leading-6 text-white/85">{document.previewContent}</pre>
      ) : document.metadata.fileType === "markdown" ? (
        <MarkdownPreview content={document.previewContent} />
      ) : (
        <div className="scrollbar mt-4 max-h-[34rem] overflow-y-auto whitespace-pre-line border-l-2 border-gold/50 pl-4 text-sm leading-7 text-ink/75">{document.previewContent}</div>
      )}
    </div>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  return (
    <div className="scrollbar mt-4 grid max-h-[34rem] gap-3 overflow-y-auto border-l-2 border-gold/50 pl-4 text-sm leading-7 text-ink/75">
      {content.split("\n").map((line, index) => {
        const key = `${index}-${line.slice(0, 20)}`;
        if (line.startsWith("### ")) return <h5 key={key} className="text-base font-semibold text-navy">{line.slice(4)}</h5>;
        if (line.startsWith("## ")) return <h4 key={key} className="text-lg font-semibold text-navy">{line.slice(3)}</h4>;
        if (line.startsWith("# ")) return <h3 key={key} className="text-xl font-semibold text-navy">{line.slice(2)}</h3>;
        if (/^[-*] /.test(line)) return <p key={key} className="pl-3 before:mr-2 before:text-gold before:content-['•']">{line.slice(2)}</p>;
        return line ? <p key={key}>{line}</p> : <span key={key} className="h-1" aria-hidden="true" />;
      })}
    </div>
  );
}
