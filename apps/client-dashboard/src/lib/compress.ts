/**
 * Compress an image file so it is at most `maxMB` megabytes.
 * Uses the Canvas API with progressive JPEG quality reduction, then
 * dimension scaling as a last resort. Returns the original file unchanged
 * if it already fits within the limit.
 */
export async function compressImage(file: File, maxMB = 2): Promise<File> {
  const maxBytes = maxMB * 1024 * 1024;
  if (file.size <= maxBytes) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const toBlob = (c: HTMLCanvasElement, q: number): Promise<Blob | null> =>
        new Promise((res) => c.toBlob((b) => res(b), "image/jpeg", q));

      // Phase 1: reduce JPEG quality from 0.85 down to 0.20 in steps
      for (let q = 0.85; q >= 0.2; q -= 0.1) {
        const blob = await toBlob(canvas, q);
        if (blob && blob.size <= maxBytes) {
          resolve(new File([blob], sanitiseName(file.name), { type: "image/jpeg" }));
          return;
        }
      }

      // Phase 2: scale down canvas dimensions until the file fits
      let scale = 0.8;
      while (scale >= 0.2) {
        const w = Math.max(1, Math.floor(img.naturalWidth * scale));
        const h = Math.max(1, Math.floor(img.naturalHeight * scale));
        const c2 = document.createElement("canvas");
        c2.width = w;
        c2.height = h;
        c2.getContext("2d")!.drawImage(img, 0, 0, w, h);
        const blob = await toBlob(c2, 0.75);
        if (blob && blob.size <= maxBytes) {
          resolve(new File([blob], sanitiseName(file.name), { type: "image/jpeg" }));
          return;
        }
        scale -= 0.1;
      }

      // Fallback: return original if all else fails
      resolve(file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

function sanitiseName(original: string): string {
  return original.replace(/\.[^.]+$/, "") + ".jpg";
}
