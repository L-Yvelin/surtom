jest.mock('./pool.js', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import pool from './pool.js';
import { getDailyScore, getScoreDistribution } from './scoreRepository.js';

const query = pool.query as unknown as jest.Mock;

beforeEach(() => {
  query.mockReset();
});

describe('getScoreDistribution', () => {
  it('counts attempts grouped by attempt count', async () => {
    query.mockResolvedValueOnce([
      [
        { Attempts: JSON.stringify([['G'], ['G']]) },
        { Attempts: JSON.stringify([['G'], ['G'], ['G']]) },
        { Attempts: JSON.stringify([['G'], ['G']]) },
      ],
    ]);
    expect(await getScoreDistribution('alice')).toEqual({ 2: 2, 3: 1 });
  });

  it('returns an empty object when no scores exist', async () => {
    query.mockResolvedValueOnce([[]]);
    expect(await getScoreDistribution('alice')).toEqual({});
  });
});

describe('getDailyScore', () => {
  it('returns the parsed attempts when present', async () => {
    query.mockResolvedValueOnce([[{ Attempts: JSON.stringify([['G', 'R', 'A', 'S', 'S']]) }]]);
    expect(await getDailyScore('alice')).toEqual([['G', 'R', 'A', 'S', 'S']]);
  });

  it('returns an empty list when nothing was found', async () => {
    query.mockResolvedValueOnce([[]]);
    expect(await getDailyScore('alice')).toEqual([]);
  });
});
