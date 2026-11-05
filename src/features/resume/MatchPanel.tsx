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
Step 1, before reading the resume: list the job's requirements and mark each must-have ("required", "must", "X+ years", listed in the title or first requirements block) or nice-to-have ("preferred", "bonus", "plus", "familiarity with").
Step 2: check each requirement against the resume. Shown in a bullet with context = full credit; only listed in Skills = half; a synonym = half (tell the candidate to use the job's exact term); absent = none. Soft skills count only when evidenced.
Score 0-100: must-haves 55, nice-to-haves 15, job title and seniority match 15, depth and domain relevance of experience 15. Caps: fewer than half the must-haves covered = max 50; job title in a different field = max 60; almost nothing relevant = 0-15; 90+ only when every must-have is shown in a bullet. Calibration: 90 interview-ready, 75 good with fixable gaps, 55 partial fit, 30 different role. Do not reward resume length.
Reply with JSON only: {"summary": string, "score": integer 0-100, "matched_keywords": string[], "missing_keywords": string[], "fixes": [{"section": string, "problem": string, "fix": string}]}. Write "summary" (2-3 sentences of reasoning) first, then the score.
missing_keywords are job terms absent from the resume, must-haves first, most important first, at most 12. "fixes" are 3-8 concrete edits that bring the resume closer to this job: "problem" quotes the current resume text exactly (or is "(missing)" when something should be added), "fix" is the rewritten text. Only suggest a fix when the resume already has related evidence. Never invent experience, tools or numbers the candidate doesn't have.`,
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
