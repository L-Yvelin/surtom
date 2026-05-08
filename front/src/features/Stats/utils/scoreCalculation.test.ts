import { calculateStats } from './scoreCalculation';

describe('calculateStats', () => {
  test('sums all values into total', () => {
    expect(calculateStats({ 1: 2, 2: 3, 3: 5 }).total).toBe(10);
  });

  test('increaseFactor is 0 when one bucket holds every game', () => {
    expect(calculateStats({ 1: 10 }).increaseFactor).toBe(0);
  });

  test('increaseFactor reflects how spread the distribution is', () => {
    expect(calculateStats({ 1: 5, 2: 5 }).increaseFactor).toBe(50);
  });

  test('increaseFactor is 0 when all values are equal at length 1', () => {
    expect(calculateStats({ 1: 1 }).increaseFactor).toBe(0);
  });

  test('handles a wide distribution', () => {
    const { total, increaseFactor } = calculateStats({ 1: 1, 2: 1, 3: 1, 4: 1 });
    expect(total).toBe(4);
    expect(increaseFactor).toBe(75);
  });

  test('empty stats produce a non-finite factor (current contract — caller must guard)', () => {
    // Math.max(...[]) is -Infinity and total is 0, so increaseFactor is non-finite.
    // Pinned so we notice if a guard is added later.
    const { total, increaseFactor } = calculateStats({});
    expect(total).toBe(0);
    expect(Number.isFinite(increaseFactor)).toBe(false);
  });
});
