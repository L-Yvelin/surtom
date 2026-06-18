import { faceSize, faceTransform } from './faceTransforms';

const dims = { width: 6, height: 2, depth: 4 };
const unit = 16;

describe('faceTransform', () => {
  it('south sits on the +Z surface (no rotation, half the depth offset)', () => {
    expect(faceTransform('south', dims, unit)).toBe('translateZ(32px)');
  });

  it('north flips around Y then translates by half the depth', () => {
    expect(faceTransform('north', dims, unit)).toBe('rotateY(180deg) translateZ(32px)');
  });

  it('east rotates +90 around Y and translates by half the width', () => {
    expect(faceTransform('east', dims, unit)).toBe('rotateY(90deg) translateZ(48px)');
  });

  it('west rotates -90 around Y and translates by half the width', () => {
    expect(faceTransform('west', dims, unit)).toBe('rotateY(-90deg) translateZ(48px)');
  });

  it('up rotates +90 around X and translates by half the height', () => {
    expect(faceTransform('up', dims, unit)).toBe('rotateX(90deg) translateZ(16px)');
  });

  it('down rotates -90 around X and translates by half the height', () => {
    expect(faceTransform('down', dims, unit)).toBe('rotateX(-90deg) translateZ(16px)');
  });
});

describe('faceSize', () => {
  it('south/north size = (width, height) * unit', () => {
    expect(faceSize('south', dims, unit)).toEqual({ width: 96, height: 32 });
    expect(faceSize('north', dims, unit)).toEqual({ width: 96, height: 32 });
  });

  it('east/west size = (depth, height) * unit', () => {
    expect(faceSize('east', dims, unit)).toEqual({ width: 64, height: 32 });
    expect(faceSize('west', dims, unit)).toEqual({ width: 64, height: 32 });
  });

  it('up/down size = (width, depth) * unit', () => {
    expect(faceSize('up', dims, unit)).toEqual({ width: 96, height: 64 });
    expect(faceSize('down', dims, unit)).toEqual({ width: 96, height: 64 });
  });
});
