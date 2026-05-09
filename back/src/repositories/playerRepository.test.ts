import { createMockDb } from '../db/testing.js';

const mock = createMockDb();
jest.mock('../db/client.js', () => ({
  __esModule: true,
  db: mock.db,
  schema: {},
}));

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: jest.fn(async () => 'hashed'),
    compare: jest.fn(),
  },
}));

import bcrypt from 'bcrypt';
import { getPlayerByName, getPlayerBySessionHash, loginPlayer, registerPlayer, storeSessionHash } from './playerRepository.js';

const buildRow = (
  overrides: Partial<{
    id: number;
    username: string;
    password: string;
    sessionHash: string | null;
    registrationDate: Date;
    isAdmin: number;
    isBanned: number;
  }> = {},
) => ({
  id: 1,
  username: 'alice',
  password: 'pwhash',
  sessionHash: null,
  registrationDate: new Date('2024-01-01'),
  isAdmin: 0,
  isBanned: 0,
  ...overrides,
});

beforeEach(() => {
  mock.reset();
  jest.clearAllMocks();
});

describe('getPlayerBySessionHash', () => {
  it('maps the row when found', async () => {
    mock.enqueue([buildRow({ sessionHash: 'h' })]);
    const player = await getPlayerBySessionHash('h');
    expect(player).toMatchObject({ id: 1, username: 'alice', sessionHash: 'h' });
  });

  it('returns undefined when no row matches', async () => {
    mock.enqueue([]);
    expect(await getPlayerBySessionHash('h')).toBeUndefined();
  });
});

describe('getPlayerByName', () => {
  it('returns the mapped player', async () => {
    mock.enqueue([buildRow()]);
    expect((await getPlayerByName('alice'))?.username).toBe('alice');
  });
});

describe('registerPlayer', () => {
  it('throws when the username is already taken', async () => {
    mock.enqueue([buildRow()]);
    await expect(registerPlayer('alice', 'pw')).rejects.toThrow('Oups, pseudo déjà pris.');
  });

  it('inserts a new player when the username is available', async () => {
    mock.enqueue([], { insertId: 2 });
    await registerPlayer('newcomer', 'pw');
    expect(bcrypt.hash).toHaveBeenCalledWith('pw', 10);
  });
});

describe('loginPlayer', () => {
  it('throws when the user does not exist', async () => {
    mock.enqueue([]);
    await expect(loginPlayer('nope', 'pw')).rejects.toThrow('Utilisateur inconnu au bataillon...');
  });

  it('throws when the password does not match', async () => {
    mock.enqueue([buildRow()]);
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
    await expect(loginPlayer('alice', 'pw')).rejects.toThrow('Mot de passe invalide !');
  });

  it('returns the mapped player when login succeeds', async () => {
    mock.enqueue([buildRow({ username: 'alice' })]);
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    expect((await loginPlayer('alice', 'pw')).username).toBe('alice');
  });
});

describe('storeSessionHash', () => {
  it('runs an UPDATE Player query', async () => {
    mock.enqueue({ affectedRows: 1 });
    await storeSessionHash(7, 'newhash');
    expect(mock.lastBuilderCalls()).toEqual(expect.arrayContaining(['update', 'set', 'where']));
  });
});
