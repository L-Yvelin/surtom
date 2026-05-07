jest.mock('./pool.js', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import pool from './pool.js';
import { getOrCreateTry, getTodaysTriesForPlayer, updateTry } from './tryRepository.js';

const query = pool.query as unknown as jest.Mock;

beforeEach(() => {
  query.mockReset();
});

describe('getTodaysTriesForPlayer', () => {
  it('returns an empty list when no row matches', async () => {
    query.mockResolvedValueOnce([[]]);
    expect(await getTodaysTriesForPlayer('alice')).toEqual([]);
  });

  it('joins each attempt array into a string', async () => {
    query.mockResolvedValueOnce([
      [
        {
          Attempts: JSON.stringify([
            ['G', 'R', 'A', 'S', 'S'],
            ['G', 'R', 'A', 'P', 'E'],
          ]),
        },
      ],
    ]);
    expect(await getTodaysTriesForPlayer('alice')).toEqual(['GRASS', 'GRAPE']);
  });
});

describe('getOrCreateTry', () => {
  it('returns an empty record when the row does not exist', async () => {
    query.mockResolvedValueOnce([[]]);
    expect(await getOrCreateTry(1, 1)).toEqual({ attempts: [], win: false });
  });

  it('parses the stored attempts and Win flag', async () => {
    query.mockResolvedValueOnce([[{ Attempts: JSON.stringify([['G', 'R']]), Win: 1 }]]);
    expect(await getOrCreateTry(1, 1)).toEqual({ attempts: [['G', 'R']], win: true });
  });

  it('defaults Win to false when null/0', async () => {
    query.mockResolvedValueOnce([[{ Attempts: null, Win: 0 }]]);
    expect(await getOrCreateTry(1, 1)).toEqual({ attempts: [], win: false });
  });
});

describe('updateTry', () => {
  it('runs an INSERT ... ON DUPLICATE KEY UPDATE with serialized attempts', async () => {
    query.mockResolvedValueOnce([{}]);
    await updateTry(1, 2, [['G', 'R', 'A', 'S', 'S']], true);
    expect(query.mock.calls[0][0]).toMatch(/INSERT INTO Try/);
    expect(query.mock.calls[0][1]).toEqual([1, 2, JSON.stringify([['G', 'R', 'A', 'S', 'S']]), true, 1]);
  });
});
