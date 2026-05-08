import { useMemo } from 'react';
import useGameStore from '../../../stores/useGameStore';
import discordEmojis from '../../../assets/discord-emojis.json';

export type Suggestion = {
  label: string;
  value: string;
};

type IndexedSuggestion = Suggestion & {
  labelLower: string;
  valueLower: string;
};

type Trigger = {
  char: string;
  getSuggestions: () => IndexedSuggestion[];
};

const EMOJI_SUGGESTIONS: IndexedSuggestion[] = (discordEmojis as { emojis: { names: string[]; surrogates: string }[] }).emojis.flatMap(
  (entry) =>
    entry.names.map((name) => {
      const label = `${entry.surrogates} :${name}:`;
      const value = entry.surrogates;
      return {
        label,
        value,
        labelLower: label.toLowerCase(),
        valueLower: value.toLowerCase(),
      };
    }),
);

function getEmojiSuggestions(): IndexedSuggestion[] {
  return EMOJI_SUGGESTIONS;
}

function getPlayerSuggestions(): IndexedSuggestion[] {
  const players = useGameStore.getState().playerList;
  return players.map((p) => {
    const label = p.name;
    const value = `@${p.name}`;
    return {
      label,
      value,
      labelLower: label.toLowerCase(),
      valueLower: value.toLowerCase(),
    };
  });
}

const TRIGGERS: Trigger[] = [
  { char: ':', getSuggestions: getEmojiSuggestions },
  { char: '@', getSuggestions: getPlayerSuggestions },
];

export type ActiveSuggestion = {
  trigger: string;
  query: string;
  startIndex: number;
  suggestions: Suggestion[];
};

export function matchTrigger(text: string, cursorPos: number): ActiveSuggestion | null {
  const textBeforeCursor = text.slice(0, cursorPos);

  for (const { char, getSuggestions } of TRIGGERS) {
    const lastTrigger = textBeforeCursor.lastIndexOf(char);
    if (lastTrigger === -1) continue;
    if (lastTrigger > 0 && textBeforeCursor[lastTrigger - 1] !== ' ') continue;

    const query = textBeforeCursor.slice(lastTrigger + 1);
    if (query.includes(' ') && char === ':') continue;

    const all = getSuggestions();
    const queryLower = query.toLowerCase();
    const filtered = query ? all.filter((s) => s.labelLower.includes(queryLower) || s.valueLower.includes(queryLower)) : all;

    if (filtered.length === 0) continue;

    return {
      trigger: char,
      query,
      startIndex: lastTrigger,
      suggestions: filtered.slice(0, 8),
    };
  }

  return null;
}

export function applySuggestion(text: string, active: ActiveSuggestion, suggestion: Suggestion): string {
  const before = text.slice(0, active.startIndex);
  const after = text.slice(active.startIndex + active.trigger.length + active.query.length);
  return `${before}${suggestion.value} ${after}`;
}

export function useInputSuggestions(input: string, cursorPos: number) {
  const playerList = useGameStore((s) => s.playerList);

  const active = useMemo(() => matchTrigger(input, cursorPos), [input, cursorPos, playerList]);

  return active;
}
