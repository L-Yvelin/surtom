const DIMENSION_STEPS = [1280, 960, 720, 540, 400];
const QUALITY_STEPS = [0.82, 0.65, 0.5, 0.38];

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function encode(bitmap: ImageBitmap, maxDimension: number, quality: number): Promise<Blob> {
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas.convertToBlob({ type: 'image/webp', quality });
}

export async function compressImageToLimit(file: File, maxLength: number): Promise<string | null> {
  const original = await blobToDataUrl(file);
  if (original.length <= maxLength) return original;

  const bitmap = await createImageBitmap(file);
  try {
    for (const maxDimension of DIMENSION_STEPS) {
      for (const quality of QUALITY_STEPS) {
        const blob = await encode(bitmap, maxDimension, quality);
        const dataUrl = await blobToDataUrl(blob);
        if (dataUrl.length <= maxLength) return dataUrl;
      }
    }
  } finally {
    bitmap.close();
  }

  return null;
}
