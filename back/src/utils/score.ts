import { Client } from '@surtom/interfaces';

export function isScoreContentCoherent(content: Client.ScoreContent): boolean {
  return (
    content.attempts.length > 0 &&
    content.attempts.length <= 6 &&
    content.attempts.every((attempt) => attempt.length === content.attempts[0].length)
  );
}
