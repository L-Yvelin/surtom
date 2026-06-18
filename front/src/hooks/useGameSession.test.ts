import { LetterState, Server, Word } from '@surtom/interfaces';
import useGameStore from '../stores/useGameStore';
import usePlayerStore, { defaultPlayer } from '../stores/usePlayerStore';
import useChatStore from '../stores/useChatStore';
import useCursorsStore from '../stores/useCursorsStore';
import useUIStore from '../stores/useUIStore';
import useInputStore from '../stores/useInputStore';
import { resetGameSession, resetGameWorld } from './useGameSession';

const word: Word = [
  { letter: 'A', state: LetterState.Correct },
  { letter: 'B', state: LetterState.Correct },
  { letter: 'C', state: LetterState.Correct },
];

const message: Server.ChatMessage.Text = {
  type: Server.MessageType.TEXT,
  content: {
    id: 'm-1',
    user: defaultPlayer,
    text: 'hi',
    timestamp: new Date().toISOString(),
    deleted: 0,
  },
};

beforeEach(() => {
  usePlayerStore.setState({ player: { ...defaultPlayer, name: 'Alice', xp: 42 } });
  useGameStore.setState({
    tries: [word],
    solution: 'CHIEN',
    validWords: ['CHIEN'],
    letters: [{ letter: 'B', state: LetterState.Miss }],
    achievements: [{ id: 'a', title: 't', description: 'd' }],
    hasLoaded: true,
    showProgression: false,
    wasFinishedOnLoad: true,
  });
  useChatStore.setState({
    messages: [message],
    answeringTo: 'm-1',
  });
  useUIStore.setState({ visibility: { chat: true, stats: true } });
  useInputStore.setState({ scopes: [{ id: 'worldLoading', policy: 'block-all' }] });
});

describe('resetGameSession', () => {
  test('clears every Session-tier field across stores', () => {
    resetGameSession();
    expect(useGameStore.getState().achievements).toStrictEqual([]);
    expect(useGameStore.getState().letters).toStrictEqual([]);
    expect(useChatStore.getState().answeringTo).toBeNull();
    expect(useUIStore.getState().visibility).toStrictEqual({});
    expect(useInputStore.getState().scopes).toStrictEqual([]);
  });

  test('preserves App-tier and World-tier state across all stores', () => {
    resetGameSession();
    expect(usePlayerStore.getState().player.name).toBe('Alice');
    expect(usePlayerStore.getState().player.xp).toBe(42);
    expect(useGameStore.getState().tries).toStrictEqual([word]);
    expect(useGameStore.getState().solution).toBe('CHIEN');
    expect(useGameStore.getState().validWords).toStrictEqual(['CHIEN']);
    expect(useGameStore.getState().hasLoaded).toBe(true);
    expect(useChatStore.getState().messages).toStrictEqual([message]);
  });

  test('is idempotent (calling twice produces the same cleared state)', () => {
    resetGameSession();
    resetGameSession();
    expect(useGameStore.getState().achievements).toStrictEqual([]);
    expect(useUIStore.getState().visibility).toStrictEqual({});
  });
});

describe('resetGameWorld', () => {
  beforeEach(() => {
    useCursorsStore.setState({
      cursors: [{ user: { ...defaultPlayer, name: 'Bob' }, cursor: { x: 1, y: 2 } }],
    });
  });

  test('clears every World-tier field across stores', () => {
    resetGameWorld();
    expect(useGameStore.getState().tries).toStrictEqual([]);
    expect(useGameStore.getState().solution).toBeUndefined();
    expect(useGameStore.getState().validWords).toStrictEqual([]);
    expect(useGameStore.getState().hasLoaded).toBe(false);
    expect(useGameStore.getState().showProgression).toBe(true);
    expect(useGameStore.getState().wasFinishedOnLoad).toBe(false);
    expect(useChatStore.getState().messages).toHaveLength(1);
    expect(useChatStore.getState().messages[0].type).toBe(Server.MessageType.TEXT);
    expect(useCursorsStore.getState().cursors).toStrictEqual([]);
  });

  test('preserves App-tier player identity', () => {
    resetGameWorld();
    expect(usePlayerStore.getState().player.name).toBe('Alice');
    expect(usePlayerStore.getState().player.xp).toBe(42);
  });
});
