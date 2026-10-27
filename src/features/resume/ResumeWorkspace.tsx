import { useState } from "react";
import { DocHeader } from "../../components/DocHeader";
import { Preview } from "../../components/Preview";
import { Segmented } from "../../components/ui/Segmented";
import { IconGrid, IconSparkle } from "../../components/ui/icons";
import type { Resume, Settings } from "../../lib/data";
import { ResumeDoc, templateMeta } from "../../templates/resume";
import { AccentPicker } from "./AccentPicker";
import { AtsPanel } from "./AtsPanel";
import { MatchPanel } from "./MatchPanel";
import { PolishPanel } from "./PolishPanel";
import { ResumeForm } from "./ResumeForm";
import { StrengthMeter } from "./StrengthMeter";
import { TemplateGallery } from "./TemplateGallery";


export function ResumeWorkspace({ r, set, patch, onCreate, settings, onDuplicate, onDelete }: { r: Resume; set: (r: Resume) => void; patch: (p: Partial<Resume>) => void; onCreate: (r: Resume) => void; settings: Settings; onDuplicate: () => void; onDelete: () => void }) {
  const [tab, setTab] = useState<"edit" | "polish" | "ats" | "match">("edit");
  const [gallery, setGallery] = useState(false);
  return (
    <>
      <section className="flex w-[480px] shrink-0 flex-col border-r border-zinc-200/80 bg-white">
        <DocHeader name={r.name} onName={(name) => set({ ...r, name })}>
          <button className="btn-ghost" onClick={onDuplicate}>Duplicate</button>
          <button className="btn-ghost hover:text-red-600" onClick={onDelete}>Delete</button>
        </DocHeader>
        <StrengthMeter r={r} />
        <div className="px-5 pb-3">
          <Segmented
            items={[["edit", "Edit"], ["polish", <><IconSparkle size={14} /> Polish</>], ["ats", <><IconSparkle size={14} /> ATS</>], ["match", <><IconSparkle size={14} /> Job match</>]]}
            value={tab}
            onChange={setTab}
          />
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto px-5 pt-2 pb-10">
          {tab === "edit" && <ResumeForm r={r} set={set} />}
          {tab === "ats" && <AtsPanel r={r} patch={patch} settings={settings} />}
          {tab === "polish" && <PolishPanel r={r} set={set} patch={patch} onCreate={onCreate} settings={settings} />}
          {tab === "match" && <MatchPanel r={r} patch={patch} settings={settings} />}
        </div>
      </section>
      <Preview
        title={r.name}
        toolbar={
          <>
            <button className="btn-ghost" onClick={() => setGallery(true)}>
              <IconGrid /> {templateMeta(r.template).label}
            </button>
            <span className="mx-1 h-5 w-px bg-zinc-300/70" />
            <AccentPicker value={r.accent} onChange={(accent) => set({ ...r, accent })} />
          </>
        }
      >
        <ResumeDoc r={r} />
      </Preview>
      {gallery && <TemplateGallery r={r} onPick={(template) => set({ ...r, template })} onClose={() => setGallery(false)} />}
    </>
  );
}
