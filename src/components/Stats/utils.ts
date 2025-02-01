export type ScoreStats = Record<number, number>;

export interface StatsCalculation {
  total: number;
  increaseFactor: number;
}

export const calculateStats = (stats: ScoreStats): StatsCalculation => {
  const total = Object.values(stats).reduce((acc, curr) => acc + curr, 0);
  const maxValue = Math.max(...Object.values(stats));
  const increaseFactor = 100 - (maxValue / total) * 100;
  return { total, increaseFactor };
};
