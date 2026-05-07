jest.mock('./pool.js', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: jest.fn(async () => 'hashed'),
    compare: jest.fn(),
  },
}));

import bcrypt from 'bcrypt';
import pool from './pool.js';
import { getPlayerByName, getPlayerBySessionHash, loginPlayer, registerPlayer, storeSessionHash } from './playerRepository.js';

const query = pool.query as unknown as jest.Mock;

const buildRow = (
  overrides: Partial<{
    ID: number;
    Username: string;
    Password: string;
    SessionHash: string | null;
    RegistrationDate: string;
    IsAdmin: number;
    IsBanned: number;
  }> = {},
) => ({
  ID: 1,
  Username: 'alice',
  Password: 'pwhash',
  SessionHash: null,
  RegistrationDate: '2024-01-01',
  IsAdmin: 0,
  IsBanned: 0,
  ...overrides,
});

beforeEach(() => {
  query.mockReset();
});

describe('getPlayerBySessionHash', () => {
  it('maps the row when found', async () => {
    query.mockResolvedValueOnce([[buildRow({ SessionHash: 'h' })]]);
    const player = await getPlayerBySessionHash('h');
    expect(player).toMatchObject({ id: 1, username: 'alice', sessionHash: 'h' });
  });

  it('returns undefined when no row matches', async () => {
    query.mockResolvedValueOnce([[]]);
    expect(await getPlayerBySessionHash('h')).toBeUndefined();
  });
});

describe('getPlayerByName', () => {
  it('returns the mapped player', async () => {
    query.mockResolvedValueOnce([[buildRow()]]);
    expect((await getPlayerByName('alice'))?.username).toBe('alice');
  });
});

describe('registerPlayer', () => {
  it('throws when the username is already taken', async () => {
    query.mockResolvedValueOnce([[buildRow()]]);
    await expect(registerPlayer('alice', 'pw')).rejects.toThrow('Oups, pseudo déjà pris.');
  });

  it('inserts a new player when the username is available', async () => {
    query.mockResolvedValueOnce([[]]).mockResolvedValueOnce([{}]);
    await registerPlayer('newcomer', 'pw');
    expect(bcrypt.hash).toHaveBeenCalledWith('pw', 10);
    expect(query).toHaveBeenLastCalledWith('INSERT INTO Player (Username, Password) VALUES (?, ?)', ['newcomer', 'hashed']);
  });
});

describe('loginPlayer', () => {
  it('throws when the user does not exist', async () => {
    query.mockResolvedValueOnce([[]]);
    await expect(loginPlayer('nope', 'pw')).rejects.toThrow('Utilisateur inconnu au bataillon...');
  });

  it('throws when the password does not match', async () => {
    query.mockResolvedValueOnce([[buildRow()]]);
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
    await expect(loginPlayer('alice', 'pw')).rejects.toThrow('Mot de passe invalide !');
  });

  it('returns the mapped player when login succeeds', async () => {
    query.mockResolvedValueOnce([[buildRow({ Username: 'alice' })]]);
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    expect((await loginPlayer('alice', 'pw')).username).toBe('alice');
  });
});

describe('storeSessionHash', () => {
  it('runs an UPDATE Player query', async () => {
    query.mockResolvedValueOnce([{}]);
    await storeSessionHash(7, 'newhash');
    expect(query).toHaveBeenCalledWith('UPDATE Player SET SessionHash = ? WHERE ID = ?', ['newhash', 7]);
  });
});
