import { create } from 'zustand';
import { applyTextures, applyDerivedColors, resolveTexture, type TextureKey, type TextureOverrides } from '../mc/textures';
import { parsePack, revokePack, type ParsedPack } from '../mc/resourcePack';
import { deletePack, loadPacks, savePack } from '../mc/packStorage';

const SELECTED_STORAGE_KEY = 'mc-resource-packs-selected';

interface BuiltinPackDef {
  id: string;
  url: string;
  name: string;
  description: string;
  iconTextureKey?: string;
}

const BUILTIN_PACKS: BuiltinPackDef[] = [
  {
    id: '__golden_days__',
    url: '/resource-packs/golden-days.zip',
    name: 'Golden Days',
    description: 'Classic textures from before the Java Edition 1.14 overhaul (April 2019)',
    iconTextureKey: 'block/grass_block_side.png',
  },
];

export interface ResourcePack extends ParsedPack {
  id: string;
  builtin?: boolean;
}

interface ResourcePackState {
  packs: ResourcePack[];
  selectedIds: string[];
  overrides: TextureOverrides;
  ready: boolean;
  init: () => Promise<void>;
  addFromFile: (file: File) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggleSelected: (id: string) => void;
  moveSelected: (id: string, direction: -1 | 1) => void;
}

function readSelectedIds(): string[] {
  try {
    const raw = localStorage.getItem(SELECTED_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function persistSelectedIds(ids: string[]): void {
  localStorage.setItem(SELECTED_STORAGE_KEY, JSON.stringify(ids));
}

function computeOverrides(packs: ResourcePack[], selectedIds: string[]): TextureOverrides {
  const overrides: TextureOverrides = {};
  for (const id of [...selectedIds].reverse()) {
    const pack = packs.find((p) => p.id === id);
    if (pack) Object.assign(overrides, pack.textures);
  }
  return overrides;
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `pack-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

let initPromise: Promise<void> | null = null;

const useResourcePackStore = create<ResourcePackState>()((set, get) => {
  const apply = (packs: ResourcePack[], selectedIds: string[]): void => {
    const overrides = computeOverrides(packs, selectedIds);
    applyTextures(overrides);
    applyDerivedColors(overrides);
    persistSelectedIds(selectedIds);
    set({ packs, selectedIds, overrides });
  };

  return {
    packs: [],
    selectedIds: [],
    overrides: {},
    ready: false,

    init: () => {
      if (!initPromise) {
        initPromise = (async () => {
          const builtinPacks: ResourcePack[] = await Promise.all(
            BUILTIN_PACKS.map(async ({ id, url, name, description, iconTextureKey }) => {
              const res = await fetch(url);
              const bytes = new Uint8Array(await res.arrayBuffer());
              const parsed = parsePack(name, bytes);
              const iconUrl = (iconTextureKey && parsed.textures[iconTextureKey]) ?? parsed.iconUrl;
              return { id, builtin: true, ...parsed, name, description, iconUrl };
            }),
          );

          const stored = await loadPacks();
          const userPacks = stored.map((entry) => ({ id: entry.id, ...parsePack(entry.name, new Uint8Array(entry.bytes)) }));
          const packs = [...builtinPacks, ...userPacks];
          const knownIds = new Set(packs.map((p) => p.id));
          const selectedIds = readSelectedIds().filter((id) => knownIds.has(id));
          apply(packs, selectedIds);
          set({ ready: true });
        })();
      }
      return initPromise;
    },

    addFromFile: async (file) => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const id = createId();
      const name = file.name.replace(/\.zip$/i, '');
      const pack = { id, ...parsePack(name, bytes) };
      await savePack({ id, name, bytes: bytes.buffer.slice(0) });
      const packs = [...get().packs, pack];
      apply(packs, [id, ...get().selectedIds]);
    },

    remove: async (id) => {
      const pack = get().packs.find((p) => p.id === id);
      if (!pack || pack.builtin) return;
      revokePack(pack);
      await deletePack(id);
      apply(
        get().packs.filter((p) => p.id !== id),
        get().selectedIds.filter((selectedId) => selectedId !== id),
      );
    },

    toggleSelected: (id) => {
      const { packs, selectedIds } = get();
      const next = selectedIds.includes(id) ? selectedIds.filter((selectedId) => selectedId !== id) : [id, ...selectedIds];
      apply(packs, next);
    },

    moveSelected: (id, direction) => {
      const { packs, selectedIds } = get();
      const index = selectedIds.indexOf(id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= selectedIds.length) return;
      const next = [...selectedIds];
      [next[index], next[target]] = [next[target], next[index]];
      apply(packs, next);
    },
  };
});

export function useTexture(path: TextureKey): string {
  return useResourcePackStore((s) => resolveTexture(path, s.overrides));
}

export default useResourcePackStore;
