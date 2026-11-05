import { Field } from "../../components/ui/Field";
import { Section } from "../../components/ui/Section";
import { IconArrowDown, IconArrowUp } from "../../components/ui/icons";
import { SECTIONS, sectionOrder, type Resume } from "../../lib/data";
import { EntryList } from "./EntryList";
import { LinksEditor } from "./LinksEditor";
import { PhotoPicker } from "./PhotoPicker";

export function ResumeForm({ r, set }: { r: Resume; set: (r: Resume) => void }) {
  const p = r.personal;
  const setP = (k: "fullName" | "headline" | "email" | "phone" | "location" | "summary") => (v: string) => set({ ...r, personal: { ...p, [k]: v } });
  const order = sectionOrder(r);
  const swap = (i: number, d: number) => {
    const next = [...order];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    set({ ...r, order: next });
  };
  return (
    <>
      <Section title="Personal details">
        <PhotoPicker r={r} set={set} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full name" value={p.fullName} onChange={setP("fullName")} />
          <Field label="Job title" value={p.headline} onChange={setP("headline")} />
          <Field label="Email" type="email" value={p.email} onChange={setP("email")} />
          <Field label="Phone" type="tel" value={p.phone} onChange={setP("phone")} />
          <div className="col-span-2"><Field label="Location" value={p.location} onChange={setP("location")} /></div>
        </div>
      </Section>
      <LinksEditor links={p.links} onChange={(links) => set({ ...r, personal: { ...p, links } })} />
      <Section title="Section order">
        <ul className="divide-y divide-zinc-100 rounded-card border border-zinc-200">
          {order.map((id, i) => (
            <li key={id} className="flex items-center gap-1 px-3 py-1 text-sm">
              <span className="flex-1">{SECTIONS[id]}</span>
              <button className="btn-icon" disabled={i === 0} onClick={() => swap(i, -1)} aria-label={`Move ${SECTIONS[id]} up`}><IconArrowUp /></button>
              <button className="btn-icon" disabled={i === order.length - 1} onClick={() => swap(i, 1)} aria-label={`Move ${SECTIONS[id]} down`}><IconArrowDown /></button>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Professional summary">
        <Field label="2-4 sentences on who you are and your biggest wins" area rows={4} value={p.summary} onChange={setP("summary")} />
      </Section>
      <EntryList title="Experience" titleLabel="Job title" orgLabel="Employer" items={r.experience} onChange={(experience) => set({ ...r, experience })} />
      <EntryList title="Education" titleLabel="Degree" orgLabel="School" items={r.education} onChange={(education) => set({ ...r, education })} />
      <EntryList title="Certifications" titleLabel="Certification" orgLabel="Issuer" items={r.certifications ?? []} onChange={(certifications) => set({ ...r, certifications })} />
      <Section title="Skills">
        <Field label="Comma or line separated" area rows={3} value={r.skills} onChange={(skills) => set({ ...r, skills })} />
      </Section>
      <Section title="Languages">
        <Field label="Comma or line separated, with level" area rows={2} placeholder="English (native), German (C1)" value={r.languages} onChange={(languages) => set({ ...r, languages })} />
      </Section>
    </>
  );
}
