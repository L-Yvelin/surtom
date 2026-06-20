import { Client, Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';

jest.mock('../repositories/messageRepository.js', () => ({
  __esModule: true,
  toggleMessage: jest.fn(),
}));
jest.mock('../ws/send.js', () => ({
  __esModule: true,
  sendToUser: jest.fn(),
}));
jest.mock('../ws/broadcast.js', () => ({
  __esModule: true,
  broadcastToWorld: jest.fn(),
}));

import { toggleMessage } from '../repositories/messageRepository.js';
import { sendToUser } from '../ws/send.js';
import { broadcastToWorld } from '../ws/broadcast.js';
import { worldRegistry } from '../state/worldRegistry.js';
import { handleDeleteMessage } from './deleteHandler.js';

const EPHEM_ID = 'ephem-test';

const fakeWs = {} as never;

const buildUser = (moderatorLevel = 1, worldId: string = 'fr') =>
  new FullUser(
    'id-1',
    {
      name: 'mod',
      moderatorLevel,
      isLoggedIn: true,
      isMobile: false,
      words: [],
      isBanned: false,
      xp: 0,
    },
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

describe('handleDeleteMessage', () => {
  it('does nothing when the user is not a moderator', async () => {
    const user = buildUser(0);
    await handleDeleteMessage(user, 1);
    expect(toggleMessage).not.toHaveBeenCalled();
  });

  it('does nothing when the message id is NaN', async () => {
    const user = buildUser(1);
    await handleDeleteMessage(user, NaN);
    expect(toggleMessage).not.toHaveBeenCalled();
  });

  it('broadcasts a DELETE_MESSAGE scoped to the user world and acks success', async () => {
    (toggleMessage as jest.Mock).mockResolvedValue(true);
    const user = buildUser(1, 'fr');
    await handleDeleteMessage(user, 42);
    expect(toggleMessage).toHaveBeenCalledWith(42, user.privateUser);
    expect(broadcastToWorld).toHaveBeenCalledWith('fr', {
      type: Server.MessageType.DELETE_MESSAGE,
      content: 42,
    });
    expect(sendToUser).toHaveBeenCalledWith(
      fakeWs,
      expect.objectContaining({ type: Server.MessageType.LOG, content: expect.stringContaining('Successfully') }),
    );
  });

  it('toggles in-memory chat deletion for ephemeral worlds without hitting the DB', async () => {
    const w = worldRegistry.get(EPHEM_ID)!;
    await w.saveMessage(
      { name: 'a', moderatorLevel: 0, isLoggedIn: false, isMobile: false, words: [], isBanned: false, xp: 0 },
      { type: Client.MessageType.CHAT_MESSAGE, content: { text: 'hi' } },
    );

    const user = buildUser(2, EPHEM_ID);
    await handleDeleteMessage(user, 1);

    expect(toggleMessage).not.toHaveBeenCalled();
    const chat = await w.getChat({ includeDeleted: false, max: 200, showHelp: false });
    expect((chat[0] as Server.ChatMessage.Text).content.deleted).toBe(2);
    expect(broadcastToWorld).toHaveBeenCalledWith(EPHEM_ID, expect.objectContaining({ type: Server.MessageType.DELETE_MESSAGE }));
  });

  it('logs failure to the moderator when toggle returns false', async () => {
    (toggleMessage as jest.Mock).mockResolvedValue(false);
    const user = buildUser(1);
    await handleDeleteMessage(user, 42);
    expect(broadcastToWorld).not.toHaveBeenCalled();
    expect(sendToUser).toHaveBeenCalledWith(
      fakeWs,
      expect.objectContaining({ type: Server.MessageType.LOG, content: expect.stringContaining('Failed') }),
    );
  });

  it('swallows errors from the repository', async () => {
    (toggleMessage as jest.Mock).mockRejectedValue(new Error('db down'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const user = buildUser(1);
    await expect(handleDeleteMessage(user, 42)).resolves.toBeUndefined();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
