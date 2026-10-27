import { Popover } from "@base-ui/react/popover";
import { HexColorInput, HexColorPicker } from "react-colorful";

const ACCENTS = ["#1f4e79", "#0f766e", "#15803d", "#b45309", "#b91c1c", "#be185d", "#6d28d9", "#334155"];

// Preset swatches plus a custom color popover (react-colorful) with a hex field.
export function AccentPicker({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const custom = !ACCENTS.includes(value.toLowerCase());
  const ring = "ring-2 ring-zinc-900 ring-offset-2";
  return (
    <div className="flex items-center gap-1.5 px-1.5">
      {ACCENTS.map((c) => (
        <button
          key={c}
          aria-label={`Accent ${c}`}
          title={c}
          onClick={() => onChange(c)}
          className={`size-5 rounded-full transition-transform duration-150 ease-out active:scale-90 ${value.toLowerCase() === c ? ring : ""}`}
          style={{ background: c }}
        />
      ))}
      <Popover.Root>
        <Popover.Trigger
          aria-label="Custom color"
          title="Custom color"
          className={`size-5 rounded-full transition-transform duration-150 ease-out active:scale-90 ${custom ? ring : "bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]"}`}
          style={custom ? { background: value } : undefined}
        />
        <Popover.Portal>
          <Popover.Positioner sideOffset={12} className="z-50">
            <Popover.Popup className="w-56 space-y-3 rounded-card border border-zinc-200 bg-white p-3 shadow-float outline-none origin-(--transform-origin) transition-[scale,opacity] duration-150 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
              <HexColorPicker color={value} onChange={onChange} className="accent-picker" />
              <label className="flex items-center gap-3">
                <span className="label">Hex</span>
                <HexColorInput color={value} onChange={onChange} prefixed className="input font-mono uppercase" aria-label="Hex color" />
              </label>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
