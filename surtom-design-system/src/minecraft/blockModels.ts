import blockJson from '@mc/models/block/block.json';
import cubeJson from '@mc/models/block/cube.json';
import cubeBottomTopJson from '@mc/models/block/cube_bottom_top.json';
import grassBlockJson from '@mc/models/block/grass_block.json';
import warpedNyliumJson from '@mc/models/block/warped_nylium.json';

import { getTextureDefault } from './textures';

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

interface RawElementFace {
  texture: string;
  uv?: number[];
  rotation?: number;
  cullface?: string;
  tintindex?: number;
}

interface RawModelElement {
  from: number[];
  to: number[];
  rotation?: { origin: number[]; axis: string; angle: number; rescale?: boolean };
  shade?: boolean;
  faces: Partial<Record<FaceName, RawElementFace>>;
}

export interface RawModel {
  parent?: string;
  textures?: Record<string, string>;
  elements?: RawModelElement[];
  [key: string]: unknown;
}

export type ModelOverrides = Record<string, RawModel>;

export interface ResolvedModel {
  textures: Record<string, string>;
  elements: ModelElement[];
}

const MODELS: Record<string, RawModel> = {
  'block/block': blockJson,
  'block/cube': cubeJson,
  'block/cube_bottom_top': cubeBottomTopJson,
  'block/grass_block': grassBlockJson,
  'block/warped_nylium': warpedNyliumJson,
};

function stripNamespace(ref: string): string {
  const colon = ref.indexOf(':');
  return colon >= 0 ? ref.slice(colon + 1) : ref;
}

function loadRawModel(name: string, overrides?: ModelOverrides): RawModel | undefined {
  const key = stripNamespace(name);
  return overrides?.[key] ?? MODELS[key] ?? MODELS[`block/${key}`];
}

const resolveCache = new Map<string, ResolvedModel>();

function resolve(name: string, overrides?: ModelOverrides): ResolvedModel {
  const chain: RawModel[] = [];
  const visited = new Set<string>();
  let current: string | undefined = stripNamespace(name);

  while (current && !visited.has(current)) {
    visited.add(current);
    const raw = loadRawModel(current, overrides);
    if (!raw) break;
    chain.push(raw);
    current = raw.parent ? stripNamespace(raw.parent) : undefined;
  }

  const textures: Record<string, string> = {};
  let elements: ModelElement[] = [];
  for (let i = chain.length - 1; i >= 0; i--) {
    if (chain[i].textures) Object.assign(textures, chain[i].textures);
    if (chain[i].elements) elements = chain[i].elements as unknown as ModelElement[];
  }

  return { textures, elements };
}

export function resolveModel(name: string, overrides?: ModelOverrides): ResolvedModel {
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

export function loadTextureUrl(path: string): string | undefined {
  return getTextureDefault(`${stripNamespace(path)}.png`);
}
