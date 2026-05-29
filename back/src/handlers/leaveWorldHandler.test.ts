import FullUser from '../models/FullUser.js';
import { worldRegistry, DEFAULT_WORLD_ID } from '../state/worldRegistry.js';

const EPHEM_ID = 'ephem-leave';

jest.mock('./userListHandler.js', () => ({
  __esModule: true,
  updateUsersListForWorld: jest.fn(),
}));

import { updateUsersListForWorld } from './userListHandler.js';
import { handleLeaveWorld } from './leaveWorldHandler.js';

const fakeWs = {} as never;

const buildUser = (worldId: string | null) =>
  new FullUser(
    'id-1',
    { name: 'alice', moderatorLevel: 0, isLoggedIn: true, isMobile: false, words: [], isBanned: false, xp: 0 },
    fakeWs,
    'ip',
    worldId,
  );

beforeEach(() => {
  jest.clearAllMocks();
  worldRegistry.resetForTests();
  worldRegistry.addEphemeral({
    id: EPHEM_ID,
    displayName: 'Ephemeral leave',
    language: 'fr',
    solution: 'DIAMANT',
    validWords: ['DIAMANT'],
  });
});

describe('handleLeaveWorld', () => {
  it('is a no-op when the user is not in any world', () => {
    const user = buildUser(null);
    handleLeaveWorld(user);
    expect(user.worldId).toBeNull();
    expect(updateUsersListForWorld).not.toHaveBeenCalled();
  });

  it('removes the user from the world, clears worldId and broadcasts the user list for the left world', () => {
    const user = buildUser(EPHEM_ID);
    worldRegistry.get(EPHEM_ID)!.addMember(user.id);

    handleLeaveWorld(user);

    expect(worldRegistry.get(EPHEM_ID)!.hasMember(user.id)).toBe(false);
    expect(user.worldId).toBeNull();
    expect(updateUsersListForWorld).toHaveBeenCalledWith(EPHEM_ID);
    expect(updateUsersListForWorld).toHaveBeenCalledTimes(1);
  });

  it('still clears membership and worldId when the previous world id is no longer registered', () => {
    const user = buildUser('vanished-world');
    handleLeaveWorld(user);
    expect(user.worldId).toBeNull();
    expect(updateUsersListForWorld).toHaveBeenCalledWith('vanished-world');
  });

  it('does not touch other worlds the user is not in', () => {
    const user = buildUser(EPHEM_ID);
    worldRegistry.get(EPHEM_ID)!.addMember(user.id);
    worldRegistry.get(DEFAULT_WORLD_ID)!.addMember('other-user');

    handleLeaveWorld(user);

    expect(worldRegistry.get(DEFAULT_WORLD_ID)!.hasMember('other-user')).toBe(true);
    expect(updateUsersListForWorld).not.toHaveBeenCalledWith(DEFAULT_WORLD_ID);
  });
});
