const STORAGE_KEY = 'chatInputHistory';

export function loadHistory(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
}

export function filterHistory(history: string[], input: string): string[] {
  return history.filter((msg) => input === '' || msg.toLowerCase().includes(input.toLowerCase()));
}

export function pushHistory(history: string[], input: string): string[] {
  if (!input.trim()) return history;
  return history[history.length - 1] === input ? history : [...history, input];
}

export function navigateHistory<T>(filtered: T[], index: number | null, direction: 'up' | 'down'): number | null {
  if (filtered.length === 0) return null;
  if (direction === 'up') {
    if (index === null) return filtered.length - 1;
    return Math.max(0, index - 1);
  } else {
    if (index === null) return null;
    if (index >= filtered.length - 1) return null;
    return index + 1;
  }
}
