import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';

jest.mock('../repositories/playerRepository.js', () => ({
  __esModule: true,
  getPlayerByName: jest.fn(),
}));
jest.mock('../repositories/wordRepository.js', () => ({
  __esModule: true,
  getTodaysWordAndHistoryId: jest.fn(),
}));
jest.mock('../repositories/tryRepository.js', () => ({
  __esModule: true,
  getOrCreateTry: jest.fn(),
  updateTry: jest.fn(),
}));
jest.mock('../repositories/xpRepository.js', () => ({
  __esModule: true,
  getPlayerXp: jest.fn(),
}));
jest.mock('../ws/send.js', () => ({
  __esModule: true,
  sendError: jest.fn(),
  sendSuccess: jest.fn(),
  sendToUser: jest.fn(),
}));

import { getPlayerByName } from '../repositories/playerRepository.js';
import { getTodaysWordAndHistoryId } from '../repositories/wordRepository.js';
import { getOrCreateTry, updateTry } from '../repositories/tryRepository.js';
import { getPlayerXp } from '../repositories/xpRepository.js';
import { sendError, sendSuccess, sendToUser } from '../ws/send.js';
import { handleTryMessage } from './tryHandler.js';

const fakeWs = {} as never;

const buildUser = (name = 'alice') =>
  new FullUser(
    'id-1',
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

beforeEach(() => {
  jest.clearAllMocks();
  (getPlayerByName as jest.Mock).mockResolvedValue({ id: 7, username: 'alice' });
  (getTodaysWordAndHistoryId as jest.Mock).mockResolvedValue({ wordHistoryId: 1, todaysWord: 'GRASS' });
  (getOrCreateTry as jest.Mock).mockResolvedValue({ attempts: [], win: false });
  (getPlayerXp as jest.Mock).mockResolvedValue(123);
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  (console.log as jest.Mock).mockRestore?.();
});

describe('handleTryMessage', () => {
  it('rejects an empty attempt', async () => {
    await handleTryMessage(buildUser(), '   ');
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Tentative vide.');
    expect(updateTry).not.toHaveBeenCalled();
  });

  it('rejects a wrong-length attempt', async () => {
    await handleTryMessage(buildUser(), 'GR');
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Le mot doit faire 5 lettres.');
  });

  it('rejects an attempt that does not start with the right letter', async () => {
    await handleTryMessage(buildUser(), 'BRASS');
    expect(sendError).toHaveBeenCalledWith(fakeWs, "Le mot doit commencer par 'G'.");
  });

  it('rejects when the user has already used 6 tries', async () => {
    (getOrCreateTry as jest.Mock).mockResolvedValue({
      attempts: Array.from({ length: 6 }, () => ['G', 'X', 'X', 'X', 'X']),
      win: false,
    });
    await handleTryMessage(buildUser(), 'GRASS');
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Nombre maximum de tentatives atteint.');
  });

  it('rejects when the user has already won', async () => {
    (getOrCreateTry as jest.Mock).mockResolvedValue({ attempts: [['G', 'R', 'A', 'S', 'S']], win: true });
    await handleTryMessage(buildUser(), 'GRASS');
    expect(sendError).toHaveBeenCalledWith(fakeWs, "Vous avez déjà trouvé le mot aujourd'hui !");
  });

  it('records a winning attempt, sends success and pushes XP', async () => {
    await handleTryMessage(buildUser(), 'grass');
    expect(updateTry).toHaveBeenCalledWith(7, 1, [['G', 'R', 'A', 'S', 'S']], true);
    expect(sendSuccess).toHaveBeenCalledWith(fakeWs, 'Bravo, vous avez trouvé le mot !');
    expect(sendToUser).toHaveBeenCalledWith(fakeWs, { type: Server.MessageType.XP, content: 123 });
  });

  it('records a losing attempt without sending XP if not the last try', async () => {
    await handleTryMessage(buildUser(), 'GRAPE');
    expect(updateTry).toHaveBeenCalledWith(7, 1, [['G', 'R', 'A', 'P', 'E']], false);
    expect(sendSuccess).toHaveBeenCalledWith(fakeWs, 'Tentative enregistrée !');
    expect(sendToUser).not.toHaveBeenCalled();
  });

  it('sends XP after the 6th non-winning attempt', async () => {
    (getOrCreateTry as jest.Mock).mockResolvedValue({
      attempts: Array.from({ length: 5 }, () => ['G', 'X', 'X', 'X', 'X']),
      win: false,
    });
    await handleTryMessage(buildUser(), 'GRAPE');
    expect(sendToUser).toHaveBeenCalledWith(fakeWs, { type: Server.MessageType.XP, content: 123 });
  });

  it('forwards repository errors via sendError', async () => {
    (getPlayerByName as jest.Mock).mockResolvedValue(undefined);
    await handleTryMessage(buildUser(), 'GRASS');
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Utilisateur introuvable.');
  });
});
