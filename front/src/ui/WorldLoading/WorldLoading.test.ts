import { isWorldReady } from './utils';

describe('isWorldReady', () => {
  test('false while cosmetic timer is still running, regardless of solution', () => {
    expect(isWorldReady(false, undefined)).toBe(false);
    expect(isWorldReady(false, 'CHIEN')).toBe(false);
  });

  test('false after cosmetic timer if no solution yet (slow WS connect)', () => {
    expect(isWorldReady(true, undefined)).toBe(false);
  });

  test('true only when both cosmetic timer is done AND solution has arrived', () => {
    expect(isWorldReady(true, 'CHIEN')).toBe(true);
  });

  test('an empty-string solution does not count as ready (defensive against bad server payload)', () => {
    expect(isWorldReady(true, '')).toBe(false);
  });
});
