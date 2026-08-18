import { Server, MAX_TRIES_PER_GAME } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { getPlayerXp } from '../repositories/xpRepository.js';
import { worldRegistry, World } from '../state/worldRegistry.js';
import { sendError, sendToUser } from '../ws/send.js';
import store from '../state/store.js';

async function broadcastDailyWords(
  playerName: string,
  worldId: string,
  world: World,
  validWords: string[],
  tries: { attempts: string[][]; win: boolean },
): Promise<void> {
  const isGameOver = tries.win || tries.attempts.length >= MAX_TRIES_PER_GAME;
  const xp = world.persistent && isGameOver ? await getPlayerXp(playerName) : undefined;

  const connections = Object.values(store.getState().users).filter((u) => u.privateUser.name === playerName && u.worldId === worldId);

  for (const conn of connections) {
    sendToUser(conn.connection, {
      type: Server.MessageType.DAILY_WORDS,
      content: {
        words: validWords,
        attempts: tries.attempts.map((letters) => letters.join('')),
        ...(xp !== undefined && { xp }),
      },
    });
  }
}

export async function handleTryMessage(user: FullUser, content: string): Promise<void> {
  try {
    const attempt = content.trim();
    if (!attempt) throw new Error('Tentative vide.');
    if (!user.worldId) throw new Error("Veuillez d'abord rejoindre un monde.");

    const world = worldRegistry.getOrDefault(user.worldId);
    const game = await world.getGameState();
    const solution = game.solution;

    if (!solution) {
      throw new Error('Impossible de récupérer le mot du jour.');
    }

    if (attempt.length !== solution.length) {
      sendError(user.connection, `Le mot doit faire ${solution.length} lettres.`);
      return;
    }
    if (attempt[0].toUpperCase() !== solution[0]) {
      sendError(user.connection, `Le mot doit commencer par '${solution[0]}'.`);
      return;
    }

    const { attempts, win } = await world.getTries(user.privateUser.name);

    if (attempts.length >= MAX_TRIES_PER_GAME) {
      sendError(user.connection, 'Nombre maximum de tentatives atteint.');
      return;
    }
    if (win) {
      sendError(user.connection, world.persistent ? "Vous avez déjà trouvé le mot aujourd'hui !" : 'Vous avez déjà trouvé le mot !');
      return;
    }

    const attemptLetters = attempt.toUpperCase().split('');
    const isWin = attempt.toUpperCase() === solution;
    const newTries = await world.recordTry(user.privateUser.name, attemptLetters, isWin);

    await broadcastDailyWords(user.privateUser.name, user.worldId, world, game.validWords, newTries);
  } catch (err) {
    sendError(user.connection, (err as Error).message);
  }
}
