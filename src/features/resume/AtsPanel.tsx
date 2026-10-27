import { Intro } from "../../components/ui/Section";
import { AiButton, ErrorBox } from "../../components/ui/feedback";
import { Fixes, List, ResultCard } from "../../components/ui/results";
import { useAi } from "../../hooks/useAi";
import { resumeToText, type Ats, type Resume, type Settings } from "../../lib/data";
import { chatJson } from "../../lib/groq";
import { templateMeta } from "../../templates/resume";

export function AtsPanel({ r, patch, settings }: { r: Resume; patch: (p: Partial<Resume>) => void; settings: Settings }) {
  const ai = useAi<void>();
  const t = templateMeta(r.template);
  const layout = `${t.label}: single column with standard headings${t.photo && r.personal.photo ? ", with a photo in the header (ATS ignore it, but many US/UK employers prefer resumes without one)" : ""}`;
  const check = () =>
    ai.run(async () => {
      const res = await chatJson<Ats>(
        settings,
        `You are an Applicant Tracking System (ATS) parser and an experienced technical recruiter. Audit the resume for ATS compatibility and quality:
contact details present, standard section headings, consistent dates, keyword density for the stated job title, quantified achievements, strong action verbs, concise bullets, spelling and grammar, length.
The template is ${layout}.
Reply with JSON only: {"score": integer 0-100, "summary": string, "strengths": string[], "weaknesses": string[], "issues": [{"severity": "high"|"medium"|"low", "section": string, "problem": string, "fix": string}]}.
"weaknesses" are the 3-6 biggest overall gaps (e.g. "No measurable results in the DataNest role"). For bullet issues, "problem" quotes the original text and "fix" is the rewritten text. Do not invent facts.`,
        resumeToText(r),
      );
      patch({ ats: { ...res, checkedAt: new Date().toISOString() } });
    });
  const data = r.ats;
  return (
    <>
      <Intro title="ATS check">See how an applicant tracking system reads your resume, then fix what it flags.</Intro>
      <AiButton loading={ai.loading} onClick={check} busy="Checking…">{data ? "Check again" : "Run ATS check"}</AiButton>
      <ErrorBox msg={ai.error} />
      {data && (
        <ResultCard score={data.score} summary={data.summary} checkedAt={data.checkedAt}>
          <List title="Strengths" items={data.strengths} />
          <List title="Weaknesses" items={data.weaknesses} />
          <Fixes items={data.issues} />
        </ResultCard>
      )}
    </>
  );
}
