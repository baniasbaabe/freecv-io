import { useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { extractCvText } from "../../lib/cvText";
import { resumeFromParsed, type Resume, type Settings } from "../../lib/data";
import { chatJson } from "../../lib/groq";

const PROMPT = `Extract the resume below into JSON. Reply with JSON only:
{"fullName": string, "headline": string, "email": string, "phone": string, "location": string, "links": [{"label": string, "url": string}], "summary": string,
"experience": [{"title": string, "org": string, "location": string, "start": string, "end": string, "bullets": string[]}],
"education": [{"title": string, "org": string, "location": string, "start": string, "end": string, "bullets": string[]}],
"skills": string[], "languages": string[]}.
"headline" is the person's current or target job title. For education, "title" is the degree and "org" the school.
Copy text exactly as written: do not rewrite, summarize, translate or invent anything. Use "" or [] for anything missing.
Keep dates as written (e.g. "03/2021", "2019", "Present"). Each bullet is one achievement or responsibility line.
Languages include the level if given, e.g. "German (C1)".`;

async function importCv(settings: Settings, file: File): Promise<Resume> {
  const text = await extractCvText(file);
  // shortcut: only the first 20k characters are sent (Groq free-tier token limits); a CV longer than ~6 pages loses its end.
  const parsed = await chatJson<unknown>(settings, PROMPT, text.slice(0, 20000));
  return resumeFromParsed(parsed, file.name.replace(/\.[^.]+$/, ""));
}

// A button that opens a file picker and turns the chosen CV into a new resume.
export function ImportCvButton({ settings, onImported, className, children }: { settings: Settings; onImported: (r: Resume) => void; className: string; children: ReactNode }) {
  const input = useRef<HTMLInputElement>(null);
  const pick = (file?: File) => {
    if (!file) return;
    toast.promise(
      importCv(settings, file).then((r) => onImported(r)),
      {
        loading: `Reading ${file.name}…`,
        success: "CV imported. Check each section before you send it.",
        error: (e) => (e instanceof Error ? e.message : String(e)),
      },
    );
  };
  return (
    <>
      <button className={className} onClick={() => input.current?.click()} aria-label="Import CV" title="Import CV (PDF, Word or text)">
        {children}
      </button>
      <input
        ref={input}
        type="file"
        hidden
        accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={(e) => (pick(e.target.files?.[0]), (e.target.value = ""))}
      />
    </>
  );
}
