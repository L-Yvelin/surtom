import FullUser from '../models/FullUser.js';
import { sendError, sendSuccess } from '../ws/send.js';
import { validateUsername } from '../utils/validate.js';

export async function handleAddTypeCommand(user: FullUser, parts: string[]): Promise<void> {
  if (parts.length === 2) {
    const type = parts[1];
    if (validateUsername(type)) {
      user.listeningTypes.push(type);
      sendSuccess(user.connection, `Vous écoutez maintenant le type : ${type}`);
    } else {
      sendError(user.connection, 'Type invalide');
    }
    return;
  }

  if (parts.length === 1) {
    sendSuccess(user.connection, `Vous écoutez les types : ${user.listeningTypes.join(', ')}`);
    return;
  }

  sendError(user.connection, 'Utilisation : /listen type');
}
