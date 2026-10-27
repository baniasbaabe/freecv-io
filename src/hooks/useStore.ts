import { useEffect, useState } from "react";
import { load, newLetter, newResume, save, type Letter, type Resume, type Settings, type Store } from "../lib/data";
import { notify } from "../lib/notify";

export type View = { kind: "resume" | "letter"; id: string } | { kind: "settings" };

const insertAt = <T,>(arr: T[], i: number, x: T) => [...arr.slice(0, i), x, ...arr.slice(i)];

// All documents, settings and the current view; persisted to localStorage on every change.
export function useStore() {
  const [store, setStore] = useState<Store>(load);
  const [view, setView] = useState<View>(() => ({ kind: "resume", id: store.resumes[0]?.id ?? "" }));
  const [saveError, setSaveError] = useState(false);
  useEffect(() => {
    try {
      save(store);
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [store]);

  const resume = view.kind === "resume" ? store.resumes.find((r) => r.id === view.id) : undefined;
  const letter = view.kind === "letter" ? store.letters.find((l) => l.id === view.id) : undefined;

  const setResume = (r: Resume) => setStore((s) => ({ ...s, resumes: s.resumes.map((x) => (x.id === r.id ? r : x)) }));
  const setLetter = (l: Letter) => setStore((s) => ({ ...s, letters: s.letters.map((x) => (x.id === l.id ? l : x)) }));
  // For results that arrive after an await: merge into the latest state so edits made meanwhile survive.
  const patchResume = (id: string, p: Partial<Resume>) => setStore((s) => ({ ...s, resumes: s.resumes.map((x) => (x.id === id ? { ...x, ...p } : x)) }));
  const patchLetter = (id: string, p: Partial<Letter>) => setStore((s) => ({ ...s, letters: s.letters.map((x) => (x.id === id ? { ...x, ...p } : x)) }));
  const patchSettings = (p: Partial<Settings>) => setStore((s) => ({ ...s, settings: { ...s.settings, ...p } }));

  const addResume = (r = newResume()) => {
    setStore((s) => ({ ...s, resumes: [...s.resumes, r] }));
    setView({ kind: "resume", id: r.id });
  };
  const addLetter = () => {
    const l = newLetter(resume?.id ?? store.resumes[0]?.id ?? "");
    setStore((s) => ({ ...s, letters: [...s.letters, l] }));
    setView({ kind: "letter", id: l.id });
  };
  const remove = (kind: "resume" | "letter", id: string) => {
    const list: (Resume | Letter)[] = kind === "resume" ? store.resumes : store.letters;
    const index = list.findIndex((d) => d.id === id);
    const doc = list[index];
    if (!doc) return;
    const rest = list.filter((d) => d.id !== id);
    const neighbor = rest[Math.min(index, rest.length - 1)];
    setStore((s) => (kind === "resume" ? { ...s, resumes: s.resumes.filter((r) => r.id !== id) } : { ...s, letters: s.letters.filter((l) => l.id !== id) }));
    // Stay in the same list when possible so the user keeps their place.
    setView(neighbor ? { kind, id: neighbor.id } : { kind: "resume", id: kind === "letter" ? (store.resumes[0]?.id ?? "") : "" });
    notify(`Deleted “${doc.name || "Untitled"}”`, () => {
      setStore((s) => (kind === "resume" ? { ...s, resumes: insertAt(s.resumes, index, doc as Resume) } : { ...s, letters: insertAt(s.letters, index, doc as Letter) }));
      setView({ kind, id });
    });
  };

  return { store, view, setView, saveError, resume, letter, setResume, setLetter, patchResume, patchLetter, patchSettings, addResume, addLetter, remove };
}
