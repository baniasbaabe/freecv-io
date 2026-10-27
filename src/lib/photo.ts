// Center-crops to a square (biased up, where faces usually are) and downsizes so localStorage stays small.
export async function toPhoto(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const s = Math.min(img.width, img.height);
  const size = Math.min(480, s);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  c.getContext("2d")!.drawImage(img, (img.width - s) / 2, (img.height - s) * 0.25, s, s, 0, 0, size, size);
  return c.toDataURL("image/jpeg", 0.85);
}
