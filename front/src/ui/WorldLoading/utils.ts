export const COSMETIC_MS = 700;

export function isWorldReady(cosmeticDone: boolean, solution: string | undefined): boolean {
  return cosmeticDone && !!solution;
}
