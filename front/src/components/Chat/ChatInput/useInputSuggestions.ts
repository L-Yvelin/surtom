import { useMemo } from 'react';
import useGameStore from '../../../stores/useGameStore';
import discordEmojis from '../../../assets/discord-emojis.json';

export type Suggestion = {
  label: string;
  value: string;
};

type Trigger = {
  char: string;
  getSuggestions: () => Suggestion[];
};

const EMOJI_SUGGESTIONS: Suggestion[] = (discordEmojis as { emojis: { names: string[]; surrogates: string }[] }).emojis.flatMap((entry) =>
  entry.names.map((name) => ({
    label: `${entry.surrogates} :${name}:`,
    value: entry.surrogates,
  })),
);

function getEmojiSuggestions(): Suggestion[] {
  return EMOJI_SUGGESTIONS;
}

function getPlayerSuggestions(): Suggestion[] {
  const players = useGameStore.getState().playerList;
  return players.map((p) => ({
    label: p.name,
    value: `@${p.name}`,
  }));
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
    const filtered = query
      ? all.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()) || s.value.toLowerCase().includes(query.toLowerCase()))
      : all;

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
