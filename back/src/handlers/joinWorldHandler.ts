import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { worldRegistry } from '../state/worldRegistry.js';
import { sendError, sendToUser } from '../ws/send.js';
import { sendWorldInitialState } from '../ws/connection.js';
import { updateUsersListForWorld } from './userListHandler.js';
import { getScoreDistribution } from '../repositories/scoreRepository.js';

async function sendStatsForWorld(user: FullUser): Promise<void> {
  if (!user.worldId) return;
  try {
    sendToUser(user.connection, {
      type: Server.MessageType.STATS,
      content: await getScoreDistribution(user.privateUser.name, user.worldId),
    });
  } catch (err) {
    console.error('Error fetching score distribution:', err);
  }
}

export async function handleJoinWorld(user: FullUser, content: { worldId: string }): Promise<void> {
  const target = worldRegistry.get(content.worldId);
  if (!target) {
    sendError(user.connection, `Monde inconnu: ${content.worldId}`);
    return;
  }

  if (user.worldId === target.id) {
    await sendWorldInitialState(user);
    await sendStatsForWorld(user);
    return;
  }

  const previousWorldId = user.worldId;
  if (previousWorldId) {
    worldRegistry.getOrDefault(previousWorldId).removeMember(user.id);
  }
  user.worldId = target.id;
  target.addMember(user.id);

  if (previousWorldId) updateUsersListForWorld(previousWorldId);
  updateUsersListForWorld(target.id);

  await sendWorldInitialState(user);
  await sendStatsForWorld(user);
}
