import { NextResponse } from "next/server";
import { AIError, normalizeAIError } from "@/lib/ai/errors";
import { chunkDocument, EmbeddingEngine, type EmbeddingGenerationSummary, type KnowledgeDocument } from "@/lib/knowledge";
import { OpenAIEmbeddingProvider } from "@/lib/knowledge/embeddings/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EmbeddingAction = "diagnostics" | "generate" | "regenerate" | "delete" | "clear" | "search";

interface EmbeddingApiRequest {
  action?: EmbeddingAction;
  documents?: KnowledgeDocument[];
  documentId?: string;
  query?: string;
  topK?: number;
}

type PublicSearchResult = {
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

interface EmbeddingApiResponse {
  ok: boolean;
  summary?: EmbeddingGenerationSummary;
  results?: PublicSearchResult[];
  error?: {
    code: string;
    message: string;
  };
}

function toPublicResults(results: Awaited<ReturnType<EmbeddingEngine["search"]>>): PublicSearchResult[] {
  return results.map((result) => ({
    chunk: {
      id: result.chunk.id,
      documentId: result.chunk.documentId,
      text: result.chunk.text,
      title: result.chunk.title,
      category: result.chunk.category
    },
    score: result.score,
    rank: result.rank
  }));
}

const engine = new EmbeddingEngine(new OpenAIEmbeddingProvider());

function developmentInfo(message: string, details: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") console.info(`[GRR Knowledge][embeddings] ${message}`, details);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseRequest(value: unknown): Required<Pick<EmbeddingApiRequest, "action" | "documents">> & Omit<EmbeddingApiRequest, "action" | "documents"> {
  if (!isRecord(value)) return { action: "diagnostics", documents: [] };
  const action = typeof value.action === "string" && ["diagnostics", "generate", "regenerate", "delete", "clear", "search"].includes(value.action)
    ? value.action as EmbeddingAction
    : "diagnostics";
  return {
    action,
    documents: Array.isArray(value.documents) ? value.documents as KnowledgeDocument[] : [],
    documentId: typeof value.documentId === "string" ? value.documentId : undefined,
    query: typeof value.query === "string" ? value.query : undefined,
    topK: typeof value.topK === "number" && Number.isFinite(value.topK) ? Math.max(1, Math.min(20, Math.round(value.topK))) : undefined
  };
}

function documentChunks(documents: KnowledgeDocument[]): number {
  return documents.reduce((total, document) => total + chunkDocument(document, { strategy: document.retrieval.chunkStrategy }).chunks.length, 0);
}

export async function GET() {
  const response: EmbeddingApiResponse = {
    ok: true,
    summary: {
      ...engine.diagnostics(),
      generated: 0,
      updated: 0,
      deleted: 0,
      searchPreview: []
    }
  };
  return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  developmentInfo("Petición recibida", { requestId });

  try {
    const body = parseRequest(await request.json().catch(() => null));
    developmentInfo("Petición validada", { requestId, action: body.action, documents: body.documents.length, documentId: body.documentId });

    if (body.action === "diagnostics") {
      const summary: EmbeddingGenerationSummary = {
        ...engine.diagnostics(body.documents.length, documentChunks(body.documents)),
        generated: 0,
        updated: 0,
        deleted: 0,
        searchPreview: []
      };
      return NextResponse.json({ ok: true, summary } satisfies EmbeddingApiResponse, { headers: { "Cache-Control": "no-store" } });
    }

    if (body.action === "clear") {
      return NextResponse.json({ ok: true, summary: engine.clear(body.documents.length) } satisfies EmbeddingApiResponse, { headers: { "Cache-Control": "no-store" } });
    }

    if (body.action === "delete") {
      if (!body.documentId) throw new AIError("Selecciona un documento para eliminar embeddings.", "INVALID_REQUEST");
      return NextResponse.json({ ok: true, summary: engine.deleteDocument(body.documentId, body.documents.length) } satisfies EmbeddingApiResponse, { headers: { "Cache-Control": "no-store" } });
    }

    if (body.action === "search") {
      if (!body.query?.trim()) throw new AIError("Escribe una búsqueda para probar el índice.", "INVALID_REQUEST");
      const results = await engine.search(body.query, body.topK ?? 5);
      return NextResponse.json({ ok: true, results: toPublicResults(results) } satisfies EmbeddingApiResponse, { headers: { "Cache-Control": "no-store" } });
    }

    const targetDocuments = body.action === "regenerate" && body.documentId
      ? body.documents.filter((document) => document.id === body.documentId)
      : body.documents;
    if (!targetDocuments.length) throw new AIError("No hay documentos disponibles para generar embeddings.", "INVALID_REQUEST");

    const summary = await engine.generateForDocuments(targetDocuments, {
      replaceDocumentIds: body.action === "regenerate" && body.documentId ? [body.documentId] : undefined,
      signal: request.signal
    });
    developmentInfo("Embeddings procesados", { requestId, action: body.action, generated: summary.generated, updated: summary.updated, embeddings: summary.embeddingCount, durationMs: Date.now() - startedAt });
    return NextResponse.json({ ok: true, summary } satisfies EmbeddingApiResponse, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const normalized = normalizeAIError(error);
    if (process.env.NODE_ENV === "development") {
      console.error("[GRR Knowledge][embeddings] Error.", { requestId, code: normalized.code, message: normalized.message });
    }
    return NextResponse.json(
      { ok: false, error: { code: normalized.code, message: normalized.message || "No fue posible procesar embeddings." } } satisfies EmbeddingApiResponse,
      { status: normalized.code === "INVALID_REQUEST" ? 400 : 500, headers: { "Cache-Control": "no-store" } }
    );
  } finally {
    developmentInfo("Petición finalizada", { requestId, durationMs: Date.now() - startedAt });
  }
}
