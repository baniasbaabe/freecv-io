import { useRef, useState } from "react";
import { IconArrowDown, IconArrowUp, IconDrag } from "../../components/ui/icons";
import { SECTIONS, sectionOrder, type Resume } from "../../lib/data";

// Reorders resume sections by dragging the handle (pointer events, not HTML5 drag, so it also works in the Tauri webview) or with the arrows.
export function SectionOrder({ r, set }: { r: Resume; set: (r: Resume) => void }) {
  const order = sectionOrder(r);
  const list = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState<number>();
  const latest = useRef({ r, order });
  latest.current = { r, order };
  const reorder = (from: number, to: number) => {
    const next = [...latest.current.order];
    next.splice(to, 0, ...next.splice(from, 1));
    set({ ...latest.current.r, order: next });
  };
  const startDrag = (from: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    let cur = from;
    setActive(cur);
    const onMove = (ev: PointerEvent) => {
      const rows = [...(list.current?.children ?? [])] as HTMLElement[];
      // Target slot = how many of the other rows have their midpoint above the pointer.
      const target = rows.filter((row, i) => {
        if (i === cur) return false;
        const b = row.getBoundingClientRect();
        return ev.clientY > b.top + b.height / 2;
      }).length;
      if (target !== cur) (reorder(cur, target), (cur = target), setActive(cur));
    };
    const stop = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      setActive(undefined);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  };
  return (
    <ul ref={list} className="divide-y divide-zinc-100 rounded-card border border-zinc-200 bg-white">
      {order.map((id, i) => (
        <li key={id} className={`flex items-center gap-1 px-2 py-1 text-sm ${active === i ? "bg-zinc-100 shadow-card" : ""}`}>
          <span className="btn-icon cursor-grab touch-none active:cursor-grabbing" onPointerDown={startDrag(i)} aria-hidden="true" title="Drag to reorder"><IconDrag /></span>
          <span className="flex-1">{SECTIONS[id]}</span>
          <button className="btn-icon" disabled={i === 0} onClick={() => reorder(i, i - 1)} aria-label={`Move ${SECTIONS[id]} up`}><IconArrowUp /></button>
          <button className="btn-icon" disabled={i === order.length - 1} onClick={() => reorder(i, i + 1)} aria-label={`Move ${SECTIONS[id]} down`}><IconArrowDown /></button>
        </li>
      ))}
    </ul>
  );
}
