import type { ReactNode } from "react";
import { IconDoc, IconPlus } from "./ui/icons";

export function EmptyState({ onNew, onSample, importButton }: { onNew: () => void; onSample: () => void; importButton: ReactNode }) {
  return (
    <div className="m-auto max-w-sm text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-card bg-zinc-100 text-zinc-500 [&_svg]:size-6"><IconDoc /></div>
      <h2 className="title mt-4">Create your resume</h2>
      <p className="mt-1 text-sm text-zinc-500">Import your existing CV, start from scratch, or open a filled-in sample.</p>
      <div className="mt-5 flex justify-center gap-2">
        <button className="btn" onClick={onSample}>Open sample</button>
        {importButton}
        <button className="btn-primary" onClick={onNew}><IconPlus /> New resume</button>
      </div>
    </div>
  );
}
