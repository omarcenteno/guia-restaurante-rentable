export type Pillar =
  | "Antes de abrir"
  | "Finanzas"
  | "Operación"
  | "Menú rentable"
  | "Marketing"
  | "Casos reales"
  | "Plantillas"
  | "Escalabilidad"
  | "Oferta";

export type Format = "Reel" | "Carrusel" | "Story" | "Stories" | "Post" | "Email" | "Blog" | "Lead magnet";
export type Goal = "Alcance" | "Autoridad" | "Conexión" | "Conversión" | "Interacción" | "Comunidad";
export type Funnel = "Descubrimiento" | "Consideración" | "Conversión" | "Retención";
export type Status = "Idea" | "Priorizado" | "Guion" | "Diseño" | "Revisión" | "Programado" | "Publicado" | "Reutilizar";

export type ContentItem = {
  id: string;
  title: string;
  topic: string;
  pillar: Pillar;
  series: string;
  format: Format;
  goal: Goal;
  funnel: Funnel;
  hook: string;
  centralIdea: string;
  script: string;
  copy: string;
  cta: string;
  hashtags: string;
  supportStories: string;
  pinnedComment: string;
  ebookChapter: string;
  status: Status;
  createdAt: string;
  scheduledAt: string;
  publishedAt: string;
  postUrl: string;
  owner: string;
  difficulty: "Baja" | "Media" | "Alta";
  priority: "Baja" | "Media" | "Alta";
  notes: string;
  archived?: boolean;
  metrics: Metrics;
};

export type Metrics = {
  reach: number;
  plays: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  profileVisits: number;
  newFollowers: number;
  linkClicks: number;
  leads: number;
  sales: number;
  revenue: number;
  adCost: number;
};

export type HookItem = {
  id: string;
  text: string;
  category: string;
  pillar: Pillar;
  format: Format;
  funnel: Funnel;
  performance: number;
  used: number;
};

export type ScriptTemplate = {
  id: string;
  name: string;
  format: Format;
  fields: string[];
  structure: string;
};

export type BrandSection = {
  id: string;
  title: string;
  body: string;
};

export type FunnelOffer = {
  id: string;
  title: string;
  body: string;
};

export type BrandBookSection = {
  id: string;
  order: number;
  title: string;
  body: string;
  notes: string;
  approved: boolean;
  lastEditedAt: string;
};

export type ProductionState =
  | "Idea"
  | "Estrategia"
  | "Hook"
  | "Guion"
  | "Copy"
  | "Diseño"
  | "Revisión"
  | "Lista para publicar"
  | "Programada"
  | "Publicada"
  | "Métricas registradas"
  | "Reutilizar";

export type ProductionChecklist = {
  objetivoDefinido: boolean;
  hookAprobado: boolean;
  guionTerminado: boolean;
  copyTerminado: boolean;
  ctaSeleccionado: boolean;
  hashtagsRevisados: boolean;
  disenoTerminado: boolean;
  imagenCreada: boolean;
  videoCreado: boolean;
  identidadVisualRevisada: boolean;
  ortografiaRevisada: boolean;
  fechaProgramada: boolean;
  storiesApoyoCreadas: boolean;
  comentarioFijadoPreparado: boolean;
  enlacePublicacionAgregado: boolean;
  metricasRegistradas: boolean;
};

export type ProductionMetrics = {
  alcance: number;
  reproducciones: number;
  likes: number;
  comentarios: number;
  guardados: number;
  compartidos: number;
  visitasPerfil: number;
  nuevosSeguidores: number;
  clicsBio: number;
  ventas: number;
  ingresos: number;
};

export type ContentProductionItem = {
  id: string;
  numero: number;
  titulo: string;
  tema: string;
  pilar: Pillar;
  serie: string;
  formato: Format;
  objetivo: Goal;
  etapaEmbudo: Funnel;
  estado: ProductionState;
  prioridad: "Alta" | "Media" | "Baja";
  dificultad: "Baja" | "Media" | "Alta";
  capituloEbook: string;
  fechaCreacion: string;
  fechaProgramada: string;
  fechaPublicada: string;
  responsable: string;
  hook: string;
  ideaCentral: string;
  objetivoEstrategico: string;
  audienciaEspecifica: string;
  problemaResuelve: string;
  resultadoEsperado: string;
  kpiPrincipal: string;
  guion: string;
  estructuraVisual: string;
  copy: string;
  cta: string;
  hashtags: string;
  historiasApoyo: string;
  comentarioFijado: string;
  promptImagen: string;
  promptVideo: string;
  notasDiseno: string;
  imagenFinal: string;
  estadoDiseno: string;
  enlaceInstagram: string;
  notas: string;
  checklist: ProductionChecklist;
  metricas: ProductionMetrics;
  archived?: boolean;
};

export type ViewId = "dashboard" | "content" | "calendar" | "production" | "brandBook" | "brand" | "hooks" | "templates" | "analytics" | "funnel";
