import { useState } from "react";
import { useAi } from "../hooks/useAi";
import type { Settings } from "../lib/data";
import { fetchJob, type Job } from "../lib/groq";
import { ErrorBox, Spinner } from "./ui/feedback";

// Job posting from a link (fetched with Scrapling) or pasted text.
export function JobInput({ value, onChange, onJob, settings }: { value: string; onChange: (v: string) => void; onJob?: (j: Job) => void; settings: Settings }) {
  const [url, setUrl] = useState("");
  const ai = useAi<Job>();
  const importJob = () =>
    ai.run(async () => {
      const j = await fetchJob(settings, url);
      onChange(j.description);
      onJob?.(j);
      setUrl("");
      return j;
    });
  return (
    <div className="space-y-2">
      <span className="label">Job posting</span>
      <div className="flex gap-2">
        <input
          className="input"
          type="url"
          value={url}
          placeholder="Paste a job link (LinkedIn, Indeed, Greenhouse…)"
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && url.trim() && !ai.loading && importJob()}
        />
        <button className="btn shrink-0" disabled={!url.trim() || ai.loading} onClick={importJob}>
          {ai.loading ? <><Spinner /> Importing…</> : "Import"}
        </button>
      </div>
      {ai.loading && <p className="hint">Opening the page in a stealth browser. This can take 10-30 seconds.</p>}
      <ErrorBox msg={ai.error} />
      {ai.data && !ai.loading && !ai.error && (
        <p className="text-xs text-emerald-700">Imported {[ai.data.title, ai.data.company].filter(Boolean).join(" at ") || "the posting"}. Check the text below.</p>
      )}
      <textarea className="input resize-y" rows={8} value={value} placeholder="…or paste the job description text" aria-label="Job description" onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
