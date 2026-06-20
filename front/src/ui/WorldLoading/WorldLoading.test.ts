import { isWorldReady } from './utils';

describe('isWorldReady', () => {
  test('false while cosmetic timer is still running, regardless of solution or packs', () => {
    expect(isWorldReady(false, undefined, false)).toBe(false);
    expect(isWorldReady(false, 'CHIEN', true)).toBe(false);
  });

  test('false after cosmetic timer if no solution yet (slow WS connect)', () => {
    expect(isWorldReady(true, undefined, true)).toBe(false);
  });

  test('false after cosmetic timer and solution if packs not ready yet', () => {
    expect(isWorldReady(true, 'CHIEN', false)).toBe(false);
  });

  test('true only when cosmetic timer done, solution arrived, and packs ready', () => {
    expect(isWorldReady(true, 'CHIEN', true)).toBe(true);
  });

  test('an empty-string solution does not count as ready (defensive against bad server payload)', () => {
    expect(isWorldReady(true, '', true)).toBe(false);
  });
});
