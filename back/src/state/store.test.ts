import store from './store.js';
import FullUser from '../models/FullUser.js';

const fakeWs = {} as never;

const buildUser = (id: string, name = 'alice') =>
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

describe('store', () => {
  beforeEach(() => {
    store.setState({ users: {} });
  });

  it('starts with an empty users map after reset', () => {
    expect(store.getState().users).toEqual({});
  });

  it('merges partial state via setState', () => {
    const user = buildUser('id-1');
    store.setState({ users: { 'id-1': user } });
    expect(store.getState().users['id-1']).toBe(user);
  });

  it('notifies subscribers when state changes', () => {
    const cb = jest.fn();
    store.subscribe(cb);
    store.setState({ users: {} });
    expect(cb).toHaveBeenCalled();
  });

  it('passes the new state to subscribers', () => {
    const cb = jest.fn();
    store.subscribe(cb);
    const user = buildUser('id-2');
    store.setState({ users: { 'id-2': user } });
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ users: { 'id-2': user } }));
  });
});
