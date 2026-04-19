import { Server } from '@surtom/interfaces';
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
  broadcastAll: jest.fn(),
}));

import { toggleMessage } from '../repositories/messageRepository.js';
import { sendToUser } from '../ws/send.js';
import { broadcastAll } from '../ws/broadcast.js';
import { handleDeleteMessage } from './deleteHandler.js';

const fakeWs = {} as never;

const buildUser = (moderatorLevel = 1) =>
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
  );

beforeEach(() => {
  jest.clearAllMocks();
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

  it('broadcasts a DELETE_MESSAGE and acks success when toggle succeeds', async () => {
    (toggleMessage as jest.Mock).mockResolvedValue(true);
    const user = buildUser(1);
    await handleDeleteMessage(user, 42);
    expect(toggleMessage).toHaveBeenCalledWith(42, user.privateUser);
    expect(broadcastAll).toHaveBeenCalledWith({
      type: Server.MessageType.DELETE_MESSAGE,
      content: 42,
    });
    expect(sendToUser).toHaveBeenCalledWith(
      fakeWs,
      expect.objectContaining({ type: Server.MessageType.LOG, content: expect.stringContaining('Successfully') }),
    );
  });

  it('logs failure to the moderator when toggle returns false', async () => {
    (toggleMessage as jest.Mock).mockResolvedValue(false);
    const user = buildUser(1);
    await handleDeleteMessage(user, 42);
    expect(broadcastAll).not.toHaveBeenCalled();
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
