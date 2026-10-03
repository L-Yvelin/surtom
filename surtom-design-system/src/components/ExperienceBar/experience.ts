export function getLevel(xp: number): number {
  if (xp <= 352) {
    return Math.sqrt(xp + 9) - 3;
  }
  if (xp <= 1507) {
    return 81 / 10 + Math.sqrt((2 / 5) * (xp - 7839 / 40));
  }
  return 325 / 18 + Math.sqrt((2 / 9) * (xp - 54215 / 72));
}

export function getRequiredXp(level: number): number {
  if (level <= 16) {
    return level * level + 6 * level;
  }
  if (level <= 31) {
    return (5 / 2) * level * level - (81 / 2) * level + 360;
  }
  return (9 / 2) * level * level - (325 / 2) * level + 2220;
}
