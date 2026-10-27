import { useState } from "react";
import { JobInput } from "../../components/JobInput";
import { Segmented } from "../../components/ui/Segmented";
import { Intro } from "../../components/ui/Section";
import { AiButton, ErrorBox } from "../../components/ui/feedback";
import { IconCheck, IconX } from "../../components/ui/icons";
import { useAi } from "../../hooks/useAi";
import { applySuggestion, resumeForPrompt, skillsNotInResume, uid, type Resume, type Review, type Settings, type Suggestion } from "../../lib/data";
import { chatJson } from "../../lib/groq";
import { notify } from "../../lib/notify";

export function PolishPanel({ r, set, patch, onCreate, settings }: { r: Resume; set: (r: Resume) => void; patch: (p: Partial<Resume>) => void; onCreate: (r: Resume) => void; settings: Settings }) {
  const [mode, setMode] = useState<"polish" | "tailor">(r.jobDescription.trim() ? "tailor" : "polish");
  // Suggestions saved before one-click apply could be "accepted"; treat those as still pending.
  const items = (r.polish ?? []).map((x) => ((x.state as string) === "accepted" ? { ...x, state: "pending" as const } : x));
  const setItems = (polish: Review[]) => patch({ polish });
  const [note, setNote] = useState("");
  const ai = useAi<number>();
  const tailor = mode === "tailor";

  const run = () =>
    ai.run(async () => {
      setNote("");
      const { suggestions } = await chatJson<{ suggestions?: Suggestion[] }>(
        settings,
        `You are an expert resume writer. Propose concrete line-level rewrites that make this resume stronger: lead with impact, keep the numbers the resume already has prominent, use strong action verbs, cut filler and passive voice, keep each bullet to one or two lines.
${tailor ? "Tailor it to the job description: mirror its wording and must-have keywords wherever the candidate's experience genuinely supports them, put the most relevant skills first, and aim the headline and summary at this role.\n" : ""}Never invent employers, titles, numbers, tools or achievements that are not in the resume. Skip lines that are already strong.
Reply with JSON only: {"suggestions": [{"target": "headline"|"summary"|"skills"|"bullet", "entry": number, "before": string, "after": string, "reason": string}]}.
"entry" is N from [EN] for bullets. "before" is the current text of that line copied exactly. "after" is the full replacement (for skills: the full comma-separated list). "reason" is at most 8 words, like "Adds scope and ownership". At most 12 suggestions.`,
        resumeForPrompt(r) + (tailor ? `\n\nJOB DESCRIPTION:\n${r.jobDescription}` : ""),
      );
      // Model output is untrusted: drop malformed or no-op suggestions.
      const list = (suggestions ?? []).filter((s) => s && typeof s.after === "string" && s.after.trim() && s.after.trim() !== String(s.before ?? "").trim());
      setItems(list.map((s) => ({ ...s, state: "pending" as const })));
      return list.length;
    });

  const setState = (i: number, state: Review["state"]) => setItems(items.map((x, j) => (j === i ? { ...x, state } : x)));
  const pending = items.filter((x) => x.state === "pending");
  // Applies the given suggestions in order; ones whose original text is gone are skipped and counted.
  const applyAll = (list: Review[]) =>
    list.reduce(
      (acc, s) => {
        const next = applySuggestion(acc.r, s);
        return next ? { r: next, done: [...acc.done, s], failed: acc.failed } : { ...acc, failed: acc.failed + 1 };
      },
      { r, done: [] as Review[], failed: 0 },
    );
  const apply = (list: Review[]) => {
    const before = r;
    const { r: next, done, failed } = applyAll(list);
    if (!done.length) return;
    set({ ...next, polish: items.map((x) => (done.includes(x) ? { ...x, state: "applied" as const } : x)) });
    setNote(failed ? `${failed} change${failed === 1 ? "" : "s"} skipped because the original text was edited.` : "");
    notify(done.length === 1 ? "Change applied" : `${done.length} changes applied`, () => set(before));
  };
  const saveCopy = () => onCreate({ ...applyAll(pending).r, id: uid(), name: `${r.name} (${tailor ? "tailored" : "polished"})`, ats: undefined, match: undefined, polish: undefined });

  const label = (s: Suggestion) =>
    s.target === "bullet" ? `Experience · ${r.experience[s.entry ?? -1]?.org || r.experience[s.entry ?? -1]?.title || "bullet"}` : { headline: "Job title", summary: "Summary", skills: "Skills" }[s.target] ?? s.target;

  return (
    <>
      <Intro title="Polish">AI reviews every line and proposes sharper rewrites. Apply the ones you like; every change can be undone.</Intro>
      <Segmented items={[["polish", "Improve overall"], ["tailor", "Tailor to a job"]]} value={mode} onChange={setMode} />
      {tailor && <JobInput value={r.jobDescription} onChange={(jobDescription) => patch({ jobDescription })} settings={settings} />}
      <AiButton loading={ai.loading} disabled={tailor && !r.jobDescription.trim()} onClick={run} busy="Reviewing your resume…">
        {items.length ? "Get new suggestions" : tailor ? "Tailor my resume" : "Polish my resume"}
      </AiButton>
      <ErrorBox msg={ai.error} />
      {note && <p className="text-sm text-amber-700">{note}</p>}
      {ai.data === 0 && !items.length && <p className="text-sm text-zinc-500">No changes suggested. Your resume already reads well.</p>}

      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((s, i) => {
            const applied = s.state === "applied";
            const stale = !applied && !applySuggestion(r, s);
            const unverified = !applied && s.target === "skills" ? skillsNotInResume(r, s.after) : [];
            return (
              <div
                key={i}
                className={`overflow-hidden rounded-control border text-sm transition-[opacity,box-shadow] duration-150 ${applied ? "border-emerald-300 ring-2 ring-emerald-100" : "border-zinc-200"} ${s.state === "declined" || stale ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className="truncate font-medium">{label(s)}</span>
                  {s.reason && <span className="chip shrink-0 bg-zinc-900 text-white">{s.reason}</span>}
                  {applied ? (
                    <span className="chip ml-auto shrink-0 bg-emerald-100 text-emerald-800"><IconCheck size={12} className="mr-1" />Applied</span>
                  ) : (
                    <div className="ml-auto flex shrink-0 gap-1">
                      <button className={`btn-icon size-7 ${s.state === "declined" ? "bg-zinc-200 text-zinc-900" : ""}`} aria-label="Dismiss" aria-pressed={s.state === "declined"} title="Dismiss" onClick={() => setState(i, s.state === "declined" ? "pending" : "declined")}><IconX /></button>
                      <button className="btn-icon size-7 hover:bg-emerald-600 hover:text-white" aria-label="Apply" title="Apply this change" disabled={stale || s.state === "declined"} onClick={() => apply([s])}><IconCheck /></button>
                    </div>
                  )}
                </div>
                {s.before && <div className="flex gap-2 bg-red-50 px-3 py-1.5 text-red-800"><span className="font-mono">−</span>{s.before}</div>}
                <div className="flex gap-2 bg-emerald-50 px-3 py-1.5 text-emerald-800"><span className="font-mono">+</span>{s.after}</div>
                {unverified.length > 0 && (
                  <div className="bg-amber-50 px-3 py-1.5 text-xs text-amber-800">Not in your resume: {unverified.join(", ")}. Only apply this if you really have these skills.</div>
                )}
                {stale && <div className="hint px-3 py-1.5">The original line has changed, so this can't be applied.</div>}
              </div>
            );
          })}
          {pending.length > 0 && (
            <div className="glass sticky bottom-0 -mx-5 flex flex-wrap items-center gap-2 border-t border-zinc-200 bg-white/80 px-5 py-3 backdrop-blur-xl">
              <span className="mr-auto text-sm text-zinc-500">{pending.length} left</span>
              <button className="btn" onClick={saveCopy} title="Creates a new resume with these changes and keeps this one unchanged">Save as copy</button>
              <button className="btn-primary" onClick={() => apply(pending)}>Apply all</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
