import type { Element3D, FaceData, FaceDirection, MinecraftElement, MinecraftFace, MinecraftModelJson, SceneGraph } from './types';

function parseFaces(el: MinecraftElement): Partial<Record<FaceDirection, FaceData>> {
  if (!el.faces) return {};
  const out: Partial<Record<FaceDirection, FaceData>> = {};
  for (const [key, face] of Object.entries(el.faces)) {
    if (!face) continue;
    const f = face as MinecraftFace;
    out[key as FaceDirection] = {
      uv: f.uv,
      texture: f.texture,
      cullface: f.cullface,
      rotation: f.rotation,
    };
  }
  return out;
}

function parseElement(el: MinecraftElement, index: number): Element3D {
  const [x1, y1, z1] = el.from;
  const [x2, y2, z2] = el.to;

  return {
    id: el.name ?? `el-${index}`,
    position: {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2,
      z: (z1 + z2) / 2,
    },
    size: {
      width: x2 - x1,
      height: y2 - y1,
      depth: z2 - z1,
    },
    rotation: el.rotation
      ? {
          origin: el.rotation.origin,
          axis: el.rotation.axis,
          angle: el.rotation.angle,
          rescale: el.rotation.rescale,
        }
      : undefined,
    faces: parseFaces(el),
  };
}

export function parseMinecraftModel(model: MinecraftModelJson): SceneGraph {
  return {
    elements: (model.elements ?? []).map(parseElement),
  };
}
