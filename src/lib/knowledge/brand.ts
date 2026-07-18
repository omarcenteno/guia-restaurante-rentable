import { initialBrandBookSections } from "@/lib/brandBookData";
import { loadActiveWorkspaceId, loadWorkspaceLocal, StorageNamespace } from "@/lib/workspaces";
import { defaultWorkspace } from "@/lib/workspaces/workspaceDefaults";
import type { BrandBookSection, BrandSection } from "@/lib/types";
import type { AudienceKnowledge, BrandKnowledge } from "./types";

export const pillars = ["Antes de abrir", "Finanzas", "Operación", "Menú rentable", "Marketing", "Casos reales", "Plantillas", "Escalabilidad", "Oferta"] as const;

export const initialBrandSections: BrandSection[] = [
  { id: "positioning", title: "Posicionamiento", body: "Referencia en español para abrir y operar restaurantes rentables en Estados Unidos con números, procesos y herramientas prácticas." },
  { id: "promise", title: "Promesa", body: "Aprende a abrir y operar un restaurante rentable en Estados Unidos, con números, procesos y herramientas prácticas antes de arriesgar tu dinero." },
  { id: "tagline", title: "Lema", body: "Abre con un plan. Opera con control. Crece con rentabilidad." },
  { id: "audience", title: "Público", body: "Hispanos en Estados Unidos que quieren abrir, mejorar o escalar restaurantes, food trucks, ghost kitchens y cafeterías." },
  { id: "problems", title: "Problemas principales", body: "Trabajan mucho y ganan poco, no dominan costos, improvisan procesos, invierten sin validar y confunden ventas con rentabilidad." },
  { id: "desires", title: "Deseos", body: "Abrir con seguridad, controlar costos, entender números, vender más con margen y operar sin depender de la improvisación diaria." },
  { id: "objections", title: "Objeciones", body: "No tengo experiencia, no sé si aplica en mi estado, no entiendo finanzas, ya tengo restaurante y no tengo tiempo." },
  { id: "offer", title: "Oferta", body: "Ebook Restaurante Rentable de 122 páginas con 15 plantillas en Excel o Google Sheets por $47 USD." },
  { id: "visuals", title: "Reglas visuales", body: "Azul marino, blanco, dorado y terracota. Editorial premium, líneas finas, espacios amplios, fotos reales de operaciones y negocios." },
  { id: "voice", title: "Tono de voz", body: "Claro, directo, experto, empático y práctico. Hablar con respeto al riesgo financiero del emprendedor." },
  { id: "reels", title: "Reglas para Reels", body: "Abrir con tensión, explicar un número o decisión, cerrar con acción específica. Evitar humor vacío o efectos genéricos." },
  { id: "carousels", title: "Reglas para carruseles", body: "Una idea por slide, titulares concretos, ejemplos de Estados Unidos, cierre con guardado o descarga." },
  { id: "stories", title: "Reglas para Stories", body: "Usar encuestas, preguntas, mini casos, prueba social y CTAs suaves hacia link en bio." },
  { id: "links", title: "Enlaces oficiales", body: "Instagram: @guia_restaurante_rentable\nWeb: www.guiarestauranterentable.com\nVenta: Hotmart y Shopify" }
];

export function getBrandBookSections() {
  const workspaceId = loadActiveWorkspaceId();
  return loadWorkspaceLocal<BrandBookSection[]>({ id: workspaceId }, StorageNamespace.setting(workspaceId, "brand-book"), workspaceId === defaultWorkspace.id ? initialBrandBookSections : [], workspaceId === defaultWorkspace.id ? ["grr-brand-book"] : []);
}

export function getSectionBody(title: string) {
  return getBrandBookSections().find((section) => section.title === title)?.body.trim() ?? "";
}

export function parseList(body: string) {
  return body.split("\n").map((line) => line.replace(/^[-\d.\s]+/, "").trim()).filter(Boolean);
}

export function valueAfterLabel(body: string, label: string) {
  const lines = body.split("\n");
  const index = lines.findIndex((line) => line.trim().toLowerCase() === `${label.toLowerCase()}:`);
  return index >= 0 ? lines[index + 1]?.trim().replace(/^"|"$/g, "") ?? "" : "";
}

export function getBrand(): BrandKnowledge {
  const essence = getSectionBody("Esencia de Marca");
  const voice = getSectionBody("Voz y Personalidad");
  return { name: valueAfterLabel(essence, "Nombre") || "Guía Restaurante Rentable", history: getSectionBody("Posicionamiento"), mission: getSectionBody("Misión"), vision: getSectionBody("Visión"), values: parseList(getSectionBody("Valores")), personality: voice, tone: getSectionBody("Tono Editorial"), voice, recommendedWords: parseList(getSectionBody("Palabras Preferidas")), forbiddenWords: parseList(getSectionBody("Palabras Prohibidas")) };
}

export function getAudience(): AudienceKnowledge {
  const workspaceId = loadActiveWorkspaceId();
  const legacy = loadWorkspaceLocal<BrandSection[]>({ id: workspaceId }, StorageNamespace.setting(workspaceId, "brand"), workspaceId === defaultWorkspace.id ? initialBrandSections : [], workspaceId === defaultWorkspace.id ? ["grr-brand"] : []);
  const find = (id: string) => legacy.find((entry) => entry.id === id)?.body ?? "";
  const avatar = getSectionBody("Avatar Principal");
  return { profile: getSectionBody("Público Objetivo"), problems: splitList(find("problems")), desires: parseList(sectionBlock(avatar, "Deseos", "Miedos")).concat(splitList(find("desires"))), objections: splitList(find("objections")), pains: parseList(sectionBlock(avatar, "Miedos")), transformation: getSectionBody("Propuesta de Valor") };
}

function sectionBlock(body: string, start: string, end?: string) {
  const from = body.indexOf(`${start}:`);
  if (from < 0) return "";
  const content = body.slice(from + start.length + 1);
  const to = end ? content.indexOf(`${end}:`) : -1;
  return to >= 0 ? content.slice(0, to) : content;
}

function splitList(value: string) {
  return value.split(",").map((entry) => entry.trim().replace(/\.$/, "")).filter(Boolean);
}
