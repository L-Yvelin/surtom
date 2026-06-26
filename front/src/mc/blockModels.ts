export type Axis = 'x' | 'y' | 'z';
export type FaceName = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

export interface ElementRotation {
  origin: [number, number, number];
  axis: Axis;
  angle: number;
  rescale?: boolean;
}

export interface ElementFace {
  texture: string;
  uv?: [number, number, number, number];
  rotation?: number;
  cullface?: string;
  tintindex?: number;
}

export interface ModelElement {
  from: [number, number, number];
  to: [number, number, number];
  rotation?: ElementRotation;
  shade?: boolean;
  faces: Partial<Record<FaceName, ElementFace>>;
}

export interface RawModel {
  parent?: string;
  textures?: Record<string, string>;
  elements?: ModelElement[];
}

export type ModelOverrides = Record<string, RawModel>;

export interface ResolvedModel {
  textures: Record<string, string>;
  elements: ModelElement[];
}

const MODEL_PREFIX = '../../vendors/minecraft/models/';
const TEXTURE_PREFIX = '../../vendors/minecraft/textures/';

const modelLoaders = import.meta.glob('../../vendors/minecraft/models/**/*.json', {
  import: 'default',
}) as Record<string, () => Promise<RawModel>>;

const textureLoaders = import.meta.glob('../../vendors/minecraft/textures/**/*.png', {
  query: '?url',
  import: 'default',
}) as Record<string, () => Promise<string>>;

function stripNamespace(ref: string): string {
  const colon = ref.indexOf(':');
  return colon >= 0 ? ref.slice(colon + 1) : ref;
}

function modelKey(name: string): string {
  return `${MODEL_PREFIX}${stripNamespace(name)}.json`;
}

function textureKey(path: string): string {
  return `${TEXTURE_PREFIX}${stripNamespace(path)}.png`;
}

export function listBlockModels(): string[] {
  const offset = `${MODEL_PREFIX}block/`.length;
  return Object.keys(modelLoaders)
    .filter((k) => k.startsWith(`${MODEL_PREFIX}block/`))
    .map((k) => `block/${k.slice(offset, -'.json'.length)}`)
    .sort();
}

const baseModelCache = new Map<string, Promise<RawModel | undefined>>();

function loadBaseModel(name: string): Promise<RawModel | undefined> {
  const cacheKey = stripNamespace(name);
  let cached = baseModelCache.get(cacheKey);
  if (!cached) {
    let loader = modelLoaders[modelKey(name)];
    if (!loader && !cacheKey.includes('/')) loader = modelLoaders[modelKey(`block/${name}`)];
    cached = loader ? loader() : Promise.resolve(undefined);
    baseModelCache.set(cacheKey, cached);
  }
  return cached;
}

async function loadRawModel(name: string, overrides?: ModelOverrides): Promise<RawModel | undefined> {
  const key = stripNamespace(name);
  return overrides?.[key] ?? loadBaseModel(key);
}

const resolveCache = new Map<string, Promise<ResolvedModel>>();

async function resolve(name: string, overrides?: ModelOverrides): Promise<ResolvedModel> {
  const chain: RawModel[] = [];
  const visited = new Set<string>();
  let current: string | undefined = stripNamespace(name);

  while (current && !visited.has(current)) {
    visited.add(current);
    const raw = await loadRawModel(current, overrides);
    if (!raw) break;
    chain.push(raw);
    current = raw.parent ? stripNamespace(raw.parent) : undefined;
  }

  const textures: Record<string, string> = {};
  let elements: ModelElement[] = [];
  for (let i = chain.length - 1; i >= 0; i--) {
    if (chain[i].textures) Object.assign(textures, chain[i].textures);
    if (chain[i].elements) elements = chain[i].elements!;
  }

  return { textures, elements };
}

export function resolveModel(name: string, overrides?: ModelOverrides): Promise<ResolvedModel> {
  const key = stripNamespace(name);
  if (overrides && Object.keys(overrides).length > 0) return resolve(key, overrides);
  let cached = resolveCache.get(key);
  if (!cached) {
    cached = resolve(key);
    resolveCache.set(key, cached);
  }
  return cached;
}

export function resolveTextureRef(textures: Record<string, string>, ref: string): string | undefined {
  let value: string | undefined = ref;
  const seen = new Set<string>();
  while (value && value.startsWith('#')) {
    const variable = value.slice(1);
    if (seen.has(variable)) return undefined;
    seen.add(variable);
    value = textures[variable];
  }
  return value;
}

const textureUrlCache = new Map<string, Promise<string | undefined>>();

export function loadTextureUrl(path: string): Promise<string | undefined> {
  const key = textureKey(path);
  let cached = textureUrlCache.get(key);
  if (!cached) {
    const loader = textureLoaders[key];
    cached = loader ? loader() : Promise.resolve(undefined);
    textureUrlCache.set(key, cached);
  }
  return cached;
}
