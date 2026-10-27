import { Section } from "../../components/ui/Section";
import { IconPlus, IconX } from "../../components/ui/icons";
import type { Link } from "../../lib/data";

export function LinksEditor({ links, onChange }: { links: Link[]; onChange: (l: Link[]) => void }) {
  const update = (i: number, l: Link) => onChange(links.map((x, j) => (j === i ? l : x)));
  return (
    <Section title="Links" action={<button className="btn" onClick={() => onChange([...links, { label: "", url: "" }])}><IconPlus /> Add link</button>}>
      {links.length === 0 && <p className="hint">Add LinkedIn, GitHub, a portfolio or any other profile.</p>}
      {links.length > 0 && (
        <div className="label flex gap-2">
          <span className="w-36">Label (optional)</span>
          <span>URL</span>
        </div>
      )}
      {links.map((l, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-36 shrink-0"><input className="input" aria-label="Link label" value={l.label} placeholder="e.g. GitHub" onChange={(e) => update(i, { ...l, label: e.target.value })} /></div>
          <div className="min-w-0 flex-1"><input className="input" aria-label="Link URL" value={l.url} placeholder="linkedin.com/in/you" onChange={(e) => update(i, { ...l, url: e.target.value })} /></div>
          <button className="btn-icon size-9" aria-label="Remove link" onClick={() => onChange(links.filter((_, j) => j !== i))}><IconX /></button>
        </div>
      ))}
    </Section>
  );
}
