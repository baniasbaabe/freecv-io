import type { ReactNode } from "react";
import type { View } from "../hooks/useStore";
import { IconDoc, IconGear, IconMail, IconPlus } from "./ui/icons";

function DocList({ title, icon, items, onAdd, active, kind, onPick, actions }: { title: string; icon: ReactNode; items: { id: string; name: string }[]; onAdd: () => void; active: View; kind: "resume" | "letter"; onPick: (v: View) => void; actions?: ReactNode }) {
  return (
    <div>
      <div className="label mb-1 flex items-center justify-between px-2">
        {title}
        <span className="ml-auto" />
        {actions}
        <button className="btn-icon size-6" onClick={onAdd} aria-label={`New ${kind}`} title={`New ${kind}`}>
          <IconPlus />
        </button>
      </div>
      {items.length === 0 && <div className="hint px-2 py-1">None yet</div>}
      {items.map((d) => {
        const on = active.kind === kind && active.id === d.id;
        return (
          <button
            key={d.id}
            onClick={() => onPick({ kind, id: d.id })}
            className={`flex w-full items-center gap-2 truncate rounded-control px-2 py-1.5 text-left ${on ? "bg-white font-medium text-zinc-900 shadow-card ring-1 ring-zinc-200" : "text-zinc-600 hover:bg-zinc-200/50"}`}
          >
            <span className="shrink-0 text-zinc-400">{icon}</span>
            <span className="truncate">{d.name || "Untitled"}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Sidebar({ resumes, letters, view, onPick, onNewResume, onNewLetter, needsKey, importButton }: { resumes: { id: string; name: string }[]; letters: { id: string; name: string }[]; view: View; onPick: (v: View) => void; onNewResume: () => void; onNewLetter: () => void; needsKey: boolean; importButton: ReactNode }) {
  return (
    <nav className="flex w-60 shrink-0 flex-col gap-5 border-r border-zinc-200/80 bg-zinc-50/70 p-3 text-sm">
      <div className="flex items-center gap-2 px-2 pt-1">
        <div className="grid size-7 place-items-center rounded-control bg-zinc-900 text-xs font-bold text-white">CV</div>
        <span className="heading">FreeCV</span>
      </div>
      <DocList title="Resumes" icon={<IconDoc />} onAdd={onNewResume} items={resumes} active={view} kind="resume" onPick={onPick} actions={importButton} />
      <DocList title="Cover letters" icon={<IconMail />} onAdd={onNewLetter} items={letters} active={view} kind="letter" onPick={onPick} />
      <button
        className={`mt-auto flex items-center gap-2 rounded-control px-2 py-1.5 text-left text-zinc-700 hover:bg-zinc-200/50 ${view.kind === "settings" ? "bg-zinc-200/60 font-medium text-zinc-900" : ""}`}
        onClick={() => onPick({ kind: "settings" })}
      >
        <IconGear /> Settings
        {needsKey && <span className="chip ml-auto bg-amber-100 text-amber-800">Add key</span>}
      </button>
    </nav>
  );
}
