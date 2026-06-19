import { unzipSync, strFromU8 } from 'fflate';
import { USED_TEXTURE_PATHS } from './textures';

const TEXTURE_PREFIX = 'assets/minecraft/textures/';
const usedTextures = new Set<string>(USED_TEXTURE_PATHS);

export interface ParsedPack {
  name: string;
  description: string;
  iconUrl: string | null;
  textures: Record<string, string>;
}

interface PackDescriptionComponent {
  text?: string;
}

function readDescription(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw.map(readDescription).join('');
  if (raw && typeof raw === 'object') return (raw as PackDescriptionComponent).text ?? '';
  return '';
}

function toBlobUrl(data: Uint8Array): string {
  return URL.createObjectURL(new Blob([data as BlobPart], { type: 'image/png' }));
}

export function parsePack(name: string, bytes: Uint8Array): ParsedPack {
  const files = unzipSync(bytes);

  let description = '';
  const meta = files['pack.mcmeta'];
  if (meta) {
    try {
      const parsed = JSON.parse(strFromU8(meta)) as { pack?: { description?: unknown } };
      description = readDescription(parsed.pack?.description);
    } catch {
      description = '';
    }
  }

  const icon = files['pack.png'];
  const iconUrl = icon ? toBlobUrl(icon) : null;

  const textures: Record<string, string> = {};
  for (const [fileName, data] of Object.entries(files)) {
    if (!fileName.startsWith(TEXTURE_PREFIX)) continue;
    const key = fileName.slice(TEXTURE_PREFIX.length);
    if (!usedTextures.has(key)) continue;
    textures[key] = toBlobUrl(data);
  }

  return { name, description, iconUrl, textures };
}

export function revokePack(pack: ParsedPack): void {
  if (pack.iconUrl) URL.revokeObjectURL(pack.iconUrl);
  for (const url of Object.values(pack.textures)) URL.revokeObjectURL(url);
}
