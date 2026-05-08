import FullUser from '../models/FullUser.js';
import { worldRegistry, DEFAULT_WORLD_ID } from '../state/worldRegistry.js';

jest.mock('../ws/send.js', () => ({
  __esModule: true,
  sendToUser: jest.fn(),
}));

import { sendToUser } from '../ws/send.js';
import { handleListWorlds, buildWorldSummaries } from './listWorldsHandler.js';
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
});

describe('buildWorldSummaries', () => {
  it('returns the default persistent world only when no ephemeral worlds are registered', () => {
    const summaries = buildWorldSummaries();
    expect(summaries).toEqual([
      {
        id: DEFAULT_WORLD_ID,
        displayName: 'Français',
        language: 'fr',
        persistent: true,
        memberCount: 0,
      },
    ]);
  });

  it('includes ephemeral worlds with their member counts', () => {
    const ephem = worldRegistry.addEphemeral({
      id: 'ephem-test',
      displayName: 'Ephemeral',
      language: 'fr',
      solution: 'DIAMANT',
      validWords: ['DIAMANT'],
    });
    ephem.addMember('user-1');
    ephem.addMember('user-2');

    const summaries = buildWorldSummaries();
    expect(summaries).toHaveLength(2);
    const ephSummary = summaries.find((w) => w.id === 'ephem-test');
    expect(ephSummary).toEqual({
      id: 'ephem-test',
      displayName: 'Ephemeral',
      language: 'fr',
      persistent: false,
      memberCount: 2,
    });
  });
});

describe('handleListWorlds', () => {
  it('sends a WORLD_LIST envelope to the requesting user', () => {
    handleListWorlds(buildUser());
    expect(sendToUser).toHaveBeenCalledTimes(1);
    const [, payload] = (sendToUser as jest.Mock).mock.calls[0];
    expect(payload.type).toBe(Server.MessageType.WORLD_LIST);
    expect(Array.isArray(payload.content)).toBe(true);
    expect(payload.content[0].id).toBe(DEFAULT_WORLD_ID);
  });
});
