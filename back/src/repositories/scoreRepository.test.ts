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

const game = (answer: string, ...words: string[]) => ({
  answer,
  attempts: JSON.stringify(words.map((word) => word.split(''))),
});

describe('getScoreDistribution', () => {
  it('counts wins grouped by their attempt count derived from the attempts', async () => {
    mock.enqueue([game('GRASS', 'CRANE', 'GRASS'), game('GRASS', 'CRANE', 'BREAD', 'GRASS'), game('GRASS', 'BLAST', 'GRASS')]);
    expect(await getScoreDistribution('alice')).toEqual({ 2: 2, 3: 1 });
  });

  it('counts finished losses in the unsolved bucket', async () => {
    mock.enqueue([
      game('GRASS', 'AAAAA', 'BBBBB', 'CCCCC', 'DDDDD', 'EEEEE', 'FFFFF'),
      game('GRASS', 'CRANE', 'GRASS'),
      game('GRASS', 'CRANE', 'BREAD', 'GRASS'),
    ]);
    expect(await getScoreDistribution('alice')).toEqual({ 0: 1, 2: 1, 3: 1 });
  });

  it('does not confuse a loss on the 6th attempt with a win on the 6th attempt', async () => {
    mock.enqueue([
      game('GRASS', 'AAAAA', 'BBBBB', 'CCCCC', 'DDDDD', 'EEEEE', 'FFFFF'),
      game('GRASS', 'AAAAA', 'BBBBB', 'CCCCC', 'DDDDD', 'EEEEE', 'GRASS'),
    ]);
    expect(await getScoreDistribution('alice')).toEqual({ 0: 1, 6: 1 });
  });

  it('counts unfinished games abandoned before winning in the unsolved bucket', async () => {
    mock.enqueue([game('GRASS', 'CRANE', 'BREAD'), game('GRASS', 'CRANE', 'GRASS')]);
    expect(await getScoreDistribution('alice')).toEqual({ 0: 1, 2: 1 });
  });

  it('counts a win when the stored answer is lowercase but attempts are uppercase', async () => {
    mock.enqueue([game('grass', 'GRASS')]);
    expect(await getScoreDistribution('alice')).toEqual({ 1: 1 });
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
