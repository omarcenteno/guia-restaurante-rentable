import type { DocumentParser, KnowledgeFileType, ParsedKnowledgeFile } from "./documentTypes";

const MAX_STORED_CHARACTERS = 100_000;
const MAX_PREVIEW_CHARACTERS = 24_000;
const PDF_PREVIEW_PAGES = 3;

const extensions: Record<string, KnowledgeFileType> = {
  pdf: "pdf",
  docx: "docx",
  md: "markdown",
  markdown: "markdown",
  txt: "txt",
  json: "json"
};

const mimeTypes: Record<KnowledgeFileType, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  markdown: "text/markdown",
  txt: "text/plain",
  json: "application/json"
};

const extensionOf = (name: string) => name.toLowerCase().split(".").pop() ?? "";
const countWords = (text: string) => text.trim() ? text.trim().split(/\s+/u).length : 0;
const truncate = (text: string, limit: number) => text.length > limit ? `${text.slice(0, limit)}\n\n[Contenido truncado para la vista previa]` : text;

export function detectKnowledgeFileType(file: Pick<File, "name" | "type">): KnowledgeFileType | null {
  const byExtension = extensions[extensionOf(file.name)];
  if (byExtension) return byExtension;
  if (file.type === "application/pdf") return "pdf";
  if (file.type.includes("wordprocessingml")) return "docx";
  if (file.type === "text/markdown") return "markdown";
  if (file.type === "application/json") return "json";
  if (file.type === "text/plain") return "txt";
  return null;
}

async function readText(file: File): Promise<string> {
  return file.text();
}

const textParser: DocumentParser = {
  id: "native-text",
  supportedTypes: ["txt", "markdown", "json"],
  canParse: (file) => {
    const type = detectKnowledgeFileType(file);
    return type === "txt" || type === "markdown" || type === "json";
  },
  async parse(file) {
    const fileType = detectKnowledgeFileType(file);
    if (fileType !== "txt" && fileType !== "markdown" && fileType !== "json") throw new Error("Tipo de texto no compatible");
    let content = await readText(file);
    if (fileType === "json") {
      try {
        content = JSON.stringify(JSON.parse(content) as unknown, null, 2);
      } catch {
        throw new Error("El archivo JSON no tiene una estructura válida");
      }
    }
    const storedContent = truncate(content, MAX_STORED_CHARACTERS);
    return {
      content: storedContent,
      previewContent: truncate(content, MAX_PREVIEW_CHARACTERS),
      fileType,
      mimeType: file.type || mimeTypes[fileType],
      wordCount: countWords(content),
      pageCount: null,
      warnings: content.length > MAX_STORED_CHARACTERS ? ["El texto completo permanece disponible en el archivo original."] : []
    };
  }
};

const docxParser: DocumentParser = {
  id: "mammoth-docx",
  supportedTypes: ["docx"],
  canParse: (file) => detectKnowledgeFileType(file) === "docx",
  async parse(file) {
    const mammothModule = await import("mammoth");
    const mammoth = mammothModule.default;
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    const content = result.value.trim();
    if (!content) throw new Error("No fue posible extraer texto del documento DOCX");
    return {
      content: truncate(content, MAX_STORED_CHARACTERS),
      previewContent: truncate(content, MAX_PREVIEW_CHARACTERS),
      fileType: "docx",
      mimeType: file.type || mimeTypes.docx,
      wordCount: countWords(content),
      pageCount: null,
      warnings: result.messages.map((message) => message.message)
    };
  }
};

const pdfParser: DocumentParser = {
  id: "pdfjs",
  supportedTypes: ["pdf"],
  canParse: (file) => detectKnowledgeFileType(file) === "pdf",
  async parse(file) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
    const pdf = await loadingTask.promise;
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item) => "str" in item ? item.str : "").join(" ").replace(/\s+/g, " ").trim();
      pages.push(`Página ${pageNumber}\n${text}`);
    }

    const content = pages.join("\n\n");
    if (!content.replace(/Página \d+/g, "").trim()) throw new Error("El PDF no contiene texto extraíble");
    return {
      content: truncate(content, MAX_STORED_CHARACTERS),
      previewContent: truncate(pages.slice(0, PDF_PREVIEW_PAGES).join("\n\n"), MAX_PREVIEW_CHARACTERS),
      fileType: "pdf",
      mimeType: file.type || mimeTypes.pdf,
      wordCount: countWords(content),
      pageCount: pdf.numPages,
      warnings: content.length > MAX_STORED_CHARACTERS ? ["El PDF completo permanece disponible para descargar."] : []
    };
  }
};

export const documentParsers: readonly DocumentParser[] = [pdfParser, docxParser, textParser];

export async function parseKnowledgeFile(file: File): Promise<ParsedKnowledgeFile> {
  const parser = documentParsers.find((candidate) => candidate.canParse(file));
  if (!parser) throw new Error("Formato no compatible. Usa PDF, DOCX, Markdown, TXT o JSON.");
  return parser.parse(file);
}

export const knowledgeFileAccept = ".pdf,.docx,.md,.markdown,.txt,.json";
