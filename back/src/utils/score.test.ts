import { isScoreContentCoherent } from './score.js';

const make = (attempts: string[][]) => ({ attempts });

describe('isScoreContentCoherent', () => {
  it('rejects empty attempts list', () => {
    expect(isScoreContentCoherent(make([]))).toBe(false);
  });

  it('accepts a single attempt', () => {
    expect(isScoreContentCoherent(make([['G', 'R', 'A', 'S', 'S']]))).toBe(true);
  });

  it('accepts up to 6 attempts of equal length', () => {
    const attempts = Array.from({ length: 6 }, () => ['G', 'R', 'A', 'S', 'S']);
    expect(isScoreContentCoherent(make(attempts))).toBe(true);
  });

  it('rejects more than 6 attempts', () => {
    const attempts = Array.from({ length: 7 }, () => ['G', 'R', 'A', 'S', 'S']);
    expect(isScoreContentCoherent(make(attempts))).toBe(false);
  });

  it('rejects attempts of varying length', () => {
    expect(
      isScoreContentCoherent(
        make([
          ['A', 'B', 'C'],
          ['A', 'B'],
        ]),
      ),
    ).toBe(false);
  });
});
