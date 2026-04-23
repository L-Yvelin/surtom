import { funnyNames } from '../data/funnyNames.js';

export function getRandomFunnyName(): string {
  return funnyNames[Math.floor(Math.random() * funnyNames.length)];
}

export function isFunnyName(name: string): boolean {
  return funnyNames.includes(name);
}
