import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import store from '../state/store.js';

jest.mock('../ws/broadcast.js', () => ({
  __esModule: true,
  broadcastToWorld: jest.fn(),
}));

import { broadcastToWorld } from '../ws/broadcast.js';
import { updateUsersList, updateUsersListForWorld } from './userListHandler.js';

const fakeWs = {} as never;

const buildUser = (id: string, name: string, worldId: string = 'fr') =>
  new FullUser(
    id,
    {
      name,
      moderatorLevel: 0,
      isLoggedIn: false,
      isMobile: false,
      words: [],
      isBanned: false,
      xp: 0,
    },
    fakeWs,
    'ip',
    worldId,
  );

describe('updateUsersListForWorld', () => {
  beforeEach(() => {
    (broadcastToWorld as jest.Mock).mockClear();
    store.setState({ users: {} });
  });

  it('broadcasts a USER_LIST containing only members of the given world', () => {
    store.setState({
      users: {
        'id-1': buildUser('id-1', 'alice', 'fr'),
        'id-2': buildUser('id-2', 'bob', 'ephem'),
        'id-3': buildUser('id-3', 'carol', 'fr'),
      },
    });

    updateUsersListForWorld('fr');

    expect(broadcastToWorld).toHaveBeenCalledTimes(1);
    const [worldId, message] = (broadcastToWorld as jest.Mock).mock.calls[0];
    expect(worldId).toBe('fr');
    expect(message.type).toBe(Server.MessageType.USER_LIST);
    const names = message.content.map((u: Server.User) => u.name).sort();
    expect(names).toEqual(['alice', 'carol']);
  });

  it('skips users with an empty name', () => {
    store.setState({ users: { 'id-1': buildUser('id-1', '', 'fr') } });
    updateUsersListForWorld('fr');
    expect((broadcastToWorld as jest.Mock).mock.calls[0][1].content).toEqual([]);
  });

  it('deduplicates by name when the same user is connected twice in the same world', () => {
    store.setState({
      users: {
        'id-1': buildUser('id-1', 'alice', 'fr'),
        'id-2': buildUser('id-2', 'alice', 'fr'),
      },
    });
    updateUsersListForWorld('fr');
    expect((broadcastToWorld as jest.Mock).mock.calls[0][1].content).toHaveLength(1);
  });
});

describe('updateUsersList', () => {
  beforeEach(() => {
    (broadcastToWorld as jest.Mock).mockClear();
    store.setState({ users: {} });
  });

  it('broadcasts a USER_LIST per inhabited world', () => {
    store.setState({
      users: {
        'id-1': buildUser('id-1', 'alice', 'fr'),
        'id-2': buildUser('id-2', 'bob', 'ephem'),
      },
    });
    updateUsersList();
    const calls = (broadcastToWorld as jest.Mock).mock.calls;
    const worldIds = calls.map(([id]) => id).sort();
    expect(worldIds).toEqual(['ephem', 'fr']);
  });
});
