jest.mock('./pool.js', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import pool from './pool.js';
import { getOrCreateTodaysWord, getTodaysWord, getTodaysWordAndHistoryId, getValidWords } from './wordRepository.js';

const query = pool.query as unknown as jest.Mock;

beforeEach(() => {
  query.mockReset();
});

describe('getTodaysWord', () => {
  it('returns the first MinecraftSolution row when present', async () => {
    query.mockResolvedValueOnce([[{ Word: 'PIOCHE' }]]);
    expect(await getTodaysWord()).toBe('PIOCHE');
    expect(query.mock.calls[0][1]).toEqual(['fr']);
  });

  it('uses the supplied worldId in the where clause', async () => {
    query.mockResolvedValueOnce([[]]);
    await getTodaysWord('en');
    expect(query.mock.calls[0][1]).toEqual(['en']);
  });

  it('returns null when no row matches today', async () => {
    query.mockResolvedValueOnce([[]]);
    expect(await getTodaysWord()).toBeNull();
  });
});

describe('getOrCreateTodaysWord', () => {
  it('returns the existing word when one is already assigned for today', async () => {
    query.mockResolvedValueOnce([[{ Word: 'EXISTING' }]]);
    expect(await getOrCreateTodaysWord()).toBe('EXISTING');
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('throws when no word exists in the rotation pool for the language', async () => {
    query.mockResolvedValueOnce([[]]).mockResolvedValueOnce([[]]);
    await expect(getOrCreateTodaysWord()).rejects.toThrow('No words available in MinecraftSolution for language fr');
  });

  it('inserts a new entry and bumps the rotation when none exists for today', async () => {
    query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ ID: 42, Word: 'NEW' }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}]);
    expect(await getOrCreateTodaysWord('fr', 'fr')).toBe('NEW');
    expect(query.mock.calls[2][0]).toMatch(/INSERT INTO WordHistory/);
    expect(query.mock.calls[2][1]).toEqual(['fr', 42]);
    expect(query.mock.calls[3][0]).toMatch(/UPDATE MinecraftSolution/);
    expect(query.mock.calls[3][1]).toEqual([42]);
  });

  it('threads worldId/language through into queries', async () => {
    query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ ID: 7, Word: 'PICK' }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}]);
    await getOrCreateTodaysWord('en', 'en');
    expect(query.mock.calls[0][1]).toEqual(['en']);
    expect(query.mock.calls[1][1]).toEqual(['en', 'en']);
    expect(query.mock.calls[2][1]).toEqual(['en', 7]);
  });
});

describe('getValidWords', () => {
  it('returns the union of valid words for the right pattern, scoped to the language', async () => {
    query.mockResolvedValueOnce([[{ Word: 'GRASS' }, { Word: 'GRAPE' }]]);
    const words = await getValidWords('GLASS');
    expect(words).toEqual(['GRASS', 'GRAPE']);
    expect(query.mock.calls[0][1]).toEqual(['fr', 'G____', 'fr', 'G____']);
  });

  it('passes the language through when supplied', async () => {
    query.mockResolvedValueOnce([[]]);
    await getValidWords('GRASS', 'en');
    expect(query.mock.calls[0][1]).toEqual(['en', 'G____', 'en', 'G____']);
  });

  it('returns an empty list when nothing matches', async () => {
    query.mockResolvedValueOnce([[]]);
    expect(await getValidWords('GRASS')).toEqual([]);
  });
});

describe('getTodaysWordAndHistoryId', () => {
  it('returns the uppercased word and word history id for the world', async () => {
    query.mockResolvedValueOnce([[{ WordHistoryID: 7, Word: 'pioche' }]]);
    expect(await getTodaysWordAndHistoryId()).toEqual({ wordHistoryId: 7, todaysWord: 'PIOCHE' });
    expect(query.mock.calls[0][1]).toEqual(['fr']);
  });

  it('threads the worldId into the where clause', async () => {
    query.mockResolvedValueOnce([[{ WordHistoryID: 9, Word: 'pickaxe' }]]);
    await getTodaysWordAndHistoryId('en');
    expect(query.mock.calls[0][1]).toEqual(['en']);
  });

  it('throws when no row is returned', async () => {
    query.mockResolvedValueOnce([[]]);
    await expect(getTodaysWordAndHistoryId()).rejects.toThrow('Mot du jour introuvable.');
  });
});
