import { Anchor, getTooltipPosition } from './utils';

const SCREEN = { width: 1000, height: 800 };

beforeAll(() => {
  Object.defineProperty(globalThis, 'window', {
    value: { innerWidth: SCREEN.width, innerHeight: SCREEN.height },
    configurable: true,
    writable: true,
  });
});

const fakeTooltip = (width: number, height: number): HTMLDivElement =>
  ({
    getBoundingClientRect: () => ({ width, height }) as DOMRect,
  }) as unknown as HTMLDivElement;

describe('getTooltipPosition — anchor placement (no clamping)', () => {
  // Center of screen so clamping doesn't kick in.
  const coords = { x: 500, y: 400 };
  const tooltip = fakeTooltip(100, 50);
  const offset = 10;

  test('TOP_LEFT places tooltip above and to the left', () => {
    expect(getTooltipPosition(coords, tooltip, offset, Anchor.TOP_LEFT)).toStrictEqual({
      x: 500 - 100 - 10,
      y: 400 - 50 - 10,
    });
  });

  test('TOP_RIGHT places tooltip above and to the right', () => {
    expect(getTooltipPosition(coords, tooltip, offset, Anchor.TOP_RIGHT)).toStrictEqual({
      x: 500 + 10,
      y: 400 - 50 - 10,
    });
  });

  test('TOP_MIDDLE centers above the anchor (offset has no effect on x)', () => {
    expect(getTooltipPosition(coords, tooltip, offset, Anchor.TOP_MIDDLE)).toStrictEqual({
      x: 500 - 50,
      y: 400 - 50 - 10,
    });
  });

  test('BOTTOM_LEFT places tooltip below and to the left', () => {
    expect(getTooltipPosition(coords, tooltip, offset, Anchor.BOTTOM_LEFT)).toStrictEqual({
      x: 500 - 100 - 10,
      y: 400 + 10,
    });
  });

  test('BOTTOM_RIGHT places tooltip below and to the right', () => {
    expect(getTooltipPosition(coords, tooltip, offset, Anchor.BOTTOM_RIGHT)).toStrictEqual({
      x: 500 + 10,
      y: 400 + 10,
    });
  });
});

describe('getTooltipPosition — viewport clamping', () => {
  const tooltip = fakeTooltip(100, 50);
  const offset = 10;

  test('clamps x to >= offset when tooltip would overflow the left edge', () => {
    // BOTTOM_LEFT at x=5 → x = 5 - 100 - 10 = -105 → clamped to 10.
    const { x } = getTooltipPosition({ x: 5, y: 400 }, tooltip, offset, Anchor.BOTTOM_LEFT);
    expect(x).toBe(10);
  });

  test('clamps x to <= screenWidth - width - offset when overflowing the right edge', () => {
    // BOTTOM_RIGHT at x=999 → x = 999 + 10 = 1009 → clamped to 1000 - 100 - 10 = 890.
    const { x } = getTooltipPosition({ x: 999, y: 400 }, tooltip, offset, Anchor.BOTTOM_RIGHT);
    expect(x).toBe(890);
  });

  test('clamps y to >= offset when overflowing the top edge', () => {
    // TOP_LEFT at y=5 → y = 5 - 50 - 10 = -55 → clamped to 10.
    const { y } = getTooltipPosition({ x: 500, y: 5 }, tooltip, offset, Anchor.TOP_LEFT);
    expect(y).toBe(10);
  });

  test('clamps y to <= screenHeight - height - offset when overflowing the bottom edge', () => {
    // BOTTOM_RIGHT at y=799 → y = 799 + 10 = 809 → clamped to 800 - 50 - 10 = 740.
    const { y } = getTooltipPosition({ x: 500, y: 799 }, tooltip, offset, Anchor.BOTTOM_RIGHT);
    expect(y).toBe(740);
  });

  test('clamps both x and y simultaneously when in a corner', () => {
    // BOTTOM_RIGHT at bottom-right corner.
    const { x, y } = getTooltipPosition({ x: 999, y: 799 }, tooltip, offset, Anchor.BOTTOM_RIGHT);
    expect(x).toBe(890);
    expect(y).toBe(740);
  });
});
