import { calculateBackgroundPosition, calculateUV } from './uv';

describe('calculateUV', () => {
  it('defaults to the full texture when uv is missing', () => {
    expect(calculateUV(undefined)).toEqual({ uScale: 1, vScale: 1, uOffset: 0, vOffset: 0 });
  });

  it('computes 0..1 fractions from MC 0..16 UV', () => {
    expect(calculateUV([5, 14, 11, 16])).toEqual({
      uScale: 6 / 16,
      vScale: 2 / 16,
      uOffset: 5 / 16,
      vOffset: 14 / 16,
    });
  });

  it('handles a centered crop', () => {
    expect(calculateUV([4, 4, 12, 12])).toEqual({
      uScale: 0.5,
      vScale: 0.5,
      uOffset: 0.25,
      vOffset: 0.25,
    });
  });
});

describe('calculateBackgroundPosition', () => {
  it('full texture maps to face 1:1 at origin', () => {
    expect(calculateBackgroundPosition([0, 0, 16, 16], 32, 32)).toEqual({
      backgroundSize: '32px 32px',
      backgroundPosition: '0px 0px',
    });
  });

  it('a quarter-area UV produces a 2x background scale and centered offset', () => {
    expect(calculateBackgroundPosition([4, 4, 12, 12], 16, 16)).toEqual({
      backgroundSize: '32px 32px',
      backgroundPosition: '-8px -8px',
    });
  });

  it('non-square face + non-square UV scale independently on each axis', () => {
    expect(calculateBackgroundPosition([5, 14, 11, 16], 96, 32)).toEqual({
      backgroundSize: '256px 256px',
      backgroundPosition: '-80px -224px',
    });
  });

  it('gracefully degrades when face is zero-sized', () => {
    expect(calculateBackgroundPosition([0, 0, 16, 16], 0, 0)).toEqual({
      backgroundSize: '100% 100%',
      backgroundPosition: '0 0',
    });
  });

  it('gracefully degrades when uv is degenerate', () => {
    expect(calculateBackgroundPosition([5, 5, 5, 5], 16, 16)).toEqual({
      backgroundSize: '100% 100%',
      backgroundPosition: '0 0',
    });
  });
});
