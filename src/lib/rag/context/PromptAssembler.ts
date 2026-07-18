import type { ContextChunk, ContextPrompt, ContextPromptSection } from "./Types";
import { estimateTokens } from "./TokenEstimator";

function chunkHeading(chunk: ContextChunk): string {
  const path = chunk.path.length ? ` · ${chunk.path.join(" > ")}` : "";
  const score = Number.isFinite(chunk.score) ? ` · score ${chunk.score.toFixed(3)}` : "";
  return `[${chunk.rank}] ${chunk.title}${path}${score}`;
}

export function assembleContextSections(chunks: ContextChunk[]): ContextPromptSection[] {
  return chunks.map((chunk) => {
    const body = `${chunkHeading(chunk)}\n${chunk.text}`;
    return {
      id: chunk.id,
      title: chunk.title,
      body,
      tokens: estimateTokens(body)
    };
  });
}

export function assemblePrompt(input: {
  query: string;
  task: string;
  systemInstruction?: string;
  chunks: ContextChunk[];
}): ContextPrompt {
  const sections = assembleContextSections(input.chunks);
  const context = sections.map((section) => section.body).join("\n\n---\n\n");
  const system = input.systemInstruction ?? "Usa únicamente el contexto proporcionado cuando sea relevante. Si el contexto no alcanza, dilo con claridad.";
  const user = [`Tarea: ${input.task}`, `Consulta: ${input.query}`, "Contexto:", context].filter(Boolean).join("\n\n");
  return {
    system,
    user,
    context,
    sections,
    tokens: estimateTokens(system) + estimateTokens(user)
  };
}
