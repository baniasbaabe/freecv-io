import { JobInput } from "../../components/JobInput";
import { Intro } from "../../components/ui/Section";
import { AiButton, ErrorBox } from "../../components/ui/feedback";
import { Chips, Fixes, List, ResultCard } from "../../components/ui/results";
import { useAi } from "../../hooks/useAi";
import { resumeToText, type Match, type Resume, type Settings } from "../../lib/data";
import { chatJson } from "../../lib/groq";

export function MatchPanel({ r, patch, settings }: { r: Resume; patch: (p: Partial<Resume>) => void; settings: Settings }) {
  const ai = useAi<void>();
  const check = () =>
    ai.run(async () => {
      const res = await chatJson<Match>(
        settings,
        `You are a recruiter comparing a candidate's resume against a job description.
Score the fit from 0 to 100 based on required skills, experience level, responsibilities and domain.
Reply with JSON only: {"score": integer 0-100, "summary": string, "matched_keywords": string[], "missing_keywords": string[], "fixes": [{"section": string, "problem": string, "fix": string}]}.
missing_keywords are important terms from the job description absent from the resume. "fixes" are 3-8 concrete edits that bring the resume closer to this job: "problem" quotes the current resume text exactly (or is "(missing)" when something should be added), "fix" is the rewritten text. Never invent experience, tools or numbers the candidate doesn't have.`,
        `JOB DESCRIPTION:\n${r.jobDescription}\n\nRESUME:\n${resumeToText(r)}`,
      );
      patch({ match: { ...res, checkedAt: new Date().toISOString() } });
    });
  const data = r.match;
  return (
    <>
      <Intro title="Job match">Paste a job posting to see how well this resume fits and which keywords are missing.</Intro>
      <JobInput value={r.jobDescription} onChange={(jobDescription) => patch({ jobDescription })} settings={settings} />
      <AiButton loading={ai.loading} disabled={!r.jobDescription.trim()} onClick={check} busy="Comparing…">{data ? "Check again" : "Check match"}</AiButton>
      <ErrorBox msg={ai.error} />
      {data && (
        <ResultCard score={data.score} summary={data.summary} checkedAt={data.checkedAt}>
          <Chips title="Matched keywords" items={data.matched_keywords} cls="bg-emerald-100 text-emerald-800" />
          <Chips title="Missing keywords" items={data.missing_keywords} cls="bg-amber-100 text-amber-900" />
          <Fixes items={data.fixes} />
          <List title="Suggestions" items={data.suggestions} />
        </ResultCard>
      )}
    </>
  );
}
