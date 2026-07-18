import { loadActiveWorkspaceId, loadWorkspaceLocal, StorageNamespace } from "@/lib/workspaces";
import { defaultWorkspace } from "@/lib/workspaces/workspaceDefaults";
import type { FunnelOffer } from "@/lib/types";
import { getSectionBody, valueAfterLabel } from "./brand";
import type { OfferKnowledge } from "./types";

export const initialOffer: FunnelOffer[] = [
  { id: "product", title: "Producto", body: "Ebook Restaurante Rentable, guía práctica de 122 páginas para abrir y operar restaurantes rentables en Estados Unidos." },
  { id: "price", title: "Precio", body: "$47 USD con garantía de 7 días." },
  { id: "includes", title: "Qué incluye", body: "15 plantillas en Excel o Google Sheets para validar, calcular costos, planear operación y medir rentabilidad." },
  { id: "benefits", title: "Beneficios", body: "Menos improvisación, mejor control financiero, decisiones antes de invertir y operación más ordenada." },
  { id: "faq", title: "Preguntas frecuentes", body: "¿Sirve si ya tengo restaurante? Sí. ¿Es para México? No, está enfocado en hispanos en Estados Unidos. ¿Necesito saber finanzas? No, explica los cálculos paso a paso." },
  { id: "links", title: "Links de venta", body: "Shopify: pendiente\nHotmart: pendiente\nLink en bio: www.guiarestauranterentable.com" },
  { id: "lead-magnets", title: "Lead magnets", body: "Calculadora de food cost, checklist antes de firmar lease, plantilla de punto de equilibrio." },
  { id: "upsells", title: "Upsells futuros", body: "Taller de números para restaurantes, auditoría de menú, membresía de plantillas y acompañamiento grupal." }
];

export function getOffer(): OfferKnowledge {
  const workspaceId = loadActiveWorkspaceId();
  const stored = loadWorkspaceLocal<FunnelOffer[]>({ id: workspaceId }, StorageNamespace.setting(workspaceId, "offer"), workspaceId === defaultWorkspace.id ? initialOffer : [], workspaceId === defaultWorkspace.id ? ["grr-offer"] : []);
  const find = (id: string) => stored.find((entry) => entry.id === id)?.body ?? "";
  const offer = getSectionBody("Oferta");
  return { mainProduct: valueAfterLabel(offer, "Producto") || find("product"), price: valueAfterLabel(offer, "Precio") || "$47 USD", guarantee: valueAfterLabel(offer, "Garantía") || "7 días", benefits: find("benefits").split(",").map((value) => value.trim()).filter(Boolean), promise: getSectionBody("Propuesta de Valor") };
}
