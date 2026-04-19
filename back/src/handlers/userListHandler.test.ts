import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import store from '../state/store.js';

jest.mock('../ws/broadcast.js', () => ({
  __esModule: true,
  broadcastAll: jest.fn(),
}));

import { broadcastAll } from '../ws/broadcast.js';
import { updateUsersList } from './userListHandler.js';

const fakeWs = {} as never;

const buildUser = (id: string, name: string) =>
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
  );

describe('updateUsersList', () => {
  beforeEach(() => {
    (broadcastAll as jest.Mock).mockClear();
    store.setState({ users: {} });
  });

  it('broadcasts a USER_LIST containing each unique user', () => {
    store.setState({ users: { 'id-1': buildUser('id-1', 'alice'), 'id-2': buildUser('id-2', 'bob') } });
    updateUsersList();

    expect(broadcastAll).toHaveBeenCalledTimes(1);
    const message = (broadcastAll as jest.Mock).mock.calls[0][0];
    expect(message.type).toBe(Server.MessageType.USER_LIST);
    const names = message.content.map((u: Server.User) => u.name).sort();
    expect(names).toEqual(['alice', 'bob']);
  });

  it('skips users with an empty name', () => {
    store.setState({ users: { 'id-1': buildUser('id-1', '') } });
    updateUsersList();
    expect((broadcastAll as jest.Mock).mock.calls[0][0].content).toEqual([]);
  });

  it('deduplicates by name when the same user is connected twice', () => {
    store.setState({
      users: {
        'id-1': buildUser('id-1', 'alice'),
        'id-2': buildUser('id-2', 'alice'),
      },
    });
    updateUsersList();
    expect((broadcastAll as jest.Mock).mock.calls[0][0].content).toHaveLength(1);
  });
});
