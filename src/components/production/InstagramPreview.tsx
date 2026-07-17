"use client";

import { useState } from "react";
import type { StudioGenerationContent } from "@/lib/ai/studioVersions";
import type { ContentProductionItem } from "@/lib/types";

type PreviewMode = "Post" | "Carrusel" | "Story" | "Reel";

export function InstagramPreview({ item, content, onClose }: { item: ContentProductionItem; content?: StudioGenerationContent; onClose: () => void }) {
  const defaultMode: PreviewMode = item.formato === "Carrusel" ? "Carrusel" : item.formato === "Story" || item.formato === "Stories" ? "Story" : item.formato === "Reel" ? "Reel" : "Post";
  const [mode, setMode] = useState<PreviewMode>(defaultMode);
  const fallbackSlides = (item.estructuraVisual || item.hook || item.titulo).split("\n").filter(Boolean);
  const slides = content?.carousel ?? fallbackSlides.map((slide, index) => ({ slide: index + 1, title: index === 0 ? item.hook || item.titulo : slide, body: index === 0 ? item.ideaCentral || item.copy : item.cta }));
  const stories = content?.story ?? [{ frame: 1, headline: item.hook || item.titulo, body: item.historiasApoyo || item.copy, pollQuestion: "", pollOptions: [], cta: item.cta }];

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-navy/70 p-4">
      <div className="mx-auto max-w-5xl rounded-md bg-cream p-5 shadow-editorial">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><p className="text-xs uppercase tracking-[0.24em] text-terracotta">Preview · Instagram</p><h3 className="mt-2 text-2xl font-semibold text-navy">{mode}</h3></div><div className="flex flex-wrap gap-2">{(["Post", "Carrusel", "Story", "Reel"] as PreviewMode[]).map((value) => <button key={value} type="button" className={`focus-ring rounded-md border px-3 py-2 text-sm font-semibold ${mode === value ? "border-gold bg-gold text-navy" : "border-ink/15 text-navy"}`} onClick={() => setMode(value)}>{value}</button>)}<button type="button" className="focus-ring rounded-md border border-ink/15 px-3 py-2" onClick={onClose}>Cerrar</button></div></div>
        {mode === "Post" ? <div className="mx-auto max-w-sm"><article className="overflow-hidden rounded-md border border-ink/10 bg-white shadow-sm"><div className="aspect-square bg-navy p-6 text-white"><p className="text-xs uppercase tracking-[0.2em] text-gold">Guía Restaurante Rentable</p><h4 className="mt-10 text-3xl font-semibold leading-tight">{content?.hook || item.hook || item.titulo}</h4></div><div className="p-4"><p className="whitespace-pre-line text-sm leading-6 text-ink/75">{content?.caption || item.copy}</p><p className="mt-3 text-sm text-navy">{content?.hashtags.join(" ") || item.hashtags}</p></div></article></div> : null}
        {mode === "Carrusel" ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{slides.map((slide, index) => <article key={`${slide.slide}-${index}`} className="aspect-[4/5] rounded-md bg-navy p-5 text-white shadow-sm"><p className="text-xs uppercase tracking-[0.2em] text-gold">Slide {index + 1}</p><h4 className="mt-8 text-2xl font-semibold leading-tight">{slide.title}</h4><p className="mt-5 text-sm leading-6 text-white/70">{slide.body}</p></article>)}</div> : null}
        {mode === "Story" ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{stories.map((story, index) => <article key={`${story.frame}-${index}`} className="aspect-[9/16] max-w-sm rounded-md bg-navy p-5 text-white shadow-sm"><p className="text-xs uppercase tracking-[0.2em] text-gold">Story {index + 1}</p><h4 className="mt-12 text-2xl font-semibold leading-tight">{story.headline}</h4><p className="mt-5 text-sm leading-6 text-white/75">{story.body}</p>{story.pollQuestion ? <div className="mt-6 rounded-md bg-white p-3 text-center text-sm text-navy"><p className="font-semibold">{story.pollQuestion}</p><p className="mt-2 text-xs">{story.pollOptions.join(" · ")}</p></div> : null}<p className="mt-5 text-sm text-gold">{story.cta}</p></article>)}</div> : null}
        {mode === "Reel" ? <div className="mx-auto max-w-sm"><article className="aspect-[9/16] rounded-md bg-navy p-5 text-white shadow-sm"><p className="text-xs uppercase tracking-[0.2em] text-gold">Reel · 9:16</p><h4 className="mt-10 text-2xl font-semibold leading-tight">{content?.reel.hook || item.hook || item.titulo}</h4><p className="mt-5 whitespace-pre-line text-sm leading-6 text-white/75">{content?.reel.onScreenText.join("\n") || item.guion}</p><div className="mt-8 border-t border-gold/30 pt-4"><p className="text-xs uppercase tracking-[0.15em] text-gold">B-roll sugerido</p><p className="mt-2 text-sm text-white/65">{content?.reel.bRoll.join(" · ") || item.promptVideo}</p></div></article></div> : null}
      </div>
    </div>
  );
}
