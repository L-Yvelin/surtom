import FullUser from '../models/FullUser.js';
import { sendError } from '../ws/send.js';

export function handleIsBanned(user: FullUser): void {
  sendError(user.connection, 'You are banned.');
  user.connection.close();
}
