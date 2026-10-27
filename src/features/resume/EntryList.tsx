import { useState } from "react";
import { Field } from "../../components/ui/Field";
import { Section } from "../../components/ui/Section";
import { IconArrowDown, IconArrowUp, IconCaretDown, IconPlus } from "../../components/ui/icons";
import { dates, emptyEntry, type Entry } from "../../lib/data";

export function EntryList({ title, titleLabel, orgLabel, items, onChange }: { title: string; titleLabel: string; orgLabel: string; items: Entry[]; onChange: (e: Entry[]) => void }) {
  const update = (i: number, e: Entry) => onChange(items.map((x, j) => (j === i ? e : x)));
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <Section title={title} action={<button className="btn" onClick={() => onChange([...items, emptyEntry()])}><IconPlus /> Add</button>}>
      {items.map((e, i) => (
        <EntryCard
          key={i}
          e={e}
          titleLabel={titleLabel}
          orgLabel={orgLabel}
          onChange={(v) => update(i, v)}
          onUp={i > 0 ? () => move(i, -1) : undefined}
          onDown={i < items.length - 1 ? () => move(i, 1) : undefined}
          onRemove={() => onChange(items.filter((_, j) => j !== i))}
        />
      ))}
    </Section>
  );
}

function EntryCard({ e, titleLabel, orgLabel, onChange, onUp, onDown, onRemove }: { e: Entry; titleLabel: string; orgLabel: string; onChange: (e: Entry) => void; onUp?: () => void; onDown?: () => void; onRemove: () => void }) {
  // Open state is decided once at mount (new, empty entries start open) so typing a title doesn't collapse the card.
  const [open, setOpen] = useState(() => !e.title && !e.org);
  return (
    <details open={open} onToggle={(ev) => setOpen(ev.currentTarget.open)} className="group rounded-card border border-zinc-200 bg-white open:shadow-card">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 select-none [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{[e.title, e.org].filter(Boolean).join(" at ") || "(Not specified)"}</div>
          <div className="hint">{dates(e) || "No dates"}</div>
        </div>
        <IconCaretDown className="size-4 shrink-0 text-zinc-400 transition-transform duration-200 ease-out group-open:rotate-180" />
      </summary>
      <div className="space-y-3 border-t border-zinc-100 px-4 pt-3 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label={titleLabel} value={e.title} onChange={(v) => onChange({ ...e, title: v })} />
          <Field label={orgLabel} value={e.org} onChange={(v) => onChange({ ...e, org: v })} />
          <Field label="Start" value={e.start} placeholder="MM/YYYY" onChange={(v) => onChange({ ...e, start: v })} />
          <Field label="End" value={e.end} placeholder="Present" onChange={(v) => onChange({ ...e, end: v })} />
        </div>
        <Field label="Location" value={e.location} onChange={(v) => onChange({ ...e, location: v })} />
        <Field label="Achievements (one bullet per line)" area rows={4} value={e.details} onChange={(v) => onChange({ ...e, details: v })} />
        <div className="flex gap-1">
          <button className="btn-icon" disabled={!onUp} onClick={onUp} aria-label="Move up"><IconArrowUp /></button>
          <button className="btn-icon" disabled={!onDown} onClick={onDown} aria-label="Move down"><IconArrowDown /></button>
          <button className="btn-ghost ml-auto hover:text-red-600" onClick={onRemove}>Remove</button>
        </div>
      </div>
    </details>
  );
}
