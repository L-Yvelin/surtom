import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';

const MC_VERSION = '1.21.8';

const MANIFEST_URL = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json';
const TEXTURES_PREFIX = 'assets/minecraft/textures/';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'vendors', 'minecraft');

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  return res.json();
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const force = !!process.env.MC_FORCE;

  if (!force && (await exists(join(OUT_DIR, 'textures')))) {
    console.log(`Minecraft textures already present in ${OUT_DIR}. Set MC_FORCE=1 to re-download.`);
    return;
  }

  console.log(`Resolving Minecraft ${MC_VERSION} ...`);
  const manifest = await getJson(MANIFEST_URL);
  const entry = manifest.versions.find((v) => v.id === MC_VERSION);
  if (!entry) throw new Error(`Version "${MC_VERSION}" not found in manifest.`);

  const versionMeta = await getJson(entry.url);
  const clientUrl = versionMeta.downloads?.client?.url;
  if (!clientUrl) throw new Error('No client download URL in version metadata.');

  console.log('Downloading client.jar ...');
  const res = await fetch(clientUrl);
  if (!res.ok) throw new Error(`GET ${clientUrl} -> ${res.status} ${res.statusText}`);
  const jar = new AdmZip(Buffer.from(await res.arrayBuffer()));

  await rm(OUT_DIR, { recursive: true, force: true });

  console.log('Extracting textures ...');
  let count = 0;
  for (const e of jar.getEntries()) {
    if (e.isDirectory || !e.entryName.startsWith(TEXTURES_PREFIX)) continue;
    const target = join(OUT_DIR, e.entryName.slice('assets/minecraft/'.length));
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, e.getData());
    count += 1;
  }

  console.log(`Done. Extracted ${count} textures to ${OUT_DIR}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
