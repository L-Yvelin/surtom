import { createMockDb } from '../db/testing.js';

const mock = createMockDb();
jest.mock('../db/client.js', () => ({
  __esModule: true,
  db: mock.db,
  schema: {},
}));

import { getDailyScore, getScoreDistribution } from './scoreRepository.js';

beforeEach(() => {
  mock.reset();
});

describe('getScoreDistribution', () => {
  it('counts attempts grouped by attempt count', async () => {
    mock.enqueue([
      [
        { Attempts: JSON.stringify([['G'], ['G']]) },
        { Attempts: JSON.stringify([['G'], ['G'], ['G']]) },
        { Attempts: JSON.stringify([['G'], ['G']]) },
      ],
    ]);
    expect(await getScoreDistribution('alice')).toEqual({ 2: 2, 3: 1 });
  });

  it('returns an empty object when no scores exist', async () => {
    mock.enqueue([[]]);
    expect(await getScoreDistribution('alice')).toEqual({});
  });

  it('accepts a worldId without throwing', async () => {
    mock.enqueue([[]]);
    await expect(getScoreDistribution('alice', 'en')).resolves.toEqual({});
  });
});

describe('getDailyScore', () => {
  it('returns parsed attempts when a row matches the WordHistoryID', async () => {
    mock.enqueue([{ attempts: JSON.stringify([['G', 'R', 'A', 'S', 'S']]) }]);
    expect(await getDailyScore('alice', 42)).toEqual([['G', 'R', 'A', 'S', 'S']]);
  });

  it('returns an empty list when no row is found for the given WordHistoryID', async () => {
    mock.enqueue([]);
    expect(await getDailyScore('alice', 42)).toEqual([]);
  });
});
