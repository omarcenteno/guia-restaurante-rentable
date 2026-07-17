import type { EbookKnowledge } from "./types";

export function getEbook(): EbookKnowledge {
  return {
    title: "Restaurante Rentable",
    chapters: [
      { title: "Antes de invertir", subchapters: ["Validación", "Modelo de negocio", "Ubicación y contrato", "Permisos y presupuesto"] },
      { title: "Números antes de abrir", subchapters: ["Punto de equilibrio", "Food cost", "Labor cost", "Prime cost", "Flujo de caja", "Capital de trabajo"] },
      { title: "Oferta y herramientas", subchapters: ["Operación", "Proveedores", "Ingeniería de menú", "Marketing", "Control y crecimiento"] }
    ],
    templates: ["Presupuesto de apertura", "Punto de equilibrio", "Food cost", "Labor cost", "Prime cost", "Flujo de caja", "Capital de trabajo", "Ingeniería de menú", "Control de inventario", "Lista de proveedores", "Costeo de recetas", "Plan de ventas", "Checklist de apertura", "Control operativo", "Tablero de indicadores"],
    calculators: ["Calculadora de food cost", "Calculadora de punto de equilibrio", "Calculadora de prime cost", "Calculadora de capital de trabajo"]
  };
}
