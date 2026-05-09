import { createMockDb } from '../db/__mocks__/mockDb.js';

const mock = createMockDb();
jest.mock('../db/client.js', () => ({
  __esModule: true,
  db: mock.db,
  schema: {},
}));

import { getPlayerXp } from './xpRepository.js';

beforeEach(() => {
  mock.reset();
});

describe('getPlayerXp', () => {
  it('returns the XP value reported by the query', async () => {
    mock.enqueue([{ xp: 123 }]);
    expect(await getPlayerXp('alice')).toBe(123);
  });

  it('returns 0 when no row is returned', async () => {
    mock.enqueue([]);
    expect(await getPlayerXp('alice')).toBe(0);
  });

  it('returns 0 when XP is null', async () => {
    mock.enqueue([{ xp: null }]);
    expect(await getPlayerXp('alice')).toBe(0);
  });
});
