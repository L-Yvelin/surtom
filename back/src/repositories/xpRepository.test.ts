jest.mock('./pool.js', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import pool from './pool.js';
import { getPlayerXp } from './xpRepository.js';

const query = pool.query as unknown as jest.Mock;

beforeEach(() => {
  query.mockReset();
});

describe('getPlayerXp', () => {
  it('returns the XP value reported by the query', async () => {
    query.mockResolvedValueOnce([[{ XP: 123 }]]);
    expect(await getPlayerXp('alice')).toBe(123);
  });

  it('returns 0 when no row is returned', async () => {
    query.mockResolvedValueOnce([[]]);
    expect(await getPlayerXp('alice')).toBe(0);
  });

  it('returns 0 when XP is null', async () => {
    query.mockResolvedValueOnce([[{ XP: null }]]);
    expect(await getPlayerXp('alice')).toBe(0);
  });
});
