import FullUser from '../models/FullUser.js';
import store from '../state/store.js';
import { sendError } from '../ws/send.js';
import { validateUsername } from '../utils/validate.js';

export function getTargetedUsers(targetUsername: string, requester: FullUser): FullUser[] {
  const users = store.getState().users;
  let targeted: FullUser[] = [];

  if (/^@[aers]{1}/.test(targetUsername)) {
    switch (targetUsername[1]) {
      case 'a':
      case 'e':
        targeted = Object.values(users);
        break;
      case 'r': {
        const userValues = Object.values(users);
        const randomIndex = Math.floor(Math.random() * userValues.length);
        targeted.push(userValues[randomIndex]);
        break;
      }
      case 's':
        targeted.push(requester);
        break;
      default:
        sendError(requester.connection, 'Sélecteur inexistant');
        break;
    }
  } else {
    const stripped = targetUsername.startsWith('@') ? targetUsername.slice(1) : targetUsername;
    if (validateUsername(stripped)) {
      targeted = Object.values(users).filter((u) => u.privateUser.name === stripped);
    } else {
      sendError(requester.connection, "Nom d'utilisateur invalide");
    }
  }

  if (targeted.length === 0) {
    sendError(requester.connection, 'Utilisateur inexistant');
  }
  return targeted;
}
