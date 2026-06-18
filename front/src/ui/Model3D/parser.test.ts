import { parseMinecraftModel } from './parser';

describe('parseMinecraftModel', () => {
  it('returns an empty scene when the model has no elements', () => {
    expect(parseMinecraftModel({})).toEqual({ elements: [] });
  });

  it('converts from/to to a center position and size', () => {
    const scene = parseMinecraftModel({
      elements: [{ from: [5, 0, 6], to: [11, 2, 10], faces: {} }],
    });

    expect(scene.elements).toHaveLength(1);
    const [el] = scene.elements;
    expect(el.position).toEqual({ x: 8, y: 1, z: 8 });
    expect(el.size).toEqual({ width: 6, height: 2, depth: 4 });
  });

  it('preserves face data including uv, texture and cullface', () => {
    const scene = parseMinecraftModel({
      elements: [
        {
          from: [0, 0, 0],
          to: [16, 16, 16],
          faces: { up: { uv: [0, 0, 16, 16], texture: '#all', cullface: 'up' } },
        },
      ],
    });
    expect(scene.elements[0].faces.up).toEqual({
      uv: [0, 0, 16, 16],
      texture: '#all',
      cullface: 'up',
      rotation: undefined,
    });
  });

  it('passes element rotation through', () => {
    const scene = parseMinecraftModel({
      elements: [{ from: [0, 0, 0], to: [16, 16, 16], rotation: { origin: [8, 8, 8], axis: 'y', angle: 45 } }],
    });
    expect(scene.elements[0].rotation).toEqual({
      origin: [8, 8, 8],
      axis: 'y',
      angle: 45,
      rescale: undefined,
    });
  });

  it('assigns stable element IDs by index', () => {
    const scene = parseMinecraftModel({
      elements: [
        { from: [0, 0, 0], to: [1, 1, 1] },
        { from: [2, 2, 2], to: [3, 3, 3] },
      ],
    });
    expect(scene.elements.map((e) => e.id)).toEqual(['el-0', 'el-1']);
  });

  it('honors a user-provided name as the stable element ID', () => {
    const scene = parseMinecraftModel({
      elements: [{ from: [0, 0, 0], to: [1, 1, 1], name: 'button-top' }],
    });
    expect(scene.elements[0].id).toBe('button-top');
  });
});
