import { createMockDb } from '../db/testing.js';

const mock = createMockDb();
jest.mock('../db/client.js', () => ({
  __esModule: true,
  db: mock.db,
  schema: {},
}));

import { getOrCreateTodaysWord, getTodaysWord, getTodaysWordAndHistoryId, getValidWords } from './wordRepository.js';

beforeEach(() => {
  mock.reset();
});

describe('getTodaysWord', () => {
  it('returns the first MinecraftSolution row when present', async () => {
    mock.enqueue([{ word: 'PIOCHE' }]);
    expect(await getTodaysWord()).toBe('PIOCHE');
  });

  it('returns null when no row matches today', async () => {
    mock.enqueue([]);
    expect(await getTodaysWord()).toBeNull();
  });

  it('accepts a worldId without throwing', async () => {
    mock.enqueue([]);
    await expect(getTodaysWord('en')).resolves.toBeNull();
  });
});

describe('getOrCreateTodaysWord', () => {
  it('returns the existing word when one is already assigned for today', async () => {
    mock.enqueue([{ word: 'EXISTING' }]);
    expect(await getOrCreateTodaysWord()).toBe('EXISTING');
    expect(mock.callCount()).toBe(1);
  });

  it('throws when no word exists in the rotation pool for the language', async () => {
    mock.enqueue([], []);
    await expect(getOrCreateTodaysWord()).rejects.toThrow('No words available in MinecraftSolution for language fr');
  });

  it('inserts a new entry and bumps the rotation when none exists for today', async () => {
    mock.enqueue([], [{ id: 42, word: 'NEW' }], { affectedRows: 1 }, { affectedRows: 1 });
    expect(await getOrCreateTodaysWord('fr', 'fr')).toBe('NEW');
    expect(mock.callCount()).toBe(4);
  });

  it('handles non-default worldId/language', async () => {
    mock.enqueue([], [{ id: 7, word: 'PICK' }], { affectedRows: 1 }, { affectedRows: 1 });
    await expect(getOrCreateTodaysWord('en', 'en')).resolves.toBe('PICK');
  });
});

describe('getValidWords', () => {
  it('returns the union of valid words for the pattern', async () => {
    mock.enqueue([[{ Word: 'GRASS' }, { Word: 'GRAPE' }], []]);
    const words = await getValidWords('GLASS');
    expect(words).toEqual(['GRASS', 'GRAPE']);
  });

  it('returns an empty list when nothing matches', async () => {
    mock.enqueue([[], []]);
    expect(await getValidWords('GRASS')).toEqual([]);
  });
});

describe('getTodaysWordAndHistoryId', () => {
  it('returns the uppercased word and word history id', async () => {
    mock.enqueue([{ wordHistoryId: 7, word: 'pioche' }]);
    expect(await getTodaysWordAndHistoryId()).toEqual({ wordHistoryId: 7, todaysWord: 'PIOCHE' });
  });

  it('threads the worldId without throwing', async () => {
    mock.enqueue([{ wordHistoryId: 9, word: 'pickaxe' }]);
    await expect(getTodaysWordAndHistoryId('en')).resolves.toEqual({ wordHistoryId: 9, todaysWord: 'PICKAXE' });
  });

  it('throws when no row is returned', async () => {
    mock.enqueue([]);
    await expect(getTodaysWordAndHistoryId()).rejects.toThrow('Mot du jour introuvable.');
  });
});
