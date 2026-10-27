import type { Letter, Resume } from "../lib/data";
import { contacts, Joined, Photo } from "./shared";

export const LETTER_TEMPLATES = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "minimal", label: "Minimal" },
] as const;

export function LetterDoc({ l, r }: { l: Letter; r?: Resume }) {
  const accent = r?.accent ?? "#1f4e79";
  const name = r?.personal.fullName ?? "";
  const today = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const paragraphs = l.body.split(/\n\s*\n/).filter((p) => p.trim());
  const body = (
    <>
      <div className="mb-6">
        {l.recipient && <div>{l.recipient}</div>}
        {l.company && <div>{l.company}</div>}
      </div>
      {l.role && <div className="mb-4 font-semibold">Re: Application for {l.role}</div>}
      <div className="space-y-3 whitespace-pre-line">{paragraphs.map((p, i) => <p key={i}>{p.trim()}</p>)}</div>
      <div className="mt-8">
        <div>Sincerely,</div>
        <div className="mt-6 font-semibold">{name}</div>
      </div>
    </>
  );
  const contactLine = r ? <Joined items={contacts(r)} sep="  ·  " /> : null;

  if (l.template === "modern")
    return (
      <div className="page font-sans text-[10.5pt] leading-relaxed">
        <header className="flex items-center gap-6 px-[20mm] py-[12mm] text-white" style={{ background: accent }}>
          {r && <Photo r={r} className="size-[22mm] rounded-full border-2 border-white" />}
          <div>
            <h1 className="text-[20pt] font-bold">{name}</h1>
            <div className="text-[9.5pt] text-white/85">{contactLine}</div>
          </div>
        </header>
        <div className="px-[20mm] py-[12mm]">
          <div className="mb-6 text-zinc-500">{today}</div>
          {body}
        </div>
      </div>
    );
  if (l.template === "minimal")
    return (
      <div className="page px-[22mm] py-[20mm] font-sans text-[10.5pt] leading-relaxed">
        <h1 className="text-[18pt] font-light">{name}</h1>
        <div className="mb-10 text-[9.5pt] text-zinc-500">{contactLine}</div>
        <div className="mb-6 text-zinc-500">{today}</div>
        {body}
      </div>
    );
  return (
    <div className="page px-[22mm] py-[18mm] font-serif text-[11pt] leading-relaxed">
      <header className="mb-8 border-b pb-3 text-center" style={{ borderColor: accent }}>
        <h1 className="text-[20pt] font-bold" style={{ color: accent }}>{name}</h1>
        <div className="text-[9.5pt] text-zinc-600">{contactLine}</div>
      </header>
      <div className="mb-6">{today}</div>
      {body}
    </div>
  );
}
