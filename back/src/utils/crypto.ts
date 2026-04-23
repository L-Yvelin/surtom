import bcrypt from 'bcrypt';
import crypto from 'crypto';

export function generateRandomHash(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function passwordInHashArray(password: string, hashArray: string[]): boolean {
  return hashArray.some((hash) => bcrypt.compareSync(password, hash));
}
