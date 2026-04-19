import { Client } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { saveMessage } from '../repositories/messageRepository.js';
import { getDailyScore } from '../repositories/scoreRepository.js';
import { getTodaysWord } from '../repositories/wordRepository.js';
import { sendError } from '../ws/send.js';
import { broadcastAll } from '../ws/broadcast.js';
import { validateText } from '../utils/validate.js';
import { logMessage } from '../utils/log.js';
import { MAX_IMAGE_BYTES } from '../config/constants.js';

type TextChatMessage = Extract<Client.ChatMessage, { type: Client.MessageType.CHAT_MESSAGE }>;
type ScoreChatMessage = Extract<Client.Message, { type: Client.MessageType.SCORE_TO_CHAT }>;

export async function handleChatMessage(user: FullUser, chatMessage: Client.ChatMessage): Promise<void> {
  switch (chatMessage.type) {
    case Client.MessageType.SCORE_TO_CHAT:
      await handleScoreToChat(user, chatMessage);
      break;
    case Client.MessageType.CHAT_MESSAGE:
      if (
        (!user.privateUser.moderatorLevel && !validateText(chatMessage.content.text.trim())) ||
        (chatMessage.content.imageData && chatMessage.content.imageData.length > MAX_IMAGE_BYTES)
      ) {
        return;
      }
      await broadcastChatMessage(user, chatMessage);
      break;
  }
}

async function broadcastChatMessage(user: FullUser, chatMessage: TextChatMessage): Promise<void> {
  try {
    const savedMessage = await saveMessage(user.privateUser, chatMessage);

    if (!savedMessage) {
      console.error(`${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Failed to save message`);
      return;
    }

    broadcastAll(savedMessage);
    logMessage(chatMessage.content.text, user);
  } catch (err) {
    console.error('Error saving message:', err);
  }
}

async function handleScoreToChat(user: FullUser, message: ScoreChatMessage): Promise<void> {
  if ((await getDailyScore(user.privateUser.name)).length > 0) {
    sendError(user.connection, 'Vous avez déjà partagé votre score...');
    return;
  }

  if (!message.content.attempts || !Array.isArray(message.content.attempts) || message.content.attempts.length > 6) {
    console.error(`${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Invalid score data: invalid attempts`);
    return;
  }

  const scoreSolution =
    message.content.custom && typeof message.content.custom === 'string' ? message.content.custom : (await getTodaysWord())?.toUpperCase();

  if (!scoreSolution) {
    console.error(
      `${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Could not determine reference word for score validation.`,
    );
    return;
  }

  const attemptsAreValid = message.content.attempts.every(
    (attempt) =>
      Array.isArray(attempt) &&
      attempt.length === scoreSolution.length &&
      attempt.every((letter) => typeof letter === 'string') &&
      attempt[0][0] === scoreSolution[0],
  );

  if (!attemptsAreValid) {
    console.error(
      `${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Invalid attempts: not all attempts match the reference word's (${scoreSolution}) first letter and length.`,
    );
    return;
  }

  try {
    const savedMessage = await saveMessage(user.privateUser, message);

    if (!savedMessage) {
      console.error(`${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Failed to save score message`);
      return;
    }

    broadcastAll(savedMessage);
    logMessage('Score sent', user);
  } catch (err) {
    console.error('Error saving score message:', err);
  }
}
