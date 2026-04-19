import { IncomingMessage } from 'http';
import WS from 'ws';
import { Client, Server, validateClientMessage } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import store from '../state/store.js';
import { parseCookies } from './cookies.js';
import { sendToUser } from './send.js';
import { handleMessage, shouldLogMessage } from './dispatcher.js';
import { generateRandomHash } from '../utils/crypto.js';
import { getRandomFunnyName } from '../utils/randomName.js';
import { getPlayerBySessionHash } from '../repositories/playerRepository.js';
import { getPlayerXp } from '../repositories/xpRepository.js';
import { getScoreDistribution } from '../repositories/scoreRepository.js';
import { getMessages } from '../repositories/messageRepository.js';
import { getOrCreateTodaysWord, getValidWords } from '../repositories/wordRepository.js';
import { getTodaysTriesForPlayer } from '../repositories/tryRepository.js';
import { updateUsersList } from '../handlers/userListHandler.js';
import { MAX_MESSAGES_LOADED, PING_INTERVAL_MS } from '../config/constants.js';

async function buildPrivateUser(sessionHash: string | undefined, usesMobileDevice: boolean): Promise<Server.PrivateUser> {
  const player = sessionHash ? await getPlayerBySessionHash(sessionHash) : undefined;

  if (player) {
    return {
      name: player.username,
      moderatorLevel: player.isAdmin,
      isLoggedIn: true,
      isMobile: usesMobileDevice,
      words: [],
      isBanned: !!player.isBanned,
      xp: await getPlayerXp(player.username),
    };
  }

  return {
    name: getRandomFunnyName(),
    moderatorLevel: 0,
    isLoggedIn: false,
    isMobile: usesMobileDevice,
    words: [],
    isBanned: false,
    xp: 0,
  };
}

function setupHeartbeat(connection: WS, isAlive: { value: boolean }): NodeJS.Timeout {
  return setInterval(() => {
    if (!isAlive.value) {
      console.log('/!\\ Connection is dead, closing');
      connection.terminate();
      updateUsersList();
      return;
    }
    isAlive.value = false;
    connection.ping();
  }, PING_INTERVAL_MS);
}

async function sendInitialState(user: FullUser): Promise<void> {
  updateUsersList();
  console.log(`New connection: [${user.ip}] ${user.privateUser.name}`);

  try {
    const dbMessages = await getMessages(!!user.privateUser.moderatorLevel, MAX_MESSAGES_LOADED, !user.privateUser.isLoggedIn);

    if (dbMessages) {
      const userMessages = dbMessages.filter(
        (msg) => msg.type === Server.MessageType.TEXT || msg.type === Server.MessageType.ENHANCED || msg.type === Server.MessageType.SCORE,
      ) as Server.ChatMessage.SavedType[];

      sendToUser(user.connection, {
        type: Server.MessageType.GET_MESSAGES,
        content: userMessages,
      });
    }
  } catch (err) {
    console.error('Error getting messages:', err);
  }

  try {
    const word = await getOrCreateTodaysWord();
    if (!word) {
      console.error('No word found for today');
      return;
    }

    const validWords = await getValidWords(word.toUpperCase());
    const attempts = await getTodaysTriesForPlayer(user.privateUser.name);

    sendToUser(user.connection, {
      type: Server.MessageType.DAILY_WORDS,
      content: {
        words: [...validWords.map((w) => w.toUpperCase()), word.toUpperCase()],
        attempts,
      },
    });
  } catch (err) {
    console.error('Error getting daily words:', err);
  }
}

function logIncomingMessage(message: Client.Message): void {
  if (!shouldLogMessage(message.type)) return;

  const content = (message as { content?: unknown }).content;
  const text = JSON.stringify(content) ?? '';
  const truncated = text.length > 100 ? `${text.slice(0, 50)}...${text.slice(-50)}` : text.length > 50 ? `${text.slice(0, 50)}...` : text;

  console.log('Received message:', `${message.type}: ${truncated}`);
}

export async function handleNewConnection(connection: WS, req: IncomingMessage): Promise<void> {
  console.log('New connection');

  try {
    const cookies = parseCookies(req.headers?.cookie);
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress)?.toString() ?? 'unknown';

    const sessionHash = cookies.modHash;
    const usesMobileDevice = cookies.mobileDevice === 'true';

    const privateUser = await buildPrivateUser(sessionHash, usesMobileDevice);
    const user = new FullUser(generateRandomHash(), privateUser, connection, ip);

    sendToUser(user.connection, {
      type: Server.MessageType.LOGIN,
      content: { user: user.privateUser },
    });

    sendToUser(user.connection, {
      type: Server.MessageType.STATS,
      content: await getScoreDistribution(user.privateUser.name),
    });

    const currentState = store.getState();
    currentState.users[user.id] = user;
    store.setState(currentState);

    const isAlive = { value: true };
    const heartbeat = setupHeartbeat(connection, isAlive);

    connection.on('message', (raw: WS.RawData) => {
      isAlive.value = true;

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw.toString());
      } catch {
        console.error(`${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Received unparseable message`);
        return;
      }

      if (!validateClientMessage(parsed)) {
        console.error(`${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Received invalid client message:`, parsed);
        return;
      }

      logIncomingMessage(parsed);
      void handleMessage(user, parsed);
    });

    connection.on('close', () => {
      console.log('Connection closed');
      clearInterval(heartbeat);
      const state = store.getState();
      delete state.users[user.id];
      store.setState(state);
      updateUsersList();
    });

    void sendInitialState(user);
  } catch (e) {
    console.error(e);
  }
}
