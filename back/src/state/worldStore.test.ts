jest.mock('../repositories/messageRepository.js', () => ({
  __esModule: true,
  getMessages: jest.fn(),
  saveMessage: jest.fn(),
  toggleMessage: jest.fn(),
}));
jest.mock('../repositories/wordRepository.js', () => ({
  __esModule: true,
  getOrCreateTodaysWord: jest.fn(),
  getTodaysWordAndHistoryId: jest.fn(),
  getValidWords: jest.fn(),
}));
jest.mock('../repositories/scoreRepository.js', () => ({
  __esModule: true,
  getDailyScore: jest.fn(),
}));
jest.mock('../repositories/playerRepository.js', () => ({
  __esModule: true,
  getPlayerByName: jest.fn(),
}));
jest.mock('../repositories/tryRepository.js', () => ({
  __esModule: true,
  getOrCreateTry: jest.fn(),
  updateTry: jest.fn(),
}));

import { getTodaysWordAndHistoryId } from '../repositories/wordRepository.js';
import { getPlayerByName } from '../repositories/playerRepository.js';
import { getOrCreateTry, updateTry } from '../repositories/tryRepository.js';
import { DbWorldStore, MemoryWorldStore } from './worldStore.js';

describe('DbWorldStore.recordTry', () => {
  const store = new DbWorldStore('fr', 'fr');

  beforeEach(() => {
    jest.clearAllMocks();
    (getPlayerByName as jest.Mock).mockResolvedValue({ id: 7, username: 'alice' });
    (getTodaysWordAndHistoryId as jest.Mock).mockResolvedValue({ wordHistoryId: 1, todaysWord: 'GRASS' });
  });

  it('returns the same {attempts, win} that a subsequent getTries call would report', async () => {
    // Persisted state right before recordTry: one prior losing attempt.
    (getOrCreateTry as jest.Mock).mockResolvedValueOnce({ attempts: [['G', 'R', 'A', 'P', 'E']], win: false });
    const recorded = await store.recordTry('alice', ['G', 'R', 'A', 'S', 'S'], true);

    expect(recorded).toEqual({
      attempts: [
        ['G', 'R', 'A', 'P', 'E'],
        ['G', 'R', 'A', 'S', 'S'],
      ],
      win: true,
    });
    expect(updateTry).toHaveBeenCalledWith(7, 1, recorded.attempts, true);

    // getTries independently re-reads through getOrCreateTry — simulate the repository
    // now reporting the just-persisted row, to check recordTry's return value isn't stale.
    (getOrCreateTry as jest.Mock).mockResolvedValueOnce(recorded);
    const readBack = await store.getTries('alice');
    expect(readBack).toEqual(recorded);
  });

  it('preserves an existing win once true, even when the new attempt itself does not win', async () => {
    (getOrCreateTry as jest.Mock).mockResolvedValueOnce({ attempts: [['G', 'R', 'A', 'S', 'S']], win: true });
    const recorded = await store.recordTry('alice', ['G', 'R', 'A', 'P', 'E'], false);
    expect(recorded.win).toBe(true);
  });

  it('throws without persisting when the player cannot be found', async () => {
    (getPlayerByName as jest.Mock).mockResolvedValue(undefined);
    await expect(store.recordTry('ghost', ['G', 'R', 'A', 'S', 'S'], true)).rejects.toThrow('Utilisateur introuvable.');
    expect(updateTry).not.toHaveBeenCalled();
  });
});

describe('MemoryWorldStore.recordTry', () => {
  it('returns the same {attempts, win} that a subsequent getTries call would report', async () => {
    const store = new MemoryWorldStore('ephem', 'DIAMANT', ['DIAMANT']);
    const recorded = await store.recordTry('alice', ['D', 'I', 'A', 'M', 'A', 'N', 'T'], true);
    const readBack = await store.getTries('alice');
    expect(readBack).toEqual(recorded);
  });
});
