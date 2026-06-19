import { createWriteStream } from 'node:fs';
import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import AdmZip from 'adm-zip';

const MANIFEST_URL = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json';
const RESOURCES_URL = 'https://resources.download.minecraft.net';

const PINNED_VERSION = '26.2';
const WANTED_VERSION = process.env.MC_VERSION ?? PINNED_VERSION;

const EXTRACT_PREFIXES = ['assets/minecraft/textures/', 'assets/minecraft/models/'];
const EXTRACT_FILES = ['assets/minecraft/lang/en_us.json'];
const LANG_OBJECT_PREFIX = 'minecraft/lang/';
const SOUND_OBJECT_PREFIX = 'minecraft/sounds/';
const DOWNLOAD_CONCURRENCY = 24;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

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

async function resolveVersion() {
  const manifest = await getJson(MANIFEST_URL);
  const id = WANTED_VERSION === 'latest' ? manifest.latest.release : WANTED_VERSION;
  const entry = manifest.versions.find((v) => v.id === id);
  if (!entry) throw new Error(`Version "${id}" not found in manifest.`);
  return entry;
}

async function downloadObjects(index, prefix, destDir) {
  const entries = Object.entries(index.objects ?? {}).filter(([name]) => name.startsWith(prefix));
  let count = 0;
  for (let i = 0; i < entries.length; i += DOWNLOAD_CONCURRENCY) {
    const batch = entries.slice(i, i + DOWNLOAD_CONCURRENCY);
    await Promise.all(
      batch.map(async ([name, { hash }]) => {
        const res = await fetch(`${RESOURCES_URL}/${hash.slice(0, 2)}/${hash}`);
        if (!res.ok) throw new Error(`GET ${name} -> ${res.status} ${res.statusText}`);
        const target = join(destDir, name.slice(prefix.length));
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, Buffer.from(await res.arrayBuffer()));
      }),
    );
    count += batch.length;
  }
  return count;
}

async function downloadClientJar(clientUrl, jarPath) {
  const res = await fetch(clientUrl);
  if (!res.ok) throw new Error(`GET ${clientUrl} -> ${res.status} ${res.statusText}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(jarPath));
}

function shouldExtract(entryName) {
  return EXTRACT_PREFIXES.some((p) => entryName.startsWith(p)) || EXTRACT_FILES.includes(entryName);
}

async function extractAssets(jarPath, outDir) {
  const zip = new AdmZip(jarPath);
  let count = 0;
  for (const entry of zip.getEntries()) {
    if (entry.isDirectory || !shouldExtract(entry.entryName)) continue;
    const target = join(outDir, entry.entryName);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, entry.getData());
    count += 1;
  }
  return count;
}

async function main() {
  const force = !!process.env.MC_FORCE;
  const mcDir = (id) => join(ROOT, 'vendor', 'minecraft', id, 'assets', 'minecraft');

  if (WANTED_VERSION !== 'latest' && !force) {
    const base = mcDir(WANTED_VERSION);
    const haveAll = (
      await Promise.all([exists(join(base, 'textures')), exists(join(base, 'lang', 'fr_fr.json')), exists(join(base, 'sounds'))])
    ).every(Boolean);
    if (haveAll) {
      console.log(`Minecraft assets for ${WANTED_VERSION} already present. Set MC_FORCE=1 to re-download.`);
      return;
    }
  }

  const version = await resolveVersion();
  console.log(`Resolving Minecraft assets for version: ${version.id}`);

  const versionMeta = await getJson(version.url);
  const clientUrl = versionMeta.downloads?.client?.url;
  if (!clientUrl) throw new Error('No client download URL in version metadata.');
  const assetIndexUrl = versionMeta.assetIndex?.url;
  if (!assetIndexUrl) throw new Error('No asset index URL in version metadata.');

  const outDir = join(ROOT, 'vendor', 'minecraft', version.id);
  if (force) await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const base = mcDir(version.id);

  if (force || !(await exists(join(base, 'textures')))) {
    const jarPath = join(outDir, 'client.jar');
    console.log('Downloading client.jar ...');
    await downloadClientJar(clientUrl, jarPath);
    console.log('Extracting textures, models and en_us lang ...');
    const fileCount = await extractAssets(jarPath, outDir);
    await rm(jarPath, { force: true });
    console.log(`Extracted ${fileCount} jar files.`);
  }

  const index = await getJson(assetIndexUrl);

  if (force || !(await exists(join(base, 'lang', 'fr_fr.json')))) {
    console.log('Downloading translated lang files ...');
    const langCount = await downloadObjects(index, LANG_OBJECT_PREFIX, join(base, 'lang'));
    console.log(`Downloaded ${langCount} lang files.`);
  }

  if (force || !(await exists(join(base, 'sounds')))) {
    console.log('Downloading sounds ...');
    const soundCount = await downloadObjects(index, SOUND_OBJECT_PREFIX, join(base, 'sounds'));
    console.log(`Downloaded ${soundCount} sounds.`);
  }

  console.log(`Done. vendor/minecraft/${version.id}/ is up to date.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
