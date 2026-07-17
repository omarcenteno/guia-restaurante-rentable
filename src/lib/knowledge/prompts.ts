import { getTemplates } from "./templates";
import type { PromptKnowledge } from "./types";

export function getPrompts(): PromptKnowledge {
  return { copywritingFrameworks: ["PAS: Problema, Agitación, Solución", "AIDA: Atención, Interés, Deseo, Acción", "BAB: Antes, Después, Puente", "4P: Promesa, Imagen, Prueba, Empuje", "Educativo GRR: Hook, Riesgo, Número, Acción, CTA"], contentTemplates: getTemplates().map((template) => `${template.name}: ${template.structure.join(" → ")}`) };
}

export const getPromptKnowledge = getPrompts;
