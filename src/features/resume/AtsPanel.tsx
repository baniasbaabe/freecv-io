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
        `You are an Applicant Tracking System (ATS) parser and an experienced technical recruiter. Audit the resume text below and score out of 100:
- Parseability, 30: contact details present as plain text, a single-column text layout with nothing hidden in tables or graphics.
- Standard section headings, 20: Summary, Experience, Education, Skills, Certifications. Deduct for creative headings.
- Consistent dates, 15: one date format throughout, every role with a start and end ("Present" is fine).
- Completeness, 15: each role has title, employer, dates and bullets; a skills section exists.
- Terms written out, 10: acronyms appear with their full form at least once, e.g. "Search Engine Optimization (SEO)".
- Bullet quality, 10: starts with an action verb, states an outcome, avoids "Responsible for" and "Helped with"; quantified where honest.
Do NOT flag: resume length of two pages, font choice, PDF format, employment gaps, a missing photo, or "keyword density". Never suggest hiding keywords.
The template is ${layout}.
Reply with JSON only: {"score": integer 0-100, "summary": string, "strengths": string[], "weaknesses": string[], "issues": [{"severity": "high"|"medium"|"low", "section": string, "problem": string, "fix": string}]}.
"weaknesses" are the 3-6 biggest overall gaps (e.g. "No measurable results in the DataNest role"). Every issue's "problem" must quote the offending resume text exactly (or be "(missing)" for something absent); without a quote there is no issue. For bullet issues, "fix" is the rewritten text. Do not invent facts, and when a bullet lacks a number do not make one up.`,
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
