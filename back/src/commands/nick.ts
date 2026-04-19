import FullUser from '../models/FullUser.js';
import { sendError } from '../ws/send.js';

export async function handleNickCommand(user: FullUser): Promise<void> {
  sendError(user.connection, 'Eh non pardi ! Les temps ont changé...');
}
