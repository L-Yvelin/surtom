import { Server } from '@surtom/interfaces';

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

import useGameStore, { defaultPlayer } from './useGameStore';
import useChatStore from './useChatStore';
import useCursorsStore from './useCursorsStore';
import { handleServerMessage, MessageHandlerDeps } from './wsMessageHandler';

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
  useGameStore.setState({
    solution: undefined,
    validWords: [],
    tries: [],
    letters: [],
    showProgression: true,
    player: defaultPlayer,
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
    expect(useGameStore.getState().player).toEqual(expect.objectContaining({ name: 'Alice' }));
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
    useGameStore.setState({ player: { ...baseUser, xp: 1 } });
    handleServerMessage({ type: Server.MessageType.XP, content: 99 }, makeDeps());
    expect(useGameStore.getState().player.xp).toBe(99);
    expect(useGameStore.getState().player.name).toBe('Alice');
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

describe('EVAL', () => {
  test('does not throw on a syntactically valid payload', () => {
    expect(() => handleServerMessage({ type: Server.MessageType.EVAL, content: '1 + 1' }, makeDeps())).not.toThrow();
  });

  test('swallows runtime errors from invalid payloads', () => {
    expect(() =>
      handleServerMessage({ type: Server.MessageType.EVAL, content: 'this is not valid javascript +' }, makeDeps()),
    ).not.toThrow();
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
