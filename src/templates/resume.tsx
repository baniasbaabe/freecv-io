import type { ReactNode } from "react";
import { bullets, dates, skillList, type Entry, type Resume } from "../lib/data";
import { contacts, Joined, Photo } from "./shared";

// Every template is single-column with standard headings and near-zero letter-spacing, so PDF text
// extraction (what an ATS reads) comes out in reading order. Photos only ever sit in the header.
export const RESUME_TEMPLATES = [
  { id: "classic", label: "Classic", photo: false },
  { id: "minimal", label: "Minimal", photo: false },
  { id: "modern", label: "Modern", photo: true },
  { id: "executive", label: "Executive", photo: true },
  { id: "banner", label: "Banner", photo: true },
  { id: "elegant", label: "Elegant", photo: true },
  { id: "bold", label: "Bold", photo: true },
  { id: "centered", label: "Centered", photo: true },
] as const;
export type TemplateId = (typeof RESUME_TEMPLATES)[number]["id"];
export const templateMeta = (id: string) => RESUME_TEMPLATES.find((t) => t.id === id) ?? RESUME_TEMPLATES[0];

const filled = (es: Entry[]) => es.filter((e) => e.title || e.org);

function Entries({ items, accent }: { items: Entry[]; accent?: string }) {
  return (
    <div className="space-y-3.5">
      {filled(items).map((e, i) => (
        <div key={i} className="break-inside-avoid">
          <div className="font-semibold">
            {e.title}
            {e.org && <span className="font-normal" style={{ color: accent }}>{e.title ? ", " : ""}{e.org}</span>}
          </div>
          {/* Dates sit inline under the title, not right-aligned: layout-based parsers detach floating dates from their job. */}
          {(dates(e) || e.location) && <div className="text-[9pt] text-zinc-500 tabular-nums">{[dates(e), e.location].filter(Boolean).join(" · ")}</div>}
          {bullets(e.details).length > 0 && (
            <ul className="mt-1 list-disc space-y-0.5 pl-4 marker:text-zinc-400">
              {bullets(e.details).map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

type H = (p: { children: ReactNode }) => ReactNode;
// The shared single-column body; templates differ in header and heading style only.
function Body({ r, H, accent }: { r: Resume; H: H; accent?: string }) {
  const skills = skillList(r.skills);
  const languages = skillList(r.languages ?? "");
  return (
    <>
      {r.personal.summary && (<><H>Summary</H><p>{r.personal.summary}</p></>)}
      {filled(r.experience).length > 0 && (<><H>Experience</H><Entries items={r.experience} accent={accent} /></>)}
      {filled(r.education).length > 0 && (<><H>Education</H><Entries items={r.education} accent={accent} /></>)}
      {skills.length > 0 && (<><H>Skills</H><p>{skills.join(" · ")}</p></>)}
      {languages.length > 0 && (<><H>Languages</H><p>{languages.join(" · ")}</p></>)}
    </>
  );
}

function Classic({ r }: { r: Resume }) {
  const H: H = ({ children }) => (
    <h2 className="mt-5 mb-2 border-b pb-0.5 text-[10pt] font-bold tracking-[0.05em] uppercase" style={{ color: r.accent, borderColor: r.accent }}>{children}</h2>
  );
  return (
    <div className="px-[18mm] py-[15mm] font-serif text-[10.5pt] leading-snug">
      <header className="text-center">
        <h1 className="text-[22pt] font-bold" style={{ color: r.accent }}>{r.personal.fullName}</h1>
        {r.personal.headline && <div className="text-[12pt] italic">{r.personal.headline}</div>}
        <div className="mt-1 text-[9.5pt] text-zinc-600"><Joined items={contacts(r)} sep="  ·  " /></div>
      </header>
      <Body r={r} H={H} />
    </div>
  );
}

function Minimal({ r }: { r: Resume }) {
  const H: H = ({ children }) => <h2 className="mt-6 mb-2 text-[10.5pt] font-semibold" style={{ color: r.accent }}>{children}</h2>;
  return (
    <div className="px-[20mm] py-[18mm] font-sans text-[10pt] leading-relaxed text-zinc-800">
      <h1 className="text-[26pt] leading-tight font-light tracking-[-0.02em] text-zinc-900">{r.personal.fullName}</h1>
      {r.personal.headline && <div className="text-[11pt] text-zinc-600">{r.personal.headline}</div>}
      <div className="mt-2 text-[9pt] text-zinc-500"><Joined items={contacts(r)} sep="   /   " /></div>
      <Body r={r} H={H} />
    </div>
  );
}

function Modern({ r }: { r: Resume }) {
  const H: H = ({ children }) => (
    <h2 className="mt-6 mb-2 flex items-center gap-2 text-[11pt] font-semibold tracking-[-0.01em]">
      <span className="size-1.5 rounded-full" style={{ background: r.accent }} />
      {children}
    </h2>
  );
  return (
    <div className="px-[18mm] py-[16mm] font-sans text-[10pt] leading-snug text-zinc-800">
      <header className="flex items-center gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-[26pt] leading-tight font-semibold tracking-[-0.02em] text-zinc-900">{r.personal.fullName}</h1>
          {r.personal.headline && <div className="text-[11.5pt] font-medium" style={{ color: r.accent }}>{r.personal.headline}</div>}
          <div className="mt-2 text-[9pt] text-zinc-500"><Joined items={contacts(r)} sep="  ·  " /></div>
        </div>
        <Photo r={r} className="size-[24mm] rounded-full" />
      </header>
      <div className="mt-5 h-[2px] w-12 rounded-full" style={{ background: r.accent }} />
      <Body r={r} H={H} accent={r.accent} />
    </div>
  );
}

function Executive({ r }: { r: Resume }) {
  const H: H = ({ children }) => <h2 className="mt-6 mb-2 text-[11.5pt] font-extrabold tracking-[-0.01em]">{children}</h2>;
  return (
    <div className="px-[16mm] py-[14mm] font-sans text-[10pt] leading-snug">
      <header className="flex items-start justify-between gap-8">
        <div>
          <h1 className="text-[30pt] leading-[0.95] font-black tracking-[-0.02em]">{r.personal.fullName}</h1>
          {r.personal.headline && <div className="mt-2 text-[10pt] font-semibold tracking-[0.04em] uppercase" style={{ color: r.accent }}>{r.personal.headline}</div>}
          <div className="mt-3 text-[9pt] text-zinc-600"><Joined items={contacts(r)} sep="  ·  " /></div>
        </div>
        <Photo r={r} className="h-[38mm] w-[32mm] rounded-sm" />
      </header>
      <hr className="mt-6 border-t-2 border-zinc-900" />
      <Body r={r} H={H} accent={r.accent} />
    </div>
  );
}

function Banner({ r }: { r: Resume }) {
  const H: H = ({ children }) => <h2 className="mt-5 mb-2 text-[11pt] font-bold" style={{ color: r.accent }}>{children}</h2>;
  return (
    <div className="font-sans text-[10pt] leading-snug">
      <header className="flex items-center gap-6 px-[16mm] py-[9mm] text-white" style={{ background: r.accent }}>
        <Photo r={r} className="size-[24mm] rounded-full border-[3px] border-white" />
        <div className="min-w-0">
          <h1 className="text-[24pt] leading-tight font-bold tracking-[-0.01em]">{r.personal.fullName}</h1>
          {r.personal.headline && <div className="text-[10.5pt] text-white/85">{r.personal.headline}</div>}
        </div>
      </header>
      <div className="border-b border-zinc-200 px-[16mm] py-[3mm] text-[9pt] text-zinc-600"><Joined items={contacts(r)} sep="  ·  " /></div>
      <div className="px-[16mm] pb-[12mm]"><Body r={r} H={H} /></div>
    </div>
  );
}

function Elegant({ r }: { r: Resume }) {
  const H: H = ({ children }) => (
    <h2 className="mt-6 mb-2 flex items-center gap-3 font-serif text-[12.5pt]" style={{ color: r.accent }}>
      {children}
      <span className="h-px flex-1 bg-zinc-200" />
    </h2>
  );
  return (
    <div className="px-[18mm] py-[15mm] font-sans text-[9.5pt] leading-relaxed text-zinc-700">
      <header className="flex items-center gap-5">
        <Photo r={r} className="size-[20mm] rounded-full" />
        <div>
          <h1 className="font-serif text-[25pt] leading-tight text-zinc-900">{r.personal.fullName}</h1>
          {r.personal.headline && <div className="text-[10.5pt]" style={{ color: r.accent }}>{r.personal.headline}</div>}
          <div className="mt-1 text-[9pt] text-zinc-500"><Joined items={contacts(r)} sep="  ·  " /></div>
        </div>
      </header>
      <Body r={r} H={H} />
    </div>
  );
}

function Bold({ r }: { r: Resume }) {
  const H: H = ({ children }) => <h2 className="mt-6 mb-2 text-[10pt] font-bold tracking-[0.05em] uppercase" style={{ color: r.accent }}>{children}</h2>;
  return (
    <div className="font-sans text-[10pt] leading-snug">
      <header className="flex items-center gap-7 bg-zinc-900 px-[16mm] py-[11mm] text-white">
        <Photo r={r} className="size-[28mm] rounded-full border-4" style={{ borderColor: r.accent }} />
        <div className="min-w-0">
          <h1 className="text-[28pt] leading-[1.05] font-bold tracking-[-0.02em]">{r.personal.fullName}</h1>
          {r.personal.headline && <div className="mt-1 text-[11pt] text-white/75">{r.personal.headline}</div>}
          <div className="mt-3 text-[8.5pt] text-white/75"><Joined items={contacts(r)} sep="  ·  " /></div>
        </div>
      </header>
      <div className="px-[16mm] pb-[12mm]"><Body r={r} H={H} /></div>
    </div>
  );
}

function Centered({ r }: { r: Resume }) {
  const H: H = ({ children }) => (
    // Body headings stay left-aligned: layout-based PDF parsers (pdfminer-style) pull short centered lines out of reading order.
    <h2 className="mt-5 mb-3 border-t border-zinc-200 pt-4 first-of-type:border-t-0 first-of-type:pt-0 text-[10pt] font-semibold tracking-[0.05em] uppercase" style={{ color: r.accent }}>{children}</h2>
  );
  return (
    <div className="font-sans text-[10pt] leading-snug">
      <header className="flex flex-col items-center bg-zinc-900 px-[16mm] pt-[10mm] pb-[8mm] text-center text-white">
        <Photo r={r} className="mb-3 size-[24mm] rounded-full border-2 border-white" />
        <h1 className="text-[24pt] font-semibold tracking-[-0.01em]">{r.personal.fullName}</h1>
        {r.personal.headline && <div className="text-[10.5pt] text-white/75">{r.personal.headline}</div>}
        <div className="mt-3 text-[8.5pt] text-white/75"><Joined items={contacts(r)} sep="  ·  " /></div>
      </header>
      <div className="px-[18mm] pb-[12mm]"><Body r={r} H={H} accent={r.accent} /></div>
    </div>
  );
}

const RESUME_COMPONENTS: Record<TemplateId, (p: { r: Resume }) => ReactNode> = {
  classic: Classic, minimal: Minimal, modern: Modern, executive: Executive, banner: Banner, elegant: Elegant, bold: Bold, centered: Centered,
};

export function ResumeDoc({ r }: { r: Resume }) {
  const T = RESUME_COMPONENTS[r.template] ?? Classic;
  return <div className="page"><T r={r} /></div>;
}
