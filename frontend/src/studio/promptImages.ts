export type PromptImage = { id: string; name: string; data: string };
export const MAX_PROMPT_IMAGES = 6;
export const MAX_IMAGE_DATA = 160000;

export async function readSketch(file: File): Promise<PromptImage> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choose a JPG, PNG, or WebP image.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Choose an image under 10 MB.");
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error("This image could not be opened."); });
  try {
    const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing is unavailable in this browser.");
    context.fillStyle = "white"; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.8, 0.65, 0.45, 0.25]) {
      const data = canvas.toDataURL("image/jpeg", quality);
      if (data.length <= MAX_IMAGE_DATA) return { id: crypto.randomUUID(), name: file.name.slice(0, 200), data };
    }
    throw new Error("This sketch is too detailed to save here. Try a smaller image.");
  } finally { bitmap.close(); }
}
