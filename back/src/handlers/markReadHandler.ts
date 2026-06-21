import FullUser from '../models/FullUser.js';
import { upsertChatLastRead } from '../repositories/chatReadRepository.js';

export async function handleMarkChatRead(user: FullUser): Promise<void> {
  if (user.playerId === null || !user.worldId) return;

  try {
    await upsertChatLastRead(user.playerId, user.worldId, new Date());
  } catch (err) {
    console.error('Error marking chat read:', err);
  }
}
