import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import type { Player } from '../models/Player.js';
import { generateRandomHash } from '../utils/crypto.js';
import { storeSessionHash } from '../repositories/playerRepository.js';
import { sendSuccess, sendToUser } from '../ws/send.js';
import { handleIsBanned } from '../utils/ban.js';
import { loginPlayer } from '../repositories/playerRepository.js';
import { sendError } from '../ws/send.js';
import { publish } from '../state/eventBus.js';

export async function applyLoginSession(user: FullUser, userInfo: Player, welcomeText: string): Promise<void> {
  user.privateUser.name = userInfo.username;
  user.privateUser.moderatorLevel = userInfo.isAdmin;
  user.privateUser.isLoggedIn = true;

  if (!userInfo.sessionHash) {
    const sessionHash = generateRandomHash();
    await storeSessionHash(userInfo.id, sessionHash);
    userInfo.sessionHash = sessionHash;
  }

  sendToUser(user.connection, {
    type: Server.MessageType.LOGIN,
    content: {
      user: {
        name: userInfo.username,
        moderatorLevel: userInfo.isAdmin,
        isMobile: user.privateUser.isMobile,
        isLoggedIn: user.privateUser.isLoggedIn,
        xp: user.privateUser.xp,
        words: user.privateUser.words,
        isBanned: user.privateUser.isBanned,
      },
      sessionHash: userInfo.sessionHash,
    },
  });

  sendSuccess(user.connection, welcomeText);
  publish('updateUsersList');
}

export async function loginUserAndSendSession(user: FullUser, username: string, password: string): Promise<boolean> {
  try {
    const userInfo = await loginPlayer(username, password);

    if (userInfo && userInfo.isBanned === 1) {
      handleIsBanned(user);
      return false;
    }

    await applyLoginSession(user, userInfo, `Rebonjour ${userInfo.username} !`);
    return true;
  } catch (error) {
    sendError(user.connection, (error as Error).message);
    return false;
  }
}
