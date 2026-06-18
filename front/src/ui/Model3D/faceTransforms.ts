import type { FaceDirection } from './types';

export interface CuboidSize {
  width: number;
  height: number;
  depth: number;
}

export interface FacePixelSize {
  width: number;
  height: number;
}

interface FaceDef {
  rotate: string;
  axis: 'width' | 'height' | 'depth';
  size: (size: CuboidSize, unit: number) => FacePixelSize;
}

const FACE_DEFS: Record<FaceDirection, FaceDef> = {
  south: {
    rotate: '',
    axis: 'depth',
    size: (s, u) => ({ width: s.width * u, height: s.height * u }),
  },
  north: {
    rotate: 'rotateY(180deg)',
    axis: 'depth',
    size: (s, u) => ({ width: s.width * u, height: s.height * u }),
  },
  east: {
    rotate: 'rotateY(90deg)',
    axis: 'width',
    size: (s, u) => ({ width: s.depth * u, height: s.height * u }),
  },
  west: {
    rotate: 'rotateY(-90deg)',
    axis: 'width',
    size: (s, u) => ({ width: s.depth * u, height: s.height * u }),
  },
  up: {
    rotate: 'rotateX(90deg)',
    axis: 'height',
    size: (s, u) => ({ width: s.width * u, height: s.depth * u }),
  },
  down: {
    rotate: 'rotateX(-90deg)',
    axis: 'height',
    size: (s, u) => ({ width: s.width * u, height: s.depth * u }),
  },
};

export function faceTransform(direction: FaceDirection, size: CuboidSize, unit: number): string {
  const def = FACE_DEFS[direction];
  const offset = (size[def.axis] * unit) / 2;
  return def.rotate ? `${def.rotate} translateZ(${offset}px)` : `translateZ(${offset}px)`;
}

export function faceSize(direction: FaceDirection, size: CuboidSize, unit: number): FacePixelSize {
  return FACE_DEFS[direction].size(size, unit);
}
