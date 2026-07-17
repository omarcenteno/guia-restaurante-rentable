# Guía Restaurante Rentable — Content OS

Aplicación web interna para planificar, crear, organizar, publicar y medir el contenido de Guía Restaurante Rentable.

## Qué incluye

- Dashboard con métricas de contenido, progreso de seguidores y ventas.
- Biblioteca de contenido con vistas tabla, tarjetas y kanban.
- Creación, edición, duplicado, archivo y exportación CSV.
- Calendario mensual, semanal y lista, con arrastre de piezas a fechas.
- Documentación editable de marca.
- Brand Book completo con índice, búsqueda, edición, aprobación, notas, restauración y exportación.
- Flujo de producción para las primeras 30 publicaciones de Instagram en `/produccion`.
- Biblioteca inicial de 50 hooks.
- Plantillas editables de guion.
- Registro de analítica por publicación con métricas calculadas.
- Sección editable de oferta y embudo.
- Persistencia inicial con `localStorage`.
- Datos mock separados en `src/lib/mockData.ts`.

## Cómo correr

```bash
npm install
npm run dev
```

Después abre:

```text
http://localhost:3000
```

## Build

```bash
npm run build
```

## Arquitectura

- `src/app/page.tsx`: experiencia principal de la aplicación.
- `src/app/globals.css`: estilos globales y Tailwind.
- `src/lib/types.ts`: tipos compartidos.
- `src/lib/mockData.ts`: contenido inicial, hooks, plantillas, documentación y oferta.
- `src/lib/brandBookData.ts`: contenido inicial completo del Brand Book.
- `src/lib/productionData.ts`: 30 publicaciones iniciales, estados y checklist de producción.
- `src/lib/storage.ts`: persistencia local y exportación CSV.

La app usa datos locales hoy, pero los tipos y módulos están preparados para reemplazar `localStorage` por Supabase más adelante.
