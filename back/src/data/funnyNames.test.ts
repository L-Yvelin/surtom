import { funnyNames } from './funnyNames.js';

describe('funnyNames', () => {
  it('is non-empty', () => {
    expect(funnyNames.length).toBeGreaterThan(0);
  });

  it('contains only non-empty strings', () => {
    funnyNames.forEach((name) => {
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });
  });

  it('contains no duplicates', () => {
    expect(new Set(funnyNames).size).toBe(funnyNames.length);
  });
});
