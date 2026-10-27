import { Select } from "@base-ui/react/select";
import { IconCaretUpDown, IconCheck } from "./icons";

// Styled select on Base UI: consistent across WebKitGTK, WebView2 and WKWebView, unlike the native <select>.
export function Pick({ label, value, items, onChange }: { label: string; value: string; items: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <Select.Root items={items} value={value} onValueChange={(v) => onChange(v as string)}>
      <Select.Label className="label mb-1">{label}</Select.Label>
      <Select.Trigger className="input flex items-center justify-between gap-2 text-left data-popup-open:border-zinc-300 data-popup-open:bg-white">
        <Select.Value className="truncate" />
        <Select.Icon className="shrink-0 text-zinc-400">
          <IconCaretUpDown size={14} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="z-50 outline-none" sideOffset={6} alignItemWithTrigger={false}>
          {/* Solid, not blurred: backdrop-filter over a scrolling list is slow in WebKitGTK (Linux). */}
          <Select.Popup className="max-h-[min(var(--available-height),20rem)] min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto overscroll-contain rounded-control border border-zinc-200 bg-white p-1 shadow-float outline-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
            {items.map((it) => (
              <Select.Item key={it.value} value={it.value} className="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-chip py-1.5 pr-3 pl-2 text-sm outline-none select-none data-highlighted:bg-zinc-100">
                <Select.ItemIndicator className="col-start-1 text-zinc-900"><IconCheck size={14} /></Select.ItemIndicator>
                <Select.ItemText className="col-start-2">{it.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
