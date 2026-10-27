import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconDownload } from "./ui/icons";

export function Preview({ title, toolbar, children }: { title: string; toolbar: ReactNode; children: ReactNode }) {
  const download = () => {
    // The print dialog uses document.title as the default PDF file name.
    const prev = document.title;
    document.title = title;
    window.print();
    document.title = prev;
  };
  return (
    <section className="min-w-0 flex-1 overflow-auto bg-zinc-100">
      {/* Translucent toolbar floats over the page as it scrolls underneath. */}
      <div className="sticky top-0 z-10 flex justify-center px-5 pt-4 pb-3">
        <div className="glass flex items-center gap-1 rounded-card border border-white/70 bg-white/70 p-1.5 shadow-float backdrop-blur-xl backdrop-saturate-150">
          {toolbar}
          <span className="mx-1 h-5 w-px bg-zinc-300/70" />
          <button className="btn-primary" onClick={download} title="Download PDF (Ctrl/⌘+P)">
            <IconDownload /> Download PDF
          </button>
        </div>
      </div>
      <div className="px-6 pt-1 pb-12">
        <div className="mx-auto w-fit shadow-paper [zoom:0.72] [&_a]:pointer-events-none">{children}</div>
      </div>
      {createPortal(<div id="print-area">{children}</div>, document.body)}
    </section>
  );
}
