import FullUser from '../models/FullUser.js';
import { worldRegistry } from '../state/worldRegistry.js';
import { updateUsersListForWorld } from './userListHandler.js';

export function handleLeaveWorld(user: FullUser): void {
  const previousWorldId = user.worldId;
  if (!previousWorldId) return;

  worldRegistry.getOrDefault(previousWorldId).removeMember(user.id);
  user.worldId = null;
  updateUsersListForWorld(previousWorldId);
}
