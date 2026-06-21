import imageCompression from 'browser-image-compression';

const MAX_WIDTH_OR_HEIGHT = 1600;
const BASE64_OVERHEAD = 4 / 3;

export async function compressImageToLimit(file: File, maxLength: number): Promise<string | null> {
  const original = await imageCompression.getDataUrlFromFile(file);
  if (original.length <= maxLength) return original;

  const maxSizeMB = maxLength / BASE64_OVERHEAD / (1024 * 1024);
  const compressed = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
    useWebWorker: true,
  });

  const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
  return dataUrl.length <= maxLength ? dataUrl : null;
}
