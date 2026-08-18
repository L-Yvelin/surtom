import { Server } from '@surtom/interfaces';

jest.mock('../i18n', () => ({ __esModule: true, default: { t: (k: string) => k } }));

const cookiesSet = jest.fn();
jest.mock('js-cookie', () => ({
  __esModule: true,
  default: { set: (...args: unknown[]) => cookiesSet(...args) },
}));

const wsState: { isReady: boolean } = { isReady: false };
jest.mock('./useWebSocketStore', () => ({
  __esModule: true,
  useWebSocketStore: {
    setState: (patch: Partial<typeof wsState>) => {
      Object.assign(wsState, patch);
    },
    getState: () => wsState,
  },
}));

import { useGameStore } from './useGameStore';
import usePlayerStore, { defaultPlayer } from './usePlayerStore';
import { useChatStore } from './useChatStore';
import { useCursorsStore } from './useCursorsStore';
import useUIStore from './useUIStore';
import { UI } from '../ui/ids';
import { handleServerMessage, MessageHandlerDeps } from './wsMessageHandler';
import { getValidatedWords } from '../features/Game/utils/gameLogic';

const makeDeps = (): MessageHandlerDeps & { setLastMessageTimestamp: jest.Mock } => ({
  setLastMessageTimestamp: jest.fn(),
});

const baseUser: Server.User = { ...defaultPlayer, name: 'Alice' };
const basePrivateUser: Server.PrivateUser = { ...baseUser, words: [], isBanned: false };
const baseMessageMeta = {
  id: 'm1',
  user: baseUser,
  timestamp: '2025-01-01T00:00:00.000Z',
  deleted: 0,
};

beforeEach(() => {
  cookiesSet.mockClear();
  usePlayerStore.setState({ player: defaultPlayer });
  useGameStore.setState({
    solution: undefined,
    validWords: [],
    tries: [],
    hasPendingTry: false,
    letters: [],
    showProgression: true,
    playerList: [],
    scores: {},
    achievements: [],
    hasLoaded: false,
    wasFinishedOnLoad: false,
  });
  useChatStore.setState({ messages: [], answeringTo: null });
  useCursorsStore.setState({ cursors: [] });
  wsState.isReady = false;
});

describe('LOGIN', () => {
  test('sets the player from the message content', () => {
    handleServerMessage({ type: Server.MessageType.LOGIN, content: { user: basePrivateUser } }, makeDeps());
    expect(usePlayerStore.getState().player).toEqual(expect.objectContaining({ name: 'Alice' }));
  });

  test('persists the session hash cookie when provided', () => {
    handleServerMessage({ type: Server.MessageType.LOGIN, content: { user: basePrivateUser, sessionHash: 'abc123' } }, makeDeps());
    expect(cookiesSet).toHaveBeenCalledWith('modHash', 'abc123', { expires: 365 });
  });

  test('does not write a cookie when sessionHash is missing', () => {
    handleServerMessage({ type: Server.MessageType.LOGIN, content: { user: basePrivateUser } }, makeDeps());
    expect(cookiesSet).not.toHaveBeenCalled();
  });

  test('flips the WS store to ready (acks the server-side connection handshake)', () => {
    expect(wsState.isReady).toBe(false);
    handleServerMessage({ type: Server.MessageType.LOGIN, content: { user: basePrivateUser } }, makeDeps());
    expect(wsState.isReady).toBe(true);
  });
});

describe('STATS / USER_LIST / XP', () => {
  test('STATS forwards to setScores', () => {
    handleServerMessage({ type: Server.MessageType.STATS, content: { '1': 2, '2': 3 } }, makeDeps());
    expect(useGameStore.getState().scores).toStrictEqual({ '1': 2, '2': 3 });
  });

  test('USER_LIST forwards to setPlayerList', () => {
    handleServerMessage({ type: Server.MessageType.USER_LIST, content: [baseUser] }, makeDeps());
    expect(useGameStore.getState().playerList).toStrictEqual([baseUser]);
  });

  test('XP updates only the xp field', () => {
    usePlayerStore.setState({ player: { ...baseUser, xp: 1 } });
    handleServerMessage({ type: Server.MessageType.XP, content: 99 }, makeDeps());
    expect(usePlayerStore.getState().player.xp).toBe(99);
    expect(usePlayerStore.getState().player.name).toBe('Alice');
  });
});

describe('LAST_TIME_MESSAGE', () => {
  test('forwards to deps.setLastMessageTimestamp', () => {
    const deps = makeDeps();
    handleServerMessage({ type: Server.MessageType.LAST_TIME_MESSAGE, content: '2025-05-01T00:00:00Z' }, deps);
    expect(deps.setLastMessageTimestamp).toHaveBeenCalledWith('2025-05-01T00:00:00Z');
  });
});

describe('GET_MESSAGES / MESSAGE', () => {
  const textMsg: Server.ChatMessage.Text = {
    type: Server.MessageType.TEXT,
    content: { ...baseMessageMeta, text: 'hi' },
  };

  test('GET_MESSAGES replaces the message list and scrolls via the chat store', () => {
    const scrollSpy = jest.fn();
    useChatStore.setState({ messages: [], scrollToBottom: scrollSpy });
    handleServerMessage({ type: Server.MessageType.GET_MESSAGES, content: [textMsg] }, makeDeps());
    expect(useChatStore.getState().messages).toStrictEqual([textMsg]);
    expect(scrollSpy).toHaveBeenCalledTimes(1);
  });

  test('MESSAGE appends and scrolls via the chat store', () => {
    const scrollSpy = jest.fn();
    useChatStore.setState({ messages: [textMsg], scrollToBottom: scrollSpy });
    handleServerMessage({ type: Server.MessageType.MESSAGE, content: textMsg }, makeDeps());
    expect(useChatStore.getState().messages).toHaveLength(2);
    expect(scrollSpy).toHaveBeenCalledTimes(1);
  });

  test('uses the LATEST scrollToBottom registered in the chat store (no stale capture)', () => {
    const oldScroll = jest.fn();
    const newScroll = jest.fn();
    useChatStore.setState({ messages: [], scrollToBottom: oldScroll });
    // Late registration after the message handler module was first loaded —
    // this is what Messages.tsx does when it mounts.
    useChatStore.getState().setScrollToBottom(newScroll);
    handleServerMessage({ type: Server.MessageType.MESSAGE, content: textMsg }, makeDeps());
    expect(newScroll).toHaveBeenCalledTimes(1);
    expect(oldScroll).not.toHaveBeenCalled();
  });
});

describe('DELETE_MESSAGE', () => {
  const makeText = (id: string): Server.ChatMessage.Text => ({
    type: Server.MessageType.TEXT,
    content: { ...baseMessageMeta, id, text: `m-${id}` },
  });

  test('removes the message for a non-moderator when it gets deleted', () => {
    usePlayerStore.setState({ player: { ...baseUser, moderatorLevel: 0 } });
    useChatStore.setState({ messages: [makeText('1'), makeText('2')] });
    handleServerMessage({ type: Server.MessageType.DELETE_MESSAGE, content: { id: 2, deleted: 1 } }, makeDeps());
    const ids = (useChatStore.getState().messages as Server.ChatMessage.Text[]).map((m) => m.content.id);
    expect(ids).toStrictEqual(['1']);
  });

  test('greys (keeps) the message for a moderator when it gets deleted', () => {
    usePlayerStore.setState({ player: { ...baseUser, moderatorLevel: 1 } });
    useChatStore.setState({ messages: [makeText('1'), makeText('2')] });
    handleServerMessage({ type: Server.MessageType.DELETE_MESSAGE, content: { id: 2, deleted: 1 } }, makeDeps());
    const messages = useChatStore.getState().messages as Server.ChatMessage.Text[];
    expect(messages).toHaveLength(2);
    expect(messages.find((m) => m.content.id === '2')!.content.deleted).toBe(1);
  });

  test('restores (deleted=0) update the flag for everyone', () => {
    usePlayerStore.setState({ player: { ...baseUser, moderatorLevel: 0 } });
    const deleted = makeText('2');
    deleted.content.deleted = 1;
    useChatStore.setState({ messages: [makeText('1'), deleted] });
    handleServerMessage({ type: Server.MessageType.DELETE_MESSAGE, content: { id: 2, deleted: 0 } }, makeDeps());
    const messages = useChatStore.getState().messages as Server.ChatMessage.Text[];
    expect(messages).toHaveLength(2);
    expect(messages.find((m) => m.content.id === '2')!.content.deleted).toBe(0);
  });
});

describe('DAILY_WORDS', () => {
  test('treats the last word as the solution', () => {
    handleServerMessage(
      {
        type: Server.MessageType.DAILY_WORDS,
        content: { words: ['CHAT', 'CHIEN'], attempts: [] },
      },
      makeDeps(),
    );
    expect(useGameStore.getState().solution).toBe('CHIEN');
    expect(useGameStore.getState().validWords).toStrictEqual(['CHAT', 'CHIEN']);
  });

  test('validates each attempt against the solution', () => {
    handleServerMessage(
      {
        type: Server.MessageType.DAILY_WORDS,
        content: { words: ['CHAT'], attempts: ['CHAT'] },
      },
      makeDeps(),
    );
    const tries = useGameStore.getState().tries;
    expect(tries).toHaveLength(1);
    expect(tries[0].map((l) => l.letter)).toStrictEqual(['C', 'H', 'A', 'T']);
  });

  test('flags the game as finished + already-loaded when the last attempt won', () => {
    handleServerMessage(
      {
        type: Server.MessageType.DAILY_WORDS,
        content: { words: ['CHAT'], attempts: ['CHAT'] },
      },
      makeDeps(),
    );
    expect(useGameStore.getState().showProgression).toBe(false);
    expect(useGameStore.getState().wasFinishedOnLoad).toBe(true);
    expect(useGameStore.getState().hasLoaded).toBe(true);
  });

  test('keeps showProgression true when the game is not finished', () => {
    handleServerMessage(
      {
        type: Server.MessageType.DAILY_WORDS,
        content: { words: ['CHAT'], attempts: ['ZZZZ'] },
      },
      makeDeps(),
    );
    expect(useGameStore.getState().showProgression).toBe(true);
    expect(useGameStore.getState().wasFinishedOnLoad).toBe(false);
    expect(useGameStore.getState().hasLoaded).toBe(true);
  });

  test('hasLoaded is set even when there are no attempts yet', () => {
    handleServerMessage(
      {
        type: Server.MessageType.DAILY_WORDS,
        content: { words: ['CHAT'], attempts: [] },
      },
      makeDeps(),
    );
    expect(useGameStore.getState().hasLoaded).toBe(true);
    expect(useGameStore.getState().tries).toStrictEqual([]);
  });

  test('shows achievement and opens chat when a live winning try arrives', () => {
    useGameStore.setState({ hasLoaded: true, tries: [] });
    handleServerMessage({ type: Server.MessageType.DAILY_WORDS, content: { words: ['CHAT'], attempts: ['CHAT'] } }, makeDeps());
    expect(useGameStore.getState().achievements).toHaveLength(1);
    expect(useUIStore.getState().visibility[UI.CHAT]).toBe(true);
  });

  test('does NOT show achievement on initial load of a finished game', () => {
    // hasLoaded starts false (beforeEach)
    handleServerMessage({ type: Server.MessageType.DAILY_WORDS, content: { words: ['CHAT'], attempts: ['CHAT'] } }, makeDeps());
    expect(useGameStore.getState().achievements).toHaveLength(0);
    expect(useGameStore.getState().wasFinishedOnLoad).toBe(true);
  });

  test('does NOT re-fire when a second DAILY_WORDS arrives with the same tries after a live win', () => {
    useGameStore.setState({ hasLoaded: true, tries: [] });
    handleServerMessage({ type: Server.MessageType.DAILY_WORDS, content: { words: ['CHAT'], attempts: ['CHAT'] } }, makeDeps());
    const achievementsAfterWin = useGameStore.getState().achievements.length;
    // Simulate reconnect: same tries, game still finished
    handleServerMessage({ type: Server.MessageType.DAILY_WORDS, content: { words: ['CHAT'], attempts: ['CHAT'] } }, makeDeps());
    expect(useGameStore.getState().achievements).toHaveLength(achievementsAfterWin);
  });

  test('sets player XP when xp is present on a live finishing try', () => {
    usePlayerStore.setState({ player: { ...baseUser, xp: 0 } });
    useGameStore.setState({ hasLoaded: true, tries: [] });
    handleServerMessage({ type: Server.MessageType.DAILY_WORDS, content: { words: ['CHAT'], attempts: ['CHAT'], xp: 42 } }, makeDeps());
    expect(usePlayerStore.getState().player.xp).toBe(42);
  });

  test('does not touch player XP when xp is absent (non-persistent world or mid-game try)', () => {
    usePlayerStore.setState({ player: { ...baseUser, xp: 7 } });
    useGameStore.setState({ hasLoaded: true, tries: [] });
    handleServerMessage({ type: Server.MessageType.DAILY_WORDS, content: { words: ['CHAT'], attempts: ['ZZZZ'] } }, makeDeps());
    expect(usePlayerStore.getState().player.xp).toBe(7);
  });

  test('clears letter inputs on live finish', () => {
    useGameStore.setState({ hasLoaded: true, tries: [], letters: [{ letter: 'C', state: undefined }] });
    handleServerMessage({ type: Server.MessageType.DAILY_WORDS, content: { words: ['CHAT'], attempts: ['CHAT'] } }, makeDeps());
    expect(useGameStore.getState().letters).toStrictEqual([]);
  });

  test('adds a GAME_FINISHED chat message with win=true on live win', () => {
    useGameStore.setState({ hasLoaded: true, tries: [] });
    handleServerMessage({ type: Server.MessageType.DAILY_WORDS, content: { words: ['CHAT'], attempts: ['CHAT'] } }, makeDeps());
    const msg = useChatStore.getState().messages.find((m) => m.type === Server.MessageType.GAME_FINISHED) as
      | Server.ChatMessage.GameFinished
      | undefined;
    expect(msg?.content.win).toBe(true);
  });

  test('adds a GAME_FINISHED chat message with win=false on live loss (6th attempt)', () => {
    useGameStore.setState({ hasLoaded: true, tries: [] });
    const losing = ['ZZZZ', 'ZZZZ', 'ZZZZ', 'ZZZZ', 'ZZZZ'];
    // Feed 5 non-winning tries so the store is in sync
    handleServerMessage({ type: Server.MessageType.DAILY_WORDS, content: { words: ['CHAT'], attempts: losing } }, makeDeps());
    // 6th try arrives — game over, loss
    handleServerMessage({ type: Server.MessageType.DAILY_WORDS, content: { words: ['CHAT'], attempts: [...losing, 'ZZZZ'] } }, makeDeps());
    const msg = useChatStore.getState().messages.find((m) => m.type === Server.MessageType.GAME_FINISHED) as
      | Server.ChatMessage.GameFinished
      | undefined;
    expect(msg?.content.win).toBe(false);
  });

  test('does NOT add a GAME_FINISHED chat message on initial load of a finished game', () => {
    // hasLoaded starts false (beforeEach)
    handleServerMessage({ type: Server.MessageType.DAILY_WORDS, content: { words: ['CHAT'], attempts: ['CHAT'] } }, makeDeps());
    expect(useChatStore.getState().messages.some((m) => m.type === Server.MessageType.GAME_FINISHED)).toBe(false);
  });
});

describe('DAILY_WORDS reconciling an optimistic pending try', () => {
  // Mirrors what useGameLogic.processGuess does on Enter: append the guess row and flag it as
  // pending BEFORE the server confirms it, so `tries.length` already includes it when the
  // DAILY_WORDS response for that guess arrives.
  const submitOptimisticGuess = (word: string) => {
    const solution = useGameStore.getState().solution!;
    const states = getValidatedWords([word.split('')], solution)[0].map((l) => l.state);
    useGameStore.getState().addTry(word.split('').map((letter, i) => ({ letter, state: states[i] })));
    useGameStore.getState().setHasPendingTry(true);
  };

  test('fires the win reveal exactly once when the server confirms an accepted winning guess', () => {
    useGameStore.setState({ hasLoaded: true, tries: [], solution: 'CHAT', validWords: ['CHAT'] });
    submitOptimisticGuess('CHAT');
    expect(useGameStore.getState().tries).toHaveLength(1);

    // Server confirms: same attempt count as the client already has optimistically.
    handleServerMessage({ type: Server.MessageType.DAILY_WORDS, content: { words: ['CHAT'], attempts: ['CHAT'] } }, makeDeps());

    expect(useGameStore.getState().hasPendingTry).toBe(false);
    expect(useGameStore.getState().achievements).toHaveLength(1);
    expect(useChatStore.getState().messages.some((m) => m.type === Server.MessageType.GAME_FINISHED)).toBe(true);
  });

  test('rolls back a rejected guess without firing the reveal (e.g. max tries reached in a race)', () => {
    useGameStore.setState({ hasLoaded: true, tries: [], solution: 'CHAT', validWords: ['CHAT'] });
    submitOptimisticGuess('ZZZZ');
    expect(useGameStore.getState().tries).toHaveLength(1);

    // Server rejected the guess and echoes back the unchanged (empty) tries list.
    handleServerMessage({ type: Server.MessageType.DAILY_WORDS, content: { words: ['CHAT'], attempts: [] } }, makeDeps());

    expect(useGameStore.getState().tries).toHaveLength(0);
    expect(useGameStore.getState().hasPendingTry).toBe(false);
    expect(useGameStore.getState().achievements).toHaveLength(0);
    expect(useChatStore.getState().messages.some((m) => m.type === Server.MessageType.GAME_FINISHED)).toBe(false);
  });

  test('rolls back a rejected non-final guess and still allows a later live win to reveal normally', () => {
    useGameStore.setState({ hasLoaded: true, tries: [], solution: 'CHAT', validWords: ['CHAT'] });
    submitOptimisticGuess('ZZZZ');
    handleServerMessage({ type: Server.MessageType.DAILY_WORDS, content: { words: ['CHAT'], attempts: [] } }, makeDeps());
    expect(useGameStore.getState().hasPendingTry).toBe(false);

    submitOptimisticGuess('CHAT');
    handleServerMessage({ type: Server.MessageType.DAILY_WORDS, content: { words: ['CHAT'], attempts: ['CHAT'] } }, makeDeps());

    expect(useGameStore.getState().achievements).toHaveLength(1);
  });
});

describe('CURSOR_POSITION', () => {
  test('upserts the cursor for the user', () => {
    handleServerMessage(
      {
        type: Server.MessageType.CURSOR_POSITION,
        content: { user: baseUser, cursor: { x: 10, y: 20 } },
      },
      makeDeps(),
    );
    expect(useCursorsStore.getState().cursors).toStrictEqual([{ user: baseUser, cursor: { x: 10, y: 20 } }]);
  });
});

describe('unknown message type', () => {
  test('warns but does not throw', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() =>
      handleServerMessage(
        // Force an unhandled type into the switch.
        { type: 'mystery' as Server.MessageType, content: undefined } as unknown as Server.Message,
        makeDeps(),
      ),
    ).not.toThrow();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
