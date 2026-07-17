import type { ReactNode } from "react";

export function EditorSection({ title, open, onToggle, meta, children }: { title: string; open: boolean; onToggle: () => void; meta?: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-ink/10 bg-white shadow-sm">
      <button type="button" className="focus-ring flex w-full items-center justify-between px-4 py-4 text-left" onClick={onToggle} aria-expanded={open}>
        <span className="text-lg font-semibold text-navy">{title}</span>
        <span className="flex items-center gap-3 text-xs text-ink/55"><span>{meta}</span><span aria-hidden="true">{open ? "−" : "+"}</span></span>
      </button>
      {open ? <div className="border-t border-ink/10 p-4">{children}</div> : null}
    </section>
  );
}
