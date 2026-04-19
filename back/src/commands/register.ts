import FullUser from '../models/FullUser.js';
import { getPlayerByName, registerPlayer } from '../repositories/playerRepository.js';
import { applyLoginSession } from './session.js';
import { sendError } from '../ws/send.js';
import { validateUsername } from '../utils/validate.js';
import { isFunnyName } from '../utils/randomName.js';

export async function handleRegisterCommand(user: FullUser, parts: string[]): Promise<void> {
  if (parts.length !== 3) {
    sendError(user.connection, 'Utilisation : /register pseudo mot_de_passe');
    return;
  }

  const [, username, password] = parts;

  if (!validateUsername(username) || isFunnyName(username)) {
    sendError(user.connection, "Ce pseudo n'est pas disponible...");
    return;
  }

  try {
    await registerPlayer(username, password);
    const userInfo = await getPlayerByName(username);
    if (!userInfo) throw new Error('Registration failed');

    await applyLoginSession(user, userInfo, `Bienvenue ${username} !`);
  } catch (error) {
    sendError(user.connection, (error as Error).message);
  }
}
