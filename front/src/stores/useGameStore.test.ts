import { LetterState, Server, Word } from '@surtom/interfaces';
import { useGameStore } from './useGameStore';
import { defaultPlayer } from './usePlayerStore';

const makeUser = (overrides: Partial<Server.User>): Server.User => ({
  ...defaultPlayer,
  ...overrides,
});

const makeAchievement = (id: string) => ({
  id,
  title: `t-${id}`,
  description: `d-${id}`,
});

beforeEach(() => {
  useGameStore.setState({
    solution: undefined,
    validWords: [],
    tries: [],
    letters: [],
    showProgression: true,
    playerList: [],
    scores: {},
    achievements: [],
    hasLoaded: false,
    wasFinishedOnLoad: false,
  });
});

describe('player list', () => {
  const alice = makeUser({ name: 'Alice' });
  const bob = makeUser({ name: 'Bob' });

  test('addPlayer appends to the list', () => {
    useGameStore.getState().addPlayer(alice);
    useGameStore.getState().addPlayer(bob);
    expect(useGameStore.getState().playerList.map((p) => p.name)).toStrictEqual(['Alice', 'Bob']);
  });

  test('removePlayer drops the matching name', () => {
    useGameStore.setState({ playerList: [alice, bob] });
    useGameStore.getState().removePlayer('Alice');
    expect(useGameStore.getState().playerList).toStrictEqual([bob]);
  });

  test('removePlayer is a no-op for unknown names', () => {
    useGameStore.setState({ playerList: [alice] });
    useGameStore.getState().removePlayer('Nobody');
    expect(useGameStore.getState().playerList).toStrictEqual([alice]);
  });
});

describe('tries', () => {
  const word: Word = [
    { letter: 'A', state: LetterState.Correct },
    { letter: 'B', state: LetterState.Correct },
    { letter: 'C', state: LetterState.Correct },
  ];

  test('addTry appends a Word to the tries list', () => {
    useGameStore.getState().addTry(word);
    expect(useGameStore.getState().tries).toStrictEqual([word]);
    useGameStore.getState().addTry(word);
    expect(useGameStore.getState().tries).toHaveLength(2);
  });
});

describe('achievements', () => {
  test('addAchievement appends', () => {
    useGameStore.getState().addAchievement(makeAchievement('a'));
    expect(useGameStore.getState().achievements.map((a) => a.id)).toStrictEqual(['a']);
  });

  test('removeAchievement filters by id', () => {
    useGameStore.setState({
      achievements: [makeAchievement('a'), makeAchievement('b'), makeAchievement('c')],
    });
    useGameStore.getState().removeAchievement('b');
    expect(useGameStore.getState().achievements.map((a) => a.id)).toStrictEqual(['a', 'c']);
  });
});

describe('resetSession', () => {
  const word: Word = [
    { letter: 'A', state: LetterState.Correct },
    { letter: 'B', state: LetterState.Correct },
    { letter: 'C', state: LetterState.Correct },
  ];
  const partial: Word = [{ letter: 'B', state: LetterState.Miss }];

  test('clears achievements', () => {
    useGameStore.setState({ achievements: [makeAchievement('a'), makeAchievement('b')] });
    useGameStore.getState().resetSession();
    expect(useGameStore.getState().achievements).toStrictEqual([]);
  });

  test('clears in-progress letters', () => {
    useGameStore.setState({ letters: partial });
    useGameStore.getState().resetSession();
    expect(useGameStore.getState().letters).toStrictEqual([]);
  });

  test('preserves World-tier fields (tries, solution, scores, etc.)', () => {
    useGameStore.setState({
      tries: [word],
      solution: 'CHIEN',
      validWords: ['CHAT', 'CHIEN'],
      playerList: [makeUser({ name: 'Bob' })],
      scores: { foo: { wins: 1, losses: 0 } } as never,
      hasLoaded: true,
      showProgression: false,
      wasFinishedOnLoad: true,
    });
    useGameStore.getState().resetSession();
    const state = useGameStore.getState();
    expect(state.tries).toStrictEqual([word]);
    expect(state.solution).toBe('CHIEN');
    expect(state.validWords).toStrictEqual(['CHAT', 'CHIEN']);
    expect(state.playerList.map((p) => p.name)).toStrictEqual(['Bob']);
    expect(state.scores).toStrictEqual({ foo: { wins: 1, losses: 0 } });
    expect(state.hasLoaded).toBe(true);
    expect(state.showProgression).toBe(false);
    expect(state.wasFinishedOnLoad).toBe(true);
  });
});

describe('resetWorld', () => {
  const word: Word = [
    { letter: 'A', state: LetterState.Correct },
    { letter: 'B', state: LetterState.Correct },
    { letter: 'C', state: LetterState.Correct },
  ];

  test('clears every World-tier field back to its initial value', () => {
    useGameStore.setState({
      tries: [word],
      solution: 'CHIEN',
      validWords: ['CHAT'],
      playerList: [makeUser({ name: 'Bob' })],
      scores: { foo: { wins: 1, losses: 0 } } as never,
      hasLoaded: true,
      showProgression: false,
      wasFinishedOnLoad: true,
    });
    useGameStore.getState().resetWorld();
    const state = useGameStore.getState();
    expect(state.tries).toStrictEqual([]);
    expect(state.solution).toBeUndefined();
    expect(state.validWords).toStrictEqual([]);
    expect(state.playerList).toStrictEqual([]);
    expect(state.scores).toStrictEqual({});
    expect(state.hasLoaded).toBe(false);
    expect(state.showProgression).toBe(true);
    expect(state.wasFinishedOnLoad).toBe(false);
  });

  test('does not touch Session-tier fields (achievements, letters)', () => {
    const ach = makeAchievement('a');
    useGameStore.setState({
      achievements: [ach],
      letters: [{ letter: 'X', state: LetterState.Correct }],
    });
    useGameStore.getState().resetWorld();
    expect(useGameStore.getState().achievements).toStrictEqual([ach]);
    expect(useGameStore.getState().letters).toStrictEqual([{ letter: 'X', state: LetterState.Correct }]);
  });
});
