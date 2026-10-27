import type { ReactNode } from "react";

export function DocHeader({ name, onName, children }: { name: string; onName: (v: string) => void; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1 px-5 pt-4 pb-3">
      <input
        className="title min-w-0 flex-1 rounded-control bg-transparent px-1 py-1 outline-none hover:bg-zinc-50 focus:bg-zinc-50"
        value={name}
        onChange={(e) => onName(e.target.value)}
        aria-label="Document name"
      />
      {children}
    </div>
  );
}
