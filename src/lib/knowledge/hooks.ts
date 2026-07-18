import { loadActiveWorkspaceId, loadWorkspaceLocal, StorageNamespace } from "@/lib/workspaces";
import { defaultWorkspace } from "@/lib/workspaces/workspaceDefaults";
import type { HookItem } from "@/lib/types";
import { pillars } from "./brand";
import { formats } from "./templates";
import type { HooksKnowledge } from "./types";

const hookCategories = ["Curiosidad", "Error", "Riesgo financiero", "Autoridad", "Mito", "Comparación", "Pregunta", "Contradicción", "Lista", "Historia"];
const hookTexts = [
  "La mayoría de restaurantes no fracasa por la comida.",
  "Antes de comprar equipo, mira este número.",
  "Tu renta puede estar matando el negocio desde el día uno.",
  "Un menú grande no siempre vende más.",
  "Si no sabes tu punto de equilibrio, estás manejando a ciegas.",
  "El food cost no se adivina, se calcula.",
  "No abras un restaurante solo porque cocinas rico.",
  "Este error en payroll se come tu ganancia.",
  "La ubicación perfecta puede ser una trampa.",
  "Tres señales de que tu concepto no está listo.",
  "Lo que revisaría antes de firmar un lease.",
  "El número que separa una idea bonita de un negocio real.",
  "Tu ticket promedio cuenta una historia incómoda.",
  "No necesitas más ventas si cada venta pierde dinero.",
  "¿Tu menú trabaja para ti o contra ti?",
  "La plantilla que todo operador debería usar cada semana.",
  "Un restaurante lleno también puede perder dinero.",
  "El costo oculto de improvisar procesos.",
  "La pregunta que haría antes de abrir una food truck.",
  "No confundas seguidores con clientes.",
  "La promoción que atrae clientes malos.",
  "Qué haría antes de invertir $50,000.",
  "La diferencia entre vender comida y operar un restaurante.",
  "Si tu equipo depende de ti para todo, no tienes sistema.",
  "El mito de que el delivery siempre aumenta ganancias.",
  "Esta decisión de menú cambia tu margen.",
  "Cómo saber si puedes pagar un gerente.",
  "El error de abrir la segunda ubicación demasiado pronto.",
  "Lo que nadie calcula antes de comprar equipo usado.",
  "El precio bajo puede salir carísimo.",
  "¿Cuánto debes vender antes de contratar a alguien más?",
  "La historia de un restaurante que vendía mucho y ganaba poco.",
  "El checklist que usaría antes de abrir puertas.",
  "Por qué tu cocina necesita números, no esperanza.",
  "La objeción más común antes de comprar el ebook.",
  "Un cambio pequeño en porciones puede salvar margen.",
  "Lo que revisaría cada lunes si fuera tu operador.",
  "Tu prime cost dice si el negocio respira.",
  "No todos los platillos merecen estar en el menú.",
  "La trampa de copiar el restaurante de moda.",
  "Si quieres inversionistas, primero enseña estos números.",
  "¿Puedes explicar tu concepto en una frase?",
  "Lo que una cafetería debe medir cada mañana.",
  "Ghost kitchen no significa bajo riesgo.",
  "La forma correcta de probar demanda antes de abrir.",
  "Una historia real sobre firmar demasiado rápido.",
  "El cálculo que evita vender por debajo del costo.",
  "Por qué tus stories deben vender confianza.",
  "El CTA que funciona mejor que pedir compras directas.",
  "Tu contenido debe educar antes de vender."
];

export const initialHooks: HookItem[] = hookTexts.map((text, index) => ({
  id: `HOOK-${String(index + 1).padStart(3, "0")}`,
  text,
  category: hookCategories[index % hookCategories.length],
  pillar: pillars[index % pillars.length],
  format: formats[index % 4],
  funnel: index % 4 === 0 ? "Descubrimiento" : index % 4 === 1 ? "Consideración" : index % 4 === 2 ? "Conversión" : "Retención",
  performance: 58 + ((index * 7) % 39),
  used: (index * 3) % 12
}));

export function getHooks(): HooksKnowledge {
  const workspaceId = loadActiveWorkspaceId();
  const hooks = loadWorkspaceLocal<HookItem[]>({ id: workspaceId }, StorageNamespace.setting(workspaceId, "hooks"), workspaceId === defaultWorkspace.id ? initialHooks : [], workspaceId === defaultWorkspace.id ? ["grr-hooks"] : []);
  const sorted = [...hooks].sort((a, b) => b.performance - a.performance || a.used - b.used);
  return { primary: sorted[0]?.text ?? initialHooks[0].text, all: sorted.map((hook) => hook.text) };
}
