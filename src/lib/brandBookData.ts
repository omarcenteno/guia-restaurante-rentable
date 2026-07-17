import type { BrandBookSection } from "./types";

const initialDate = "2026-07-10";

const section = (order: number, title: string, body: string): BrandBookSection => ({
  id: title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  order,
  title,
  body,
  notes: "",
  approved: false,
  lastEditedAt: initialDate
});

export const initialBrandBookSections: BrandBookSection[] = [
  section(1, "Esencia de Marca", `Nombre:
Guía Restaurante Rentable

Instagram:
@guia_restaurante_rentable

Sitio web:
www.guiarestauranterentable.com

Producto principal:
Ebook "Restaurante Rentable" de 122 páginas.

Incluye:
15 plantillas en Excel o Google Sheets.

Precio:
$47 USD.

Garantía:
7 días.

Mercado:
Hispanos que viven en Estados Unidos.

Idioma:
Español.

Tagline:
Abre con un plan. Opera con control. Crece con rentabilidad.

Propósito:
Ayudar a los emprendedores hispanos en Estados Unidos a construir restaurantes rentables mediante educación práctica, sistemas y herramientas reales.`),
  section(2, "Posicionamiento", `Guía Restaurante Rentable es una plataforma educativa en español para personas que quieren abrir, operar o hacer crecer un restaurante en Estados Unidos.

No es una cuenta de recetas.
No es una página de motivación.
No es una cuenta de frases.
No es una promesa de riqueza rápida.
No debe percibirse como una cuenta que vende un ebook.

Debe percibirse como una plataforma educativa profesional en español para emprendedores restauranteros en Estados Unidos.

La marca enseña a construir restaurantes rentables mediante:
- validación,
- finanzas,
- operación,
- marketing,
- sistemas,
- control,
- escalabilidad.

Es una guía práctica basada en experiencia real, números, procesos y herramientas.`),
  section(3, "Misión", "Reducir la cantidad de restaurantes que fracasan por falta de conocimiento empresarial, ayudando a los emprendedores a tomar mejores decisiones antes y después de abrir."),
  section(4, "Visión", "Convertirse en la marca de referencia en español para emprender, operar y hacer crecer restaurantes rentables en Estados Unidos."),
  section(5, "Valores", `- Claridad
- Honestidad
- Rentabilidad
- Disciplina
- Educación práctica
- Respeto por la inversión
- Decisiones basadas en datos
- Mejora continua
- Profesionalismo
- Responsabilidad`),
  section(6, "Público Objetivo", `Principal:
Emprendedor hispano viviendo en Estados Unidos, de 35 a 60 años, que quiere abrir un restaurante o negocio de comida y teme perder su inversión por falta de experiencia.

Secundario:
Dueños de restaurantes que trabajan demasiado, no dominan sus números y sienten que venden pero no generan utilidad.

Audiencias:
- Personas que quieren abrir un restaurante en Estados Unidos.
- Dueños de restaurantes que trabajan mucho y ganan poco.
- Emprendedores de food trucks.
- Emprendedores de ghost kitchens.
- Dueños de cafeterías.
- Inversionistas sin experiencia restaurantera.
- Operadores que quieren abrir una segunda ubicación.
- Restaurantes latinos en Estados Unidos.

No enfocar la marca en restaurantes de México.`),
  section(7, "Avatar Principal", `Nombre ficticio:
Carlos o María.

Edad:
35 a 60 años.

Ubicación:
Estados Unidos.

Situación:
Tiene experiencia cocinando o trabajando en restaurantes, pero no domina finanzas, permisos, sistemas ni marketing.

Deseos:
- abrir su propio restaurante,
- construir independencia,
- crear un patrimonio,
- mejorar la vida de su familia,
- evitar errores costosos.

Miedos:
- perder sus ahorros,
- firmar un mal contrato,
- no vender,
- contratar mal,
- quedarse sin liquidez,
- cerrar antes del primer año.`),
  section(8, "Oferta", `Producto:
Ebook Restaurante Rentable.

Precio:
$47 USD.

Incluye:
- Ebook de 122 páginas.
- 15 plantillas en Excel o Google Sheets.
- Herramientas para presupuesto, punto de equilibrio, food cost, labor cost, flujo de caja, ingeniería de menú, proveedores y operación.

Garantía:
7 días.

Plataformas de venta:
Hotmart y Shopify.`),
  section(9, "Propuesta de Valor", "Una guía práctica en español para abrir y operar un restaurante rentable en Estados Unidos, construida desde la experiencia real y acompañada por herramientas listas para usar."),
  section(10, "Voz y Personalidad", `La voz de la marca debe ser:
- profesional,
- clara,
- honesta,
- cercana,
- práctica,
- estratégica,
- directa,
- basada en experiencia,
- basada en números,
- sin exageraciones.

La personalidad debe sentirse:
- como un consultor,
- como un mentor,
- como un operador experimentado,
- nunca como un gurú.`),
  section(11, "Tono Editorial", `Distribución recomendada:
- 70% consultor
- 20% mentor
- 10% storytelling

El contenido debe:
- explicar,
- enseñar,
- advertir,
- simplificar,
- demostrar,
- orientar.`),
  section(12, "Mensajes Clave", `- La pasión no reemplaza un sistema.
- La buena comida no garantiza rentabilidad.
- Antes de invertir, valida.
- Lo que no se mide no se controla.
- Un restaurante lleno también puede perder dinero.
- El punto de equilibrio es un número que todo dueño debe conocer.
- El food cost y el labor cost definen la rentabilidad.
- Un restaurante rentable necesita procesos, no improvisación.
- El dueño no debe convertirse en el único sistema del negocio.

Enemigo de la marca:
La improvisación.

Frases y mentalidades contra las que compite la marca:
- "Sobre la marcha vemos."
- "Con buena comida basta."
- "Así lo hacen todos."
- "Primero abrimos y luego resolvemos."
- "No necesito calcular los números."

Filosofía:
"La pasión puede abrir un restaurante. Los sistemas lo mantienen abierto."`),
  section(13, "Identidad Visual", `Sensación:
- premium,
- editorial,
- corporativa,
- ejecutiva,
- confiable,
- sobria.

La marca nunca debe parecer:
- una cuenta de recetas,
- una cuenta de memes,
- una cuenta de frases motivacionales,
- una cuenta de riqueza rápida.`),
  section(14, "Paleta de Colores", `Azul marino principal:
#0E1B2B

Azul marino secundario:
#16283D

Blanco:
#FFFFFF

Dorado principal:
#C7A45A

Dorado suave:
#D8C38A

Terracota:
#B66A4A

Gris claro:
#E9ECEF

Gris texto:
#6B7280

Los códigos HEX son editables y deben mantenerse consistentes en piezas de contenido, landing pages, emails y campañas.`),
  section(15, "Tipografías", `Recomendación inicial:
Titulares:
Playfair Display o Cormorant Garamond.

Texto:
Inter, Manrope o Source Sans 3.

Usar:
- titulares grandes,
- poco texto,
- alto contraste,
- mucho espacio,
- jerarquía clara.`),
  section(16, "Estilo Fotográfico", `Usar:
- restaurantes reales,
- cocinas profesionales,
- personal trabajando,
- manos,
- ingredientes,
- inventarios,
- Excel,
- gráficas,
- locales,
- contratos,
- equipos,
- operaciones,
- planos,
- pizarras,
- detalles premium.

No usar:
- billetes volando,
- Ferraris,
- mansiones,
- llamas,
- chefs caricaturizados,
- ilustraciones infantiles,
- diseños saturados.`),
  section(17, "Sistema de Portadas", `Cada portada debe tener:
- un hook grande,
- una sola idea,
- una imagen dominante,
- mucho aire,
- contraste alto,
- máximo 10 a 14 palabras visibles,
- identidad azul marino, blanco y dorado.`),
  section(18, "Reglas para Reels", `- Hook en los primeros 3 segundos.
- Una sola idea principal.
- Duración recomendada: 20 a 45 segundos.
- Texto grande y legible.
- No depender del audio.
- Usar subtítulos.
- Mostrar cifras cuando aporten valor.
- Cerrar con CTA claro.
- Mantener estilo visual consistente.`),
  section(19, "Reglas para Carruseles", `- Slide 1: hook fuerte.
- Slides intermedios: una idea por slide.
- Última slide: resumen + CTA.
- Entre 5 y 7 slides.
- Poco texto.
- Alto valor guardable.
- Diseñar para compartir y guardar.`),
  section(20, "Reglas para Stories", `- 3 a 5 pantallas.
- Una secuencia, no pantallas aisladas.
- Combinar:
  - educación,
  - interacción,
  - CTA.
- Usar encuestas, quiz o caja de preguntas cuando tenga sentido.
- No saturar con texto.`),
  section(21, "CTAs Aprobados", `CTA principal de seguimiento:
"Síguenos y aprende a abrir y operar un restaurante rentable en Estados Unidos."

CTA de venta:
"Descubre la guía completa en el enlace de nuestra bio."

CTA de guardado:
"Guarda esta publicación antes de tomar una decisión."

CTA de comentario:
"Cuéntanos en los comentarios qué parte te preocupa más."

CTA de compartir:
"Compártelo con alguien que quiere abrir un restaurante."

CTA de autoridad:
"Aprende a tomar decisiones con números, no con suposiciones."`),
  section(22, "Hashtags Aprobados", `- #GuiaRestauranteRentable
- #RestaurantesUSA
- #EmprendedoresLatinos
- #AbrirRestaurante
- #NegocioRestaurantero
- #FoodCost
- #RestaurantBusiness
- #RestauranteRentable
- #NegociosEnUSA
- #EmprenderEnUSA`),
  section(23, "Palabras Preferidas", `- Rentabilidad
- Sistema
- Operación
- Indicadores
- Procesos
- Margen
- Utilidad
- Control
- Planeación
- Negocio
- Punto de equilibrio
- Food cost
- Labor cost
- Prime cost
- Flujo de caja
- Capital de trabajo
- Validación
- Estandarización`),
  section(24, "Palabras Prohibidas", `- Hazte rico
- Millonario
- Fácil
- Sin esfuerzo
- Garantizado
- Secreto
- Hack
- Dinero rápido
- Fórmula mágica
- Éxito asegurado`),
  section(25, "Reglas de Oro", `1. Nunca publicar por publicar.
2. Todo contenido debe enseñar algo práctico.
3. Una publicación debe tener una sola idea central.
4. Diseñar para que se guarde.
5. Diseñar para que se comparta.
6. Hablar con evidencia, experiencia y números.
7. No perseguir tendencias que debiliten el posicionamiento.
8. La marca siempre debe sentirse premium.
9. Cada pieza debe fortalecer la confianza.
10. La venta debe ser consecuencia de la autoridad.
11. No exagerar cifras ni promesas.
12. No publicar estadísticas sin fuente verificable.
13. No usar miedo vacío; explicar el riesgo y la solución.
14. Mantener coherencia con el ebook.
15. Hablar siempre al mercado hispano en Estados Unidos.`),
  section(26, "Ejemplos de Aplicación", `Ejemplo de hook:
"La mayoría de los restaurantes no fracasa por la comida."

Ejemplo de título de carrusel:
"5 preguntas que debes responder antes de invertir un solo dólar."

Ejemplo de CTA:
"Guarda esta publicación y revisa estos números antes de firmar un contrato."

Ejemplo de mensaje de marca:
"Abre con un plan. Opera con control. Crece con rentabilidad."`)
];
