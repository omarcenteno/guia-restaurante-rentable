import { getSectionBody, valueAfterLabel } from "./brand";
import type { CtaKnowledge } from "./types";

export function getCtas(): CtaKnowledge {
  const body = getSectionBody("CTAs Aprobados");
  const all = body.split("\n").map((line) => line.trim().replace(/^"|"$/g, "")).filter((line) => line && !line.endsWith(":"));
  return { primary: valueAfterLabel(body, "CTA principal de seguimiento") || all[0] || "Síguenos para aprender a operar un restaurante rentable.", all };
}
