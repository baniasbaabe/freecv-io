import type { TemplateId } from "../templates/resume";

// Experience and education share one shape: title = role/degree, org = company/school.
export type Entry = { title: string; org: string; location: string; start: string; end: string; details: string };

export type Resume = {
  id: string;
  name: string;
  template: TemplateId;
  accent: string;
  // photo: square JPEG data URL; optional because resumes saved before photos existed lack it.
  personal: { fullName: string; headline: string; email: string; phone: string; location: string; links: Link[]; summary: string; photo?: string };
  experience: Entry[];
  education: Entry[];
  skills: string;
  languages: string;
  jobDescription: string;
  // Last AI results, kept with the resume so they survive tab switches and restarts.
  ats?: Ats & { checkedAt: string };
  match?: Match & { checkedAt: string };
  polish?: Review[];
};

export type Ats = {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  issues: Fix[];
};
// A before/after edit shown diff-style; `problem` quotes the current resume text.
export type Fix = { severity?: "high" | "medium" | "low"; section: string; problem: string; fix: string };
// `suggestions` (plain strings) only exists on results saved before fixes became diff-style.
export type Match = { score: number; summary: string; matched_keywords: string[]; missing_keywords: string[]; fixes?: Fix[]; suggestions?: string[] };

export type Letter = {
  id: string;
  name: string;
  resumeId: string;
  template: "classic" | "modern" | "minimal";
  company: string;
  role: string;
  recipient: string;
  tone: string;
  jobDescription: string;
  body: string;
};

export type Link = { label: string; url: string };
export type Settings = { apiKey: string; model: string; scraplingPath?: string };

// One AI edit proposal. Indices and `before` come from the LLM, so applySuggestion re-verifies them.
export type Suggestion = { target: "headline" | "summary" | "skills" | "bullet"; entry?: number; before: string; after: string; reason: string };
export type Review = Suggestion & { state: "pending" | "applied" | "declined" };
export type Store = { resumes: Resume[]; letters: Letter[]; settings: Settings };

export const uid = () => crypto.randomUUID();
export const emptyEntry = (): Entry => ({ title: "", org: "", location: "", start: "", end: "", details: "" });

const cleanBullet = (line: string) => line.replace(/^\s*[-•*]\s*/, "").trim();
export const bullets = (details: string) => details.split("\n").map(cleanBullet).filter(Boolean);

export const skillList = (skills: string) =>
  skills
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

export const dates = (e: Entry) => [e.start, e.end].filter(Boolean).join(" – ");

// Forces http(s) so a pasted "javascript:" or bare domain can't become a dangerous or broken href.
export const linkHref = (url: string) => (/^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim().replace(/^[a-z]+:\/*/i, "")}`);
export const prettyUrl = (url: string) => url.trim().replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
export const linkText = (l: Link) => l.label.trim() || prettyUrl(l.url);

export function newResume(): Resume {
  return {
    id: uid(),
    name: "Untitled resume",
    template: "modern",
    accent: "#1f4e79",
    personal: { fullName: "", headline: "", email: "", phone: "", location: "", links: [], summary: "" },
    experience: [emptyEntry()],
    education: [emptyEntry()],
    skills: "",
    languages: "",
    jobDescription: "",
  };
}

export function sampleResume(): Resume {
  return {
    ...newResume(),
    name: "Sample resume",
    personal: {
      fullName: "Alex Morgan",
      headline: "Senior Software Engineer",
      email: "alex.morgan@example.com",
      phone: "+1 555 010 2030",
      location: "Berlin, Germany",
      links: [
        { label: "", url: "linkedin.com/in/alexmorgan" },
        { label: "", url: "github.com/alexmorgan" },
      ],
      summary:
        "Backend engineer with 7 years building payment and data platforms in Go and Python. Led migrations that cut infrastructure cost by 35% and mentored teams of up to 6 engineers.",
    },
    experience: [
      {
        title: "Senior Software Engineer",
        org: "Paystream GmbH",
        location: "Berlin",
        start: "03/2021",
        end: "Present",
        details:
          "Led the migration of the settlement service from a monolith to 6 Go services, cutting p99 latency from 900 ms to 120 ms\nDesigned an idempotent ledger API processing 4M transactions per day\nMentored 4 engineers; 2 were promoted within a year",
      },
      {
        title: "Software Engineer",
        org: "DataNest",
        location: "Hamburg",
        start: "06/2018",
        end: "02/2021",
        details: "Built ETL pipelines in Python and Airflow for 30+ data sources\nReduced AWS spend by 35% by moving batch jobs to spot instances",
      },
    ],
    education: [{ title: "B.Sc. Computer Science", org: "TU Munich", location: "Munich", start: "2014", end: "2018", details: "" }],
    skills: "Go, Python, PostgreSQL, Kafka, Kubernetes, AWS, Terraform, gRPC",
    languages: "English (fluent), German (native)",
  };
}

export function newLetter(resumeId: string): Letter {
  return { id: uid(), name: "Untitled cover letter", resumeId, template: "classic", company: "", role: "", recipient: "", tone: "Professional", jobDescription: "", body: "" };
}

// Plain-text rendering fed to the LLM; also what an ATS parser roughly sees.
export function resumeToText(r: Resume): string {
  const p = r.personal;
  const section = (title: string, entries: Entry[]) => {
    const filled = entries.filter((e) => e.title || e.org);
    if (!filled.length) return "";
    const body = filled
      .map((e) => [[e.title, e.org, e.location, dates(e)].filter(Boolean).join(" | "), ...bullets(e.details).map((b) => `- ${b}`)].join("\n"))
      .join("\n\n");
    return `${title}\n${body}`;
  };
  return [
    [p.fullName, p.headline].filter(Boolean).join("\n"),
    [p.email, p.phone, p.location, ...p.links.filter((l) => l.url.trim()).map((l) => (l.label.trim() ? `${l.label.trim()}: ${prettyUrl(l.url)}` : prettyUrl(l.url)))].filter(Boolean).join(" | "),
    p.summary && `SUMMARY\n${p.summary}`,
    section("EXPERIENCE", r.experience),
    section("EDUCATION", r.education),
    skillList(r.skills).length ? `SKILLS\n${skillList(r.skills).join(", ")}` : "",
    skillList(r.languages ?? "").length ? `LANGUAGES\n${skillList(r.languages).join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

// Resume with stable bullet ids for the optimizer prompt: "[E0]" marks experience entry 0.
export function resumeForPrompt(r: Resume): string {
  const p = r.personal;
  return [
    `[HEADLINE] ${p.headline}`,
    `[SUMMARY] ${p.summary}`,
    ...r.experience.map((e, i) => `[E${i}] ${[e.title, e.org, dates(e)].filter(Boolean).join(" | ")}\n${bullets(e.details).map((b) => `- ${b}`).join("\n")}`),
    `[SKILLS] ${r.skills}`,
  ].join("\n\n");
}

// Returns the resume with one suggestion applied, or null when its target text no longer exists.
export function applySuggestion(r: Resume, s: Suggestion): Resume | null {
  const after = s.after?.trim();
  if (!after) return null;
  if (s.target === "headline" || s.target === "summary") return { ...r, personal: { ...r.personal, [s.target]: after } };
  if (s.target === "skills") return { ...r, skills: after };
  if (s.target !== "bullet") return null;
  // Find the bullet by its text, trying the entry the model named first.
  const before = cleanBullet(s.before ?? "");
  const order = [s.entry ?? -1, ...r.experience.keys()].filter((i) => Number.isInteger(i) && i >= 0 && i < r.experience.length);
  for (const i of order) {
    const lines = r.experience[i].details.split("\n");
    const j = lines.findIndex((l) => cleanBullet(l) === before);
    if (j < 0) continue;
    lines[j] = after;
    return { ...r, experience: r.experience.map((e, k) => (k === i ? { ...e, details: lines.join("\n") } : e)) };
  }
  return null;
}

// Older saves had a single `website` string (now `links`) or a retired template.
export function migrate(r: Resume): Resume {
  const { website, ...personal } = r.personal as Resume["personal"] & { website?: string };
  // "split" was a two-column template, retired for ATS reasons.
  const template = (r.template as string) === "split" ? "modern" : r.template;
  return { ...r, template, languages: r.languages ?? "", personal: { ...personal, links: personal.links ?? (website ? [{ label: "", url: website }] : []) } };
}

const KEY = "freecv:store";
export function load(): Store {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "");
    if (s?.resumes) return { ...s, resumes: s.resumes.map(migrate) };
  } catch {
    // first launch or corrupted store: fall through to defaults
  }
  const r = sampleResume();
  return { resumes: [r], letters: [], settings: { apiKey: "", model: "llama-3.3-70b-versatile" } };
}
// Throws when storage is full (e.g. many photos); the caller must surface that.
export const save = (s: Store) => localStorage.setItem(KEY, JSON.stringify(s));

// Completeness score shown above the editor; `next` is the most useful missing piece, in order.
export function strength(r: Resume): { score: number; next?: string } {
  const p = r.personal;
  const jobs = r.experience.filter((e) => e.title || e.org);
  const checks: [boolean, string][] = [
    [!!p.fullName.trim() && !!p.headline.trim(), "Add your name and job title"],
    [!!p.email.trim() && !!p.phone.trim(), "Add your email and phone"],
    [!!p.location.trim(), "Add your location"],
    [p.links.some((l) => l.url.trim()), "Add a LinkedIn or portfolio link"],
    [p.summary.trim().length >= 80, "Write a 2-4 sentence summary"],
    [jobs.length > 0, "Add your work experience"],
    [jobs.length > 0 && jobs.every((e) => bullets(e.details).length >= 2), "Give each job at least two bullets"],
    [jobs.some((e) => /\d/.test(e.details)), "Add numbers that show your impact"],
    [r.education.some((e) => e.title || e.org), "Add your education"],
    [skillList(r.skills).length >= 5, "List at least five skills"],
  ];
  return { score: checks.filter(([ok]) => ok).length * 10, next: checks.find(([ok]) => !ok)?.[1] };
}

// Skills in a proposed skills line that the resume gives no evidence for, so the UI can flag invented ones.
// A skill counts as evidenced when it, or a part in parentheses ("Data Engineering (ETL, Airflow)" -> "ETL"),
// appears as a whole word anywhere in the resume.
export function skillsNotInResume(r: Resume, after: string): string[] {
  const text = resumeToText(r).toLowerCase();
  const has = (term: string) => {
    const t = term.trim().toLowerCase();
    return !!t && new RegExp(`(?<![a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z0-9])`).test(text);
  };
  // Split on top-level commas only, so a parenthesised group stays one skill.
  const skills = after.split(/,(?![^()]*\))|\n/).map((x) => x.trim()).filter(Boolean);
  return skills.filter((skill) => ![skill.replace(/\(.*\)/, ""), ...(skill.match(/\(([^)]*)\)/)?.[1].split(",") ?? [])].some(has));
}

// Builds a resume from the LLM's parse of an imported CV. Every field is coerced: model output is untrusted.
export function resumeFromParsed(p: unknown, fallbackName: string): Resume {
  const o = (p && typeof p === "object" ? p : {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
  const arr = (v: unknown) => (Array.isArray(v) ? v : []);
  const entries = (v: unknown): Entry[] =>
    arr(v)
      .map((e) => {
        const x = (e && typeof e === "object" ? e : {}) as Record<string, unknown>;
        const details = Array.isArray(x.bullets) ? x.bullets.map(str).filter(Boolean).join("\n") : str(x.details);
        return { title: str(x.title), org: str(x.org), location: str(x.location), start: str(x.start), end: str(x.end), details };
      })
      .filter((e) => e.title || e.org);
  const list = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean).join(", ") : str(v));
  const r = newResume();
  const fullName = str(o.fullName);
  return {
    ...r,
    name: fullName ? `${fullName} (imported)` : fallbackName,
    personal: {
      ...r.personal,
      fullName,
      headline: str(o.headline),
      email: str(o.email),
      phone: str(o.phone),
      location: str(o.location),
      summary: str(o.summary),
      links: arr(o.links)
        .map((l) => (typeof l === "string" ? { label: "", url: l.trim() } : { label: str((l as Record<string, unknown>)?.label), url: str((l as Record<string, unknown>)?.url) }))
        .filter((l) => l.url),
    },
    experience: entries(o.experience).length ? entries(o.experience) : [emptyEntry()],
    education: entries(o.education).length ? entries(o.education) : [emptyEntry()],
    skills: list(o.skills),
    languages: list(o.languages),
  };
}
