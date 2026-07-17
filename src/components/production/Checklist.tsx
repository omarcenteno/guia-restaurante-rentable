export type ChecklistItem = { id: string; label: string; done: boolean };

export function Checklist({ items, onToggle }: { items: ChecklistItem[]; onToggle: (id: string, done: boolean) => void }) {
  const completed = items.filter((item) => item.done).length;
  const percentage = Math.round((completed / Math.max(1, items.length)) * 100);
  return (
    <div className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex justify-between text-sm"><span className="font-semibold text-navy">Checklist</span><span>{percentage}%</span></div>
      <div className="mt-3 h-2 rounded-full bg-cream"><div className="h-2 rounded-full bg-gold transition-all" style={{ width: `${percentage}%` }} /></div>
      <div className="mt-3 grid gap-2">
        {items.map((item) => <label key={item.id} className="flex items-center gap-2 rounded-md bg-cream px-3 py-2 text-sm"><input type="checkbox" checked={item.done} onChange={(event) => onToggle(item.id, event.target.checked)} />{item.done ? "✓ " : ""}{item.label}</label>)}
      </div>
    </div>
  );
}
