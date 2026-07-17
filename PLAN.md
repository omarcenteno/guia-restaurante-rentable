# Plan de Producto

## Versión 1

- Construir el Content OS como herramienta interna usable desde el primer día.
- Cargar datos iniciales de contenido, calendario, hooks, marca, plantillas y oferta.
- Crear Brand Book como fuente única de verdad de la marca, con secciones aprobables y exportables.
- Agregar flujo manual de Producción para completar las primeras 30 publicaciones de Instagram.
- Permitir edición completa con persistencia en `localStorage`.
- Incluir exportación CSV para mover datos a hojas o bases externas.
- Validar que la aplicación compile con Next.js, TypeScript y Tailwind CSS.

## Próxima versión

- Integrar Supabase con tablas para contenido, hooks, calendario, métricas, marca y oferta.
- Migrar Brand Book a Supabase con control de versiones por sección.
- Migrar Producción a Supabase con historial de cambios, assets y calendario compartido.
- Agregar autenticación para equipo interno.
- Añadir historial de cambios por publicación.
- Crear importación CSV.
- Agregar adjuntos de assets por pieza de contenido.
- Sincronizar calendario con Google Calendar o Meta Business Suite.
- Crear reportes mensuales por pilar, formato y campaña.

## Modelo sugerido para Supabase

- `content_items`
- `content_metrics`
- `hooks`
- `script_templates`
- `brand_sections`
- `offer_sections`
- `content_activity`

## Criterios de calidad

- La app debe sentirse premium, editorial y operativa.
- Ningún botón visible debe quedar sin acción.
- Los formularios deben guardar sin fricción.
- Las vistas deben funcionar en desktop y tablet.
- Los datos deben sobrevivir al refrescar la página.
