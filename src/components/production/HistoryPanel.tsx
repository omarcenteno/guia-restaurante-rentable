export type HistoryEntry = { id: string; savedAt: string; summary: string };

export function HistoryPanel({ entries }: { entries: HistoryEntry[] }) {
  return (
    <div className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-navy">Historial de cambios</h3>
      {entries.length ? <div className="mt-3 grid gap-2">{entries.slice(0, 12).map((entry) => <div key={entry.id} className="border-t border-ink/10 pt-2 text-xs"><p className="font-semibold text-navy">{new Date(entry.savedAt).toLocaleString("es-ES")}</p><p className="mt-1 text-ink/60">{entry.summary}</p></div>)}</div> : <p className="mt-3 text-sm text-ink/60">Los guardados aparecerán aquí.</p>}
    </div>
  );
}
