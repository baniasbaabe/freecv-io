import { useEffect } from "react";
import { Field } from "../../components/ui/Field";
import { Pick } from "../../components/ui/Pick";
import { ErrorBox, Spinner } from "../../components/ui/feedback";
import { useAi } from "../../hooks/useAi";
import type { Settings } from "../../lib/data";
import { listModels } from "../../lib/groq";

export function SettingsView({ settings: s, onChange: set }: { settings: Settings; onChange: (patch: Partial<Settings>) => void }) {
  const ai = useAi<string[]>();
  // Load the model list as soon as a key is present (debounced while typing), instead of behind a "Test" button.
  useEffect(() => {
    if (s.apiKey.length < 20) return;
    const t = setTimeout(() => ai.run(() => listModels(s)), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.apiKey]);
  const models = [...new Set([s.model, ...(ai.data ?? [])])];
  return (
    <section className="flex-1 overflow-y-auto bg-zinc-100 p-10">
      <div className="mx-auto max-w-xl space-y-5 rounded-card border border-zinc-200 bg-white p-8 shadow-card">
        <div>
          <h2 className="title">Settings</h2>
          <p className="mt-1 text-sm text-zinc-500">
            AI features use Groq's free API. Create a key at <span className="font-mono text-zinc-700">console.groq.com/keys</span>. Your key and documents stay on this computer; only the text you check is sent to Groq.
          </p>
        </div>
        <Field label="Groq API key" type="password" value={s.apiKey} placeholder="gsk_…" onChange={(v) => set({ apiKey: v.trim() })} />
        <div>
          <Pick
            label="Model"
            value={s.model}
            items={models.map((m) => ({ value: m, label: m === "llama-3.3-70b-versatile" ? `${m} (recommended)` : m }))}
            onChange={(model) => set({ model })}
          />
          <p className="hint mt-1.5 flex items-center gap-1.5">
            {!s.apiKey ? "Add a key to load the available models." : ai.loading ? <><Spinner /> Checking your key…</> : ai.data ? <span className="text-emerald-700">Key works. {ai.data.length} models available.</span> : null}
          </p>
        </div>
        <ErrorBox msg={ai.error} />
        <div className="border-t border-zinc-100 pt-5">
          <h3 className="heading">Job links</h3>
          <p className="mt-1 mb-3 text-sm text-zinc-500">
            Importing a job from a link uses <span className="font-mono text-zinc-700">Scrapling</span>'s stealth browser on this computer. Install it once with{" "}
            <span className="font-mono text-zinc-700">pip install "scrapling[fetchers,rag]==0.4.15"</span>, then{" "}
            <span className="font-mono text-zinc-700">scrapling install</span>. Use exactly version 0.4.15 with both extras: other versions may not have the command the app uses, and without <span className="font-mono text-zinc-700">rag</span> pages can't be converted.
          </p>
          <Field label="Scrapling command (optional, if it isn't found automatically)" value={s.scraplingPath ?? ""} placeholder="scrapling" onChange={(v) => set({ scraplingPath: v.trim() })} />
        </div>
      </div>
    </section>
  );
}
