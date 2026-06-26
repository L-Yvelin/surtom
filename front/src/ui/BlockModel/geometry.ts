import { resolveTextureRef, type FaceName, type ModelElement } from '../../mc/blockModels';

export const FACES: FaceName[] = ['up', 'down', 'north', 'south', 'east', 'west'];

export interface FaceLayout {
  transform: string;
  width: number;
  height: number;
}

export interface ElementGeometry {
  el: ModelElement;
  width: number;
  height: number;
  depth: number;
  transform: string;
}

export function faceLayout(face: FaceName, w: number, h: number, d: number): FaceLayout {
  const center = 'translate(-50%, -50%)';
  switch (face) {
    case 'up':
      return { transform: `${center} rotateX(90deg) translateZ(${h / 2}px)`, width: w, height: d };
    case 'down':
      return { transform: `${center} rotateX(-90deg) translateZ(${h / 2}px)`, width: w, height: d };
    case 'south':
      return { transform: `${center} translateZ(${d / 2}px)`, width: w, height: h };
    case 'north':
      return { transform: `${center} rotateY(180deg) translateZ(${d / 2}px)`, width: w, height: h };
    case 'east':
      return { transform: `${center} rotateY(90deg) translateZ(${w / 2}px)`, width: d, height: h };
    case 'west':
      return { transform: `${center} rotateY(-90deg) translateZ(${w / 2}px)`, width: d, height: h };
  }
}

export function defaultUv(face: FaceName, el: ModelElement): [number, number, number, number] {
  const [fx, fy, fz] = el.from;
  const [tx, ty, tz] = el.to;
  switch (face) {
    case 'up':
    case 'down':
      return [fx, fz, tx, tz];
    case 'north':
      return [16 - tx, 16 - ty, 16 - fx, 16 - fy];
    case 'south':
      return [fx, 16 - ty, tx, 16 - fy];
    case 'west':
      return [fz, 16 - ty, tz, 16 - fy];
    case 'east':
      return [16 - tz, 16 - ty, 16 - fz, 16 - fy];
  }
}

export function faceBackground(uv: [number, number, number, number], width: number, height: number): { size: string; position: string } {
  const [u1, v1, u2, v2] = uv;
  const uw = Math.abs(u2 - u1) || 16;
  const vh = Math.abs(v2 - v1) || 16;
  const bgW = (width * 16) / uw;
  const bgH = (height * 16) / vh;
  return {
    size: `${bgW}px ${bgH}px`,
    position: `${-(Math.min(u1, u2) / 16) * bgW}px ${-(Math.min(v1, v2) / 16) * bgH}px`,
  };
}

function rotationTransform(el: ModelElement, unit: number): string {
  if (!el.rotation) return '';
  const { origin, axis, angle } = el.rotation;
  const ox = (origin[0] - 8) * unit;
  const oy = (origin[1] - 8) * unit;
  const oz = (origin[2] - 8) * unit;
  const rotate = axis === 'x' ? `rotateX(${angle}deg)` : axis === 'y' ? `rotateY(${-angle}deg)` : `rotateZ(${-angle}deg)`;
  return `translate3d(${ox}px, ${-oy}px, ${oz}px) ${rotate} translate3d(${-ox}px, ${oy}px, ${-oz}px)`;
}

export function elementGeometry(el: ModelElement, unit: number): ElementGeometry {
  const width = (el.to[0] - el.from[0]) * unit;
  const height = (el.to[1] - el.from[1]) * unit;
  const depth = (el.to[2] - el.from[2]) * unit;
  const cx = ((el.from[0] + el.to[0]) / 2 - 8) * unit;
  const cy = ((el.from[1] + el.to[1]) / 2 - 8) * unit;
  const cz = ((el.from[2] + el.to[2]) / 2 - 8) * unit;
  const transform = `${rotationTransform(el, unit)} translate3d(${cx}px, ${-cy}px, ${cz}px)`;
  return { el, width, height, depth, transform };
}

export function collectTexturePaths(elements: ModelElement[], textures: Record<string, string>): string[] {
  const paths = new Set<string>();
  for (const el of elements) {
    for (const face of Object.values(el.faces)) {
      const resolved = resolveTextureRef(textures, face.texture);
      if (resolved) paths.add(resolved);
    }
  }
  return [...paths];
}
