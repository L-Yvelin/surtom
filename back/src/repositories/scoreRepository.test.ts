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
  it('counts wins grouped by their attempt count', async () => {
    mock.enqueue([
      { win: 1, attemptCount: 2 },
      { win: 1, attemptCount: 3 },
      { win: 1, attemptCount: 2 },
    ]);
    expect(await getScoreDistribution('alice')).toEqual({ 2: 2, 3: 1 });
  });

  it('counts finished losses in the unsolved bucket', async () => {
    mock.enqueue([
      { win: 0, attemptCount: 6 },
      { win: 1, attemptCount: 2 },
      { win: 1, attemptCount: 3 },
    ]);
    expect(await getScoreDistribution('alice')).toEqual({ 0: 1, 2: 1, 3: 1 });
  });

  it('does not confuse a loss on the 6th attempt with a win on the 6th attempt', async () => {
    mock.enqueue([
      { win: 0, attemptCount: 6 },
      { win: 1, attemptCount: 6 },
    ]);
    expect(await getScoreDistribution('alice')).toEqual({ 0: 1, 6: 1 });
  });

  it('returns an empty object when no finished games exist', async () => {
    mock.enqueue([]);
    expect(await getScoreDistribution('alice')).toEqual({});
  });

  it('accepts a worldId without throwing', async () => {
    mock.enqueue([]);
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
