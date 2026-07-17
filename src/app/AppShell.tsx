"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { KnowledgeLibrary } from "@/components/library/KnowledgeLibrary";
import { EditorSection } from "@/components/production/EditorSection";
import { CharacterCounter } from "@/components/production/CharacterCounter";
import { Checklist } from "@/components/production/Checklist";
import { HistoryPanel, type HistoryEntry } from "@/components/production/HistoryPanel";
import { InstagramPreview } from "@/components/production/InstagramPreview";
import { ImagePromptCard } from "@/components/production/ImagePromptCard";
import { ProfessionalEditor } from "@/components/production/ProfessionalEditor";
import { StudioStatistics, VersionComparison, VersionManager, VersionMetadataPanel } from "@/components/production/VersionManager";
import { cancelPublicationGeneration, generatePublication, getPublicationGenerationContext } from "@/lib/ai/contentGenerator";
import { cloneStudioVersion, createStudioExportData, createStudioVersion, generationToMarkdown, generationToText, loadAllStudioVersions, loadStudioVersions, nextStudioVersionNumber, saveStudioVersions, type StudioGenerationContent, type StudioGenerationVersion } from "@/lib/ai/studioVersions";
import type { Publication } from "@/lib/ai/types";
import { buildImagePrompts, type ImageContentType, type ImageTemplateName } from "@/lib/images";
import { initialBrandBookSections } from "@/lib/brandBookData";
import { checklistLabels, initialProductionItems, productionKanbanColumns, productionStates } from "@/lib/productionData";
import { downloadBlob, downloadCsv, downloadFile, loadLocal, saveLocal } from "@/lib/storage";
import { createStudioDocx } from "@/lib/studioDocx";
import { formats, funnels, goals, initialBrandSections, initialContent, initialHooks, initialOffer, initialTemplates, pillars, series, statuses } from "@/lib/knowledge";
import type { BrandBookSection, BrandSection, ContentItem, ContentProductionItem, Format, FunnelOffer, HookItem, ProductionState, ScriptTemplate, ViewId } from "@/lib/types";
import { loadWorkspaceLocal, saveWorkspaceLocal, useWorkspace, WorkspaceProvider } from "@/lib/workspaces";

const contentKey = "grr-content";
const hooksKey = "grr-hooks";
const templatesKey = "grr-templates";
const brandKey = "grr-brand";
const brandBookKey = "grr-brand-book";
const productionKey = "grr-production";
const offerKey = "grr-offer";

const nav: { id: ViewId; label: string; glyph: string }[] = [
  { id: "dashboard", label: "Dashboard", glyph: "◆" },
  { id: "content", label: "Biblioteca", glyph: "▦" },
  { id: "calendar", label: "Calendario", glyph: "◇" },
  { id: "production", label: "Producción", glyph: "▣" },
  { id: "brandBook", label: "Brand Book", glyph: "◐" },
  { id: "brand", label: "Marca", glyph: "◈" },
  { id: "hooks", label: "Hooks", glyph: "✦" },
  { id: "templates", label: "Guiones", glyph: "▤" },
  { id: "analytics", label: "Analítica", glyph: "◌" },
  { id: "funnel", label: "Oferta", glyph: "◍" }
];

const blankContent = (): ContentItem => ({
  id: `GRR-${Date.now().toString().slice(-5)}`,
  title: "Nueva idea de contenido",
  topic: "",
  pillar: "Antes de abrir",
  series: "Restaurante en USA",
  format: "Reel",
  goal: "Alcance",
  funnel: "Descubrimiento",
  hook: "",
  centralIdea: "",
  script: "",
  copy: "",
  cta: "Síguenos para aprender a abrir y operar un restaurante rentable en Estados Unidos.",
  hashtags: "#restaurante #restauranteusa #negociolatino",
  supportStories: "",
  pinnedComment: "",
  ebookChapter: "",
  status: "Idea",
  createdAt: new Date().toISOString().slice(0, 10),
  scheduledAt: "",
  publishedAt: "",
  postUrl: "",
  owner: "Omar",
  difficulty: "Media",
  priority: "Media",
  notes: "",
  metrics: {
    reach: 0,
    plays: 0,
    likes: 0,
    comments: 0,
    saves: 0,
    shares: 0,
    profileVisits: 0,
    newFollowers: 0,
    linkClicks: 0,
    leads: 0,
    sales: 0,
    revenue: 0,
    adCost: 0
  }
});

export function AppShell(props: { initialView?: ViewId; initialProductionId?: string; initialProductionMode?: "kanban" | "list" | "studio" } = {}) {
  return (
    <WorkspaceProvider>
      <AppShellContent {...props} />
    </WorkspaceProvider>
  );
}

function AppShellContent({ initialView = "dashboard", initialProductionId = "", initialProductionMode = "kanban" }: { initialView?: ViewId; initialProductionId?: string; initialProductionMode?: "kanban" | "list" | "studio" } = {}) {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const [view, setView] = useState<ViewId>(initialView);
  const [content, setContent] = useState<ContentItem[]>(initialContent);
  const [hooks, setHooks] = useState<HookItem[]>(initialHooks);
  const [templates, setTemplates] = useState<ScriptTemplate[]>(initialTemplates);
  const [brand, setBrand] = useState<BrandSection[]>(initialBrandSections);
  const [brandBook, setBrandBook] = useState<BrandBookSection[]>(initialBrandBookSections);
  const [production, setProduction] = useState<ContentProductionItem[]>(initialProductionItems);
  const [offer, setOffer] = useState<FunnelOffer[]>(initialOffer);
  const [toast, setToast] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [loadedWorkspaceId, setLoadedWorkspaceId] = useState("");

  useEffect(() => {
    const hashView = window.location.hash.replace("#", "");
    if (hashView === "brand-book") setView("brandBook");
    if (window.location.pathname === "/produccion") setView("production");
    setContent(loadWorkspaceLocal(workspace, contentKey, initialContent));
    setHooks(loadWorkspaceLocal(workspace, hooksKey, initialHooks));
    setTemplates(loadWorkspaceLocal(workspace, templatesKey, initialTemplates));
    setBrand(loadWorkspaceLocal(workspace, brandKey, initialBrandSections));
    setBrandBook(loadWorkspaceLocal(workspace, brandBookKey, initialBrandBookSections));
    setProduction(loadWorkspaceLocal(workspace, productionKey, initialProductionItems));
    setOffer(loadWorkspaceLocal(workspace, offerKey, initialOffer));
    setLoadedWorkspaceId(workspace.id);
    setHydrated(true);
  }, [workspace]);

  const workspaceReady = hydrated && loadedWorkspaceId === workspace.id;

  useEffect(() => { if (workspaceReady) saveWorkspaceLocal(workspace, contentKey, content); }, [content, workspace, workspaceReady]);
  useEffect(() => { if (workspaceReady) saveWorkspaceLocal(workspace, hooksKey, hooks); }, [hooks, workspace, workspaceReady]);
  useEffect(() => { if (workspaceReady) saveWorkspaceLocal(workspace, templatesKey, templates); }, [templates, workspace, workspaceReady]);
  useEffect(() => { if (workspaceReady) saveWorkspaceLocal(workspace, brandKey, brand); }, [brand, workspace, workspaceReady]);
  useEffect(() => { if (workspaceReady) saveWorkspaceLocal(workspace, brandBookKey, brandBook); }, [brandBook, workspace, workspaceReady]);
  useEffect(() => { if (workspaceReady) saveWorkspaceLocal(workspace, productionKey, production); }, [production, workspace, workspaceReady]);
  useEffect(() => { if (workspaceReady) saveWorkspaceLocal(workspace, offerKey, offer); }, [offer, workspace, workspaceReady]);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const activeContent = content.filter((item) => !item.archived);

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="thin-lines sticky top-0 z-20 border-b border-white/10 bg-navy px-5 py-5 text-white lg:h-screen lg:border-b-0 lg:border-r lg:border-gold/20">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.32em] text-gold">Content OS</p>
          <WorkspaceSelector />
          <h1 className="mt-3 text-2xl font-semibold leading-tight">Guía Restaurante Rentable</h1>
          <p className="mt-3 text-sm leading-6 text-white/68">Abre con un plan. Opera con control. Crece con rentabilidad.</p>
        </div>
        <nav className="grid gap-2 sm:grid-cols-4 lg:grid-cols-1">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id);
                if (item.id === "production") router.push("/produccion");
                if (item.id === "brandBook") window.history.replaceState(null, "", "#brand-book");
                if (item.id !== "brandBook" && item.id !== "production") router.push("/");
              }}
              className={`focus-ring flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition ${
                view === item.id ? "bg-white text-navy shadow-editorial" : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-gold">{item.glyph}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-8 hidden border-t border-gold/20 pt-5 text-sm text-white/70 lg:block">
          <p>@guia_restaurante_rentable</p>
          <p className="mt-2">Meta: 10,000 seguidores y 400 ventas mensuales.</p>
        </div>
      </aside>

      <section className="px-4 py-5 sm:px-6 lg:px-8">
        <Topbar view={view} />
        {toast ? <div className="fixed right-5 top-5 z-50 rounded-md bg-ink px-4 py-3 text-sm text-white shadow-editorial">{toast}</div> : null}
        {view === "dashboard" && <Dashboard content={activeContent} production={production.filter((item) => !item.archived)} setView={setView} />}
        {view === "content" && <KnowledgeLibrary flash={flash} />}
        {view === "calendar" && <Calendar content={activeContent} setContent={setContent} flash={flash} />}
        {view === "production" && <ProductionModule production={production.filter((item) => !item.archived)} allProduction={production} initialProductionId={initialProductionId} initialProductionMode={initialProductionMode} setProduction={setProduction} content={content} setContent={setContent} brandBook={brandBook} flash={flash} />}
        {view === "brandBook" && <BrandBook sections={brandBook} setSections={setBrandBook} flash={flash} />}
        {view === "brand" && <EditableSections title="Documentación de marca" sections={brand} setSections={setBrand} flash={flash} />}
        {view === "hooks" && <HooksLibrary hooks={hooks} setHooks={setHooks} />}
        {view === "templates" && <Templates templates={templates} setTemplates={setTemplates} flash={flash} />}
        {view === "analytics" && <Analytics content={activeContent} setContent={setContent} flash={flash} />}
        {view === "funnel" && <EditableSections title="Oferta y embudo" sections={offer} setSections={setOffer} flash={flash} />}
      </section>
    </main>
  );
}

function WorkspaceSelector() {
  const { workspace, workspaces, setActiveWorkspace } = useWorkspace();
  return (
    <label className="mt-3 block text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
      Workspace
      <select
        className="focus-ring mt-2 min-h-10 w-full rounded-md border border-gold/25 bg-white/8 px-3 text-sm normal-case tracking-normal text-white transition hover:bg-white/10"
        value={workspace.id}
        onChange={(event) => setActiveWorkspace(event.target.value)}
        aria-label="Seleccionar workspace"
      >
        {workspaces.map((item) => (
          <option key={item.id} value={item.id}>
            {item.id === workspace.id ? "✓ " : ""}{item.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Home() {
  return <AppShell />;
}

function Topbar({ view }: { view: ViewId }) {
  const label = nav.find((item) => item.id === view)?.label;
  return (
    <header className="mb-6 flex flex-col justify-between gap-4 border-b border-ink/10 pb-5 md:flex-row md:items-end">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-terracotta">Guía Restaurante Rentable</p>
        <h2 className="mt-2 text-3xl font-semibold text-navy md:text-4xl">{label}</h2>
      </div>
      <div className="rounded-md border border-gold/30 bg-white/70 px-4 py-3 text-sm text-ink shadow-sm">
        Producto: Ebook + 15 plantillas · $47 USD · Garantía 7 días
      </div>
    </header>
  );
}

function Dashboard({ content, production, setView }: { content: ContentItem[]; production: ContentProductionItem[]; setView: (view: ViewId) => void }) {
  const router = useRouter();
  const published = content.filter((item) => item.status === "Publicado");
  const productionSummary = getProductionSummary(production);
  const recommended = nextProductionItem(production);
  const totals = content.reduce(
    (acc, item) => {
      acc.reach += item.metrics.reach;
      acc.saves += item.metrics.saves;
      acc.shares += item.metrics.shares;
      acc.clicks += item.metrics.linkClicks;
      acc.sales += item.metrics.sales;
      acc.revenue += item.metrics.revenue;
      return acc;
    },
    { reach: 0, saves: 0, shares: 0, clicks: 0, sales: 0, revenue: 0 }
  );
  const byPillar = pillars.map((pillar) => ({ label: pillar, value: content.filter((item) => item.pillar === pillar).length }));
  const byFormat = formats.slice(0, 4).map((format) => ({ label: format, value: published.filter((item) => item.format === format).reduce((sum, item) => sum + item.metrics.reach, 0) }));
  const weeks = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"].map((label, index) => ({ label, value: content.filter((_, itemIndex) => itemIndex % 4 === index).length }));

  return (
    <div className="grid gap-5">
      <section className="thin-lines overflow-hidden rounded-md bg-navy text-white shadow-editorial">
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_520px] lg:p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Flujo operativo</p>
            <h3 className="mt-3 text-3xl font-semibold">Producir contenido</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">Convierte las ideas de GRR OS en publicaciones listas para Instagram.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="focus-ring rounded-md bg-gold px-5 py-3 text-sm font-semibold text-navy"
                onClick={() => {
                  setView("production");
                  router.push("/produccion");
                }}
              >
                Empezar producción
              </button>
              <button
                className="focus-ring rounded-md border border-white/25 px-5 py-3 text-sm font-semibold text-white"
                onClick={() => {
                  if (recommended) {
                    setView("production");
                    router.push(`/produccion/studio/${productionSlug(recommended)}`);
                  }
                }}
              >
                {recommended ? "Continuar con la siguiente publicación" : "Temporada completada"}
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <DarkStat label="Pendientes" value={productionSummary.pending} />
            <DarkStat label="En producción" value={productionSummary.inProduction} />
            <DarkStat label="Listas para publicar" value={productionSummary.ready} />
            <DarkStat label="Publicadas" value={productionSummary.published} />
            <div className="rounded-md border border-gold/25 bg-white/8 p-4 sm:col-span-2">
              <div className="flex justify-between text-sm">
                <span>Progreso primeras 30 publicaciones</span>
                <strong>{productionSummary.progress}%</strong>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/15"><div className="h-2 rounded-full bg-terracotta" style={{ width: `${productionSummary.progress}%` }} /></div>
            </div>
          </div>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total de ideas" value={content.length} />
        <Stat label="En producción" value={content.filter((item) => ["Priorizado", "Guion", "Diseño", "Revisión"].includes(item.status)).length} />
        <Stat label="Programado" value={content.filter((item) => item.status === "Programado").length} />
        <Stat label="Publicado" value={published.length} />
        <Stat label="Reels publicados" value={published.filter((item) => item.format === "Reel").length} />
        <Stat label="Carruseles publicados" value={published.filter((item) => item.format === "Carrusel").length} />
        <Stat label="Stories publicadas" value={published.filter((item) => item.format === "Story").length} />
        <Stat label="Alcance total" value={totals.reach.toLocaleString("en-US")} />
        <Stat label="Guardados" value={totals.saves.toLocaleString("en-US")} />
        <Stat label="Compartidos" value={totals.shares.toLocaleString("en-US")} />
        <Stat label="Clics al enlace" value={totals.clicks.toLocaleString("en-US")} />
        <Stat label="Ventas atribuidas" value={totals.sales} />
        <Stat label="Ingresos generados" value={`$${totals.revenue.toLocaleString("en-US")}`} />
        <Stat label="Tasa de conversión" value={`${pct(totals.sales, totals.clicks)}`} />
        <Progress label="Seguidores" value={2140} target={10000} />
        <Progress label="Ventas mensuales" value={totals.sales} target={400} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <BarChart title="Publicaciones por semana" data={weeks} />
        <BarChart title="Alcance por tipo de contenido" data={byFormat} />
        <BarChart title="Clics al enlace" data={published.map((item) => ({ label: item.id, value: item.metrics.linkClicks }))} />
        <BarChart title="Ventas por publicación" data={published.map((item) => ({ label: item.id, value: item.metrics.sales }))} />
      </div>
      <BarChart title="Distribución por pilar" data={byPillar} />
    </div>
  );
}

function ContentLibrary({ content, setContent, flash }: { content: ContentItem[]; setContent: React.Dispatch<React.SetStateAction<ContentItem[]>>; flash: (message: string) => void }) {
  const [mode, setMode] = useState<"table" | "cards" | "kanban">("table");
  const [query, setQuery] = useState("");
  const [pillar, setPillar] = useState("Todos");
  const [format, setFormat] = useState("Todos");
  const [editing, setEditing] = useState<ContentItem | null>(null);

  const filtered = content
    .filter((item) => [item.title, item.topic, item.hook, item.series].join(" ").toLowerCase().includes(query.toLowerCase()))
    .filter((item) => pillar === "Todos" || item.pillar === pillar)
    .filter((item) => format === "Todos" || item.format === format)
    .sort((a, b) => a.priority.localeCompare(b.priority));

  const saveItem = (item: ContentItem) => {
    setContent((current) => current.map((entry) => (entry.id === item.id ? item : entry)));
    setEditing(null);
    flash("Contenido guardado.");
  };

  const createItem = () => {
    const item = blankContent();
    setContent((current) => [item, ...current]);
    setEditing(item);
    flash("Nueva pieza creada.");
  };

  const duplicate = (item: ContentItem) => {
    const copy = { ...item, id: `GRR-${Date.now().toString().slice(-5)}`, title: `${item.title} (duplicado)`, status: "Idea" as const, publishedAt: "", postUrl: "" };
    setContent((current) => [copy, ...current]);
    flash("Contenido duplicado.");
  };

  const archive = (item: ContentItem) => {
    if (!window.confirm(`¿Archivar "${item.title}"?`)) return;
    setContent((current) => current.map((entry) => (entry.id === item.id ? { ...entry, archived: true } : entry)));
    flash("Contenido archivado.");
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 rounded-md border border-ink/10 bg-white/80 p-4 shadow-sm xl:flex-row xl:items-center">
        <input className="focus-ring min-h-11 flex-1 rounded-md border border-ink/15 px-3" placeholder="Buscar por título, hook, serie o tema" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={pillar} onChange={setPillar} options={["Todos", ...pillars]} />
        <Select value={format} onChange={setFormat} options={["Todos", ...formats]} />
        <Segment value={mode} setValue={setMode} options={["table", "cards", "kanban"]} labels={["Tabla", "Tarjetas", "Kanban"]} />
        <button className="focus-ring rounded-md bg-navy px-4 py-3 text-sm font-semibold text-white" onClick={createItem}>Crear contenido</button>
        <button
          className="focus-ring rounded-md border border-gold/50 px-4 py-3 text-sm font-semibold text-navy"
          onClick={() => downloadCsv("contenido-grr.csv", filtered.map((item) => ({
            id: item.id,
            titulo: item.title,
            pilar: item.pillar,
            serie: item.series,
            formato: item.format,
            objetivo: item.goal,
            embudo: item.funnel,
            estado: item.status,
            fecha_programada: item.scheduledAt,
            fecha_publicada: item.publishedAt,
            responsable: item.owner,
            alcance: item.metrics.reach,
            ventas: item.metrics.sales,
            ingresos: item.metrics.revenue
          })))}
        >
          Exportar CSV
        </button>
      </div>

      {filtered.length === 0 ? <Empty text="No hay contenido con esos filtros." /> : null}
      {mode === "table" && <ContentTable items={filtered} onEdit={setEditing} onDuplicate={duplicate} onArchive={archive} />}
      {mode === "cards" && <ContentCards items={filtered} onEdit={setEditing} onDuplicate={duplicate} onArchive={archive} />}
      {mode === "kanban" && <Kanban items={filtered} setContent={setContent} onEdit={setEditing} flash={flash} />}
      {editing ? <ContentModal item={editing} onCancel={() => setEditing(null)} onSave={saveItem} /> : null}
    </div>
  );
}

function Calendar({ content, setContent, flash }: { content: ContentItem[]; setContent: React.Dispatch<React.SetStateAction<ContentItem[]>>; flash: (message: string) => void }) {
  const [view, setView] = useState<"month" | "week" | "list">("month");
  const [filter, setFilter] = useState("Todos");
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const days = Array.from({ length: view === "week" ? 7 : 30 }, (_, index) => {
    const date = new Date("2026-07-10T12:00:00");
    date.setDate(date.getDate() + index);
    return date.toISOString().slice(0, 10);
  });
  const visible = content.filter((item) => filter === "Todos" || item.format === filter || item.pillar === filter || item.status === filter);

  const moveToDate = (id: string, date: string) => {
    setContent((current) => current.map((item) => (item.id === id ? { ...item, scheduledAt: date, status: item.status === "Publicado" ? item.status : "Programado" } : item)));
    flash("Calendario actualizado.");
  };
  const duplicate = (item: ContentItem) => {
    const copy = { ...item, id: `GRR-${Date.now().toString().slice(-5)}`, title: `${item.title} (duplicado)`, status: "Idea" as const, scheduledAt: "" };
    setContent((current) => [copy, ...current]);
    flash("Contenido duplicado.");
  };
  const archive = (item: ContentItem) => {
    if (!window.confirm(`¿Archivar "${item.title}"?`)) return;
    setContent((current) => current.map((entry) => (entry.id === item.id ? { ...entry, archived: true } : entry)));
    flash("Contenido archivado.");
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 rounded-md border border-ink/10 bg-white/80 p-4 sm:flex-row sm:items-center">
        <Segment value={view} setValue={setView} options={["month", "week", "list"]} labels={["Mensual", "Semanal", "Lista"]} />
        <Select value={filter} onChange={setFilter} options={["Todos", ...formats, ...pillars, ...statuses]} />
      </div>
      <div className="rounded-md border border-gold/30 bg-navy p-4 text-white">
        Cadencia inicial: 3 reels por semana · 2 carruseles por semana · Historias diarias · 1 publicación de conversión semanal
      </div>
      {view === "list" ? (
        <ContentTable items={visible.filter((item) => item.scheduledAt)} onEdit={setEditing} onDuplicate={duplicate} onArchive={archive} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {days.map((day) => {
            const items = visible.filter((item) => item.scheduledAt === day);
            return (
              <div key={day} onDragOver={(event) => event.preventDefault()} onDrop={(event) => moveToDate(event.dataTransfer.getData("text/plain"), day)} className="min-h-40 rounded-md border border-ink/10 bg-white/75 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <strong className="text-sm text-navy">{day}</strong>
                  <span className="rounded-full bg-cream px-2 py-1 text-xs">{items.length}</span>
                </div>
                <div className="grid gap-2">
                  {items.map((item) => (
                    <button key={item.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)} onClick={() => setEditing(item)} className="focus-ring rounded-md border border-gold/30 bg-cream p-3 text-left text-sm">
                      <span className="block font-semibold text-navy">{item.title}</span>
                      <span className="mt-1 block text-xs text-ink/60">{item.format} · {item.goal}</span>
                    </button>
                  ))}
                  {items.length === 0 ? <p className="text-sm text-ink/45">Hueco disponible</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="rounded-md border border-ink/10 bg-white/80 p-4">
        <h3 className="mb-3 font-semibold text-navy">Sin fecha</h3>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {visible.filter((item) => !item.scheduledAt && item.status !== "Publicado").map((item) => (
            <button key={item.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)} onClick={() => setEditing(item)} className="focus-ring rounded-md border border-ink/10 bg-cream p-3 text-left text-sm">
              {item.title}
            </button>
          ))}
        </div>
      </div>
      {editing ? <ContentModal item={editing} onCancel={() => setEditing(null)} onSave={(item) => { setContent((current) => current.map((entry) => entry.id === item.id ? item : entry)); setEditing(null); flash("Contenido guardado."); }} /> : null}
    </div>
  );
}

function ProductionModule({
  production,
  allProduction,
  initialProductionId,
  initialProductionMode,
  setProduction,
  content,
  setContent,
  brandBook,
  flash
}: {
  production: ContentProductionItem[];
  allProduction: ContentProductionItem[];
  initialProductionId: string;
  initialProductionMode: "kanban" | "list" | "studio";
  setProduction: React.Dispatch<React.SetStateAction<ContentProductionItem[]>>;
  content: ContentItem[];
  setContent: React.Dispatch<React.SetStateAction<ContentItem[]>>;
  brandBook: BrandBookSection[];
  flash: (message: string) => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"kanban" | "list" | "studio">(initialProductionId ? "studio" : initialProductionMode);
  const [selectedId, setSelectedId] = useState(resolveProductionId(initialProductionId, production) || nextProductionItem(production)?.id || production[0]?.id || "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [formatFilter, setFormatFilter] = useState("Todos");
  const [pillarFilter, setPillarFilter] = useState("Todos");
  const [priorityFilter, setPriorityFilter] = useState("Todos");
  const selected = production.find((item) => item.id === selectedId) ?? production[0];
  const summary = getProductionSummary(production);
  const brandRefs = getBrandBookReferences(brandBook);
  const recommended = nextProductionItem(production);

  useEffect(() => {
    if (!initialProductionId) return;
    const resolved = resolveProductionId(initialProductionId, production);
    if (resolved && resolved !== selectedId) setSelectedId(resolved);
  }, [initialProductionId, production, selectedId]);

  const filtered = production
    .filter((item) => [item.titulo, item.hook, item.tema, item.capituloEbook].join(" ").toLowerCase().includes(query.toLowerCase()))
    .filter((item) => statusFilter === "Todos" || item.estado === statusFilter || kanbanGroup(item.estado) === statusFilter)
    .filter((item) => formatFilter === "Todos" || item.formato === formatFilter)
    .filter((item) => pillarFilter === "Todos" || item.pilar === pillarFilter)
    .filter((item) => priorityFilter === "Todos" || item.prioridad === priorityFilter)
    .sort((a, b) => priorityRank(a.prioridad) - priorityRank(b.prioridad) || a.numero - b.numero);

  const updateItem = (updated: ContentProductionItem, message = "Producción guardada.") => {
    const next = normalizeProductionItem(updated);
    const nextCollection = allProduction.map((item) => (item.id === next.id ? next : item));
    saveLocal(productionKey, nextCollection);
    setProduction((current) => current.map((item) => (item.id === next.id ? next : item)));
    if (isPublishedState(next.estado)) syncPublishedToContent(next, content, setContent);
    if (message) flash(message);
  };

  const moveItem = (id: string, target: string) => {
    const item = production.find((entry) => entry.id === id);
    if (!item) return;
    const targetState = targetToProductionState(target);
    if (targetState === "Lista para publicar" && !canBeReady(item).ok) {
      flash(`Falta: ${canBeReady(item).missing.join(", ")}.`);
      return;
    }
    updateItem({ ...item, estado: targetState }, "Estado actualizado.");
  };

  const openStudio = (item: ContentProductionItem) => {
    setSelectedId(item.id);
    setMode("studio");
    router.push(`/produccion/studio/${productionSlug(item)}`);
  };

  const continueNext = () => {
    const next = nextProductionItem(production);
    if (!next) {
      flash("Temporada completada");
      return;
    }
    setSelectedId(next.id);
    setMode("studio");
    router.push(`/produccion/studio/${productionSlug(next)}`);
    flash(`Siguiente publicación: ${next.titulo}`);
  };

  const duplicate = (item: ContentProductionItem) => {
    const copy = { ...item, id: `PROD-${Date.now().toString().slice(-5)}`, numero: Math.max(...allProduction.map((entry) => entry.numero)) + 1, titulo: `${item.titulo} (duplicado)`, estado: "Idea" as ProductionState, fechaPublicada: "", enlaceInstagram: "" };
    setProduction((current) => [copy, ...current]);
    setSelectedId(copy.id);
    setMode("studio");
    router.push(`/produccion/studio/${productionSlug(copy)}`);
    flash("Publicación duplicada.");
  };

  const archive = (item: ContentProductionItem) => {
    if (!window.confirm(`¿Archivar "${item.titulo}"?`)) return;
    setProduction((current) => current.map((entry) => (entry.id === item.id ? { ...entry, archived: true } : entry)));
    flash("Publicación archivada.");
  };

  const restoreInitial = () => {
    if (!window.confirm("¿Restaurar las 30 publicaciones iniciales? Esto reemplazará el tablero de producción.")) return;
    setProduction(initialProductionItems);
    setSelectedId("PROD-002");
    setMode("studio");
    router.push("/produccion/studio/grr-002");
    flash("Publicaciones iniciales restauradas.");
  };

  return (
    <div className="grid gap-5">
      <section className="thin-lines rounded-md bg-navy p-5 text-white shadow-editorial">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Temporada</p>
            <h3 className="mt-2 text-3xl font-semibold">Antes de abrir tu restaurante</h3>
            <p className="mt-3 text-sm text-white/70">30 publicaciones iniciales para producir, programar, publicar y medir manualmente.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="focus-ring rounded-md bg-gold px-4 py-3 text-sm font-semibold text-navy" onClick={continueNext}>Continuar con la siguiente publicación</button>
            <button className="focus-ring rounded-md border border-white/25 px-4 py-3 text-sm font-semibold text-white" onClick={() => { downloadProductionCsv(filtered); flash("Producción exportada en CSV."); }}>Exportar CSV</button>
            <button className="focus-ring rounded-md border border-white/25 px-4 py-3 text-sm font-semibold text-white" onClick={() => { downloadFile("produccion-grr.json", JSON.stringify(filtered, null, 2), "application/json;charset=utf-8"); flash("Producción exportada en JSON."); }}>Exportar JSON</button>
            <button className="focus-ring rounded-md border border-terracotta/70 px-4 py-3 text-sm font-semibold text-white" onClick={restoreInitial}>Restaurar iniciales</button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Stat label="Publicaciones totales" value={summary.total} />
        <Stat label="Completado" value={`${summary.progress}%`} />
        <Stat label="En producción" value={summary.inProduction} />
        <Stat label="Listas" value={summary.ready} />
        <Stat label="Publicadas" value={summary.published} />
        <Stat label="Ventas generadas" value={`$${summary.revenue.toLocaleString("en-US")}`} />
      </div>

      <div className="rounded-md border border-ink/10 bg-white/80 p-4 shadow-sm">
        <div className="grid gap-3 xl:grid-cols-[1fr_repeat(5,150px)]">
          <input className="focus-ring min-h-11 rounded-md border border-ink/15 px-3" placeholder="Buscar por título, hook, tema o capítulo" value={query} onChange={(event) => setQuery(event.target.value)} />
          <Select value={statusFilter} onChange={setStatusFilter} options={uniqueStrings(["Todos", ...productionStates, ...productionKanbanColumns])} />
          <Select value={formatFilter} onChange={setFormatFilter} options={["Todos", ...formats]} />
          <Select value={pillarFilter} onChange={setPillarFilter} options={["Todos", ...pillars]} />
          <Select value={priorityFilter} onChange={setPriorityFilter} options={["Todos", "Alta", "Media", "Baja"]} />
          <Segment value={mode} setValue={(value) => {
            setMode(value);
            if (value === "kanban") router.push("/produccion/kanban");
            if (value === "list") router.push("/produccion/lista");
            if (value === "studio" && selected) router.push(`/produccion/studio/${productionSlug(selected)}`);
          }} options={["kanban", "list", "studio"]} labels={["Kanban", "Lista", "Studio"]} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <InfoPanel title="Siguiente publicación recomendada" value={recommended?.titulo ?? "Temporada completada"} note={recommended?.id ?? "Todas las publicaciones están completas"} onClick={recommended ? () => openStudio(recommended) : undefined} />
        <InfoPanel title="Publicaciones atrasadas" value={String(production.filter((item) => item.fechaProgramada && item.estado !== "Publicada" && new Date(item.fechaProgramada) < new Date()).length)} note="Con fecha vencida y sin publicar" />
        <InfoPanel title="Próximas fechas programadas" value={production.filter((item) => item.fechaProgramada && item.estado !== "Publicada").slice(0, 3).map((item) => `${item.fechaProgramada} · #${item.numero}`).join(" / ") || "Sin fechas"} note="Calendario operativo" />
      </div>

      {mode === "kanban" && <ProductionKanban items={filtered} onMove={moveItem} onOpen={openStudio} />}
      {mode === "list" && <ProductionList items={filtered} onOpen={openStudio} onMove={moveItem} />}
      {mode === "studio" && selected ? (
        <ProductionStudio
          item={selected}
          items={production}
          brandRefs={brandRefs}
          onSave={updateItem}
          onDuplicate={duplicate}
          onArchive={archive}
          onBack={() => {
            setMode("kanban");
            router.push("/produccion/kanban");
          }}
          onOpen={openStudio}
          onNextPending={continueNext}
          onProgram={(item) => updateItem({ ...item, estado: "Programada", checklist: { ...item.checklist, fechaProgramada: Boolean(item.fechaProgramada) } }, "Publicación programada.")}
          onPublish={(item) => updateItem({ ...item, estado: "Publicada", fechaPublicada: item.fechaPublicada || new Date().toISOString().slice(0, 10), checklist: { ...item.checklist, enlacePublicacionAgregado: Boolean(item.enlaceInstagram) } }, "Publicación marcada como publicada.")}
          onMetrics={(item) => updateItem({ ...item, estado: "Métricas registradas", checklist: { ...item.checklist, metricasRegistradas: true } }, "Métricas registradas.")}
        />
      ) : null}
    </div>
  );
}

function ProductionKanban({ items, onMove, onOpen }: { items: ContentProductionItem[]; onMove: (id: string, target: string) => void; onOpen: (item: ContentProductionItem) => void }) {
  return (
    <div className="scrollbar overflow-x-auto">
      <div className="grid min-w-[1180px] grid-cols-6 gap-3">
        {productionKanbanColumns.map((column) => (
          <section key={column} onDragOver={(event) => event.preventDefault()} onDrop={(event) => onMove(event.dataTransfer.getData("text/plain"), column)} className="min-h-[520px] rounded-md border border-ink/10 bg-white/80 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-navy">{column}</h3>
              <span className="rounded-full bg-cream px-2 py-1 text-xs">{items.filter((item) => kanbanGroup(item.estado) === column).length}</span>
            </div>
            <div className="grid gap-2">
              {items.filter((item) => kanbanGroup(item.estado) === column).map((item) => (
                <button key={item.id} role="button" tabIndex={0} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)} onClick={() => onOpen(item)} className="focus-ring cursor-pointer rounded-md border border-gold/25 bg-cream p-3 text-left text-sm transition hover:-translate-y-0.5 hover:border-gold hover:bg-white hover:shadow-editorial">
                  <span className="text-xs font-semibold text-terracotta">#{item.numero} · {item.prioridad}</span>
                  <strong className="mt-1 block leading-snug text-navy">{item.titulo}</strong>
                  <span className="mt-2 block text-xs text-ink/60">{item.formato} · {item.pilar}</span>
                  <div className="mt-3 h-1.5 rounded-full bg-white"><div className="h-1.5 rounded-full bg-gold" style={{ width: `${productionProgress(item)}%` }} /></div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ProductionList({ items, onOpen, onMove }: { items: ContentProductionItem[]; onOpen: (item: ContentProductionItem) => void; onMove: (id: string, target: string) => void }) {
  return (
    <div className="overflow-hidden rounded-md border border-ink/10 bg-white shadow-sm">
      <div className="scrollbar overflow-x-auto">
        <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
          <thead className="bg-navy text-white">
            <tr>{["#", "Título", "Formato", "Pilar", "Objetivo", "Estado", "Avance", "Fecha", "Acciones"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpen(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen(item);
                  }
                }}
                className="cursor-pointer border-t border-ink/10 transition hover:bg-cream"
              >
                <td className="px-4 py-3 text-ink/60">{item.numero}</td>
                <td className="px-4 py-3 font-semibold text-navy">{item.titulo}</td>
                <td className="px-4 py-3">{item.formato}</td>
                <td className="px-4 py-3">{item.pilar}</td>
                <td className="px-4 py-3">{item.objetivo}</td>
                <td className="px-4 py-3"><Badge label={item.estado} /></td>
                <td className="px-4 py-3">{productionProgress(item)}%</td>
                <td className="px-4 py-3">{item.fechaPublicada || item.fechaProgramada || "Sin fecha"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button role="button" tabIndex={0} className="focus-ring cursor-pointer rounded-md bg-navy px-3 py-2 text-xs font-semibold text-white transition hover:bg-ink hover:shadow-editorial" onClick={(event) => { event.stopPropagation(); onOpen(item); }}>Studio</button>
                    <button className="focus-ring cursor-pointer rounded-md border border-gold/40 px-3 py-2 text-xs font-semibold text-navy transition hover:bg-gold/10" onClick={(event) => { event.stopPropagation(); onMove(item.id, "Revisión"); }}>A revisión</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function generationContentToDraft(item: ContentProductionItem, content: StudioGenerationContent, type: StudioGenerationVersion["type"]): ContentProductionItem {
  const stories = content.story.map((frame) => [`Story ${frame.frame}: ${frame.headline}`, frame.body, frame.pollQuestion ? `Encuesta: ${frame.pollQuestion} (${frame.pollOptions.join(" / ")})` : "", frame.cta].filter(Boolean).join("\n")).join("\n\n");
  const carousel = content.carousel.map((slide) => `Slide ${slide.slide}: ${slide.title}\n${slide.body}`).join("\n\n");
  const reel = [`Hook: ${content.reel.hook}`, `Guion: ${content.reel.script}`, `Texto en pantalla:\n${content.reel.onScreenText.join("\n")}`, `B-roll:\n${content.reel.bRoll.join("\n")}`, `CTA: ${content.reel.cta}`].join("\n\n");
  return normalizeProductionItem({
    ...item,
    titulo: content.title,
    hook: content.hook,
    copy: type === "blog" && content.blog ? content.blog : content.caption,
    cta: content.cta,
    hashtags: content.hashtags.join(" "),
    historiasApoyo: stories,
    estructuraVisual: carousel,
    guion: content.reel.script,
    promptImagen: content.imagePrompt,
    promptVideo: reel
  });
}

function safeFilename(value: string): string {
  return value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "contenido-grr";
}

function imageTypeForVersion(version: StudioGenerationVersion): ImageContentType {
  if (version.type === "carousel") return "carousel";
  if (version.type === "story") return "story";
  if (version.type === "reel") return "reel-cover";
  if (version.type === "lead-magnet") return "lead-magnet";
  if (version.type === "blog") return "thumbnail";
  if (version.type === "email" || version.type === "landing") return "banner";
  if (version.type === "cta") return "ad";
  return "instagram-post";
}

function promptsForVersion(version: StudioGenerationVersion, objective: string, template?: ImageTemplateName, variation = 1) {
  return buildImagePrompts({ topic: version.topic, hook: version.content.hook, publicationType: imageTypeForVersion(version), cta: version.content.cta, objective, versionId: version.id, template, variation });
}

function ProductionStudio({
  item,
  items,
  brandRefs,
  onSave,
  onDuplicate,
  onArchive,
  onBack,
  onOpen,
  onNextPending,
  onProgram,
  onPublish,
  onMetrics
}: {
  item: ContentProductionItem;
  items: ContentProductionItem[];
  brandRefs: Record<string, string>;
  onSave: (item: ContentProductionItem, message?: string) => void;
  onDuplicate: (item: ContentProductionItem) => void;
  onArchive: (item: ContentProductionItem) => void;
  onBack: () => void;
  onOpen: (item: ContentProductionItem) => void;
  onNextPending: () => void;
  onProgram: (item: ContentProductionItem) => void;
  onPublish: (item: ContentProductionItem) => void;
  onMetrics: (item: ContentProductionItem) => void;
}) {
  const [draft, setDraft] = useState(item);
  const [focusMode, setFocusMode] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Último guardado hace unos segundos");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [versions, setVersions] = useState<StudioGenerationVersion[]>([]);
  const [allStudioVersions, setAllStudioVersions] = useState<StudioGenerationVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [comparison, setComparison] = useState<{ previous: StudioGenerationVersion; current: StudioGenerationVersion } | null>(null);
  const [versionMessage, setVersionMessage] = useState("");
  const [studioAction, setStudioAction] = useState<string | null>(null);
  const [promptInspectorOpen, setPromptInspectorOpen] = useState(false);
  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({
    hook: true,
    idea: true,
    guion: true,
    copy: true,
    cta: true,
    hashtags: false,
    comentario: false,
    stories: false,
    notas: false
  });
  const lastSavedRef = useRef(JSON.stringify(item));
  const studioActionTimerRef = useRef<number | null>(null);
  const ordered = [...items].sort((a, b) => a.numero - b.numero);
  const index = ordered.findIndex((entry) => entry.id === draft.id);
  const previous = index > 0 ? ordered[index - 1] : null;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null;
  const ctas = extractBrandBookCtas(brandRefs["CTA oficiales"]);
  const aiPublication = useMemo<Publication>(() => ({
    id: draft.id,
    number: draft.numero,
    title: draft.titulo,
    format: draft.formato,
    pillar: draft.pilar,
    objective: draft.objetivo,
    topic: draft.tema,
    hook: draft.hook,
    cta: draft.cta
  }), [draft.id, draft.numero, draft.titulo, draft.formato, draft.pilar, draft.objetivo, draft.tema, draft.hook, draft.cta]);
  const generationContext = useMemo(() => getPublicationGenerationContext(aiPublication), [aiPublication]);
  const activeVersion = versions.find((version) => version.id === activeVersionId) ?? null;
  const calc = productionMetricCalculations(draft);
  const historyKey = `grr-production-history-${draft.id}`;
  const checklistItems = [
    { id: "hook", label: "Hook", done: Boolean(draft.hook.trim()) },
    { id: "copy", label: "Copy", done: Boolean(draft.copy.trim()) },
    { id: "cta", label: "CTA", done: Boolean(draft.cta.trim()) },
    { id: "imagen", label: "Imagen", done: draft.checklist.imagenCreada || Boolean(draft.imagenFinal.trim() || draft.promptImagen.trim()) },
    { id: "video", label: "Video", done: draft.checklist.videoCreado || Boolean(draft.promptVideo?.trim()) },
    { id: "hashtags", label: "Hashtags", done: Boolean(draft.hashtags.trim()) },
    { id: "programado", label: "Programado", done: Boolean(draft.fechaProgramada.trim()) }
  ];
  const checklistKeyMap: Record<string, keyof ContentProductionItem["checklist"]> = {
    hook: "hookAprobado",
    copy: "copyTerminado",
    cta: "ctaSeleccionado",
    imagen: "imagenCreada",
    video: "videoCreado",
    hashtags: "hashtagsRevisados",
    programado: "fechaProgramada"
  };

  useEffect(() => {
    setDraft(item);
    lastSavedRef.current = JSON.stringify(item);
    setLastSavedAt(new Date());
    setSaveStatus("Último guardado hace unos segundos");
    setHistory(loadLocal<HistoryEntry[]>(`grr-production-history-${item.id}`, []));
  }, [item]);

  useEffect(() => {
    const storedVersions = loadStudioVersions(item.id);
    const hydratedVersions = storedVersions.map((version) => {
      if (version.visualPrompts.length) return version;
      const visualPrompts = promptsForVersion(version, item.objetivo);
      const primaryPrompt = visualPrompts.find((prompt) => prompt.provider === "gpt-image")?.prompt ?? version.content.imagePrompt;
      return { ...version, visualPrompts, content: { ...version.content, imagePrompt: primaryPrompt } };
    });
    if (hydratedVersions.some((version, index) => version !== storedVersions[index])) saveStudioVersions(item.id, hydratedVersions);
    setVersions(hydratedVersions);
    setAllStudioVersions(loadAllStudioVersions());
    setActiveVersionId(hydratedVersions[0]?.id ?? null);
    setHasGenerated(hydratedVersions.length > 0);
    setComparison(null);
    setVersionMessage("");
    return cancelPublicationGeneration;
  }, [item.id]);

  useEffect(() => () => {
    if (studioActionTimerRef.current) window.clearTimeout(studioActionTimerRef.current);
  }, []);

  const recordHistory = (summary: string) => {
    const entry: HistoryEntry = { id: `${Date.now()}-${Math.random()}`, savedAt: new Date().toISOString(), summary };
    const next = [entry, ...loadLocal<HistoryEntry[]>(historyKey, history)].slice(0, 50);
    saveLocal(historyKey, next);
    setHistory(next);
  };

  const persistVersions = (nextVersions: StudioGenerationVersion[]) => {
    setVersions(nextVersions);
    saveStudioVersions(item.id, nextVersions);
    setAllStudioVersions(loadAllStudioVersions());
  };

  const showStudioAction = (label: string, duration = 900) => {
    setStudioAction(label);
    if (studioActionTimerRef.current) window.clearTimeout(studioActionTimerRef.current);
    studioActionTimerRef.current = window.setTimeout(() => setStudioAction(null), duration);
  };

  const openVersion = (version: StudioGenerationVersion) => {
    setActiveVersionId(version.id);
    setDraft((current) => generationContentToDraft(current, version.content, version.type));
    setVersionMessage("");
  };

  const updateVersionContent = (content: StudioGenerationContent) => {
    if (!activeVersion) return;
    showStudioAction("Guardando…");
    const updated = { ...activeVersion, updatedAt: new Date().toISOString(), content };
    persistVersions(versions.map((version) => version.id === updated.id ? updated : version));
    setDraft((current) => generationContentToDraft(current, content, updated.type));
  };

  const updateVersion = (target: StudioGenerationVersion, changes: Partial<StudioGenerationVersion>) => {
    showStudioAction("Guardando…");
    persistVersions(versions.map((version) => version.id === target.id ? { ...version, ...changes, updatedAt: new Date().toISOString() } : version));
  };

  const restoreVersion = async (source: StudioGenerationVersion) => {
    setStudioAction("Restaurando…");
    try {
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      const restored = cloneStudioVersion(source, { versionNumber: nextStudioVersionNumber(versions), source: "restored", restoredFromVersion: source.versionNumber, useCount: source.useCount + 1 });
      persistVersions([restored, ...versions.map((version) => version.id === source.id ? { ...version, useCount: version.useCount + 1 } : version)]);
      setActiveVersionId(restored.id);
      setDraft((current) => generationContentToDraft(current, restored.content, restored.type));
      setVersionMessage(`Versión ${restored.versionNumber} creada al restaurar la versión ${source.versionNumber}.`);
      recordHistory(`Versión ${source.versionNumber} restaurada como versión ${restored.versionNumber}`);
    } catch {
      setVersionMessage("No fue posible restaurar la versión. Intenta nuevamente.");
    } finally {
      setStudioAction(null);
    }
  };

  const duplicateVersion = (source: StudioGenerationVersion) => {
    try {
      const duplicated = cloneStudioVersion(source, { versionNumber: nextStudioVersionNumber(versions), source: "duplicated", content: { ...source.content, title: `${source.content.title} (copia)` } });
      persistVersions([duplicated, ...versions]);
      setActiveVersionId(duplicated.id);
      setDraft((current) => generationContentToDraft(current, duplicated.content, duplicated.type));
      setVersionMessage("Versión duplicada.");
    } catch {
      setVersionMessage("No fue posible duplicar la versión. Intenta nuevamente.");
    }
  };

  const deleteVersion = (target: StudioGenerationVersion) => {
    try {
      const nextVersions = versions.filter((version) => version.id !== target.id);
      persistVersions(nextVersions);
      if (activeVersionId === target.id) {
        setActiveVersionId(nextVersions[0]?.id ?? null);
        if (nextVersions[0]) setDraft((current) => generationContentToDraft(current, nextVersions[0].content, nextVersions[0].type));
      }
      setVersionMessage("Versión eliminada.");
    } catch {
      setVersionMessage("No fue posible eliminar la versión. Intenta nuevamente.");
    }
  };

  const compareVersion = (target: StudioGenerationVersion) => {
    if (!activeVersion) return;
    const chronological = [...versions].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    const other = target.id === activeVersion.id ? chronological.find((version) => version.id !== activeVersion.id) : target;
    if (!other) {
      setVersionMessage("Genera otra versión para poder comparar cambios.");
      return;
    }
    const previous = Date.parse(other.createdAt) <= Date.parse(activeVersion.createdAt) ? other : activeVersion;
    const current = previous.id === activeVersion.id ? other : activeVersion;
    setComparison({ previous, current });
  };

  const copyVersion = async (target: StudioGenerationVersion, markdown: boolean) => {
    try {
      await navigator.clipboard.writeText(markdown ? generationToMarkdown(target, versions) : generationToText(target, versions));
      updateVersion(target, { useCount: target.useCount + 1 });
      setVersionMessage(markdown ? "Markdown copiado." : "Publicación completa copiada.");
    } catch {
      setVersionMessage("No fue posible copiar. Revisa los permisos del navegador.");
    }
  };

  const exportVersion = async (target: StudioGenerationVersion, format: "md" | "docx" | "json" | "txt") => {
    setStudioAction("Exportando…");
    try {
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      const filename = safeFilename(target.content.title);
      if (format === "json") downloadFile(`${filename}.json`, JSON.stringify(createStudioExportData(target, versions), null, 2), "application/json;charset=utf-8");
      if (format === "md") downloadFile(`${filename}.md`, generationToMarkdown(target, versions), "text/markdown;charset=utf-8");
      if (format === "txt") downloadFile(`${filename}.txt`, generationToText(target, versions));
      if (format === "docx") downloadBlob(`${filename}.docx`, createStudioDocx(target, versions));
      persistVersions(versions.map((version) => version.id === target.id ? { ...version, useCount: version.useCount + 1, updatedAt: new Date().toISOString() } : version));
      setVersionMessage(`Exportación ${format.toUpperCase()} preparada.`);
    } catch {
      setVersionMessage(`No fue posible exportar ${format.toUpperCase()}. Intenta nuevamente.`);
    } finally {
      setStudioAction(null);
    }
  };

  const regenerateVisualPrompts = (template: ImageTemplateName) => {
    if (!activeVersion) return;
    try {
      const variation = Math.max(0, ...activeVersion.visualPrompts.map((prompt) => prompt.variation)) + 1;
      const generatedPrompts = promptsForVersion(activeVersion, draft.objetivo, template, variation)
        .filter((prompt) => !activeVersion.visualPrompts.some((existing) => existing.provider === prompt.provider && existing.prompt === prompt.prompt));
      if (!generatedPrompts.length) {
        setVersionMessage("La variación visual ya existe. Intenta con otro estilo.");
        return;
      }
      const primaryPrompt = generatedPrompts.find((prompt) => prompt.provider === "gpt-image")?.prompt ?? activeVersion.content.imagePrompt;
      const updated: StudioGenerationVersion = {
        ...activeVersion,
        updatedAt: new Date().toISOString(),
        visualPrompts: [...generatedPrompts, ...activeVersion.visualPrompts],
        content: { ...activeVersion.content, imagePrompt: primaryPrompt }
      };
      persistVersions(versions.map((version) => version.id === updated.id ? updated : version));
      setDraft((current) => ({ ...current, promptImagen: primaryPrompt }));
      recordHistory(`Prompts visuales regenerados · ${template} · versión ${variation}`);
      setVersionMessage("Nueva variación visual guardada sin modificar el copy.");
    } catch {
      setVersionMessage("No fue posible construir el prompt visual. Se conservó la versión anterior.");
    }
  };

  useEffect(() => {
    const serialized = JSON.stringify(draft);
    if (serialized === lastSavedRef.current) return;
    const timeout = window.setTimeout(() => {
      setSaveStatus("Guardando...");
      lastSavedRef.current = serialized;
      recordHistory("Guardado automático de la publicación");
      onSave(draft, "");
      const now = new Date();
      setLastSavedAt(now);
      setSaveStatus("Último guardado hace 0 segundos");
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [draft, onSave]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!lastSavedAt) return;
      const seconds = Math.max(0, Math.round((Date.now() - lastSavedAt.getTime()) / 1000));
      setSaveStatus(`Último guardado hace ${seconds} segundos`);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [lastSavedAt]);

  const update = <K extends keyof ContentProductionItem>(key: K, value: ContentProductionItem[K]) => setDraft((current) => normalizeProductionItem({ ...current, [key]: value }));
  const updateMetric = (key: keyof ContentProductionItem["metricas"], value: number) => setDraft((current) => ({ ...current, metricas: { ...current.metricas, [key]: value } }));
  const updateChecklist = (key: keyof ContentProductionItem["checklist"], value: boolean) => setDraft((current) => ({ ...current, checklist: { ...current.checklist, [key]: value } }));
  const setBlock = (key: string) => setOpenBlocks((current) => ({ ...current, [key]: !current[key] }));
  const saveNow = (message = "Studio guardado.") => {
    lastSavedRef.current = JSON.stringify(draft);
    recordHistory(message === "Studio guardado." ? "Guardado manual de la publicación" : message);
    onSave(draft, message);
    const now = new Date();
    setLastSavedAt(now);
    setSaveStatus("Último guardado hace 0 segundos");
  };
  const generateWithAi = async () => {
    if (isGenerating) return;
    const regenerating = hasGenerated;
    setIsGenerating(true);
    if (process.env.NODE_ENV === "development") console.info("[GRR AI][studio] Generación iniciada", { publicationId: draft.id, regenerating });
    try {
      const generated = await generatePublication(draft.id, aiPublication, { regenerate: regenerating });
      const baseVersion = createStudioVersion({ publicationId: draft.id, versionNumber: nextStudioVersionNumber(versions), type: generated.type, topic: draft.tema, generated: generated.generated, meta: generated.meta, user: loadLocal<string | undefined>("grr-current-user", undefined) });
      const visualPrompts = promptsForVersion(baseVersion, draft.objetivo);
      const primaryPrompt = visualPrompts.find((prompt) => prompt.provider === "gpt-image")?.prompt ?? baseVersion.content.imagePrompt;
      const version: StudioGenerationVersion = { ...baseVersion, visualPrompts, content: { ...baseVersion.content, imagePrompt: primaryPrompt } };
      persistVersions([version, ...versions]);
      setActiveVersionId(version.id);
      setDraft((current) => generationContentToDraft(current, version.content, version.type));
      setHasGenerated(true);
      setVersionMessage(generated.meta.fallbackUsed ? "OpenAI no estuvo disponible; se creó una versión con el respaldo local." : "Nueva versión generada con OpenAI.");
      recordHistory(`${regenerating ? "Contenido regenerado" : "Contenido generado"} con IA · ${generated.meta.model} · ${generated.meta.usage.totalTokens} tokens`);
    } catch (error) {
      const cancelled = error instanceof Error && error.name === "AbortError";
      if (!cancelled) {
        recordHistory("No fue posible completar la generación");
      }
      setVersionMessage(cancelled ? "La generación fue cancelada." : "No fue posible completar la generación. Intenta nuevamente.");
      if (process.env.NODE_ENV === "development") console.error("[GRR AI][studio] La generación no pudo aplicarse", { publicationId: draft.id, error });
    } finally {
      setIsGenerating(false);
      if (process.env.NODE_ENV === "development") console.info("[GRR AI][studio] Generación finalizada", { publicationId: draft.id });
    }
  };

  return (
    <div className={focusMode ? "fixed inset-0 z-50 overflow-y-auto bg-cream p-4 lg:p-6" : "grid gap-5"}>
      <div className="flex flex-col justify-between gap-3 rounded-md border border-ink/10 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-terracotta">CONTENT STUDIO · Publicación #{draft.numero}</p>
          <h3 className="mt-2 text-2xl font-semibold text-navy">{draft.titulo}</h3>
          <p className="mt-1 text-sm text-ink/60">{draft.formato} · {draft.estado} · {saveStatus}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="focus-ring rounded-md bg-gold px-3 py-2 text-sm font-semibold text-navy disabled:opacity-45" disabled={isGenerating} onClick={generateWithAi}>{isGenerating ? "Generando contenido…" : hasGenerated ? "✨ Regenerar" : "✨ Generar con IA"}</button>
          <button className="focus-ring rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold text-navy disabled:opacity-45" disabled={!previous} onClick={() => previous && onOpen(previous)}>← Publicación anterior</button>
          <button className="focus-ring rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold text-navy disabled:opacity-45" disabled={!next} onClick={() => next && onOpen(next)}>Publicación siguiente →</button>
          <button className="focus-ring rounded-md bg-gold px-3 py-2 text-sm font-semibold text-navy" onClick={onNextPending}>Siguiente publicación</button>
          <button className="focus-ring rounded-md border border-gold/50 px-3 py-2 text-sm font-semibold text-navy" onClick={() => setPreviewOpen(true)}>Preview</button>
          <button className="focus-ring rounded-md border border-gold/50 px-3 py-2 text-sm font-semibold text-navy" onClick={() => setFocusMode((value) => !value)}>{focusMode ? "Salir de Focus" : "Focus Mode"}</button>
          <button className="focus-ring rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold text-navy" onClick={onBack}>Volver a producción</button>
        </div>
      </div>

      <div className={focusMode ? "grid gap-5 xl:grid-cols-[minmax(0,1fr)]" : "grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)_320px]"}>
        {!focusMode ? (
          <aside className="grid h-fit gap-4">
            <Checklist items={checklistItems} onToggle={(id, done) => {
              const key = checklistKeyMap[id];
              if (key) updateChecklist(key, done);
            }} />
            <StudioStrategy item={draft} update={update} onSave={saveNow} onContinue={() => saveNow("Guardado y avanzado.")} />
            {versions.length ? <VersionManager versions={versions} activeId={activeVersionId} busyLabel={studioAction} onOpen={openVersion} onCompare={compareVersion} onRestore={restoreVersion} onFavorite={(version) => updateVersion(version, { favorite: !version.favorite })} onDuplicate={duplicateVersion} onRemove={deleteVersion} onStatus={(version, status) => updateVersion(version, { status })} onCopy={copyVersion} onExport={exportVersion} /> : null}
            <HistoryPanel entries={history} />
          </aside>
        ) : null}

        <section className="grid gap-4">
          {studioAction ? <p className="rounded-md border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-semibold text-navy" role="status">{studioAction}</p> : null}
          {versionMessage ? <p className="rounded-md border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-navy" role="status">{versionMessage}</p> : null}
          {activeVersion ? <VersionMetadataPanel version={activeVersion} onNotesChange={(notes) => updateVersion(activeVersion, { notes })} onTagsChange={(tags) => updateVersion(activeVersion, { tags })} /> : null}
          {activeVersion ? <ProfessionalEditor content={activeVersion.content} onChange={updateVersionContent} /> : <>
          <EditorSection title="Título" open={openBlocks.title ?? true} onToggle={() => setBlock("title")}>
            <input className="focus-ring min-h-12 w-full rounded-md border border-ink/15 bg-white px-4 text-xl font-semibold text-navy" value={draft.titulo} onChange={(event) => update("titulo", event.target.value)} />
          </EditorSection>
          <EditorSection title="1. Hook" open={openBlocks.hook} onToggle={() => setBlock("hook")} meta={`${draft.hook.length} caracteres`}>
            <textarea className="focus-ring min-h-36 w-full rounded-md border border-ink/15 bg-white p-4 text-xl leading-8" value={draft.hook} onChange={(event) => update("hook", event.target.value)} placeholder="Escribe un hook fuerte para detener el scroll." />
          </EditorSection>
          <EditorSection title="Problema" open={openBlocks.problema ?? true} onToggle={() => setBlock("problema")}><textarea className="focus-ring min-h-32 w-full rounded-md border border-ink/15 bg-white p-4 leading-7" value={draft.problemaResuelve} onChange={(event) => update("problemaResuelve", event.target.value)} /></EditorSection>
          <EditorSection title="2. Idea principal" open={openBlocks.idea} onToggle={() => setBlock("idea")}><textarea className="focus-ring min-h-32 w-full rounded-md border border-ink/15 bg-white p-4 leading-7" value={draft.ideaCentral} onChange={(event) => update("ideaCentral", event.target.value)} /></EditorSection>
          <EditorSection title="3. Guion" open={openBlocks.guion} onToggle={() => setBlock("guion")}><textarea className="focus-ring min-h-72 w-full rounded-md border border-ink/15 bg-white p-4 leading-7" value={draft.guion} onChange={(event) => update("guion", event.target.value)} /></EditorSection>
          <EditorSection title="4. Copy de Instagram" open={openBlocks.copy} onToggle={() => setBlock("copy")}><textarea className="focus-ring min-h-64 w-full rounded-md border border-ink/15 bg-white p-4 leading-7" value={draft.copy} onChange={(event) => update("copy", event.target.value)} /> <CharacterCounter value={draft.copy} /></EditorSection>
          <EditorSection title="5. CTA" open={openBlocks.cta} onToggle={() => setBlock("cta")}>
            <select className="focus-ring min-h-11 w-full rounded-md border border-ink/15 bg-white px-3" value={draft.cta} onChange={(event) => update("cta", event.target.value)}>
              {[draft.cta, ...ctas].filter(Boolean).filter((value, valueIndex, array) => array.indexOf(value) === valueIndex).map((cta) => <option key={cta}>{cta}</option>)}
            </select>
          </EditorSection>
          <EditorSection title="6. Hashtags" open={openBlocks.hashtags} onToggle={() => setBlock("hashtags")}><textarea className="focus-ring min-h-28 w-full rounded-md border border-ink/15 bg-white p-4 leading-7" value={draft.hashtags} onChange={(event) => update("hashtags", event.target.value)} /></EditorSection>
          <EditorSection title="7. Comentario fijado" open={openBlocks.comentario} onToggle={() => setBlock("comentario")}><textarea className="focus-ring min-h-28 w-full rounded-md border border-ink/15 bg-white p-4 leading-7" value={draft.comentarioFijado} onChange={(event) => update("comentarioFijado", event.target.value)} /></EditorSection>
          <EditorSection title="8. Stories" open={openBlocks.stories} onToggle={() => setBlock("stories")}><textarea className="focus-ring min-h-36 w-full rounded-md border border-ink/15 bg-white p-4 leading-7" value={draft.historiasApoyo} onChange={(event) => update("historiasApoyo", event.target.value)} /></EditorSection>
          <EditorSection title="9. Notas internas" open={openBlocks.notas} onToggle={() => setBlock("notas")}><textarea className="focus-ring min-h-32 w-full rounded-md border border-ink/15 bg-white p-4 leading-7" value={draft.notas} onChange={(event) => update("notas", event.target.value)} /></EditorSection>
          </>}

          {activeVersion?.visualPrompts.length ? <ImagePromptCard prompts={activeVersion.visualPrompts} onRegenerate={regenerateVisualPrompts} /> : null}
          <ProductionPanel title="Diseño"><div className="grid gap-4 md:grid-cols-2"><Area label="Prompt de imagen" value={draft.promptImagen} onChange={(value) => update("promptImagen", value)} /><Area label="Prompt de video" value={draft.promptVideo ?? ""} onChange={(value) => update("promptVideo", value)} /><Area label="Notas para diseñador" value={draft.notasDiseno} onChange={(value) => update("notasDiseno", value)} /><Field label="Imagen de referencia" value={draft.estructuraVisual} onChange={(value) => update("estructuraVisual", value)} /><Field label="Imagen final" value={draft.imagenFinal} onChange={(value) => update("imagenFinal", value)} /><Field label="Estado del diseño" value={draft.estadoDiseno} onChange={(value) => update("estadoDiseno", value)} options={["Pendiente", "En diseño", "Terminado", "Aprobado"]} /></div></ProductionPanel>
          <ProductionPanel title="Publicación"><div className="grid gap-4 md:grid-cols-2"><Field label="Fecha" value={draft.fechaProgramada} onChange={(value) => update("fechaProgramada", value)} type="date" /><Field label="Hora" value={extractTimeFromNotes(draft.notas)} onChange={(value) => update("notas", setTimeInNotes(draft.notas, value))} type="time" /><Field label="Link de Instagram" value={draft.enlaceInstagram} onChange={(value) => update("enlaceInstagram", value)} /><Field label="Estado" value={draft.estado} onChange={(value) => update("estado", value as ProductionState)} options={productionStates} /></div><div className="mt-4 flex flex-wrap gap-2"><button className="focus-ring rounded-md border border-gold/50 px-4 py-3 text-sm font-semibold text-navy" onClick={() => onProgram(draft)}>Programar</button><button className="focus-ring rounded-md bg-gold px-4 py-3 text-sm font-semibold text-navy" onClick={() => onPublish(draft)}>Marcar como publicada</button></div></ProductionPanel>
          {isPublishedState(draft.estado) ? <ProductionPanel title="Métricas"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{(Object.keys(draft.metricas) as (keyof ContentProductionItem["metricas"])[]).filter((key) => key !== "reproducciones").map((key) => <label key={key} className="text-sm font-semibold text-navy">{productionMetricLabel(key)}<input className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 px-3" type="number" value={draft.metricas[key]} onChange={(event) => updateMetric(key, Number(event.target.value))} /></label>)}</div><div className="mt-4 grid gap-3 md:grid-cols-3"><Stat label="Engagement" value={calc.Engagement} /><Stat label="CTR" value={calc.CTR} /><Stat label="Conversión" value={calc.Conversión} /></div><button className="focus-ring mt-4 rounded-md border border-gold/50 px-4 py-3 text-sm font-semibold text-navy" onClick={() => onMetrics(draft)}>Registrar métricas</button></ProductionPanel> : null}
        </section>

        {!focusMode ? (
          <aside className="grid h-fit gap-4">
            <StudioStatistics versions={allStudioVersions} />
            <div className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-navy">Contexto utilizado</h3>
              {[
                ["Marca", generationContext.knowledge.brand.name],
                ["Oferta", generationContext.knowledge.offer.mainProduct],
                ["Buyer Persona", generationContext.knowledge.buyerPersona.profile],
                ["Objetivo", draft.objetivo],
                ["Pilar", draft.pilar],
                ["CTA", generationContext.promptContext.selectedCta],
                ["Hook principal", generationContext.promptContext.primaryHook]
              ].map(([label, value]) => <div key={label} className="mt-3 border-t border-ink/10 pt-2"><p className="text-xs uppercase tracking-[0.16em] text-terracotta">{label}</p><p className="mt-1 line-clamp-4 text-sm leading-6 text-ink/70">{value}</p></div>)}
            </div>
            <EditorSection title="Prompt Builder" open={promptInspectorOpen} onToggle={() => setPromptInspectorOpen((value) => !value)}>
              <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-ink/70">{generationContext.prompt}</pre>
            </EditorSection>
            <div className="rounded-md border border-gold/30 bg-navy p-4 text-white shadow-sm"><h3 className="text-lg font-semibold">Centro de referencia</h3>{Object.entries(brandRefs).map(([label, value]) => <div key={label} className="mt-4 border-t border-gold/20 pt-3"><p className="text-xs uppercase tracking-[0.18em] text-gold">{label}</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/75">{value}</p></div>)}</div>
            <div className="grid gap-2 rounded-md border border-ink/10 bg-white p-4 shadow-sm"><button className="focus-ring rounded-md bg-navy px-4 py-3 text-sm font-semibold text-white" onClick={() => saveNow()}>Guardar</button><button className="focus-ring rounded-md border border-gold/50 px-4 py-3 text-sm font-semibold text-navy" onClick={() => { const advanced = recommendedNextStage(draft); recordHistory("Guardado y avance de etapa"); onSave(advanced, "Guardado y avanzado."); }}>Guardar y continuar</button><button className="focus-ring rounded-md border border-ink/15 px-4 py-3 text-sm font-semibold text-navy" onClick={() => onDuplicate(draft)}>Duplicar</button><button className="focus-ring rounded-md border border-terracotta/50 px-4 py-3 text-sm font-semibold text-terracotta" onClick={() => onArchive(draft)}>Archivar</button></div>
          </aside>
        ) : null}
      </div>
      {previewOpen ? <InstagramPreview item={draft} content={activeVersion?.content} onClose={() => setPreviewOpen(false)} /> : null}
      {comparison ? <VersionComparison previous={comparison.previous} current={comparison.current} onClose={() => setComparison(null)} /> : null}
    </div>
  );
}

function ProductionDetail({
  item,
  brandRefs,
  onSave,
  onContinue,
  onDuplicate,
  onArchive,
  onBack,
  onProgram,
  onPublish,
  onMetrics
}: {
  item: ContentProductionItem;
  brandRefs: Record<string, string>;
  onSave: (item: ContentProductionItem, message?: string) => void;
  onContinue: () => void;
  onDuplicate: (item: ContentProductionItem) => void;
  onArchive: (item: ContentProductionItem) => void;
  onBack: () => void;
  onProgram: (item: ContentProductionItem) => void;
  onPublish: (item: ContentProductionItem) => void;
  onMetrics: (item: ContentProductionItem) => void;
}) {
  const [draft, setDraft] = useState(item);
  const lastSavedRef = useRef(JSON.stringify(item));
  useEffect(() => {
    setDraft(item);
    lastSavedRef.current = JSON.stringify(item);
  }, [item]);
  useEffect(() => {
    const serialized = JSON.stringify(draft);
    if (serialized === lastSavedRef.current) return;
    const timeout = window.setTimeout(() => {
      lastSavedRef.current = serialized;
      onSave(draft, "");
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [draft, onSave]);
  const missing = missingProductionFields(draft);
  const ready = canBeReady(draft);
  const calc = productionMetricCalculations(draft);
  const update = <K extends keyof ContentProductionItem>(key: K, value: ContentProductionItem[K]) => setDraft((current) => normalizeProductionItem({ ...current, [key]: value }));
  const updateMetric = (key: keyof ContentProductionItem["metricas"], value: number) => setDraft((current) => ({ ...current, metricas: { ...current.metricas, [key]: value } }));
  const updateChecklist = (key: keyof ContentProductionItem["checklist"], value: boolean) => setDraft((current) => ({ ...current, checklist: { ...current.checklist, [key]: value } }));

  const saveWithState = (state?: ProductionState) => {
    if (state === "Lista para publicar" && !ready.ok) {
      window.alert(`No se puede marcar como lista. Falta: ${ready.missing.join(", ")}.`);
      return;
    }
    onSave(state ? { ...draft, estado: state } : draft);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <section className="grid gap-5">
        <div className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-terracotta">Publicación #{draft.numero}</p>
              <h3 className="mt-2 text-2xl font-semibold text-navy">{draft.titulo}</h3>
              <p className="mt-2 text-sm text-ink/60">{draft.formato} · {draft.pilar} · {draft.estado} · Avance {productionProgress(draft)}%</p>
            </div>
            <button className="focus-ring rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold text-navy" onClick={onBack}>Volver a producción</button>
          </div>
          {missing.length ? <div className="mt-4 rounded-md border border-terracotta/30 bg-terracotta/10 p-3 text-sm text-ink">Falta antes de publicar: {missing.join(", ")}</div> : <div className="mt-4 rounded-md border border-gold/40 bg-gold/15 p-3 text-sm text-navy">Esta pieza está lista para avanzar a publicación.</div>}
        </div>

        <ProductionPanel title="1. Estrategia">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Objetivo" value={draft.objetivo} onChange={(value) => update("objetivo", value as ContentProductionItem["objetivo"])} options={[...goals]} />
            <Field label="Pilar" value={draft.pilar} onChange={(value) => update("pilar", value as ContentProductionItem["pilar"])} options={pillars} />
            <Field label="Serie" value={draft.serie} onChange={(value) => update("serie", value)} options={series} />
            <Field label="Formato" value={draft.formato} onChange={(value) => update("formato", value as ContentProductionItem["formato"])} options={formats} />
            <Field label="Nivel del embudo" value={draft.etapaEmbudo} onChange={(value) => update("etapaEmbudo", value as ContentProductionItem["etapaEmbudo"])} options={[...funnels]} />
            <Field label="Capítulo del ebook" value={draft.capituloEbook} onChange={(value) => update("capituloEbook", value)} />
            <Field label="Audiencia específica" value={draft.audienciaEspecifica} onChange={(value) => update("audienciaEspecifica", value)} />
            <Field label="KPI principal" value={draft.kpiPrincipal} onChange={(value) => update("kpiPrincipal", value)} />
            <Area label="Problema que resuelve" value={draft.problemaResuelve} onChange={(value) => update("problemaResuelve", value)} />
            <Area label="Resultado esperado" value={draft.resultadoEsperado} onChange={(value) => update("resultadoEsperado", value)} />
            <Area label="Objetivo estratégico" value={draft.objetivoEstrategico} onChange={(value) => update("objetivoEstrategico", value)} />
          </div>
        </ProductionPanel>

        <ProductionPanel title="2. Contenido">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Título" value={draft.titulo} onChange={(value) => update("titulo", value)} />
            <Field label="CTA" value={draft.cta} onChange={(value) => update("cta", value)} />
            <Area label="Hook" value={draft.hook} onChange={(value) => update("hook", value)} />
            <Area label="Idea central" value={draft.ideaCentral} onChange={(value) => update("ideaCentral", value)} />
            <Area label="Guion" value={draft.guion} onChange={(value) => update("guion", value)} />
            <Area label="Copy" value={draft.copy} onChange={(value) => update("copy", value)} />
            <Area label="Hashtags" value={draft.hashtags} onChange={(value) => update("hashtags", value)} />
            <Area label="Comentario fijado" value={draft.comentarioFijado} onChange={(value) => update("comentarioFijado", value)} />
            <Area label="Stories de apoyo" value={draft.historiasApoyo} onChange={(value) => update("historiasApoyo", value)} />
          </div>
        </ProductionPanel>

        <ProductionPanel title="3. Diseño">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="URL o ruta de la imagen final" value={draft.imagenFinal} onChange={(value) => update("imagenFinal", value)} />
            <Field label="Estado del diseño" value={draft.estadoDiseno} onChange={(value) => update("estadoDiseno", value)} options={["Pendiente", "En diseño", "Terminado", "Aprobado"]} />
            <Area label="Estructura visual" value={draft.estructuraVisual} onChange={(value) => update("estructuraVisual", value)} />
            <Area label="Prompt de imagen" value={draft.promptImagen} onChange={(value) => update("promptImagen", value)} />
            <Area label="Notas de diseño" value={draft.notasDiseno} onChange={(value) => update("notasDiseno", value)} />
          </div>
        </ProductionPanel>

        <ProductionPanel title="4. Publicación">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Fecha programada" value={draft.fechaProgramada} onChange={(value) => update("fechaProgramada", value)} type="date" />
            <Field label="Fecha publicada" value={draft.fechaPublicada} onChange={(value) => update("fechaPublicada", value)} type="date" />
            <Field label="Enlace de Instagram" value={draft.enlaceInstagram} onChange={(value) => update("enlaceInstagram", value)} />
            <Field label="Estado" value={draft.estado} onChange={(value) => saveWithState(value as ProductionState)} options={productionStates} />
            <Field label="Responsable" value={draft.responsable} onChange={(value) => update("responsable", value)} />
            <Field label="Prioridad" value={draft.prioridad} onChange={(value) => update("prioridad", value as ContentProductionItem["prioridad"])} options={["Alta", "Media", "Baja"]} />
            <Area label="Notas" value={draft.notas} onChange={(value) => update("notas", value)} />
          </div>
        </ProductionPanel>

        <ProductionPanel title="5. Métricas">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(Object.keys(draft.metricas) as (keyof ContentProductionItem["metricas"])[]).map((key) => (
              <label key={key} className="text-sm font-semibold text-navy">
                {productionMetricLabel(key)}
                <input className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 px-3" type="number" value={draft.metricas[key]} onChange={(event) => updateMetric(key, Number(event.target.value))} />
              </label>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {Object.entries(calc).map(([label, value]) => <Stat key={label} label={label} value={value} />)}
          </div>
        </ProductionPanel>
      </section>

      <aside className="grid h-fit gap-4">
        <div className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-navy">Checklist</h3>
          <div className="mt-3 grid gap-2">
            {(Object.keys(draft.checklist) as (keyof ContentProductionItem["checklist"])[]).map((key) => (
              <label key={key} className="flex items-center gap-2 rounded-md border border-ink/10 bg-cream px-3 py-2 text-sm">
                <input type="checkbox" checked={draft.checklist[key]} onChange={(event) => updateChecklist(key, event.target.checked)} />
                {checklistLabels[key]}
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-gold/30 bg-navy p-4 text-white shadow-sm">
          <h3 className="text-lg font-semibold">Resumen Brand Book</h3>
          {Object.entries(brandRefs).map(([label, value]) => (
            <div key={label} className="mt-4 border-t border-gold/20 pt-3">
              <p className="text-xs uppercase tracking-[0.18em] text-gold">{label}</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/75">{value}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-2 rounded-md border border-ink/10 bg-white p-4 shadow-sm">
          <button className="focus-ring rounded-md bg-navy px-4 py-3 text-sm font-semibold text-white" onClick={() => onSave(draft)}>Guardar</button>
          <button className="focus-ring rounded-md border border-gold/50 px-4 py-3 text-sm font-semibold text-navy" onClick={() => onSave(recommendedNextStage(draft), "Guardado y avanzado.")}>Guardar y continuar</button>
          <button className="focus-ring rounded-md border border-gold/50 px-4 py-3 text-sm font-semibold text-navy" onClick={() => onSave(recommendedNextStage(draft), "Etapa marcada como completada.")}>Marcar etapa como completada</button>
          <button className="focus-ring rounded-md border border-ink/15 px-4 py-3 text-sm font-semibold text-navy" onClick={() => onDuplicate(draft)}>Duplicar</button>
          <button className="focus-ring rounded-md border border-terracotta/50 px-4 py-3 text-sm font-semibold text-terracotta" onClick={() => onArchive(draft)}>Archivar</button>
          <button className="focus-ring rounded-md border border-gold/50 px-4 py-3 text-sm font-semibold text-navy" onClick={() => onProgram(draft)}>Programar</button>
          <button className="focus-ring rounded-md bg-gold px-4 py-3 text-sm font-semibold text-navy" onClick={() => onPublish(draft)}>Marcar como publicada</button>
          <button className="focus-ring rounded-md border border-gold/50 px-4 py-3 text-sm font-semibold text-navy" onClick={() => onMetrics(draft)}>Registrar métricas</button>
        </div>
      </aside>
    </div>
  );
}

function ProductionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-xl font-semibold text-navy">{title}</h3>
      {children}
    </section>
  );
}

function StudioStrategy({
  item,
  update,
  onSave,
  onContinue
}: {
  item: ContentProductionItem;
  update: <K extends keyof ContentProductionItem>(key: K, value: ContentProductionItem[K]) => void;
  onSave: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-terracotta">Estrategia</p>
        <h3 className="mt-2 text-2xl font-semibold text-navy">#{item.numero}</h3>
        <div className="mt-4 grid gap-3 text-sm">
          <MiniSelect label="Estado" value={item.estado === "Idea" ? "Pendiente" : ["Estrategia", "Hook", "Guion", "Copy", "Diseño"].includes(item.estado) ? "Producción" : item.estado === "Publicada" || item.estado === "Programada" || item.estado === "Métricas registradas" ? "Publicado" : item.estado} options={["Pendiente", "Producción", "Revisión", "Publicado"]} onChange={(value) => update("estado", ({ Pendiente: "Idea", Producción: "Estrategia", Revisión: "Revisión", Publicado: "Publicada" } as Record<string, ProductionState>)[value])} />
          <MiniSelect label="Formato" value={item.formato} options={formats} onChange={(value) => update("formato", value as ContentProductionItem["formato"])} />
          <MiniSelect label="Pilar" value={item.pilar} options={pillars} onChange={(value) => update("pilar", value as ContentProductionItem["pilar"])} />
          <MiniSelect label="Serie" value={item.serie} options={series} onChange={(value) => update("serie", value)} />
          <MiniInput label="Capítulo del ebook" value={item.capituloEbook} onChange={(value) => update("capituloEbook", value)} />
          <MiniSelect label="Objetivo" value={item.objetivo} options={[...goals]} onChange={(value) => update("objetivo", value as ContentProductionItem["objetivo"])} />
          <MiniSelect label="Embudo" value={item.etapaEmbudo} options={[...funnels]} onChange={(value) => update("etapaEmbudo", value as ContentProductionItem["etapaEmbudo"])} />
          <MiniSelect label="Prioridad" value={item.prioridad} options={["Alta", "Media", "Baja"]} onChange={(value) => update("prioridad", value as ContentProductionItem["prioridad"])} />
          <MiniInput label="Responsable" value={item.responsable} onChange={(value) => update("responsable", value)} />
          <MiniInput label="Fecha programada" value={item.fechaProgramada} onChange={(value) => update("fechaProgramada", value)} type="date" />
          <MiniInput label="Fecha publicada" value={item.fechaPublicada} onChange={(value) => update("fechaPublicada", value)} type="date" />
        </div>
      </div>
      <div className="grid gap-2">
        <button className="focus-ring rounded-md bg-navy px-4 py-3 text-sm font-semibold text-white" onClick={onSave}>Guardar</button>
        <button className="focus-ring rounded-md border border-gold/50 px-4 py-3 text-sm font-semibold text-navy" onClick={onContinue}>Guardar y continuar</button>
      </div>
    </div>
  );
}

function StudioBlock({ title, open, onToggle, meta, children }: { title: string; open: boolean; onToggle: () => void; meta?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-ink/10 bg-white shadow-sm">
      <button className="focus-ring flex w-full items-center justify-between px-4 py-4 text-left" onClick={onToggle}>
        <span className="text-lg font-semibold text-navy">{title}</span>
        <span className="text-sm text-ink/55">{meta ? `${meta} · ` : ""}{open ? "Cerrar" : "Abrir"}</span>
      </button>
      {open ? <div className="border-t border-ink/10 bg-cream/60 p-4">{children}</div> : null}
    </section>
  );
}

function ProductionPreview({ item, onClose }: { item: ContentProductionItem; onClose: () => void }) {
  const isCarousel = item.formato === "Carrusel";
  const isStory = item.formato === "Stories" || item.formato === "Story";
  const slides = (item.estructuraVisual || item.guion || item.copy || item.titulo).split("\n").filter(Boolean).slice(0, isCarousel ? 7 : isStory ? 5 : 1);
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-navy/70 p-4">
      <div className="mx-auto max-w-5xl rounded-md bg-cream p-5 shadow-editorial">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-terracotta">Preview</p>
            <h3 className="mt-2 text-2xl font-semibold text-navy">{item.formato}</h3>
          </div>
          <button className="focus-ring rounded-md border border-ink/15 px-3 py-2" onClick={onClose}>Cerrar</button>
        </div>
        <div className={isCarousel || isStory ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "mx-auto max-w-sm"}>
          {(slides.length ? slides : [item.hook || item.titulo]).map((slide, index) => (
            <article key={`${slide}-${index}`} className="aspect-[4/5] rounded-md bg-navy p-5 text-white shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">{isCarousel ? `Slide ${index + 1}` : isStory ? `Story ${index + 1}` : "Portada Reel"}</p>
              <h4 className="mt-8 text-2xl font-semibold leading-tight">{index === 0 ? item.hook || item.titulo : slide}</h4>
              <p className="mt-5 text-sm leading-6 text-white/70">{index === 0 ? item.ideaCentral : item.cta}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="grid gap-1 text-xs font-semibold text-navy">{label}<input className="focus-ring min-h-9 rounded-md border border-ink/15 px-2 text-sm" type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function MiniSelect({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  const uniqueOptions = uniqueStrings(options);
  return <label className="grid gap-1 text-xs font-semibold text-navy">{label}<select className="focus-ring min-h-9 rounded-md border border-ink/15 bg-white px-2 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>{uniqueOptions.map((option, index) => <option key={`${option}-${index}`} value={option}>{option}</option>)}</select></label>;
}

function BrandBook({ sections, setSections, flash }: { sections: BrandBookSection[]; setSections: React.Dispatch<React.SetStateAction<BrandBookSection[]>>; flash: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(sections[0]?.id ?? "");
  const [draft, setDraft] = useState<BrandBookSection | null>(sections[0] ?? null);
  const [isEditing, setIsEditing] = useState(false);
  const selected = sections.find((section) => section.id === selectedId) ?? sections[0];
  const completed = sections.filter((section) => section.body.trim().length > 0).length;
  const approved = sections.filter((section) => section.approved).length;
  const filtered = sections.filter((section) => [section.title, section.body, section.notes].join(" ").toLowerCase().includes(query.toLowerCase()));
  const completionPct = Math.round((completed / Math.max(1, sections.length)) * 100);
  const approvedPct = Math.round((approved / Math.max(1, sections.length)) * 100);

  useEffect(() => {
    const next = sections.find((section) => section.id === selectedId) ?? sections[0] ?? null;
    setDraft(next ? { ...next } : null);
  }, [sections, selectedId]);

  const choose = (id: string) => {
    setSelectedId(id);
    const next = sections.find((section) => section.id === id);
    setDraft(next ? { ...next } : null);
    setIsEditing(false);
  };

  const saveDraft = () => {
    if (!draft) return;
    if (!draft.title.trim() || !draft.body.trim()) {
      flash("La sección necesita título y contenido antes de guardar.");
      return;
    }
    const updated = { ...draft, lastEditedAt: new Date().toISOString().slice(0, 10) };
    setSections((current) => current.map((section) => (section.id === updated.id ? updated : section)));
    setIsEditing(false);
    flash("Brand Book guardado.");
  };

  const restoreSection = () => {
    if (!draft) return;
    if (!window.confirm(`¿Restaurar "${draft.title}" a la versión inicial?`)) return;
    const initial = initialBrandBookSections.find((section) => section.id === draft.id);
    if (!initial) {
      flash("No se encontró una versión inicial para esta sección.");
      return;
    }
    const restored = { ...initial, lastEditedAt: new Date().toISOString().slice(0, 10) };
    setSections((current) => current.map((section) => (section.id === restored.id ? restored : section)));
    setDraft(restored);
    flash("Sección restaurada.");
  };

  const toggleApproved = () => {
    if (!draft) return;
    const updated = { ...draft, approved: !draft.approved, lastEditedAt: new Date().toISOString().slice(0, 10) };
    setDraft(updated);
    setSections((current) => current.map((section) => (section.id === updated.id ? updated : section)));
    flash(updated.approved ? "Sección aprobada." : "Aprobación retirada.");
  };

  const exportBrandBook = (format: "json" | "markdown" | "text") => {
    const ordered = [...sections].sort((a, b) => a.order - b.order);
    if (format === "json") {
      downloadFile("grr-brand-book.json", JSON.stringify({ brand: "Guía Restaurante Rentable", exportedAt: new Date().toISOString(), sections: ordered }, null, 2), "application/json;charset=utf-8");
    }
    if (format === "markdown") {
      downloadFile("grr-brand-book.md", brandBookMarkdown(ordered), "text/markdown;charset=utf-8");
    }
    if (format === "text") {
      downloadFile("grr-brand-book.txt", brandBookText(ordered), "text/plain;charset=utf-8");
    }
    flash(`Brand Book exportado en ${format.toUpperCase()}.`);
  };

  if (!draft || !selected) return <Empty text="No hay secciones en el Brand Book." />;

  return (
    <div className="grid gap-5">
      <section className="thin-lines overflow-hidden rounded-md bg-navy text-white shadow-editorial">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_420px] lg:p-7">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-gold">Fuente única de verdad</p>
            <h3 className="mt-3 text-3xl font-semibold md:text-4xl">Brand Book</h3>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">
              Referencia central para contenido, diseño, copy, anuncios, Reels, carruseles, Stories, landing pages, emails, campañas y productos de Guía Restaurante Rentable.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Progress label="Completado" value={completed} target={sections.length} />
            <Progress label="Aprobado" value={approved} target={sections.length} />
            <Stat label="Completado" value={`${completionPct}%`} />
            <Stat label="Aprobado" value={`${approvedPct}%`} />
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
          <div className="mb-4 grid gap-3">
            <input className="focus-ring min-h-11 rounded-md border border-ink/15 px-3" placeholder="Buscar dentro del Brand Book" value={query} onChange={(event) => setQuery(event.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              <button className="focus-ring rounded-md bg-navy px-3 py-2 text-sm font-semibold text-white" onClick={() => exportBrandBook("json")}>JSON</button>
              <button className="focus-ring rounded-md border border-gold/50 px-3 py-2 text-sm font-semibold text-navy" onClick={() => exportBrandBook("markdown")}>Markdown</button>
              <button className="focus-ring rounded-md border border-gold/50 px-3 py-2 text-sm font-semibold text-navy" onClick={() => exportBrandBook("text")}>Texto</button>
            </div>
          </div>
          <div className="scrollbar grid max-h-[68vh] gap-2 overflow-y-auto pr-1">
            {filtered.map((section) => (
              <button
                key={section.id}
                onClick={() => choose(section.id)}
                className={`focus-ring rounded-md border p-3 text-left text-sm transition ${
                  selectedId === section.id ? "border-gold bg-navy text-white" : "border-ink/10 bg-cream text-ink hover:border-gold/60"
                }`}
              >
                <span className="block text-xs opacity-70">{String(section.order).padStart(2, "0")}</span>
                <span className="mt-1 block font-semibold">{section.title}</span>
                <span className="mt-2 block text-xs opacity-70">{section.approved ? "Aprobada" : "Pendiente"} · Editada {section.lastEditedAt}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-md border border-ink/10 bg-white p-4 shadow-sm lg:p-5">
          <div className="mb-5 flex flex-col justify-between gap-3 border-b border-ink/10 pb-4 md:flex-row md:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-terracotta">Sección {String(draft.order).padStart(2, "0")}</p>
              <h3 className="mt-2 text-2xl font-semibold text-navy">{draft.title}</h3>
              <p className="mt-2 text-sm text-ink/60">Última edición: {draft.lastEditedAt}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className={`focus-ring rounded-md px-3 py-2 text-sm font-semibold ${draft.approved ? "bg-gold text-navy" : "border border-gold/50 text-navy"}`} onClick={toggleApproved}>
                {draft.approved ? "Aprobada" : "Marcar aprobada"}
              </button>
              <button className="focus-ring rounded-md border border-gold/50 px-3 py-2 text-sm font-semibold text-navy" onClick={() => setIsEditing(true)}>Editar</button>
              <button className="focus-ring rounded-md border border-terracotta/50 px-3 py-2 text-sm font-semibold text-terracotta" onClick={restoreSection}>Restaurar versión inicial</button>
              <button className="focus-ring rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white" onClick={saveDraft}>Guardar</button>
            </div>
          </div>

          {draft.title === "Paleta de Colores" ? <ColorSwatches body={draft.body} /> : null}

          <div className="grid gap-4">
            <label className="text-sm font-semibold text-navy">
              Título
              <input disabled={!isEditing} className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 px-3 disabled:bg-cream disabled:text-ink/65" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
            </label>
            <label className="text-sm font-semibold text-navy">
              Contenido
              <textarea disabled={!isEditing} className="focus-ring mt-2 min-h-[420px] w-full rounded-md border border-ink/15 bg-cream p-4 leading-7 disabled:text-ink/70" value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} />
            </label>
            <label className="text-sm font-semibold text-navy">
              Notas internas
              <textarea disabled={!isEditing} className="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink/15 px-3 py-2 leading-6 disabled:bg-cream disabled:text-ink/65" placeholder="Añade observaciones, pendientes o decisiones del equipo." value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}

function HooksLibrary({ hooks, setHooks }: { hooks: HookItem[]; setHooks: React.Dispatch<React.SetStateAction<HookItem[]>> }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const categories = Array.from(new Set(hooks.map((hook) => hook.category)));
  const filtered = hooks.filter((hook) => hook.text.toLowerCase().includes(query.toLowerCase())).filter((hook) => category === "Todas" || hook.category === category);

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 rounded-md border border-ink/10 bg-white/80 p-4 sm:flex-row">
        <input className="focus-ring min-h-11 flex-1 rounded-md border border-ink/15 px-3" placeholder="Buscar hooks" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={category} onChange={setCategory} options={["Todas", ...categories]} />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((hook) => (
          <article key={hook.id} className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
            <p className="text-lg font-semibold leading-snug text-navy">{hook.text}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {[hook.category, hook.pillar, hook.format, hook.funnel].map((label) => <Badge key={label} label={label} />)}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-ink/65">
              <span>Rendimiento {hook.performance}%</span>
              <button className="focus-ring rounded-md border border-gold/40 px-3 py-2" onClick={() => setHooks((current) => current.map((item) => item.id === hook.id ? { ...item, used: item.used + 1 } : item))}>Usar ({hook.used})</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Templates({ templates, setTemplates, flash }: { templates: ScriptTemplate[]; setTemplates: React.Dispatch<React.SetStateAction<ScriptTemplate[]>>; flash: (message: string) => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {templates.map((template) => (
        <article key={template.id} className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-navy">{template.name}</h3>
              <p className="text-sm text-ink/60">{template.format} · {template.fields.length} campos editables</p>
            </div>
            <Badge label={template.format} />
          </div>
          <textarea
            className="focus-ring min-h-52 w-full rounded-md border border-ink/15 bg-cream p-3 text-sm leading-6"
            value={template.structure}
            onChange={(event) => setTemplates((current) => current.map((item) => item.id === template.id ? { ...item, structure: event.target.value } : item))}
            onBlur={() => flash("Plantilla guardada.")}
          />
        </article>
      ))}
    </div>
  );
}

function Analytics({ content, setContent, flash }: { content: ContentItem[]; setContent: React.Dispatch<React.SetStateAction<ContentItem[]>>; flash: (message: string) => void }) {
  const [selectedId, setSelectedId] = useState(content[0]?.id ?? "");
  const selected = content.find((item) => item.id === selectedId) ?? content[0];
  const updateMetric = (key: keyof ContentItem["metrics"], value: number) => {
    setContent((current) => current.map((item) => item.id === selected.id ? { ...item, metrics: { ...item.metrics, [key]: value } } : item));
  };
  if (!selected) return <Empty text="No hay publicaciones para medir." />;
  const m = selected.metrics;
  const calculated = [
    ["Engagement", pct(m.likes + m.comments + m.saves + m.shares, m.reach)],
    ["Tasa de guardados", pct(m.saves, m.reach)],
    ["Tasa de compartidos", pct(m.shares, m.reach)],
    ["CTR", pct(m.linkClicks, m.reach)],
    ["Conversión a venta", pct(m.sales, m.linkClicks)],
    ["Ingreso por publicación", `$${m.revenue.toLocaleString("en-US")}`],
    ["ROAS", m.adCost > 0 ? `${(m.revenue / m.adCost).toFixed(2)}x` : "Sin pauta"]
  ];
  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <div className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
        <Select value={selected.id} onChange={setSelectedId} options={content.map((item) => item.id)} />
        <h3 className="mt-4 text-xl font-semibold text-navy">{selected.title}</h3>
        <p className="mt-2 text-sm text-ink/60">{selected.format} · {selected.pillar} · {selected.status}</p>
        <div className="mt-5 grid gap-2">
          {calculated.map(([label, value]) => <Stat key={label} label={label} value={value} />)}
        </div>
      </div>
      <div className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(Object.keys(m) as (keyof ContentItem["metrics"])[]).map((key) => (
            <label key={key} className="text-sm font-semibold text-navy">
              {metricLabel(key)}
              <input className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 px-3" type="number" value={m[key]} onChange={(event) => updateMetric(key, Number(event.target.value))} onBlur={() => flash("Métricas guardadas.")} />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function EditableSections<T extends BrandSection | FunnelOffer>({ title, sections, setSections, flash }: { title: string; sections: T[]; setSections: React.Dispatch<React.SetStateAction<T[]>>; flash: (message: string) => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {sections.map((section) => (
        <article key={section.id} className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-xl font-semibold text-navy">{section.title}</h3>
          <textarea
            className="focus-ring min-h-44 w-full rounded-md border border-ink/15 bg-cream p-3 text-sm leading-6"
            value={section.body}
            onChange={(event) => setSections((current) => current.map((item) => item.id === section.id ? { ...item, body: event.target.value } : item))}
            onBlur={() => flash(`${title} guardada.`)}
          />
        </article>
      ))}
    </div>
  );
}

function ContentTable({ items, onEdit, onDuplicate, onArchive }: { items: ContentItem[]; onEdit: (item: ContentItem) => void; onDuplicate: (item: ContentItem) => void; onArchive: (item: ContentItem) => void }) {
  return (
    <div className="overflow-hidden rounded-md border border-ink/10 bg-white shadow-sm">
      <div className="scrollbar overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
          <thead className="bg-navy text-white">
            <tr>{["ID", "Título", "Pilar", "Formato", "Objetivo", "Estado", "Fecha", "Responsable", "Acciones"].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-ink/10">
                <td className="px-4 py-3 text-ink/60">{item.id}</td>
                <td className="px-4 py-3 font-semibold text-navy">{item.title}</td>
                <td className="px-4 py-3">{item.pillar}</td>
                <td className="px-4 py-3">{item.format}</td>
                <td className="px-4 py-3">{item.goal}</td>
                <td className="px-4 py-3"><Badge label={item.status} /></td>
                <td className="px-4 py-3">{item.publishedAt || item.scheduledAt || "Sin fecha"}</td>
                <td className="px-4 py-3">{item.owner}</td>
                <td className="px-4 py-3">
                  <RowActions item={item} onEdit={onEdit} onDuplicate={onDuplicate} onArchive={onArchive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContentCards({ items, onEdit, onDuplicate, onArchive }: { items: ContentItem[]; onEdit: (item: ContentItem) => void; onDuplicate: (item: ContentItem) => void; onArchive: (item: ContentItem) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article key={item.id} className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <Badge label={item.format} />
            <Badge label={item.status} />
          </div>
          <h3 className="mt-4 text-xl font-semibold leading-tight text-navy">{item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-ink/65">{item.hook || item.centralIdea}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {[item.pillar, item.series, item.goal, item.funnel].map((label) => <Badge key={label} label={label} />)}
          </div>
          <div className="mt-5"><RowActions item={item} onEdit={onEdit} onDuplicate={onDuplicate} onArchive={onArchive} /></div>
        </article>
      ))}
    </div>
  );
}

function Kanban({ items, setContent, onEdit, flash }: { items: ContentItem[]; setContent: React.Dispatch<React.SetStateAction<ContentItem[]>>; onEdit: (item: ContentItem) => void; flash: (message: string) => void }) {
  const move = (id: string, status: ContentItem["status"]) => {
    setContent((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    flash("Estado actualizado.");
  };
  return (
    <div className="scrollbar overflow-x-auto">
      <div className="grid min-w-[1180px] grid-cols-8 gap-3">
        {statuses.map((status) => (
          <section key={status} onDragOver={(event) => event.preventDefault()} onDrop={(event) => move(event.dataTransfer.getData("text/plain"), status)} className="min-h-96 rounded-md border border-ink/10 bg-white/80 p-3">
            <h3 className="mb-3 text-sm font-semibold text-navy">{status}</h3>
            <div className="grid gap-2">
              {items.filter((item) => item.status === status).map((item) => (
                <button key={item.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)} onClick={() => onEdit(item)} className="focus-ring rounded-md border border-gold/30 bg-cream p-3 text-left text-sm">
                  <strong className="block text-navy">{item.title}</strong>
                  <span className="mt-1 block text-xs text-ink/60">{item.format} · {item.pillar}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ContentModal({ item, onCancel, onSave }: { item: ContentItem; onCancel: () => void; onSave: (item: ContentItem) => void }) {
  const [draft, setDraft] = useState(item);
  const update = <K extends keyof ContentItem>(key: K, value: ContentItem[K]) => setDraft((current) => ({ ...current, [key]: value }));
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-navy/55 p-4">
      <form onSubmit={(event) => { event.preventDefault(); onSave(draft); }} className="scrollbar max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-md bg-white p-5 shadow-editorial">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-ink/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-terracotta">{draft.id}</p>
            <h3 className="mt-2 text-2xl font-semibold text-navy">Editar contenido</h3>
          </div>
          <button type="button" className="focus-ring rounded-md border border-ink/15 px-3 py-2" onClick={onCancel}>Cerrar</button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Título" value={draft.title} onChange={(value) => update("title", value)} />
          <Field label="Tema" value={draft.topic} onChange={(value) => update("topic", value)} />
          <Field label="Serie" value={draft.series} onChange={(value) => update("series", value)} options={series} />
          <Field label="Pilar" value={draft.pillar} onChange={(value) => update("pillar", value as ContentItem["pillar"])} options={pillars} />
          <Field label="Formato" value={draft.format} onChange={(value) => update("format", value as ContentItem["format"])} options={formats} />
          <Field label="Objetivo" value={draft.goal} onChange={(value) => update("goal", value as ContentItem["goal"])} options={[...goals]} />
          <Field label="Embudo" value={draft.funnel} onChange={(value) => update("funnel", value as ContentItem["funnel"])} options={[...funnels]} />
          <Field label="Estado" value={draft.status} onChange={(value) => update("status", value as ContentItem["status"])} options={[...statuses]} />
          <Field label="Fecha programada" value={draft.scheduledAt} onChange={(value) => update("scheduledAt", value)} type="date" />
          <Field label="Fecha publicada" value={draft.publishedAt} onChange={(value) => update("publishedAt", value)} type="date" />
          <Field label="Responsable" value={draft.owner} onChange={(value) => update("owner", value)} />
          <Field label="Capítulo del ebook" value={draft.ebookChapter} onChange={(value) => update("ebookChapter", value)} />
          <Field label="Dificultad" value={draft.difficulty} onChange={(value) => update("difficulty", value as ContentItem["difficulty"])} options={["Baja", "Media", "Alta"]} />
          <Field label="Prioridad" value={draft.priority} onChange={(value) => update("priority", value as ContentItem["priority"])} options={["Baja", "Media", "Alta"]} />
          <Field label="Enlace de publicación" value={draft.postUrl} onChange={(value) => update("postUrl", value)} />
          <Field label="Hashtags" value={draft.hashtags} onChange={(value) => update("hashtags", value)} />
          <Area label="Hook" value={draft.hook} onChange={(value) => update("hook", value)} />
          <Area label="Idea central" value={draft.centralIdea} onChange={(value) => update("centralIdea", value)} />
          <Area label="Guion" value={draft.script} onChange={(value) => update("script", value)} />
          <Area label="Copy" value={draft.copy} onChange={(value) => update("copy", value)} />
          <Area label="CTA" value={draft.cta} onChange={(value) => update("cta", value)} />
          <Area label="Historias de apoyo" value={draft.supportStories} onChange={(value) => update("supportStories", value)} />
          <Area label="Comentario fijado" value={draft.pinnedComment} onChange={(value) => update("pinnedComment", value)} />
          <Area label="Notas" value={draft.notes} onChange={(value) => update("notes", value)} />
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" className="focus-ring rounded-md border border-ink/15 px-4 py-3" onClick={onCancel}>Cancelar</button>
          <button className="focus-ring rounded-md bg-navy px-5 py-3 font-semibold text-white">Guardar cambios</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, options, type = "text" }: { label: string; value: string; onChange: (value: string) => void; options?: readonly string[]; type?: string }) {
  const uniqueOptions = options ? uniqueStrings(options) : [];
  return (
    <label className="text-sm font-semibold text-navy">
      {label}
      {options ? (
        <select className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 bg-white px-3" value={value} onChange={(event) => onChange(event.target.value)}>
          {uniqueOptions.map((option, index) => <option key={`${option}-${index}`} value={option}>{option}</option>)}
        </select>
      ) : (
        <input className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 px-3" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-sm font-semibold text-navy md:col-span-2">
      {label}
      <textarea className="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink/15 px-3 py-2 leading-6" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ColorSwatches({ body }: { body: string }) {
  const colors = Array.from(body.matchAll(/#[0-9A-Fa-f]{6}/g)).map((match) => match[0]);
  if (colors.length === 0) return null;
  return (
    <div className="mb-5 grid gap-3 rounded-md border border-gold/30 bg-cream p-4 sm:grid-cols-2 xl:grid-cols-4">
      {colors.map((color) => (
        <div key={color} className="flex items-center gap-3 rounded-md bg-white p-3">
          <span className="h-10 w-10 rounded-md border border-ink/10" style={{ backgroundColor: color }} />
          <span className="text-sm font-semibold text-navy">{color.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}

function RowActions({ item, onEdit, onDuplicate, onArchive }: { item: ContentItem; onEdit: (item: ContentItem) => void; onDuplicate: (item: ContentItem) => void; onArchive: (item: ContentItem) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="focus-ring rounded-md bg-navy px-3 py-2 text-xs font-semibold text-white" onClick={() => onEdit(item)}>Editar</button>
      <button className="focus-ring rounded-md border border-gold/40 px-3 py-2 text-xs font-semibold text-navy" onClick={() => onDuplicate(item)}>Duplicar</button>
      <button className="focus-ring rounded-md border border-terracotta/40 px-3 py-2 text-xs font-semibold text-terracotta" onClick={() => onArchive(item)}>Archivar</button>
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: readonly string[] }) {
  const uniqueOptions = uniqueStrings(options);
  return (
    <select className="focus-ring min-h-11 rounded-md border border-ink/15 bg-white px-3" value={value} onChange={(event) => onChange(event.target.value)}>
      {uniqueOptions.map((option, index) => <option key={`${option}-${index}`} value={option}>{option}</option>)}
    </select>
  );
}

function Segment<T extends string>({ value, setValue, options, labels }: { value: T; setValue: (value: T) => void; options: T[]; labels: string[] }) {
  const uniqueOptions = options.reduce<Array<{ option: T; label: string }>>((acc, option, index) => {
    if (!acc.some((entry) => entry.option === option)) acc.push({ option, label: labels[index] });
    return acc;
  }, []);
  return (
    <div className="flex rounded-md border border-ink/10 bg-cream p-1">
      {uniqueOptions.map(({ option, label }, index) => (
        <button key={`${option}-${index}`} className={`focus-ring rounded px-3 py-2 text-sm ${value === option ? "bg-navy text-white" : "text-ink/70"}`} onClick={() => setValue(option)}>{label}</button>
      ))}
    </div>
  );
}

function DarkStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-gold/25 bg-white/8 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-ink/48">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-navy">{value}</p>
    </div>
  );
}

function InfoPanel({ title, value, note, onClick }: { title: string; value: string; note: string; onClick?: () => void }) {
  const interactive = Boolean(onClick);
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };
  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`rounded-md border border-ink/10 bg-white p-4 shadow-sm transition ${interactive ? "cursor-pointer hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-editorial" : ""}`}
    >
      <p className="text-xs uppercase tracking-[0.18em] text-ink/48">{title}</p>
      <p className="mt-2 font-semibold leading-snug text-navy">{value}</p>
      <p className="mt-2 text-sm text-ink/55">{note}</p>
    </div>
  );
}

function Progress({ label, value, target }: { label: string; value: number; target: number }) {
  const width = Math.min(100, Math.round((value / target) * 100));
  return (
    <div className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-navy">{label}</span>
        <span>{value.toLocaleString("en-US")} / {target.toLocaleString("en-US")}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-cream"><div className="h-2 rounded-full bg-gold" style={{ width: `${width}%` }} /></div>
    </div>
  );
}

function BarChart({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <section className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-navy">{title}</h3>
      <div className="grid gap-3">
        {data.map((item) => (
          <div key={item.label} className="grid grid-cols-[150px_1fr_70px] items-center gap-3 text-sm">
            <span className="truncate text-ink/70">{item.label}</span>
            <div className="h-3 rounded-full bg-cream"><div className="h-3 rounded-full bg-terracotta" style={{ width: `${Math.max(5, (item.value / max) * 100)}%` }} /></div>
            <strong className="text-right text-navy">{item.value.toLocaleString("en-US")}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function Badge({ label }: { label: string }) {
  return <span className="inline-flex rounded-full border border-gold/30 bg-cream px-2.5 py-1 text-xs font-semibold text-navy">{label}</span>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-gold/50 bg-white/70 p-8 text-center text-ink/60">{text}</div>;
}

function pct(part: number, total: number) {
  return total > 0 ? `${((part / total) * 100).toFixed(1)}%` : "0.0%";
}

function uniqueStrings(options: readonly string[]) {
  return Array.from(new Set(options.filter((option) => option.trim().length > 0)));
}

function productionProgress(item: ContentProductionItem) {
  const values = Object.values(item.checklist);
  return Math.round((values.filter(Boolean).length / values.length) * 100);
}

function missingProductionFields(item: ContentProductionItem) {
  const missing: string[] = [];
  if (!item.hook.trim()) missing.push("hook");
  if (!item.copy.trim()) missing.push("copy");
  if (!item.cta.trim()) missing.push("CTA");
  if (!item.promptImagen.trim() && !item.imagenFinal.trim() && !item.estructuraVisual.trim()) missing.push("diseño o prompt de imagen");
  if (!item.fechaProgramada.trim()) missing.push("fecha programada");
  return missing;
}

function canBeReady(item: ContentProductionItem) {
  const missing = missingProductionFields(item);
  return { ok: missing.length === 0, missing };
}

function normalizeProductionItem(item: ContentProductionItem): ContentProductionItem {
  return {
    ...item,
    promptVideo: item.promptVideo ?? "",
    checklist: {
      ...item.checklist,
      objetivoDefinido: Boolean(item.objetivo),
      hookAprobado: item.checklist.hookAprobado || Boolean(item.hook.trim()),
      guionTerminado: item.checklist.guionTerminado || Boolean(item.guion.trim()),
      copyTerminado: item.checklist.copyTerminado || Boolean(item.copy.trim()),
      ctaSeleccionado: Boolean(item.cta.trim()),
      hashtagsRevisados: item.checklist.hashtagsRevisados || Boolean(item.hashtags.trim()),
      disenoTerminado: item.checklist.disenoTerminado || Boolean(item.imagenFinal.trim() || item.promptImagen.trim() || item.estructuraVisual.trim()),
      imagenCreada: item.checklist.imagenCreada || Boolean(item.imagenFinal.trim() || item.promptImagen.trim()),
      videoCreado: item.checklist.videoCreado || Boolean(item.promptVideo?.trim()),
      fechaProgramada: Boolean(item.fechaProgramada),
      storiesApoyoCreadas: item.checklist.storiesApoyoCreadas || Boolean(item.historiasApoyo.trim()),
      comentarioFijadoPreparado: item.checklist.comentarioFijadoPreparado || Boolean(item.comentarioFijado.trim()),
      enlacePublicacionAgregado: Boolean(item.enlaceInstagram),
      metricasRegistradas: item.checklist.metricasRegistradas || Object.values(item.metricas).some((value) => value > 0)
    }
  };
}

function kanbanGroup(state: ProductionState) {
  if (["Estrategia", "Hook", "Guion", "Copy", "Diseño"].includes(state)) return "En producción";
  if (state === "Revisión") return "Revisión";
  if (state === "Lista para publicar") return "Lista para publicar";
  if (state === "Programada") return "Programada";
  if (["Publicada", "Métricas registradas", "Reutilizar"].includes(state)) return "Publicada";
  return "Idea";
}

function targetToProductionState(target: string): ProductionState {
  if (target === "En producción") return "Estrategia";
  if (target === "Publicada") return "Publicada";
  if (productionStates.includes(target as ProductionState)) return target as ProductionState;
  return target as ProductionState;
}

function priorityRank(priority: ContentProductionItem["prioridad"]) {
  return priority === "Alta" ? 1 : priority === "Media" ? 2 : 3;
}

function isPublishedState(state: ProductionState) {
  return ["Publicada", "Métricas registradas", "Reutilizar"].includes(state);
}

function nextProductionItem(items: ContentProductionItem[]) {
  return items
    .filter((item) => !item.archived && !isPublishedState(item.estado) && productionProgress(item) < 100)
    .sort((a, b) => priorityRank(a.prioridad) - priorityRank(b.prioridad) || a.numero - b.numero)[0];
}

function productionSlug(item: ContentProductionItem) {
  return `grr-${String(item.numero).padStart(3, "0")}`;
}

function resolveProductionId(idOrSlug: string, items: ContentProductionItem[]) {
  if (!idOrSlug) return "";
  const normalized = idOrSlug.toLowerCase();
  const byId = items.find((item) => item.id.toLowerCase() === normalized);
  if (byId) return byId.id;
  const bySlug = items.find((item) => productionSlug(item) === normalized);
  return bySlug?.id ?? "";
}

function recommendedNextStage(item: ContentProductionItem): ContentProductionItem {
  const index = productionStates.indexOf(item.estado);
  const next = productionStates[Math.min(index + 1, productionStates.length - 1)];
  if (next === "Lista para publicar" && !canBeReady(item).ok) return { ...item, estado: "Revisión" };
  return { ...item, estado: next };
}

function getProductionSummary(items: ContentProductionItem[]) {
  const total = items.length;
  const publishedItems = items.filter((item) => isPublishedState(item.estado));
  const progress = Math.round(items.reduce((sum, item) => sum + productionProgress(item), 0) / Math.max(1, total));
  return {
    total,
    pending: items.filter((item) => !isPublishedState(item.estado)).length,
    inProduction: items.filter((item) => kanbanGroup(item.estado) === "En producción").length,
    ready: items.filter((item) => item.estado === "Lista para publicar").length,
    published: publishedItems.length,
    progress,
    revenue: publishedItems.reduce((sum, item) => sum + item.metricas.ingresos, 0)
  };
}

function productionMetricCalculations(item: ContentProductionItem) {
  const m = item.metricas;
  return {
    Engagement: pct(m.likes + m.comentarios + m.guardados + m.compartidos, m.alcance),
    "Tasa guardados": pct(m.guardados, m.alcance),
    "Tasa compartidos": pct(m.compartidos, m.alcance),
    CTR: pct(m.clicsBio, m.visitasPerfil),
    Conversión: pct(m.ventas, m.clicsBio)
  };
}

function productionMetricLabel(key: keyof ContentProductionItem["metricas"]) {
  const labels: Record<keyof ContentProductionItem["metricas"], string> = {
    alcance: "Alcance",
    reproducciones: "Reproducciones",
    likes: "Likes",
    comentarios: "Comentarios",
    guardados: "Guardados",
    compartidos: "Compartidos",
    visitasPerfil: "Visitas al perfil",
    nuevosSeguidores: "Nuevos seguidores",
    clicsBio: "Clics al enlace de la bio",
    ventas: "Ventas atribuidas",
    ingresos: "Ingresos generados"
  };
  return labels[key];
}

function studioChecklist(item: ContentProductionItem) {
  return [
    { label: "Hook", done: Boolean(item.hook.trim()) },
    { label: "Guion", done: Boolean(item.guion.trim()) },
    { label: "Copy", done: Boolean(item.copy.trim()) },
    { label: "CTA", done: Boolean(item.cta.trim()) },
    { label: "Diseño", done: Boolean(item.promptImagen.trim() || item.imagenFinal.trim() || item.estructuraVisual.trim()) },
    { label: "Stories", done: Boolean(item.historiasApoyo.trim()) },
    { label: "Programación", done: Boolean(item.fechaProgramada.trim()) }
  ];
}

function extractBrandBookCtas(value = "") {
  const quoted = Array.from(value.matchAll(/"([^"]+)"/g)).map((match) => match[1]);
  return quoted.length ? quoted : value.split("\n").filter((line) => line.trim().length > 12).slice(0, 6);
}

function extractTimeFromNotes(notes: string) {
  return notes.match(/Hora:\s*([0-9]{2}:[0-9]{2})/)?.[1] ?? "";
}

function setTimeInNotes(notes: string, time: string) {
  const clean = notes.replace(/(^|\n)Hora:\s*[0-9]{2}:[0-9]{2}/, "").trim();
  return `${clean}${clean ? "\n" : ""}Hora: ${time}`.trim();
}

function syncPublishedToContent(item: ContentProductionItem, content: ContentItem[], setContent: React.Dispatch<React.SetStateAction<ContentItem[]>>) {
  const synced: ContentItem = {
    id: item.id,
    title: item.titulo,
    topic: item.tema,
    pillar: item.pilar,
    series: item.serie,
    format: item.formato,
    goal: item.objetivo,
    funnel: item.etapaEmbudo,
    hook: item.hook,
    centralIdea: item.ideaCentral,
    script: item.guion,
    copy: item.copy,
    cta: item.cta,
    hashtags: item.hashtags,
    supportStories: item.historiasApoyo,
    pinnedComment: item.comentarioFijado,
    ebookChapter: item.capituloEbook,
    status: item.estado === "Programada" ? "Programado" : "Publicado",
    createdAt: item.fechaCreacion,
    scheduledAt: item.fechaProgramada || item.fechaPublicada,
    publishedAt: item.fechaPublicada || new Date().toISOString().slice(0, 10),
    postUrl: item.enlaceInstagram,
    owner: item.responsable,
    difficulty: item.dificultad,
    priority: item.prioridad,
    notes: item.notas,
    metrics: {
      reach: item.metricas.alcance,
      plays: item.metricas.reproducciones,
      likes: item.metricas.likes,
      comments: item.metricas.comentarios,
      saves: item.metricas.guardados,
      shares: item.metricas.compartidos,
      profileVisits: item.metricas.visitasPerfil,
      newFollowers: item.metricas.nuevosSeguidores,
      linkClicks: item.metricas.clicsBio,
      leads: 0,
      sales: item.metricas.ventas,
      revenue: item.metricas.ingresos,
      adCost: 0
    }
  };
  setContent((current) => {
    const exists = current.some((entry) => entry.id === item.id);
    return exists ? current.map((entry) => (entry.id === item.id ? synced : entry)) : [synced, ...current];
  });
}

function downloadProductionCsv(items: ContentProductionItem[]) {
  downloadCsv("produccion-grr.csv", items.map((item) => ({
    id: item.id,
    numero: item.numero,
    titulo: item.titulo,
    formato: item.formato,
    pilar: item.pilar,
    serie: item.serie,
    objetivo: item.objetivo,
    estado: item.estado,
    prioridad: item.prioridad,
    fecha_programada: item.fechaProgramada,
    fecha_publicada: item.fechaPublicada,
    avance: productionProgress(item),
    alcance: item.metricas.alcance,
    ventas: item.metricas.ventas,
    ingresos: item.metricas.ingresos
  })));
}

function getBrandBookReferences(sections: BrandBookSection[]) {
  const find = (title: string) => sections.find((section) => section.title === title)?.body ?? "No definido.";
  return {
    "Colores oficiales": find("Paleta de Colores").split("\n").filter((line) => line.includes("#")).join("\n"),
    Tipografía: find("Tipografías").slice(0, 420),
    "Tono de voz": find("Voz y Personalidad").slice(0, 420),
    "Palabras recomendadas": find("Palabras Preferidas").slice(0, 420),
    "Palabras prohibidas": find("Palabras Prohibidas"),
    "CTA oficiales": find("CTAs Aprobados").slice(0, 620),
    "Reglas Reels": find("Reglas para Reels").slice(0, 420),
    "Reglas Carruseles": find("Reglas para Carruseles").slice(0, 420),
    Ejemplos: find("Ejemplos de Aplicación").slice(0, 420)
  };
}

function brandBookMarkdown(sections: BrandBookSection[]) {
  return [
    "# Guía Restaurante Rentable — Brand Book",
    "",
    `Exportado: ${new Date().toISOString()}`,
    "",
    ...sections.flatMap((section) => [
      `## ${section.order}. ${section.title}`,
      "",
      `Estado: ${section.approved ? "Aprobada" : "Pendiente"}`,
      `Última edición: ${section.lastEditedAt}`,
      "",
      section.body,
      "",
      section.notes.trim() ? `Notas:\n${section.notes}` : "",
      ""
    ])
  ].join("\n");
}

function brandBookText(sections: BrandBookSection[]) {
  return [
    "GUÍA RESTAURANTE RENTABLE — BRAND BOOK",
    `Exportado: ${new Date().toISOString()}`,
    "",
    ...sections.flatMap((section) => [
      `${section.order}. ${section.title.toUpperCase()}`,
      `Estado: ${section.approved ? "Aprobada" : "Pendiente"}`,
      `Última edición: ${section.lastEditedAt}`,
      "",
      section.body,
      section.notes.trim() ? `\nNotas:\n${section.notes}` : "",
      "\n---\n"
    ])
  ].join("\n");
}

function metricLabel(key: keyof ContentItem["metrics"]) {
  const labels: Record<keyof ContentItem["metrics"], string> = {
    reach: "Alcance",
    plays: "Reproducciones",
    likes: "Likes",
    comments: "Comentarios",
    saves: "Guardados",
    shares: "Compartidos",
    profileVisits: "Visitas al perfil",
    newFollowers: "Nuevos seguidores",
    linkClicks: "Clics al enlace",
    leads: "Leads",
    sales: "Ventas",
    revenue: "Ingresos",
    adCost: "Costo publicitario"
  };
  return labels[key];
}
