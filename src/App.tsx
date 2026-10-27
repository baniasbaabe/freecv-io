import { IconContext } from "@phosphor-icons/react";
import { Toaster } from "sonner";
import { EmptyState } from "./components/EmptyState";
import { IconImport } from "./components/ui/icons";
import { ImportCvButton } from "./features/resume/ImportCv";
import { Sidebar } from "./components/Sidebar";
import { LetterWorkspace } from "./features/letter/LetterWorkspace";
import { ResumeWorkspace } from "./features/resume/ResumeWorkspace";
import { SettingsView } from "./features/settings/SettingsView";
import { useStore } from "./hooks/useStore";
import { sampleResume, uid } from "./lib/data";

export default function App() {
  const { store, view, setView, saveError, resume, letter, setResume, setLetter, patchResume, patchLetter, patchSettings, addResume, addLetter, remove } = useStore();

  return (
    <IconContext.Provider value={{ size: 16, weight: "regular" }}>
    <div className="flex h-screen bg-white text-zinc-900">
      <Sidebar
        resumes={store.resumes}
        letters={store.letters}
        view={view}
        onPick={setView}
        onNewResume={() => addResume()}
        onNewLetter={addLetter}
        needsKey={!store.settings.apiKey}
        importButton={
          <ImportCvButton settings={store.settings} onImported={addResume} className="btn-icon size-6">
            <IconImport />
          </ImportCvButton>
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {saveError && (
          <div role="alert" className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            Changes can't be saved: local storage is full. Remove a photo or delete old documents.
          </div>
        )}
        <div className="flex min-h-0 flex-1">
          {resume && (
            <ResumeWorkspace
              key={resume.id}
              r={resume}
              set={setResume}
              patch={(p) => patchResume(resume.id, p)}
              onCreate={addResume}
              settings={store.settings}
              onDuplicate={() => addResume({ ...structuredClone(resume), id: uid(), name: `${resume.name} (copy)`, ats: undefined, match: undefined, polish: undefined })}
              onDelete={() => remove("resume", resume.id)}
            />
          )}
          {letter && (
            <LetterWorkspace
              key={letter.id}
              l={letter}
              set={setLetter}
              patch={(p) => patchLetter(letter.id, p)}
              resumes={store.resumes}
              settings={store.settings}
              onDelete={() => remove("letter", letter.id)}
            />
          )}
          {view.kind === "settings" && <SettingsView settings={store.settings} onChange={patchSettings} />}
          {view.kind !== "settings" && !resume && !letter && <EmptyState
              onNew={() => addResume()}
              onSample={() => addResume({ ...sampleResume(), name: "Sample resume" })}
              importButton={
                <ImportCvButton settings={store.settings} onImported={addResume} className="btn">
                  <IconImport /> Import CV
                </ImportCvButton>
              }
            />}
        </div>
      </div>
      <Toaster position="bottom-center" duration={6000} toastOptions={{ className: "!rounded-card !border-zinc-200 !text-sm !shadow-float" }} />
    </div>
    </IconContext.Provider>
  );
}
