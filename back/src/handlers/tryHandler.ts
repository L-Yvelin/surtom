import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { getPlayerXp } from '../repositories/xpRepository.js';
import { worldRegistry } from '../state/worldRegistry.js';
import { sendError, sendSuccess, sendToUser } from '../ws/send.js';
import { MAX_TRIES_PER_GAME } from '../config/constants.js';

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
    await world.recordTry(user.privateUser.name, attemptLetters, isWin);

    sendSuccess(user.connection, isWin ? 'Bravo, vous avez trouvé le mot !' : 'Tentative enregistrée !');

    if (world.persistent && (isWin || attempts.length + 1 >= MAX_TRIES_PER_GAME)) {
      const xp = await getPlayerXp(user.privateUser.name);
      sendToUser(user.connection, {
        type: Server.MessageType.XP,
        content: xp,
      });
    }
  } catch (err) {
    sendError(user.connection, (err as Error).message);
  }
}
