"use client";

import { loadActiveWorkspaceId, loadWorkspaceLocal, saveWorkspaceLocal, StorageNamespace } from "@/lib/workspaces";
import type { ImagePromptRecord } from "@/lib/images";
import type { AIGenerationMeta, AIProvider, GeneratedPublicationPayload, GenerationType } from "./types";

export type StudioVersionStatus = "Borrador" | "En revisión" | "Aprobado" | "Publicado";
export type StudioVersionSource = "generated" | "restored" | "duplicated";

export type StudioGenerationContent = GeneratedPublicationPayload & {
  blog: string;
};

export interface StudioGenerationVersion {
  id: string;
  publicationId: string;
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
  provider: AIProvider;
  model: string;
  tokens: number;
  generationDurationMs: number;
  user?: string;
  type: GenerationType;
  topic: string;
  status: StudioVersionStatus;
  favorite: boolean;
  useCount: number;
  source: StudioVersionSource;
  restoredFromVersion?: number;
  notes: string;
  tags: string[];
  content: StudioGenerationContent;
  visualPrompts: ImagePromptRecord[];
}

const STORAGE_KEY = "grr-ai-studio-versions-v1";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function createVersionId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  return `version-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function versionStorageKey(publicationId: string, workspaceId = loadActiveWorkspaceId()): string {
  return StorageNamespace.version(workspaceId, publicationId);
}

function inferProvider(model: string): AIProvider {
  const normalized = model.toLocaleLowerCase("es");
  if (normalized.includes("fallback") || normalized.includes("mock")) return "mock";
  if (normalized.includes("claude")) return "anthropic";
  if (normalized.includes("gemini")) return "google";
  return "openai";
}

function normalizeVersions(versions: StudioGenerationVersion[]): StudioGenerationVersion[] {
  const chronological = [...versions].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id.localeCompare(b.id));
  const inferredNumbers = new Map(chronological.map((version, index) => [version.id, index + 1]));
  return versions.map((version) => {
    const source: StudioVersionSource = version.source === "restored" || version.source === "duplicated" ? version.source : "generated";
    const tags = Array.isArray(version.tags) ? Array.from(new Set(version.tags.map((tag) => String(tag).trim()).filter(Boolean))) : [];
    return {
      ...version,
      versionNumber: Number.isInteger(version.versionNumber) && version.versionNumber > 0 ? version.versionNumber : inferredNumbers.get(version.id) ?? 1,
      provider: version.provider || inferProvider(version.model),
      generationDurationMs: Number.isFinite(version.generationDurationMs) ? version.generationDurationMs : 0,
      source,
      notes: typeof version.notes === "string" ? version.notes : "",
      tags,
      visualPrompts: Array.isArray(version.visualPrompts) ? version.visualPrompts : []
    };
  }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function loadStudioVersions(publicationId: string, workspaceId = loadActiveWorkspaceId()): StudioGenerationVersion[] {
  return clone(normalizeVersions(loadWorkspaceLocal({ id: workspaceId }, versionStorageKey(publicationId, workspaceId), [], [`${STORAGE_KEY}:${publicationId}`])));
}

export function loadAllStudioVersions(workspaceId = loadActiveWorkspaceId()): StudioGenerationVersion[] {
  if (typeof window === "undefined") return [];
  const versions: StudioGenerationVersion[] = [];
  const scopedPrefix = `${StorageNamespace.versionsRoot(workspaceId)}/`;
  const previousScopedPrefix = `grr-workspace:${workspaceId}:${STORAGE_KEY}:`;
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(scopedPrefix) && !key?.startsWith(previousScopedPrefix) && !key?.startsWith(`${STORAGE_KEY}:`)) continue;
    try {
      const stored = JSON.parse(window.localStorage.getItem(key) || "[]") as StudioGenerationVersion[];
      if (Array.isArray(stored)) versions.push(...normalizeVersions(stored));
    } catch {
      // Ignore isolated legacy entries while preserving the rest of the Studio.
    }
  }
  return clone(versions.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
}

export function saveStudioVersions(publicationId: string, versions: StudioGenerationVersion[], workspaceId = loadActiveWorkspaceId()): void {
  saveWorkspaceLocal({ id: workspaceId }, versionStorageKey(publicationId, workspaceId), clone(versions));
}

export function nextStudioVersionNumber(versions: readonly StudioGenerationVersion[]): number {
  return Math.max(0, ...versions.map((version) => version.versionNumber || 0)) + 1;
}

export function createStudioVersion(input: {
  publicationId: string;
  versionNumber?: number;
  type: GenerationType;
  topic: string;
  generated: GeneratedPublicationPayload;
  meta: AIGenerationMeta;
  visualPrompts?: ImagePromptRecord[];
  user?: string;
}): StudioGenerationVersion {
  const now = new Date().toISOString();
  return {
    id: input.meta.requestId || createVersionId(),
    publicationId: input.publicationId,
    versionNumber: input.versionNumber ?? 1,
    createdAt: now,
    updatedAt: now,
    provider: input.meta.provider,
    model: input.meta.model,
    tokens: input.meta.usage.totalTokens,
    generationDurationMs: input.meta.durationMs,
    user: input.user,
    type: input.type,
    topic: input.topic,
    status: "Borrador",
    favorite: false,
    useCount: 0,
    source: "generated",
    notes: "",
    tags: [],
    visualPrompts: clone(input.visualPrompts ?? []),
    content: {
      ...clone(input.generated),
      blog: input.type === "blog" ? input.generated.caption : ""
    }
  };
}

export function cloneStudioVersion(
  source: StudioGenerationVersion,
  overrides: Partial<StudioGenerationVersion> = {}
): StudioGenerationVersion {
  const now = new Date().toISOString();
  return {
    ...clone(source),
    id: createVersionId(),
    createdAt: now,
    updatedAt: now,
    status: "Borrador",
    favorite: false,
    useCount: 0,
    source: "duplicated",
    ...overrides,
    tags: clone(overrides.tags ?? source.tags),
    content: clone(overrides.content ?? source.content),
    visualPrompts: clone(overrides.visualPrompts ?? source.visualPrompts)
  };
}

function storyMarkdown(content: StudioGenerationContent): string {
  return content.story.map((frame) => [
    `### Story ${frame.frame}: ${frame.headline}`,
    frame.body,
    frame.pollQuestion ? `Encuesta: ${frame.pollQuestion} (${frame.pollOptions.join(" / ")})` : "",
    frame.cta ? `CTA: ${frame.cta}` : ""
  ].filter(Boolean).join("\n")).join("\n\n");
}

function carouselMarkdown(content: StudioGenerationContent): string {
  return content.carousel.map((slide) => `### Slide ${slide.slide}: ${slide.title}\n${slide.body}`).join("\n\n");
}

export function generationVideoPrompt(version: StudioGenerationVersion): string {
  const reel = version.content.reel;
  return [
    `Hook: ${reel.hook}`,
    `Guion: ${reel.script}`,
    `Texto en pantalla:\n${reel.onScreenText.map((line) => `- ${line}`).join("\n")}`,
    `B-roll sugerido:\n${reel.bRoll.map((shot) => `- ${shot}`).join("\n")}`,
    `CTA: ${reel.cta}`
  ].join("\n\n");
}

function versionHistoryMarkdown(history: readonly StudioGenerationVersion[]): string {
  return [...history]
    .sort((a, b) => b.versionNumber - a.versionNumber)
    .map((version) => {
      const origin = version.source === "restored" ? ` · Restaurada desde versión ${version.restoredFromVersion}` : version.source === "duplicated" ? " · Duplicada" : "";
      return `- Versión ${version.versionNumber} · ${new Date(version.createdAt).toLocaleString("es-ES")} · ${version.provider} · ${version.model} · ${version.generationDurationMs} ms${origin}`;
    })
    .join("\n");
}

export function generationToMarkdown(version: StudioGenerationVersion, history: readonly StudioGenerationVersion[] = []): string {
  const { content } = version;
  return [
    `# ${content.title}`,
    `**Versión:** ${version.versionNumber}`,
    `**Fecha:** ${new Date(version.createdAt).toLocaleString("es-ES")}`,
    `**Tema:** ${version.topic}`,
    `**Tipo:** ${version.type}`,
    `**Estado:** ${version.status}`,
    `**Proveedor:** ${version.provider}`,
    `**Modelo IA:** ${version.model}`,
    `**Tiempo IA:** ${version.generationDurationMs} ms`,
    version.user ? `**Usuario:** ${version.user}` : "",
    version.tags.length ? `**Etiquetas:** ${version.tags.join(", ")}` : "",
    version.source === "restored" ? `**Origen:** Restaurada desde versión ${version.restoredFromVersion}` : "",
    `## Hook\n${content.hook}`,
    `## Copy\n${content.caption}`,
    `## CTA\n${content.cta}`,
    `## Hashtags\n${content.hashtags.join(" ")}`,
    `## Prompt Imagen\n${content.imagePrompt}`,
    `## Prompt Video\n${generationVideoPrompt(version)}`,
    version.notes ? `## Notas internas\n${version.notes}` : "",
    `## Stories\n${storyMarkdown(content)}`,
    `## Carrusel\n${carouselMarkdown(content)}`,
    content.blog ? `## Blog\n${content.blog}` : "",
    version.visualPrompts.length ? `## Prompts visuales\n${version.visualPrompts.map((prompt) => `### ${prompt.provider} · ${prompt.template} · ${prompt.aspectRatio}\n${prompt.prompt}\n\nNegative prompt: ${prompt.negativePrompt}`).join("\n\n")}` : "",
    history.length ? `## Historial de versiones\n${versionHistoryMarkdown(history)}` : ""
  ].filter(Boolean).join("\n\n");
}

export function generationToText(version: StudioGenerationVersion, history: readonly StudioGenerationVersion[] = []): string {
  return generationToMarkdown(version, history)
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/^-\s+/gm, "• ");
}

export function createStudioExportData(version: StudioGenerationVersion, history: readonly StudioGenerationVersion[]) {
  return {
    exportedAt: new Date().toISOString(),
    version,
    history: [...history]
      .sort((a, b) => b.versionNumber - a.versionNumber)
      .map(({ id, versionNumber, createdAt, updatedAt, provider, model, generationDurationMs, user, source, restoredFromVersion, status, favorite, tags, notes }) => ({ id, versionNumber, createdAt, updatedAt, provider, model, generationDurationMs, user, source, restoredFromVersion, status, favorite, tags, notes }))
  };
}

export function generationSearchText(version: StudioGenerationVersion): string {
  return [
    version.content.title,
    version.topic,
    version.content.hook,
    version.content.caption,
    version.content.cta,
    version.content.hashtags.join(" "),
    version.tags.join(" "),
    version.notes,
    version.type
  ].join(" ").toLocaleLowerCase("es");
}
