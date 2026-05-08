import { filterHistory, loadHistory, navigateHistory, pushHistory, saveHistory } from './chatInputHistoryStorage';

const STORAGE_KEY = 'chatInputHistory';

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  });
});

describe('pushHistory', () => {
  test('appends a fresh entry', () => {
    expect(pushHistory(['a'], 'b')).toStrictEqual(['a', 'b']);
  });

  test('drops whitespace-only input', () => {
    expect(pushHistory(['a'], '   ')).toStrictEqual(['a']);
  });

  test('drops empty input', () => {
    expect(pushHistory(['a'], '')).toStrictEqual(['a']);
  });

  test('dedupes when input matches the last entry', () => {
    expect(pushHistory(['a', 'b'], 'b')).toStrictEqual(['a', 'b']);
  });

  test('does not dedupe when matching a non-last entry', () => {
    expect(pushHistory(['a', 'b'], 'a')).toStrictEqual(['a', 'b', 'a']);
  });

  test('does not mutate the input array', () => {
    const history = ['a'];
    pushHistory(history, 'b');
    expect(history).toStrictEqual(['a']);
  });

  test('appends to an empty history', () => {
    expect(pushHistory([], 'hi')).toStrictEqual(['hi']);
  });
});

describe('filterHistory', () => {
  test('empty input returns full history', () => {
    expect(filterHistory(['hello', 'world'], '')).toStrictEqual(['hello', 'world']);
  });

  test('filters by case-insensitive substring', () => {
    expect(filterHistory(['Hello', 'World', 'help'], 'el')).toStrictEqual(['Hello', 'help']);
  });

  test('matches case-insensitively from the input side', () => {
    expect(filterHistory(['hello'], 'HELL')).toStrictEqual(['hello']);
  });

  test('returns empty array when nothing matches', () => {
    expect(filterHistory(['a', 'b'], 'z')).toStrictEqual([]);
  });
});

describe('navigateHistory', () => {
  const filtered = ['cmd1', 'cmd2', 'cmd3'];

  test('empty filtered → null in any direction', () => {
    expect(navigateHistory([], null, 'up')).toBeNull();
    expect(navigateHistory([], 0, 'down')).toBeNull();
  });

  test('up from null lands on last index', () => {
    expect(navigateHistory(filtered, null, 'up')).toBe(2);
  });

  test('up from 0 stays at 0 (clamp)', () => {
    expect(navigateHistory(filtered, 0, 'up')).toBe(0);
  });

  test('up from middle decrements', () => {
    expect(navigateHistory(filtered, 2, 'up')).toBe(1);
  });

  test('down from null stays null (does not enter history)', () => {
    expect(navigateHistory(filtered, null, 'down')).toBeNull();
  });

  test('down from middle increments', () => {
    expect(navigateHistory(filtered, 0, 'down')).toBe(1);
  });

  test('down from last index returns null (exits history)', () => {
    expect(navigateHistory(filtered, 2, 'down')).toBeNull();
  });

  test('down past last index returns null', () => {
    expect(navigateHistory(filtered, 5, 'down')).toBeNull();
  });
});

describe('loadHistory & saveHistory', () => {
  test('round-trips an array', () => {
    saveHistory(['one', 'two']);
    expect(loadHistory()).toStrictEqual(['one', 'two']);
  });

  test('returns [] when storage is empty', () => {
    expect(loadHistory()).toStrictEqual([]);
  });

  test('returns [] when storage value is corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadHistory()).toStrictEqual([]);
  });

  test('does not throw when localStorage is unavailable', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    expect(() => saveHistory(['x'])).not.toThrow();
    expect(loadHistory()).toStrictEqual([]);
  });

  test('does not throw when setItem throws', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: () => null,
        setItem: () => {
          throw new Error('quota');
        },
        removeItem: () => {},
      },
      configurable: true,
      writable: true,
    });
    expect(() => saveHistory(['x'])).not.toThrow();
  });
});
