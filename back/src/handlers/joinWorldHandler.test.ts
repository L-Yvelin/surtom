import FullUser from '../models/FullUser.js';
import { worldRegistry, DEFAULT_WORLD_ID } from '../state/worldRegistry.js';

const EPHEM_ID = 'ephem-test';

jest.mock('../ws/send.js', () => ({
  __esModule: true,
  sendError: jest.fn(),
  sendToUser: jest.fn(),
}));
jest.mock('../ws/connection.js', () => ({
  __esModule: true,
  sendWorldInitialState: jest.fn(async () => undefined),
}));
jest.mock('./userListHandler.js', () => ({
  __esModule: true,
  updateUsersListForWorld: jest.fn(),
}));
jest.mock('../repositories/scoreRepository.js', () => ({
  __esModule: true,
  getScoreDistribution: jest.fn(async () => ({})),
}));

import { sendError, sendToUser } from '../ws/send.js';
import { sendWorldInitialState } from '../ws/connection.js';
import { updateUsersListForWorld } from './userListHandler.js';
import { getScoreDistribution } from '../repositories/scoreRepository.js';
import { handleJoinWorld } from './joinWorldHandler.js';
import { Server } from '@surtom/interfaces';

const fakeWs = {} as never;

const buildUser = (worldId: string = DEFAULT_WORLD_ID) =>
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
    displayName: 'Ephemeral test',
    language: 'fr',
    solution: 'DIAMANT',
    validWords: ['DIAMANT'],
  });
});

describe('handleJoinWorld', () => {
  it('rejects an unknown world id with a sendError', async () => {
    const user = buildUser();
    await handleJoinWorld(user, { worldId: 'nope' });
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Monde inconnu: nope');
    expect(updateUsersListForWorld).not.toHaveBeenCalled();
    expect(sendWorldInitialState).not.toHaveBeenCalled();
  });

  it('replays initial state when the user is already in the requested world', async () => {
    const user = buildUser(DEFAULT_WORLD_ID);
    await handleJoinWorld(user, { worldId: DEFAULT_WORLD_ID });
    expect(sendWorldInitialState).toHaveBeenCalledWith(user);
    expect(updateUsersListForWorld).not.toHaveBeenCalled();
  });

  it('moves the user, updates membership and broadcasts user list for both worlds', async () => {
    const user = buildUser(DEFAULT_WORLD_ID);
    worldRegistry.get(DEFAULT_WORLD_ID)!.addMember(user.id);

    await handleJoinWorld(user, { worldId: EPHEM_ID });

    expect(user.worldId).toBe(EPHEM_ID);
    expect(worldRegistry.get(DEFAULT_WORLD_ID)!.hasMember(user.id)).toBe(false);
    expect(worldRegistry.get(EPHEM_ID)!.hasMember(user.id)).toBe(true);
    expect(updateUsersListForWorld).toHaveBeenCalledWith(DEFAULT_WORLD_ID);
    expect(updateUsersListForWorld).toHaveBeenCalledWith(EPHEM_ID);
    expect(sendWorldInitialState).toHaveBeenCalledWith(user);
  });

  it('re-emits STATS scoped to the new world after a move', async () => {
    (getScoreDistribution as jest.Mock).mockResolvedValue({ 3: 7 });
    const user = buildUser(DEFAULT_WORLD_ID);

    await handleJoinWorld(user, { worldId: EPHEM_ID });

    expect(getScoreDistribution).toHaveBeenCalledWith('alice', EPHEM_ID);
    expect(sendToUser).toHaveBeenCalledWith(fakeWs, {
      type: Server.MessageType.STATS,
      content: { 3: 7 },
    });
  });

  it('also re-emits STATS when replaying initial state for the same world', async () => {
    (getScoreDistribution as jest.Mock).mockResolvedValue({ 4: 1 });
    const user = buildUser(DEFAULT_WORLD_ID);

    await handleJoinWorld(user, { worldId: DEFAULT_WORLD_ID });

    expect(getScoreDistribution).toHaveBeenCalledWith('alice', DEFAULT_WORLD_ID);
    expect(sendToUser).toHaveBeenCalledWith(fakeWs, {
      type: Server.MessageType.STATS,
      content: { 4: 1 },
    });
  });
});
