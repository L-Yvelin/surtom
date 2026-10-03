import { TYPING_TTL_MS, useTypingStore } from './useTypingStore';

beforeEach(() => {
  jest.useFakeTimers();
  useTypingStore.getState().resetWorld();
});

afterEach(() => {
  useTypingStore.getState().resetWorld();
  jest.useRealTimers();
});

describe('markTyping', () => {
  test('adds a typer once, keeping arrival order', () => {
    const { markTyping } = useTypingStore.getState();
    markTyping('Alice');
    markTyping('Bob');
    markTyping('Alice');
    expect(useTypingStore.getState().typers).toStrictEqual(['Alice', 'Bob']);
  });

  test('expires a typer after the TTL', () => {
    useTypingStore.getState().markTyping('Alice');
    jest.advanceTimersByTime(TYPING_TTL_MS - 1);
    expect(useTypingStore.getState().typers).toStrictEqual(['Alice']);
    jest.advanceTimersByTime(1);
    expect(useTypingStore.getState().typers).toStrictEqual([]);
  });

  test('renewing a typer postpones its expiry', () => {
    const { markTyping } = useTypingStore.getState();
    markTyping('Alice');
    jest.advanceTimersByTime(TYPING_TTL_MS - 500);
    markTyping('Alice');
    jest.advanceTimersByTime(TYPING_TTL_MS - 500);
    expect(useTypingStore.getState().typers).toStrictEqual(['Alice']);
    jest.advanceTimersByTime(500);
    expect(useTypingStore.getState().typers).toStrictEqual([]);
  });
});

describe('clearTyper', () => {
  test('removes only the given typer', () => {
    const { markTyping, clearTyper } = useTypingStore.getState();
    markTyping('Alice');
    markTyping('Bob');
    clearTyper('Alice');
    expect(useTypingStore.getState().typers).toStrictEqual(['Bob']);
  });

  test('is a no-op for an unknown typer', () => {
    const before = useTypingStore.getState().typers;
    useTypingStore.getState().clearTyper('Nobody');
    expect(useTypingStore.getState().typers).toBe(before);
  });
});

describe('resetWorld', () => {
  test('empties the list and cancels pending expiries', () => {
    useTypingStore.getState().markTyping('Alice');
    useTypingStore.getState().resetWorld();
    expect(useTypingStore.getState().typers).toStrictEqual([]);
    expect(jest.getTimerCount()).toBe(0);
  });
});
