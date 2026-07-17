"use client";

import { useState } from "react";
import type { StudioGenerationContent } from "@/lib/ai/studioVersions";
import { CharacterCounter } from "./CharacterCounter";
import { EditorSection } from "./EditorSection";

type SectionKey = "title" | "hook" | "caption" | "cta" | "hashtags" | "story" | "carousel" | "reel" | "blog";

const platformLimits = [
  { name: "Instagram", ideal: 1800, max: 2200 },
  { name: "Facebook", ideal: 500, max: 63206 },
  { name: "LinkedIn", ideal: 1500, max: 3000 },
  { name: "X", ideal: 240, max: 280 },
  { name: "Threads", ideal: 400, max: 500 }
] as const;

function PlatformCounters({ value }: { value: string }) {
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
      {platformLimits.map((platform) => {
        const state = value.length > platform.max ? "❌ Excede límite" : value.length > platform.ideal ? "⚠ Muy largo" : "✔ Ideal";
        const color = value.length > platform.max ? "text-terracotta" : value.length > platform.ideal ? "text-ink/60" : "text-navy";
        return <div key={platform.name} className="border-t border-ink/10 pt-2 text-xs"><p className="font-semibold text-navy">{platform.name}</p><p className={color}>{state}</p><p className="text-ink/45">{value.length.toLocaleString("es-ES")} / {platform.max.toLocaleString("es-ES")}</p></div>;
      })}
    </div>
  );
}

export function ProfessionalEditor({ content, onChange }: { content: StudioGenerationContent; onChange: (content: StudioGenerationContent) => void }) {
  const [hashtagDraft, setHashtagDraft] = useState("");
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({ title: true, hook: true, caption: true, cta: true, hashtags: true, story: false, carousel: false, reel: false, blog: false });
  const toggle = (key: SectionKey) => setOpen((current) => ({ ...current, [key]: !current[key] }));
  const update = <K extends keyof StudioGenerationContent>(key: K, value: StudioGenerationContent[K]) => onChange({ ...content, [key]: value });
  const addHashtags = () => {
    const additions = hashtagDraft.split(/[\s,]+/).map((tag) => tag.trim()).filter(Boolean).map((tag) => tag.startsWith("#") ? tag : `#${tag}`);
    const seen = new Set<string>();
    const next = [...content.hashtags, ...additions].filter((tag) => {
      const normalized = tag.toLocaleLowerCase("es");
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    }).slice(0, 10);
    update("hashtags", next);
    setHashtagDraft("");
  };

  return (
    <>
      <EditorSection title="Título" open={open.title} onToggle={() => toggle("title")}>
        <input aria-label="Título generado" className="focus-ring min-h-12 w-full rounded-md border border-ink/15 bg-white px-4 text-xl font-semibold text-navy" value={content.title} onChange={(event) => update("title", event.target.value)} />
      </EditorSection>
      <EditorSection title="Hook" open={open.hook} onToggle={() => toggle("hook")} meta={`${content.hook.length} caracteres`}>
        <textarea aria-label="Hook generado" className="focus-ring min-h-36 w-full rounded-md border border-ink/15 bg-white p-4 text-xl leading-8" value={content.hook} onChange={(event) => update("hook", event.target.value)} />
      </EditorSection>
      <EditorSection title="Caption" open={open.caption} onToggle={() => toggle("caption")}>
        <textarea aria-label="Caption generado" className="focus-ring min-h-72 w-full rounded-md border border-ink/15 bg-white p-4 leading-7" value={content.caption} onChange={(event) => update("caption", event.target.value)} />
        <CharacterCounter value={content.caption} />
        <PlatformCounters value={content.caption} />
      </EditorSection>
      <EditorSection title="CTA" open={open.cta} onToggle={() => toggle("cta")}>
        <textarea className="focus-ring min-h-28 w-full rounded-md border border-ink/15 bg-white p-4 leading-7" value={content.cta} onChange={(event) => update("cta", event.target.value)} />
      </EditorSection>
      <EditorSection title="Hashtags" open={open.hashtags} onToggle={() => toggle("hashtags")} meta={`${content.hashtags.length} / 10`}>
        <div className="flex flex-wrap gap-2">{content.hashtags.map((tag) => <button key={tag.toLocaleLowerCase("es")} type="button" className="focus-ring rounded-md border border-ink/15 px-2 py-1 text-sm text-navy" title={`Eliminar ${tag}`} onClick={() => update("hashtags", content.hashtags.filter((value) => value !== tag))}>{tag} ×</button>)}</div>
        <div className="mt-3 flex gap-2"><input className="focus-ring min-h-11 min-w-0 flex-1 rounded-md border border-ink/15 px-3" value={hashtagDraft} onChange={(event) => setHashtagDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addHashtags(); } }} placeholder="#foodcost" /><button type="button" className="focus-ring rounded-md border border-gold/50 px-3 py-2 text-sm font-semibold text-navy" onClick={addHashtags}>Agregar</button></div>
      </EditorSection>
      <EditorSection title="Story" open={open.story} onToggle={() => toggle("story")} meta="3 historias">
        <div className="grid gap-5">{content.story.map((frame, index) => <div key={frame.frame} className="border-t border-ink/10 pt-4"><p className="mb-3 text-sm font-semibold text-navy">Story {index + 1}</p><div className="grid gap-3"><input className="focus-ring min-h-11 rounded-md border border-ink/15 px-3" value={frame.headline} onChange={(event) => update("story", content.story.map((item, itemIndex) => itemIndex === index ? { ...item, headline: event.target.value } : item))} placeholder="Título" /><textarea className="focus-ring min-h-24 rounded-md border border-ink/15 p-3" value={frame.body} onChange={(event) => update("story", content.story.map((item, itemIndex) => itemIndex === index ? { ...item, body: event.target.value } : item))} placeholder="Contenido" /><input className="focus-ring min-h-11 rounded-md border border-ink/15 px-3" value={frame.pollQuestion} onChange={(event) => update("story", content.story.map((item, itemIndex) => itemIndex === index ? { ...item, pollQuestion: event.target.value } : item))} placeholder="Pregunta de encuesta" /><input className="focus-ring min-h-11 rounded-md border border-ink/15 px-3" value={frame.pollOptions.join(" / ")} onChange={(event) => update("story", content.story.map((item, itemIndex) => itemIndex === index ? { ...item, pollOptions: event.target.value.split("/").map((value) => value.trim()).filter(Boolean).slice(0, 2) } : item))} placeholder="Opción 1 / Opción 2" /></div></div>)}</div>
      </EditorSection>
      <EditorSection title="Carrusel" open={open.carousel} onToggle={() => toggle("carousel")} meta={`${content.carousel.length} slides`}>
        <div className="grid gap-4">{content.carousel.map((slide, index) => <div key={slide.slide} className="grid gap-2 border-t border-ink/10 pt-4"><p className="text-sm font-semibold text-navy">Slide {index + 1}</p><input className="focus-ring min-h-11 rounded-md border border-ink/15 px-3" value={slide.title} onChange={(event) => update("carousel", content.carousel.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} /><textarea className="focus-ring min-h-24 rounded-md border border-ink/15 p-3" value={slide.body} onChange={(event) => update("carousel", content.carousel.map((item, itemIndex) => itemIndex === index ? { ...item, body: event.target.value } : item))} /></div>)}</div>
      </EditorSection>
      <EditorSection title="Reel" open={open.reel} onToggle={() => toggle("reel")}>
        <div className="grid gap-3"><textarea className="focus-ring min-h-24 rounded-md border border-ink/15 p-3" value={content.reel.hook} onChange={(event) => update("reel", { ...content.reel, hook: event.target.value })} placeholder="Hook" /><textarea className="focus-ring min-h-56 rounded-md border border-ink/15 p-3" value={content.reel.script} onChange={(event) => update("reel", { ...content.reel, script: event.target.value })} placeholder="Guion" /><textarea className="focus-ring min-h-28 rounded-md border border-ink/15 p-3" value={content.reel.onScreenText.join("\n")} onChange={(event) => update("reel", { ...content.reel, onScreenText: event.target.value.split("\n") })} placeholder="Texto en pantalla, una línea por toma" /><textarea className="focus-ring min-h-28 rounded-md border border-ink/15 p-3" value={content.reel.bRoll.join("\n")} onChange={(event) => update("reel", { ...content.reel, bRoll: event.target.value.split("\n") })} placeholder="B-roll, una toma por línea" /><textarea className="focus-ring min-h-24 rounded-md border border-ink/15 p-3" value={content.reel.cta} onChange={(event) => update("reel", { ...content.reel, cta: event.target.value })} placeholder="CTA" /></div>
      </EditorSection>
      <EditorSection title="Blog" open={open.blog} onToggle={() => toggle("blog")} meta={content.blog ? `${content.blog.trim().split(/\s+/).filter(Boolean).length} palabras` : "Sin contenido"}>
        <textarea className="focus-ring min-h-96 w-full rounded-md border border-ink/15 bg-white p-4 leading-7" value={content.blog} onChange={(event) => update("blog", event.target.value)} placeholder="Artículo de 600 a 1000 palabras" />
      </EditorSection>
    </>
  );
}
