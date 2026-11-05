import { useRef, useState } from "react";
import { IconUpload } from "../../components/ui/icons";
import type { Resume } from "../../lib/data";
import { cropPhoto, cropRect, defaultCrop, toSource, type Crop } from "../../lib/photo";

const FRAME = 160;

export function PhotoPicker({ r, set }: { r: Resume; set: (r: Resume) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const pick = async (file?: File) => {
    if (!file) return;
    setError("");
    try {
      if (!file.type.startsWith("image/")) throw new Error();
      const photoSrc = await toSource(file);
      set({ ...r, personal: { ...r.personal, photoSrc, photoCrop: defaultCrop, photo: await cropPhoto(photoSrc, defaultCrop) } });
    } catch {
      setError("Couldn't read that image. Use a JPG, PNG or WebP file.");
    }
  };
  const { photoSrc } = r.personal;
  const [crop, setCrop] = useState<Crop>(r.personal.photoCrop ?? defaultCrop);
  const [size, setSize] = useState<{ w: number; h: number }>();
  const drag = useRef<{ x: number; y: number; crop: Crop } | undefined>(undefined);
  // A new upload resets the editor to its default crop.
  const [seen, setSeen] = useState(photoSrc);
  if (seen !== photoSrc) (setSeen(photoSrc), setCrop(r.personal.photoCrop ?? defaultCrop));
  const commit = async (c: Crop) => {
    if (!photoSrc) return;
    try {
      set({ ...r, personal: { ...r.personal, photoCrop: c, photo: await cropPhoto(photoSrc, c) } });
    } catch {
      setError("Couldn't update the photo.");
    }
  };
  const rect = size && cropRect(size.w, size.h, crop);
  const move = (e: React.PointerEvent) => {
    if (!drag.current || !size || !rect) return;
    // Dragging pans the image under the frame, so the crop centre moves the opposite way.
    const k = rect.side / FRAME;
    const { x, y, crop: c } = drag.current;
    setCrop({ ...c, cx: c.cx - ((e.clientX - x) * k) / size.w, cy: c.cy - ((e.clientY - y) * k) / size.h });
  };
  const end = () => {
    if (!drag.current) return;
    drag.current = undefined;
    // Store the clamped centre so the next drag starts from where the image actually is.
    if (size && rect) commit({ ...crop, cx: (rect.x + rect.side / 2) / size.w, cy: (rect.y + rect.side / 2) / size.h });
  };
  return (
    <div className="space-y-3">
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
        {r.personal.photo && <button className="btn-ghost -ml-3" onClick={() => set({ ...r, personal: { ...r.personal, photo: undefined, photoSrc: undefined, photoCrop: undefined } })}>Remove photo</button>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => (pick(e.target.files?.[0]), (e.target.value = ""))} />
    </div>
    {photoSrc && (
      <div className="flex items-center gap-4">
        <div
          className="relative shrink-0 cursor-grab touch-none overflow-hidden rounded-card bg-zinc-100 active:cursor-grabbing"
          style={{ width: FRAME, height: FRAME }}
          onPointerDown={(e) => ((drag.current = { x: e.clientX, y: e.clientY, crop }), e.currentTarget.setPointerCapture(e.pointerId))}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
        >
          <img
            src={photoSrc}
            alt=""
            draggable={false}
            onLoad={(e) => setSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            className="absolute max-w-none select-none"
            style={size && rect ? { width: (size.w / rect.side) * FRAME, left: (-rect.x / rect.side) * FRAME, top: (-rect.y / rect.side) * FRAME } : { opacity: 0 }}
          />
        </div>
        <label className="space-y-1.5 text-xs text-zinc-500">
          Drag to move, slide to zoom
          <input
            type="range" min={1} max={3} step={0.05} value={crop.zoom} className="block w-40"
            onChange={(e) => setCrop({ ...crop, zoom: +e.target.value })}
            onPointerUp={() => commit(crop)}
            onKeyUp={() => commit(crop)}
          />
        </label>
      </div>
    )}
    </div>
  );
}
