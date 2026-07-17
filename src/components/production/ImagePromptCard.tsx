"use client";

import { useEffect, useMemo, useState } from "react";
import { IMAGE_PROVIDERS, IMAGE_TEMPLATES, type ImagePromptRecord, type ImageProvider, type ImageTemplateName } from "@/lib/images";

export function ImagePromptCard({ prompts, onRegenerate }: { prompts: ImagePromptRecord[]; onRegenerate: (template: ImageTemplateName) => void }) {
  const [provider, setProvider] = useState<ImageProvider>("gpt-image");
  const [template, setTemplate] = useState<ImageTemplateName>(prompts[0]?.template ?? "Premium");
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const current = useMemo(() => prompts.find((prompt) => prompt.provider === provider) ?? prompts[0], [prompts, provider]);

  useEffect(() => {
    if (current?.template) setTemplate(current.template);
  }, [current?.template]);

  const copyPrompt = async () => {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(current.prompt);
      setMessage("Prompt copiado.");
    } catch {
      setMessage("No fue posible copiar. Revisa los permisos del navegador.");
    }
  };

  if (!current) return null;

  return (
    <section id="image-prompt-card" className="rounded-md border border-ink/10 bg-white p-4 shadow-sm" data-testid="image-prompt-card">
      <div className="flex flex-col justify-between gap-3 2xl:flex-row 2xl:items-start"><div><p className="text-xs uppercase tracking-[0.2em] text-terracotta">Motor visual</p><h3 className="mt-1 text-xl font-semibold text-navy">Prompt de imagen</h3><p className="mt-1 text-xs text-ink/50">Versión {current.variation} · {new Date(current.createdAt).toLocaleString("es-ES")}</p></div><div className="flex flex-wrap gap-2"><button type="button" className="focus-ring rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold text-navy" onClick={copyPrompt}>Copiar</button><button type="button" className="focus-ring rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold text-navy" onClick={() => setExpanded((value) => !value)}>{expanded ? "Contraer" : "Expandir"}</button><button type="button" className="focus-ring rounded-md bg-gold px-3 py-2 text-sm font-semibold text-navy" onClick={() => onRegenerate(template)}>Regenerar Prompt</button></div></div>
      <div className="mt-4 grid gap-3 xl:grid-cols-3"><label className="text-sm font-semibold text-navy">Proveedor<select className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 bg-white px-3" value={provider} onChange={(event) => setProvider(event.target.value as ImageProvider)}>{IMAGE_PROVIDERS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label className="text-sm font-semibold text-navy">Estilo<select className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink/15 bg-white px-3" value={template} onChange={(event) => setTemplate(event.target.value as ImageTemplateName)}>{(Object.keys(IMAGE_TEMPLATES) as ImageTemplateName[]).map((name) => <option key={name}>{name}</option>)}</select></label><div className="text-sm font-semibold text-navy">Aspect Ratio<div className="mt-2 flex min-h-11 items-center rounded-md border border-ink/15 px-3 font-normal text-ink">{current.aspectRatio}</div></div></div>
      <label className="mt-4 block text-sm font-semibold text-navy">Prompt<textarea readOnly aria-label="Prompt visual" className={`focus-ring mt-2 w-full rounded-md border border-ink/15 bg-cream p-4 font-normal leading-7 text-ink ${expanded ? "min-h-96" : "min-h-40"}`} value={current.prompt} /></label>
      {expanded ? <div className="mt-4 grid gap-3 text-sm md:grid-cols-2"><div className="border-t border-ink/10 pt-3"><p className="font-semibold text-navy">Negative Prompt</p><p className="mt-1 leading-6 text-ink/65">{current.negativePrompt}</p></div><div className="border-t border-ink/10 pt-3"><p className="font-semibold text-navy">Safe Area</p><p className="mt-1 leading-6 text-ink/65">{current.safeArea}</p></div><div className="border-t border-ink/10 pt-3"><p className="font-semibold text-navy">Composición</p><p className="mt-1 leading-6 text-ink/65">{current.composition}</p></div><div className="border-t border-ink/10 pt-3"><p className="font-semibold text-navy">Iluminación</p><p className="mt-1 leading-6 text-ink/65">{current.lighting}</p></div></div> : null}
      {message ? <p className="mt-3 text-sm text-ink/60" role="status">{message}</p> : null}
    </section>
  );
}
