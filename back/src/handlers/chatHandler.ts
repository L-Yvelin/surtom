import { Client } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { worldRegistry } from '../state/worldRegistry.js';
import { sendError } from '../ws/send.js';
import { broadcastToWorld } from '../ws/broadcast.js';
import { validateText } from '../utils/validate.js';
import { logMessage } from '../utils/log.js';
import { MAX_IMAGE_BYTES } from '../config/constants.js';

type ScoreChatMessage = Extract<Client.Message, { type: Client.MessageType.SCORE_TO_CHAT }>;

export async function handleChatMessage(user: FullUser, chatMessage: Client.ChatMessage): Promise<void> {
  switch (chatMessage.type) {
    case Client.MessageType.SCORE_TO_CHAT:
      await handleScoreToChat(user, chatMessage);
      break;
    case Client.MessageType.CHAT_MESSAGE: {
      const text = chatMessage.content.text.trim();
      const hasImage = !!chatMessage.content.imageData;
      const imageTooLarge = hasImage && chatMessage.content.imageData!.length > MAX_IMAGE_BYTES;
      const textAllowed = !!user.privateUser.moderatorLevel || validateText(text) || (hasImage && text.length === 0);
      if (!textAllowed || imageTooLarge) {
        return;
      }
      await broadcastChatMessage(user, chatMessage);
      break;
    }
  }
}

async function broadcastChatMessage(user: FullUser, chatMessage: Client.ChatMessage): Promise<void> {
  if (!user.worldId) return;
  const world = worldRegistry.getOrDefault(user.worldId);

  try {
    const savedMessage = await world.saveMessage(user.privateUser, chatMessage);
    if (!savedMessage) {
      console.error(`${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Failed to save message`);
      return;
    }
    broadcastToWorld(world.id, savedMessage);
    if (chatMessage.type === Client.MessageType.CHAT_MESSAGE) {
      logMessage(chatMessage.content.text, user);
    }
  } catch (err) {
    console.error('Error saving message:', err);
  }
}

async function handleScoreToChat(user: FullUser, message: ScoreChatMessage): Promise<void> {
  if (!user.worldId) return;
  const world = worldRegistry.getOrDefault(user.worldId);

  if (await world.hasSharedScore(user.privateUser.name)) {
    sendError(user.connection, 'Vous avez déjà partagé votre score...');
    return;
  }

  if (!message.content.attempts || !Array.isArray(message.content.attempts) || message.content.attempts.length > 6) {
    console.error(`${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Invalid score data: invalid attempts`);
    return;
  }

  let scoreSolution: string | undefined;
  if (message.content.custom && typeof message.content.custom === 'string') {
    scoreSolution = message.content.custom;
  } else {
    try {
      const game = await world.getGameState();
      scoreSolution = game.solution;
    } catch (err) {
      console.error(
        `${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Could not determine reference word for score validation.`,
        err,
      );
      return;
    }
  }

  if (!scoreSolution) {
    console.error(
      `${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Could not determine reference word for score validation.`,
    );
    return;
  }

  const attemptsAreValid = message.content.attempts.every(
    (attempt) =>
      Array.isArray(attempt) &&
      attempt.length === scoreSolution!.length &&
      attempt.every((letter) => typeof letter === 'string') &&
      attempt[0][0] === scoreSolution![0],
  );

  if (!attemptsAreValid) {
    console.error(
      `${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Invalid attempts: not all attempts match the reference word's (${scoreSolution}) first letter and length.`,
    );
    return;
  }

  try {
    const savedMessage = await world.saveMessage(user.privateUser, message, scoreSolution);
    if (!savedMessage) {
      console.error(`${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Failed to save score message`);
      return;
    }
    await world.markScoreShared(user.privateUser.name);
    broadcastToWorld(world.id, savedMessage);
    logMessage('Score sent', user);
  } catch (err) {
    console.error('Error saving score message:', err);
  }
}
