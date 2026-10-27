import NumberFlow from "@number-flow/react";
import type { ReactNode } from "react";
import type { Fix } from "../../lib/data";

export function Score({ value }: { value: number }) {
  // Score comes from the LLM; clamp it before it drives the ring geometry.
  const v = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  const c = 2 * Math.PI * 26;
  const color = v >= 80 ? "text-emerald-500" : v >= 60 ? "text-amber-500" : "text-red-500";
  return (
    <div className="relative size-16 shrink-0">
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
        <circle cx="32" cy="32" r="26" fill="none" strokeWidth="6" className="stroke-zinc-200" />
        <circle cx="32" cy="32" r="26" fill="none" strokeWidth="6" strokeLinecap="round" stroke="currentColor" className={color} strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-lg font-semibold"><NumberFlow value={v} /></div>
    </div>
  );
}

export function ResultCard({ score, summary, checkedAt, children }: { score: number; summary: string; checkedAt: string; children: ReactNode }) {
  return (
    <div className="space-y-5 rounded-card border border-zinc-200 p-4 shadow-card">
      <div className="flex items-center gap-4">
        <Score value={score} />
        <div>
          <p className="text-sm text-zinc-700">{summary}</p>
          <p className="hint mt-1">Checked {new Date(checkedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}. Run again after editing.</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export const List = ({ title, items }: { title: string; items?: string[] }) =>
  items?.length ? (
    <div>
      <h3 className="subheading mb-1.5">{title}</h3>
      <ul className="space-y-1.5 text-sm text-zinc-700">
        {items.map((x, i) => (
          <li key={i} className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-zinc-400" />{x}</li>
        ))}
      </ul>
    </div>
  ) : null;

export const Chips = ({ title, items, cls }: { title: string; items?: string[]; cls: string }) =>
  items?.length ? (
    <div>
      <h3 className="subheading mb-1.5">{title}</h3>
      <div className="flex flex-wrap gap-1.5">{items.map((k) => <span key={k} className={`chip ${cls}`}>{k}</span>)}</div>
    </div>
  ) : null;

const SEVERITY = { high: "bg-red-100 text-red-700", medium: "bg-amber-100 text-amber-800", low: "bg-zinc-100 text-zinc-600" };

// Before/after edits in git-diff style, shared by ATS check and Job match.
export const Fixes = ({ items }: { items?: Fix[] }) =>
  items?.length ? (
    <div className="space-y-3">
      <h3 className="subheading">Suggested fixes</h3>
      {items.map((x, i) => (
        <div key={i} className="overflow-hidden rounded-control border border-zinc-200 text-sm">
          <div className="flex items-center gap-2 px-3 py-2">
            {x.severity && <span className={`chip capitalize ${SEVERITY[x.severity] ?? SEVERITY.low}`}>{x.severity}</span>}
            <span className="font-medium">{x.section}</span>
          </div>
          {x.problem && x.problem !== "(missing)" && <div className="flex gap-2 bg-red-50 px-3 py-1.5 text-red-800"><span className="font-mono">−</span>{x.problem}</div>}
          <div className="flex gap-2 bg-emerald-50 px-3 py-1.5 text-emerald-800"><span className="font-mono">+</span>{x.fix}</div>
        </div>
      ))}
    </div>
  ) : null;
