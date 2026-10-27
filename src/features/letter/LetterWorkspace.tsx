import { DocHeader } from "../../components/DocHeader";
import { JobInput } from "../../components/JobInput";
import { Preview } from "../../components/Preview";
import { Field } from "../../components/ui/Field";
import { Pick } from "../../components/ui/Pick";
import { Section } from "../../components/ui/Section";
import { Segmented } from "../../components/ui/Segmented";
import { AiButton, ErrorBox } from "../../components/ui/feedback";
import { useAi } from "../../hooks/useAi";
import { resumeToText, type Letter, type Resume, type Settings } from "../../lib/data";
import { chat } from "../../lib/groq";
import { notify } from "../../lib/notify";
import { LETTER_TEMPLATES, LetterDoc } from "../../templates/letter";

export function LetterWorkspace({ l, set, patch, resumes, settings, onDelete }: { l: Letter; set: (l: Letter) => void; patch: (p: Partial<Letter>) => void; resumes: Resume[]; settings: Settings; onDelete: () => void }) {
  const r = resumes.find((x) => x.id === l.resumeId);
  const ai = useAi<string>();
  const generate = () =>
    ai.run(async () => {
      const previous = l.body;
      const body = await chat(
        settings,
        `You write cover letters. Write the letter body only, in a ${l.tone.toLowerCase()} tone, 250-350 words.
Start with a greeting line ("Dear ${l.recipient || "Hiring Manager"},"), then 3-4 paragraphs separated by blank lines.
Do not include addresses, dates, a subject line or a sign-off, and never use placeholders like [Company].
Use only facts from the resume; tie the candidate's concrete achievements to the job's requirements.`,
        `Company: ${l.company}\nRole: ${l.role}\n\nJOB DESCRIPTION:\n${l.jobDescription || "(not provided)"}\n\nRESUME:\n${r ? resumeToText(r) : "(no resume selected)"}`,
      );
      patch({ body: body.trim() });
      if (previous.trim()) notify("Letter rewritten", () => patch({ body: previous }));
      return body;
    });
  return (
    <>
      <section className="flex w-[480px] shrink-0 flex-col border-r border-zinc-200/80 bg-white">
        <DocHeader name={l.name} onName={(name) => set({ ...l, name })}>
          <button className="btn-ghost hover:text-red-600" onClick={onDelete}>Delete</button>
        </DocHeader>
        <div className="flex-1 space-y-6 overflow-y-auto px-5 pt-2 pb-10">
          <Section title="Job">
            <div>
              <Pick label="Based on resume" value={l.resumeId} items={[{ value: "", label: "None" }, ...resumes.map((x) => ({ value: x.id, label: x.name || "Untitled" }))]} onChange={(resumeId) => set({ ...l, resumeId })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Company" value={l.company} onChange={(company) => set({ ...l, company })} />
              <Field label="Role" value={l.role} onChange={(role) => set({ ...l, role })} />
              <Field label="Recipient" value={l.recipient} placeholder="Hiring Manager" onChange={(recipient) => set({ ...l, recipient })} />
              <div>
                <Pick label="Tone" value={l.tone} items={["Professional", "Enthusiastic", "Confident", "Friendly", "Concise"].map((t) => ({ value: t, label: t }))} onChange={(tone) => set({ ...l, tone })} />
              </div>
            </div>
            <JobInput
              value={l.jobDescription}
              onChange={(jobDescription) => patch({ jobDescription })}
              onJob={(j) => patch({ ...(!l.company && { company: j.company }), ...(!l.role && { role: j.title }) })}
              settings={settings}
            />
          </Section>
          <AiButton loading={ai.loading} onClick={generate} busy="Writing…">
            {l.body ? "Regenerate with AI" : "Write with AI"}
          </AiButton>
          <ErrorBox msg={ai.error} />
          <Section title="Letter">
            <Field label="Editable. Changes show in the preview." area rows={16} value={l.body} onChange={(body) => set({ ...l, body })} />
          </Section>
        </div>
      </section>
      <Preview
        title={l.name}
        toolbar={<Segmented items={LETTER_TEMPLATES.map((t) => [t.id, t.label] as [Letter["template"], string])} value={l.template} onChange={(template) => set({ ...l, template })} />}
      >
        <LetterDoc l={l} r={r} />
      </Preview>
    </>
  );
}
