import FullUser from '../models/FullUser.js';
import { loginUserAndSendSession } from './session.js';
import { sendError } from '../ws/send.js';

export async function handleLoginCommand(user: FullUser, parts: string[]): Promise<void> {
  if (parts.length === 3) {
    await loginUserAndSendSession(user, parts[1], parts[2]);
  } else {
    sendError(user.connection, 'Utilisation : /login pseudo mot_de_passe');
  }
}
