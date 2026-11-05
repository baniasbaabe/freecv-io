// Photos are stored twice: a downsized original (photoSrc) so the crop can be redone, and the square crop (photo) the templates use.
// cx/cy are the crop centre as fractions of the original; zoom >= 1.
export type Crop = { cx: number; cy: number; zoom: number };
export const defaultCrop: Crop = { cx: 0.5, cy: 0.4, zoom: 1 }; // a bit above centre, where faces usually are

const toUrl = (img: ImageBitmap, sx: number, sy: number, side: number, size: number, q: number) => {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  c.getContext("2d")!.drawImage(img, sx, sy, side, side, 0, 0, size, size);
  return c.toDataURL("image/jpeg", q);
};

// Source rectangle of the crop, kept inside the image.
export function cropRect(w: number, h: number, c: Crop) {
  const side = Math.min(w, h) / Math.max(1, c.zoom);
  const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);
  return { side, x: clamp(c.cx * w - side / 2, w - side), y: clamp(c.cy * h - side / 2, h - side) };
}

// Downsizes the original (max 720px) so localStorage stays small.
export async function toSource(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const k = Math.min(1, 720 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * k);
  c.height = Math.round(img.height * k);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.8);
}

export async function cropPhoto(src: string, c: Crop): Promise<string> {
  const img = await createImageBitmap(await (await fetch(src)).blob());
  const { side, x, y } = cropRect(img.width, img.height, c);
  return toUrl(img, x, y, side, Math.min(480, Math.round(side)), 0.85);
}
