import { getAudience } from "./brand";
import { getOffer } from "./offer";
import type { FaqItem } from "./types";

export function getFaq(): FaqItem[] {
  const audience = getAudience();
  const offer = getOffer();
  return [
    { question: "¿Sirve si ya tengo un restaurante?", answer: "Sí. El sistema ayuda a controlar números, procesos y rentabilidad tanto antes como después de abrir." },
    { question: "¿Está enfocado en Estados Unidos?", answer: "Sí. Está creado para emprendedores hispanos que abren u operan restaurantes en Estados Unidos." },
    { question: "¿Necesito experiencia en finanzas?", answer: "No. Los conceptos y cálculos se explican de forma práctica y paso a paso." },
    { question: "¿Qué incluye la oferta?", answer: `${offer.mainProduct}, herramientas prácticas y plantillas para tomar decisiones con datos.` },
    { question: "¿Cuáles son las objeciones principales?", answer: audience.objections.join(", ") }
  ];
}
