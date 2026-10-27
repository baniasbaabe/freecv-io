import { Tabs } from "@base-ui/react/tabs";
import type { ReactNode } from "react";

// Base UI Tabs give arrow-key navigation and roving focus; the indicator slides between tabs.
export function Segmented<T extends string>({ items, value, onChange }: { items: [T, ReactNode][]; value: T; onChange: (t: T) => void }) {
  return (
    <Tabs.Root value={value} onValueChange={(v) => onChange(v as T)}>
      <Tabs.List className="relative z-0 flex gap-1 rounded-control bg-zinc-100 p-1">
        {items.map(([id, label]) => (
          <Tabs.Tab
            key={id}
            value={id}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-chip px-2 py-1.5 text-sm whitespace-nowrap text-zinc-500 outline-none select-none hover:text-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-400 data-active:font-medium data-active:text-zinc-900"
          >
            {label}
          </Tabs.Tab>
        ))}
        <Tabs.Indicator className="absolute top-(--active-tab-top) left-0 -z-1 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) rounded-chip bg-white shadow-card transition-[translate,width] duration-200 ease-out-strong" />
      </Tabs.List>
    </Tabs.Root>
  );
}
