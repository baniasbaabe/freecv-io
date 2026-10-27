import { useEffect, useRef } from "react";
import { IconX } from "../../components/ui/icons";
import type { Resume } from "../../lib/data";
import { RESUME_TEMPLATES, ResumeDoc } from "../../templates/resume";

// Placeholder portrait so photo templates read as such in the gallery before the user uploads one.
const SILHOUETTE =
  "data:image/svg+xml," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#d4d4d8"/><circle cx="50" cy="40" r="18" fill="#a1a1aa"/><path d="M14 100c4-22 18-32 36-32s32 10 36 32z" fill="#a1a1aa"/></svg>');

export function TemplateGallery({ r, onPick, onClose }: { r: Resume; onPick: (t: Resume["template"]) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  // showModal gives focus trapping, Esc to close and a top-layer backdrop for free.
  useEffect(() => ref.current?.showModal(), []);
  const sample = { ...r, personal: { ...r.personal, photo: r.personal.photo || SILHOUETTE } };
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      className="m-auto max-h-[88vh] w-[min(1060px,92vw)] rounded-card bg-white p-0 shadow-float backdrop:bg-zinc-900/30 backdrop:backdrop-blur-[2px] open:opacity-100 open:scale-100 starting:open:scale-[0.97] starting:open:opacity-0 transition-[opacity,scale] duration-200 ease-out-strong"
    >
      <div className="glass sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-xl">
        <div>
          <h2 className="title">Choose a template</h2>
          <p className="text-sm text-zinc-500">Previewed with your content. Every template is single-column with standard headings, so applicant tracking systems read it correctly.</p>
        </div>
        <button className="btn-icon" onClick={() => ref.current?.close()} aria-label="Close"><IconX /></button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-5 overflow-y-auto p-6">
        {RESUME_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              onPick(t.id);
              ref.current?.close();
            }}
            className="group text-left transition-transform duration-150 ease-out active:scale-[0.98]"
          >
            <div
              className={`relative h-[297mm] w-[210mm] overflow-hidden bg-white ring-1 [zoom:0.23] ${r.template === t.id ? "ring-[10px] ring-zinc-900" : "ring-zinc-200 group-hover:ring-[6px] group-hover:ring-zinc-300"}`}
            >
              <ResumeDoc r={{ ...sample, template: t.id }} />
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm font-medium">
              {t.label}
              <span className="chip bg-zinc-100 text-zinc-600">{t.photo ? "Optional photo" : "No photo"}</span>
            </div>
          </button>
        ))}
      </div>
    </dialog>
  );
}
