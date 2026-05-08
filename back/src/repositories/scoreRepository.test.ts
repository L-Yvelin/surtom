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
  it('counts attempts grouped by attempt count, scoped to the world', async () => {
    query.mockResolvedValueOnce([
      [
        { Attempts: JSON.stringify([['G'], ['G']]) },
        { Attempts: JSON.stringify([['G'], ['G'], ['G']]) },
        { Attempts: JSON.stringify([['G'], ['G']]) },
      ],
    ]);
    expect(await getScoreDistribution('alice')).toEqual({ 2: 2, 3: 1 });
    expect(query.mock.calls[0][1]).toEqual(['alice', 'fr', 'alice', 'fr', 'alice', 'fr']);
  });

  it('threads the worldId into the query', async () => {
    query.mockResolvedValueOnce([[]]);
    await getScoreDistribution('alice', 'en');
    expect(query.mock.calls[0][1]).toEqual(['alice', 'en', 'alice', 'en', 'alice', 'en']);
  });

  it('returns an empty object when no scores exist', async () => {
    query.mockResolvedValueOnce([[]]);
    expect(await getScoreDistribution('alice')).toEqual({});
  });
});

describe('getDailyScore', () => {
  it('uses the WordHistoryID-based check', async () => {
    query.mockResolvedValueOnce([[{ Attempts: JSON.stringify([['G', 'R', 'A', 'S', 'S']]) }]]);
    expect(await getDailyScore('alice', 42)).toEqual([['G', 'R', 'A', 'S', 'S']]);
    expect(query.mock.calls[0][0]).toMatch(/WordHistoryID = \?/);
    expect(query.mock.calls[0][1]).toEqual(['alice', 42]);
  });

  it('returns an empty list when no row is found for the given WordHistoryID', async () => {
    query.mockResolvedValueOnce([[]]);
    expect(await getDailyScore('alice', 42)).toEqual([]);
  });
});
