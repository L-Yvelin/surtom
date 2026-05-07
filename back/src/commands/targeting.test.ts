import FullUser from '../models/FullUser.js';
import store from '../state/store.js';

jest.mock('../ws/send.js', () => ({
  __esModule: true,
  sendError: jest.fn(),
}));

import { sendError } from '../ws/send.js';
import { getTargetedUsers } from './targeting.js';

const fakeWs = {} as never;

const buildUser = (id: string, name: string) =>
  new FullUser(
    id,
    {
      name,
      moderatorLevel: 0,
      isLoggedIn: true,
      isMobile: false,
      words: [],
      isBanned: false,
      xp: 0,
    },
    fakeWs,
    'ip',
  );

const setUsers = (users: FullUser[]) => {
  const map: Record<string, FullUser> = {};
  users.forEach((u) => (map[u.id] = u));
  store.setState({ users: map });
};

beforeEach(() => {
  jest.clearAllMocks();
  store.setState({ users: {} });
});

describe('getTargetedUsers', () => {
  it('returns every user for @a', () => {
    const a = buildUser('1', 'a');
    const b = buildUser('2', 'b');
    setUsers([a, b]);
    expect(getTargetedUsers('@a', a)).toHaveLength(2);
  });

  it('returns every user for @e', () => {
    const a = buildUser('1', 'a');
    const b = buildUser('2', 'b');
    setUsers([a, b]);
    expect(getTargetedUsers('@e', a)).toHaveLength(2);
  });

  it('returns the requester for @s', () => {
    const a = buildUser('1', 'a');
    setUsers([a]);
    expect(getTargetedUsers('@s', a)).toEqual([a]);
  });

  it('returns one (random) user for @r', () => {
    const a = buildUser('1', 'a');
    const b = buildUser('2', 'b');
    setUsers([a, b]);
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(getTargetedUsers('@r', a)).toEqual([a]);
    spy.mockReturnValue(0.99);
    expect(getTargetedUsers('@r', a)).toEqual([b]);
    spy.mockRestore();
  });

  it('matches a single user by exact name', () => {
    const a = buildUser('1', 'alice');
    const b = buildUser('2', 'bob');
    setUsers([a, b]);
    expect(getTargetedUsers('alice', a)).toEqual([a]);
  });

  it('strips a leading @ when looking up a user', () => {
    const a = buildUser('1', 'alice');
    setUsers([a]);
    expect(getTargetedUsers('@alice', a)).toEqual([a]);
  });

  it('reports "Utilisateur inexistant" when nobody matches the name', () => {
    const a = buildUser('1', 'alice');
    setUsers([a]);
    expect(getTargetedUsers('nope', a)).toEqual([]);
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Utilisateur inexistant');
  });

  it('rejects an invalid username', () => {
    const a = buildUser('1', 'alice');
    setUsers([a]);
    expect(getTargetedUsers('bad name!', a)).toEqual([]);
    expect(sendError).toHaveBeenCalledWith(fakeWs, "Nom d'utilisateur invalide");
  });
});
