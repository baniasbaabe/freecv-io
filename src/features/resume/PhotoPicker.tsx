import { useRef, useState } from "react";
import { IconUpload } from "../../components/ui/icons";
import type { Resume } from "../../lib/data";
import { toPhoto } from "../../lib/photo";

export function PhotoPicker({ r, set }: { r: Resume; set: (r: Resume) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const pick = async (file?: File) => {
    if (!file) return;
    setError("");
    try {
      if (!file.type.startsWith("image/")) throw new Error();
      set({ ...r, personal: { ...r.personal, photo: await toPhoto(file) } });
    } catch {
      setError("Couldn't read that image. Use a JPG, PNG or WebP file.");
    }
  };
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => input.current?.click()}
        className="group relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-card bg-zinc-100 text-zinc-400 outline-none transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-zinc-400 active:scale-[0.97]"
        aria-label={r.personal.photo ? "Change photo" : "Upload photo"}
        title={r.personal.photo ? "Change photo" : "Upload photo"}
      >
        {r.personal.photo ? (
          <>
            <img src={r.personal.photo} alt="" className="size-full object-cover" />
            {/* Upload affordance appears on hover (and keyboard focus) over the picture. */}
            <span className="absolute inset-0 grid place-items-center bg-zinc-900/45 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
              <IconUpload size={24} />
            </span>
          </>
        ) : (
          <span className="grid size-full place-items-center transition-colors duration-150 group-hover:bg-zinc-200/80 group-hover:text-zinc-600"><IconUpload size={24} /></span>
        )}
      </button>
      <div className="space-y-1.5 text-sm">
        {r.personal.photo && <button className="btn-ghost -ml-3" onClick={() => set({ ...r, personal: { ...r.personal, photo: undefined } })}>Remove photo</button>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => (pick(e.target.files?.[0]), (e.target.value = ""))} />
    </div>
  );
}
