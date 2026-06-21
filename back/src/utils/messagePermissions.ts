import { Server } from '@surtom/interfaces';

export function canToggleDeletion(
  user: Pick<Server.PrivateUser, 'name' | 'moderatorLevel'>,
  author: { name: string; moderatorLevel: number },
  currentDeleted: number,
): boolean {
  const isOwnMessage = author.name === user.name;
  const outranksAuthor = user.moderatorLevel > author.moderatorLevel;
  if (!isOwnMessage && !outranksAuthor) return false;
  if (currentDeleted && user.moderatorLevel < currentDeleted) return false;
  return true;
}
