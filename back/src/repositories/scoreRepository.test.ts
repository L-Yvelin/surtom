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
  it('counts wins grouped by attempt count', async () => {
    mock.enqueue([
      [
        {
          Attempts: JSON.stringify([
            ['G', 'R'],
            ['G', 'O'],
          ]),
          Answer: 'GO',
        }, // gagné en 2
        {
          Attempts: JSON.stringify([
            ['C', 'A', 'R'],
            ['C', 'O', 'W'],
            ['C', 'A', 'T'],
          ]),
          Answer: 'CAT',
        }, // gagné en 3
        {
          Attempts: JSON.stringify([
            ['G', 'R'],
            ['G', 'O'],
          ]),
          Answer: 'GO',
        }, // gagné en 2
      ],
    ]);
    expect(await getScoreDistribution('alice')).toEqual({ 2: 2, 3: 1 });
  });

  it('routes empty attempts to the not-found bucket instead of dropping them', async () => {
    mock.enqueue([
      [
        { Attempts: JSON.stringify([]), Answer: 'CAT' }, // pas trouvé
        {
          Attempts: JSON.stringify([
            ['G', 'R'],
            ['G', 'O'],
          ]),
          Answer: 'GO',
        }, // gagné en 2
        {
          Attempts: JSON.stringify([
            ['C', 'A', 'R'],
            ['C', 'O', 'W'],
            ['C', 'A', 'T'],
          ]),
          Answer: 'CAT',
        }, // gagné en 3
      ],
    ]);
    expect(await getScoreDistribution('alice')).toEqual({ 0: 1, 2: 1, 3: 1 });
  });

  it('does not confuse a loss after 6 attempts with a win on the 6th attempt', async () => {
    mock.enqueue([
      [
        {
          // 6 tentatives, la dernière ne correspond pas à la réponse -> perdu
          Attempts: JSON.stringify([
            ['D', 'O', 'G'],
            ['D', 'O', 'G'],
            ['D', 'O', 'G'],
            ['D', 'O', 'G'],
            ['D', 'O', 'G'],
            ['D', 'O', 'G'],
          ]),
          Answer: 'CAT',
        },
        {
          // 6 tentatives, la dernière correspond à la réponse -> gagné en 6
          Attempts: JSON.stringify([
            ['D', 'O', 'G'],
            ['D', 'O', 'G'],
            ['D', 'O', 'G'],
            ['D', 'O', 'G'],
            ['D', 'O', 'G'],
            ['C', 'A', 'T'],
          ]),
          Answer: 'CAT',
        },
      ],
    ]);
    expect(await getScoreDistribution('alice')).toEqual({ 0: 1, 6: 1 });
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
