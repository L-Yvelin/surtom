import { Server } from '@surtom/interfaces';
import useGameStore from '../../../stores/useGameStore';
import { applySuggestion, matchTrigger } from './useInputSuggestions';

const players: Server.User[] = [
  { name: 'Alice', isMobile: false, isLoggedIn: true, moderatorLevel: 0, xp: 0 },
  { name: 'Bob', isMobile: false, isLoggedIn: true, moderatorLevel: 0, xp: 0 },
  { name: 'Alfred', isMobile: false, isLoggedIn: true, moderatorLevel: 0, xp: 0 },
];

beforeEach(() => {
  useGameStore.setState({ playerList: players });
});

afterAll(() => {
  useGameStore.setState({ playerList: [] });
});

describe('matchTrigger — no trigger', () => {
  test('plain text returns null', () => {
    expect(matchTrigger('hello world', 11)).toBeNull();
  });

  test('trigger after the cursor is ignored', () => {
    expect(matchTrigger('hi :smile', 2)).toBeNull();
  });
});

describe('matchTrigger — `:` trigger (emojis)', () => {
  test('matches at start of input', () => {
    const active = matchTrigger(':smil', 5);
    expect(active).not.toBeNull();
    expect(active!.trigger).toBe(':');
    expect(active!.startIndex).toBe(0);
    expect(active!.query).toBe('smil');
    expect(active!.suggestions.length).toBeGreaterThan(0);
  });

  test('matches when preceded by whitespace', () => {
    const active = matchTrigger('hi :smile', 9);
    expect(active).not.toBeNull();
    expect(active!.startIndex).toBe(3);
    expect(active!.query).toBe('smile');
  });

  test('does NOT match when preceded by a non-space character', () => {
    expect(matchTrigger('not:smile', 9)).toBeNull();
  });

  test('rejects queries containing a space (emoji names cannot contain spaces)', () => {
    expect(matchTrigger(': smile', 7)).toBeNull();
  });

  test('empty query (just typed `:`) returns the top-8 suggestions', () => {
    const active = matchTrigger(':', 1);
    expect(active).not.toBeNull();
    expect(active!.query).toBe('');
    expect(active!.suggestions).toHaveLength(8);
  });

  test('caps suggestions at 8 even with many matches', () => {
    const active = matchTrigger(':s', 2);
    expect(active).not.toBeNull();
    expect(active!.suggestions.length).toBeLessThanOrEqual(8);
  });

  test('returns null when nothing matches the query', () => {
    expect(matchTrigger(':xxxnotanemojiname', 18)).toBeNull();
  });
});

describe('matchTrigger — `@` trigger (mentions)', () => {
  test('empty query returns all current players', () => {
    const active = matchTrigger('@', 1);
    expect(active).not.toBeNull();
    expect(active!.trigger).toBe('@');
    expect(active!.suggestions.map((s) => s.label)).toStrictEqual(['Alice', 'Bob', 'Alfred']);
  });

  test('filters players case-insensitively by label', () => {
    const active = matchTrigger('@al', 3);
    expect(active).not.toBeNull();
    expect(active!.suggestions.map((s) => s.label)).toStrictEqual(['Alice', 'Alfred']);
  });

  test('does NOT reject queries containing a space (unlike `:`)', () => {
    // `@a b` looks for the substring 'a b' in player labels — none match → null,
    // but the rejection happens because the filter returns no matches, not because of the space rule.
    expect(matchTrigger('@a b', 4)).toBeNull();
  });

  test('returns null when no player matches', () => {
    expect(matchTrigger('@zzz', 4)).toBeNull();
  });

  test('returns null when player list is empty', () => {
    useGameStore.setState({ playerList: [] });
    expect(matchTrigger('@', 1)).toBeNull();
  });
});

describe('matchTrigger — multiple triggers in input', () => {
  test('uses the rightmost trigger before the cursor', () => {
    // `:` is at index 0, `@al` starts at index 9, cursor at 12 → @ wins via lastIndexOf.
    const active = matchTrigger(':smile  @al', 11);
    expect(active).not.toBeNull();
    expect(active!.trigger).toBe('@');
    expect(active!.query).toBe('al');
  });
});

describe('applySuggestion', () => {
  test('replaces trigger + query with suggestion value plus a trailing space', () => {
    const active = matchTrigger('hi :sm', 6)!;
    const result = applySuggestion('hi :sm', active, { label: 'smile :smile:', value: '😄' });
    expect(result).toBe('hi 😄 ');
  });

  test('preserves text after the query', () => {
    // active spans the `:sm` token only; text after the cursor must be preserved.
    const active = matchTrigger('hi :sm bye', 6)!;
    const result = applySuggestion('hi :sm bye', active, { label: 'smile :smile:', value: '😄' });
    expect(result).toBe('hi 😄  bye');
  });

  test('works with @ mentions', () => {
    const active = matchTrigger('hello @al', 9)!;
    const result = applySuggestion('hello @al', active, { label: 'Alice', value: '@Alice' });
    expect(result).toBe('hello @Alice ');
  });

  test('works on an empty query (just the trigger char)', () => {
    const active = matchTrigger(':', 1)!;
    const result = applySuggestion(':', active, { label: 'x', value: '😄' });
    expect(result).toBe('😄 ');
  });
});
