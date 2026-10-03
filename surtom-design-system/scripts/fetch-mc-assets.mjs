import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'vendors', 'minecraft');

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

const WANTED = ['assets/minecraft/textures/', 'assets/minecraft/models/'];

if (!process.env.MC_FORCE) {
  try {
    const fs = await import('node:fs');
    fs.accessSync(join(OUT_DIR, 'textures'));
    fs.accessSync(join(OUT_DIR, 'models'));
    console.log('Minecraft assets already present. Set MC_FORCE=1 to re-download.');
    process.exit(0);
  } catch {}
}

const MC_VERSION = '26.2';

const manifest = await fetchJson('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json');
const entry = manifest.versions.find((v) => v.id === MC_VERSION);
const { url: clientUrl } = (await fetchJson(entry.url)).downloads.client;

console.log(`Downloading Minecraft ${MC_VERSION} client.jar ...`);
const res = await fetch(clientUrl);
const jar = new AdmZip(Buffer.from(await res.arrayBuffer()));

await rm(OUT_DIR, { recursive: true, force: true });

let textures = 0;
let models = 0;
for (const e of jar.getEntries()) {
  if (e.isDirectory || !WANTED.some((p) => e.entryName.startsWith(p))) continue;
  const target = join(OUT_DIR, e.entryName.slice('assets/minecraft/'.length));
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, e.getData());
  if (e.entryName.endsWith('.png')) textures++;
  else if (e.entryName.endsWith('.json')) models++;
}

console.log(`Done. Extracted ${textures} textures and ${models} models.`);
