import { Dialog } from "@base-ui/react/dialog";
import { useRef, useState } from "react";
import { IconUpload } from "../../components/ui/icons";
import type { Resume } from "../../lib/data";
import { cropPhoto, cropRect, defaultCrop, toSource, type Crop } from "../../lib/photo";

const FRAME = 288;

// Thumbnail that opens a modal: drag the picture, zoom, and see the circle the resume will show.
export function PhotoPicker({ r, set }: { r: Resume; set: (r: Resume) => void }) {
  const [open, setOpen] = useState(false);
  const photo = r.personal.photo;
  const label = photo ? "Edit photo" : "Add photo";
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-4">
        <Dialog.Trigger
          aria-label={label}
          title={label}
          className="group relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-100 text-zinc-400 outline-none transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-zinc-900 active:scale-95"
        >
          {photo ? <img src={photo} alt="" className="size-full object-cover" /> : <IconUpload size={24} />}
          <span className="absolute inset-0 grid place-items-center bg-zinc-900/45 text-xs font-medium text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">Edit</span>
        </Dialog.Trigger>
        <p className="text-sm text-zinc-500">{photo ? "Click the photo to move, zoom or replace it." : "Click to add a photo (optional)."}</p>
      </div>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-zinc-900/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[22rem] -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-card border border-zinc-200 bg-white p-5 shadow-float outline-none transition-[scale,opacity] duration-150 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <Dialog.Title className="heading">Profile photo</Dialog.Title>
          <PhotoEditor r={r} set={set} />
          <Dialog.Close className="btn-primary w-full">Done</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PhotoEditor({ r, set }: { r: Resume; set: (r: Resume) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const { photoSrc } = r.personal;
  const [crop, setCrop] = useState<Crop>(r.personal.photoCrop ?? defaultCrop);
  const [size, setSize] = useState<{ w: number; h: number }>();
  const drag = useRef<{ x: number; y: number; crop: Crop } | undefined>(undefined);
  // Latest values for async/debounced commits, which must not write a stale resume back.
  const latest = useRef({ r, crop });
  latest.current = { r, crop };
  const wheelTimer = useRef<number | undefined>(undefined);
  // A new upload resets the editor to its default crop.
  const [seen, setSeen] = useState(photoSrc);
  if (seen !== photoSrc) (setSeen(photoSrc), setCrop(r.personal.photoCrop ?? defaultCrop));

  const update = (c: Crop) => ((latest.current.crop = c), setCrop(c));
  const commit = async (c = latest.current.crop) => {
    window.clearTimeout(wheelTimer.current);
    if (!photoSrc) return;
    try {
      const photo = await cropPhoto(photoSrc, c);
      const { r: cur } = latest.current;
      set({ ...cur, personal: { ...cur.personal, photoCrop: c, photo } });
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
    update({ ...c, cx: c.cx - ((e.clientX - x) * k) / size.w, cy: c.cy - ((e.clientY - y) * k) / size.h });
  };
  const end = () => {
    if (!drag.current) return;
    drag.current = undefined;
    // Store the clamped centre so the next drag starts from where the image actually is.
    if (size && rect) commit({ ...crop, cx: (rect.x + rect.side / 2) / size.w, cy: (rect.y + rect.side / 2) / size.h });
  };
  const wheel = (e: React.WheelEvent) => {
    if (!photoSrc) return;
    update({ ...crop, zoom: Math.min(3, Math.max(1, crop.zoom - e.deltaY * 0.002)) });
    window.clearTimeout(wheelTimer.current);
    wheelTimer.current = window.setTimeout(() => commit(), 200);
  };
  const pick = async (file?: File) => {
    if (!file) return;
    setError("");
    try {
      if (!file.type.startsWith("image/")) throw new Error();
      const src = await toSource(file);
      const photo = await cropPhoto(src, defaultCrop);
      const { r: cur } = latest.current;
      set({ ...cur, personal: { ...cur.personal, photoSrc: src, photoCrop: defaultCrop, photo } });
    } catch {
      setError("Couldn't read that image. Use a JPG, PNG or WebP file.");
    }
  };
  const remove = () => set({ ...r, personal: { ...r.personal, photo: undefined, photoSrc: undefined, photoCrop: undefined } });

  return (
    <div className="space-y-4">
      <div
        className={`relative mx-auto overflow-hidden rounded-card bg-zinc-200 select-none touch-none ${photoSrc ? "cursor-grab active:cursor-grabbing" : ""}`}
        style={{ width: FRAME, height: FRAME }}
        onPointerDown={(e) => photoSrc && ((drag.current = { x: e.clientX, y: e.clientY, crop }), e.currentTarget.setPointerCapture(e.pointerId))}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onWheel={wheel}
      >
        {photoSrc ? (
          <img
            src={photoSrc}
            alt=""
            draggable={false}
            onLoad={(e) => setSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            className="absolute max-w-none"
            style={size && rect ? { width: (size.w / rect.side) * FRAME, left: (-rect.x / rect.side) * FRAME, top: (-rect.y / rect.side) * FRAME } : { opacity: 0 }}
          />
        ) : (
          <button className="absolute inset-0 grid place-items-center text-zinc-400" onClick={() => input.current?.click()} aria-label="Upload photo"><IconUpload size={40} /></button>
        )}
        {/* The circle is what most templates show; everything outside it is dimmed. */}
        <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white shadow-[0_0_0_999px_rgba(24,24,27,0.55)]" />
      </div>
      <input
        type="range" min={1} max={3} step={0.02} value={crop.zoom} disabled={!photoSrc} aria-label="Zoom" className="block w-full"
        onChange={(e) => update({ ...crop, zoom: +e.target.value })}
        onPointerUp={() => commit()}
        onKeyUp={() => commit()}
      />
      <div className="flex items-center gap-2">
        <button className="btn" onClick={() => input.current?.click()}><IconUpload /> {photoSrc ? "Change photo" : "Upload photo"}</button>
        {r.personal.photo && <button className="btn-ghost hover:text-red-600" onClick={remove}>Remove photo</button>}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => (pick(e.target.files?.[0]), (e.target.value = ""))} />
    </div>
  );
}
