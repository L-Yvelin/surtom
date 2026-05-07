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
  it('returns the first MotMinecraft when present', async () => {
    query.mockResolvedValueOnce([[{ MotMinecraft: 'PIOCHE' }]]);
    expect(await getTodaysWord()).toBe('PIOCHE');
  });

  it('returns null when no row matches today', async () => {
    query.mockResolvedValueOnce([[]]);
    expect(await getTodaysWord()).toBeNull();
  });
});

describe('getOrCreateTodaysWord', () => {
  it('returns the existing word when one is already assigned for today', async () => {
    query.mockResolvedValueOnce([[{ MotMinecraft: 'EXISTING' }]]);
    expect(await getOrCreateTodaysWord()).toBe('EXISTING');
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('throws when no word exists in the rotation pool', async () => {
    query.mockResolvedValueOnce([[]]).mockResolvedValueOnce([[]]);
    await expect(getOrCreateTodaysWord()).rejects.toThrow('No words available in MotMinecraft');
  });

  it('inserts a new entry and bumps the rotation when none exists for today', async () => {
    query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ ID: 42, MotMinecraft: 'NEW' }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}]);
    expect(await getOrCreateTodaysWord()).toBe('NEW');
    expect(query.mock.calls[2][0]).toMatch(/INSERT INTO WordHistory/);
    expect(query.mock.calls[2][1]).toEqual([42]);
    expect(query.mock.calls[3][0]).toMatch(/UPDATE MotMinecraft/);
    expect(query.mock.calls[3][1]).toEqual([42]);
  });
});

describe('getValidWords', () => {
  it('returns the union of valid words for the right pattern', async () => {
    query.mockResolvedValueOnce([[{ MotValide: 'GRASS' }, { MotValide: 'GRAPE' }]]);
    const words = await getValidWords('GLASS');
    expect(words).toEqual(['GRASS', 'GRAPE']);
    expect(query.mock.calls[0][1]).toEqual(['G____', 'G____']);
  });

  it('returns an empty list when nothing matches', async () => {
    query.mockResolvedValueOnce([[]]);
    expect(await getValidWords('GRASS')).toEqual([]);
  });
});

describe('getTodaysWordAndHistoryId', () => {
  it('returns the uppercased word and word history id', async () => {
    query.mockResolvedValueOnce([[{ WordHistoryID: 7, MotMinecraft: 'pioche' }]]);
    expect(await getTodaysWordAndHistoryId()).toEqual({ wordHistoryId: 7, todaysWord: 'PIOCHE' });
  });

  it('throws when no row is returned', async () => {
    query.mockResolvedValueOnce([[]]);
    await expect(getTodaysWordAndHistoryId()).rejects.toThrow('Mot du jour introuvable.');
  });
});
