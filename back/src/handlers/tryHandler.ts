import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { getPlayerByName } from '../repositories/playerRepository.js';
import { getTodaysWordAndHistoryId } from '../repositories/wordRepository.js';
import { getOrCreateTry, updateTry } from '../repositories/tryRepository.js';
import { getPlayerXp } from '../repositories/xpRepository.js';
import { sendError, sendSuccess, sendToUser } from '../ws/send.js';
import { MAX_TRIES_PER_GAME } from '../config/constants.js';

export async function handleTryMessage(user: FullUser, content: string): Promise<void> {
  try {
    const attempt = content.trim();
    if (!attempt) throw new Error('Tentative vide.');

    const player = await getPlayerByName(user.privateUser.name);
    if (!player) throw new Error('Utilisateur introuvable.');

    const { wordHistoryId, todaysWord } = await getTodaysWordAndHistoryId();
    const { attempts, win } = await getOrCreateTry(player.id, wordHistoryId);

    if (attempt.length !== todaysWord.length) {
      console.log(`Tentative invalide: longueur attendue ${todaysWord.length}, reçu ${attempt.length}`);
      sendError(user.connection, `Le mot doit faire ${todaysWord.length} lettres.`);
      return;
    }
    if (attempt[0].toUpperCase() !== todaysWord[0]) {
      console.log(`Tentative invalide: première lettre attendue '${todaysWord[0]}', reçu '${attempt[0]}'`);
      sendError(user.connection, `Le mot doit commencer par '${todaysWord[0]}'.`);
      return;
    }
    if (attempts.length >= MAX_TRIES_PER_GAME) {
      console.log('Tentative invalide: nombre maximum de tentatives atteint.');
      sendError(user.connection, 'Nombre maximum de tentatives atteint.');
      return;
    }
    if (win) {
      console.log("Tentative invalide: mot déjà trouvé aujourd'hui.");
      sendError(user.connection, "Vous avez déjà trouvé le mot aujourd'hui !");
      return;
    }

    const newAttempts = [...attempts, attempt.toUpperCase().split('')];
    const isWin = attempt.toUpperCase() === todaysWord;
    const newWin = win || isWin;

    await updateTry(player.id, wordHistoryId, newAttempts, newWin);

    sendSuccess(user.connection, isWin ? 'Bravo, vous avez trouvé le mot !' : 'Tentative enregistrée !');

    if (isWin || newAttempts.length >= MAX_TRIES_PER_GAME) {
      const xp = await getPlayerXp(player.username);
      sendToUser(user.connection, {
        type: Server.MessageType.XP,
        content: xp,
      });
    }
  } catch (err) {
    sendError(user.connection, (err as Error).message);
  }
}
