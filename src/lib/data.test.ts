import { test } from "node:test";
import assert from "node:assert/strict";
import { applySuggestion, bullets, linkHref, migrate, newResume, resumeToText, resumeFromParsed, sampleResume, skillList, skillsNotInResume, strength, type Resume as R } from "./data.ts";
import { parseLooseJson } from "./json.ts";

test("bullets strips markers and blank lines", () => {
  assert.deepEqual(bullets("- one\n\n• two\n  * three  "), ["one", "two", "three"]);
});

test("skillList splits commas and newlines", () => {
  assert.deepEqual(skillList("Go, Python\nSQL,,"), ["Go", "Python", "SQL"]);
});

test("resumeToText includes sections and skips empty ones", () => {
  const t = resumeToText(sampleResume());
  assert.match(t, /^Alex Morgan\nSenior Software Engineer/);
  assert.match(t, /EXPERIENCE\nSenior Software Engineer \| Paystream GmbH \| Berlin \| 03\/2021 – Present\n- Led/);
  assert.match(t, /SKILLS\nGo, Python/);
  assert.equal(resumeToText(newResume()), "");
});

test("applySuggestion finds a bullet by text even if the model names the wrong entry", () => {
  const r = sampleResume();
  r.experience[1].details = "- Built ETL pipelines in Python and Airflow for 30+ data sources\nOther";
  const next = applySuggestion(r, { target: "bullet", entry: 0, before: "Built ETL pipelines in Python and Airflow for 30+ data sources", after: "Shipped 30+ ETL pipelines", reason: "" });
  assert.equal(next?.experience[1].details, "Shipped 30+ ETL pipelines\nOther");
  assert.equal(next?.experience[0].details, r.experience[0].details);
});

test("applySuggestion rejects stale or empty suggestions and sets plain fields", () => {
  const r = sampleResume();
  assert.equal(applySuggestion(r, { target: "bullet", entry: 0, before: "not in resume", after: "x", reason: "" }), null);
  assert.equal(applySuggestion(r, { target: "summary", before: "", after: "  ", reason: "" }), null);
  assert.equal(applySuggestion(r, { target: "headline", before: "", after: "Staff Engineer", reason: "" })?.personal.headline, "Staff Engineer");
  assert.equal(applySuggestion(r, { target: "bullet", entry: 99, before: "Mentored 4 engineers; 2 were promoted within a year", after: "Mentored 4", reason: "" })?.experience[0].details.split("\n")[2], "Mentored 4");
});

test("links: safe hrefs, text export, migration from website", () => {
  assert.equal(linkHref("github.com/a"), "https://github.com/a");
  assert.equal(linkHref("javascript:alert(1)"), "https://alert(1)");
  assert.equal(linkHref("http://x.io"), "http://x.io");
  assert.match(resumeToText(sampleResume()), /linkedin\.com\/in\/alexmorgan \| github\.com\/alexmorgan/);
  const old = { ...sampleResume(), personal: { ...sampleResume().personal, links: undefined, website: "me.dev" } } as unknown as R;
  const m = migrate(old);
  assert.deepEqual(m.personal.links, [{ label: "", url: "me.dev" }]);
  assert.equal("website" in m.personal, false);
});

test("strength scores completeness and names the next step", () => {
  assert.deepEqual(strength(sampleResume()), { score: 100, next: undefined });
  assert.deepEqual(strength(newResume()), { score: 0, next: "Add your name and job title" });
  const r = sampleResume();
  r.personal.summary = "short";
  assert.deepEqual(strength(r), { score: 90, next: "Write a 2-4 sentence summary" });
});

test("languages export and migrate", () => {
  assert.match(resumeToText(sampleResume()), /LANGUAGES\nEnglish \(fluent\), German \(native\)$/);
  const old = { ...sampleResume(), languages: undefined } as unknown as R;
  assert.equal(migrate(old).languages, "");
});

test("skillsNotInResume flags only skills the resume doesn't mention", () => {
  const after = "Python, Go, Kubernetes, AWS, CI/CD (GitHub Actions), Observability (OpenTelemetry), Data Engineering (ETL, Airflow), C++";
  assert.deepEqual(skillsNotInResume(sampleResume(), after), ["CI/CD (GitHub Actions)", "Observability (OpenTelemetry)", "C++"]);
});

test("parseLooseJson salvages fenced, reasoning-prefixed or chatty replies", () => {
  assert.deepEqual(parseLooseJson('```json\n{"a": 1}\n```'), { a: 1 });
  assert.deepEqual(parseLooseJson('<think>{"no": true}</think>Sure! {"a": [1, 2]} Hope this helps.'), { a: [1, 2] });
  assert.equal(parseLooseJson('{"a": '), undefined);
  assert.equal(parseLooseJson(undefined), undefined);
});

test("resumeFromParsed maps a CV parse and survives junk", () => {
  const r = resumeFromParsed(
    {
      fullName: "Mira Okafor",
      headline: "Data Analyst",
      email: "mira@example.org",
      links: ["linkedin.com/in/mira", { label: "GitHub", url: "github.com/mira" }, { label: "empty" }],
      experience: [{ title: "Analyst", org: "Northwind", start: 2021, end: "Present", bullets: ["Built dashboards", "", 42] }, { foo: 1 }],
      education: "not an array",
      skills: ["SQL", "Python", null],
      languages: "English, Yoruba",
    },
    "cv.pdf",
  );
  assert.equal(r.name, "Mira Okafor (imported)");
  assert.deepEqual(r.personal.links, [{ label: "", url: "linkedin.com/in/mira" }, { label: "GitHub", url: "github.com/mira" }]);
  assert.deepEqual(r.experience, [{ title: "Analyst", org: "Northwind", location: "", start: "2021", end: "Present", details: "Built dashboards\n42" }]);
  assert.equal(r.education.length, 1); // falls back to one empty entry
  assert.equal(r.skills, "SQL, Python");
  assert.equal(r.languages, "English, Yoruba");
  assert.equal(resumeFromParsed(null, "cv.pdf").name, "cv.pdf");
});
