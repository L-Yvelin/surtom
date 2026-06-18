export type FaceDirection = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

export const FACE_DIRECTIONS: readonly FaceDirection[] = ['north', 'south', 'east', 'west', 'up', 'down'] as const;

export interface MinecraftFace {
  uv?: [number, number, number, number];
  texture: string;
  cullface?: string;
  rotation?: 0 | 90 | 180 | 270;
  tintindex?: number;
}

export interface MinecraftElementRotation {
  origin: [number, number, number];
  axis: 'x' | 'y' | 'z';
  angle: number;
  rescale?: boolean;
}

export interface MinecraftElement {
  from: [number, number, number];
  to: [number, number, number];
  rotation?: MinecraftElementRotation;
  faces?: Partial<Record<FaceDirection, MinecraftFace>>;
  shade?: boolean;
  name?: string;
}

export interface MinecraftModelJson {
  parent?: string;
  textures?: Record<string, string>;
  elements?: MinecraftElement[];
}

export interface FaceData {
  uv?: [number, number, number, number];
  texture: string;
  cullface?: string;
  rotation?: number;
}

export interface ElementRotation {
  origin: [number, number, number];
  axis: 'x' | 'y' | 'z';
  angle: number;
  rescale?: boolean;
}

export interface Element3D {
  id: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  rotation?: ElementRotation;
  faces: Partial<Record<FaceDirection, FaceData>>;
}

export interface SceneGraph {
  elements: Element3D[];
}
