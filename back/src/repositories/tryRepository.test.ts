import { createMockDb } from '../db/testing.js';

const mock = createMockDb();
jest.mock('../db/client.js', () => ({
  __esModule: true,
  db: mock.db,
  schema: {},
}));

import { getOrCreateTry, getTodaysTriesForPlayer, updateTry } from './tryRepository.js';

beforeEach(() => {
  mock.reset();
});

describe('getTodaysTriesForPlayer', () => {
  it('returns an empty list when no row matches', async () => {
    mock.enqueue([]);
    expect(await getTodaysTriesForPlayer('alice')).toEqual([]);
  });

  it('joins each attempt array into a string', async () => {
    mock.enqueue([
      {
        attempts: JSON.stringify([
          ['G', 'R', 'A', 'S', 'S'],
          ['G', 'R', 'A', 'P', 'E'],
        ]),
      },
    ]);
    expect(await getTodaysTriesForPlayer('alice')).toEqual(['GRASS', 'GRAPE']);
  });
});

describe('getOrCreateTry', () => {
  it('returns an empty record when the row does not exist', async () => {
    mock.enqueue([]);
    expect(await getOrCreateTry(1, 1)).toEqual({ attempts: [], win: false });
  });

  it('parses the stored attempts and Win flag', async () => {
    mock.enqueue([{ attempts: JSON.stringify([['G', 'R']]), win: 1 }]);
    expect(await getOrCreateTry(1, 1)).toEqual({ attempts: [['G', 'R']], win: true });
  });

  it('defaults Win to false when null/0', async () => {
    mock.enqueue([{ attempts: null, win: 0 }]);
    expect(await getOrCreateTry(1, 1)).toEqual({ attempts: [], win: false });
  });
});

describe('updateTry', () => {
  it('runs an upsert with serialized attempts', async () => {
    mock.enqueue({ affectedRows: 1 });
    await updateTry(1, 2, [['G', 'R', 'A', 'S', 'S']], true);
    expect(mock.lastBuilderCalls()).toEqual(expect.arrayContaining(['insert', 'values', 'onDuplicateKeyUpdate']));
  });
});
