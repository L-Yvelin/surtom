/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { LetterState } from '@surtom/interfaces';

jest.mock('../../../i18n', () => ({ __esModule: true, default: { t: (k: string) => k } }));

import { useGameStore } from '../../../stores/useGameStore';
import { useWebSocketStore } from '../../../stores/useWebSocketStore';
import useGameLogic from './useGameLogic';

const sendMessage = jest.fn();

function fireKey(handleKeyDown: (e: KeyboardEvent) => void, key: string, extra: Partial<KeyboardEvent> = {}) {
  act(() => {
    handleKeyDown({ key, ctrlKey: false, altKey: false, metaKey: false, ...extra } as KeyboardEvent);
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  useGameStore.setState({
    solution: 'CHAT',
    validWords: ['CHAT', 'CHOP'],
    tries: [],
    letters: [],
    hasPendingTry: false,
    achievements: [],
  });
  useWebSocketStore.setState({ sendMessage });
});

describe('useGameLogic', () => {
  test('pins the solution first letter into `letters` once the solution loads', () => {
    renderHook(() => useGameLogic());
    expect(useGameStore.getState().letters).toStrictEqual([{ letter: 'C', state: LetterState.Correct }]);
  });

  test('Enter with a valid non-winning guess optimistically adds a colored try, flags it pending, and sends TRY', () => {
    const { result } = renderHook(() => useGameLogic());
    act(() => {
      useGameStore.getState().setLetters([{ letter: 'C', state: LetterState.Correct }, { letter: 'H' }, { letter: 'O' }, { letter: 'P' }]);
    });

    fireKey(result.current.handleKeyDown, 'Enter');

    expect(useGameStore.getState().tries).toStrictEqual([
      [
        { letter: 'C', state: LetterState.Correct },
        { letter: 'H', state: LetterState.Correct },
        { letter: 'O', state: LetterState.Miss },
        { letter: 'P', state: LetterState.Miss },
      ],
    ]);
    expect(useGameStore.getState().hasPendingTry).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith({ type: 'try', content: 'CHOP' });
    // The input row resets back to just the pinned first letter, ready for the next guess.
    expect(useGameStore.getState().letters).toStrictEqual([{ letter: 'C', state: LetterState.Correct }]);
  });

  test('Enter with a valid winning guess clears the input entirely once the game is finished', () => {
    const { result } = renderHook(() => useGameLogic());
    act(() => {
      useGameStore.getState().setLetters([{ letter: 'C', state: LetterState.Correct }, { letter: 'H' }, { letter: 'A' }, { letter: 'T' }]);
    });

    fireKey(result.current.handleKeyDown, 'Enter');

    expect(useGameStore.getState().hasPendingTry).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith({ type: 'try', content: 'CHAT' });
    // isGameFinished(tries) flips true for the optimistic winning row, which the hook's own
    // effect reacts to by clearing the input entirely (rather than re-pinning the first letter).
    expect(useGameStore.getState().letters).toStrictEqual([]);
  });

  test('Enter with a guess outside the valid-words list is rejected locally: no try, no pending flag, no send', () => {
    const { result } = renderHook(() => useGameLogic());
    act(() => {
      useGameStore.getState().setLetters([{ letter: 'C', state: LetterState.Correct }, { letter: 'H' }, { letter: 'X' }, { letter: 'T' }]);
    });

    fireKey(result.current.handleKeyDown, 'Enter');

    expect(useGameStore.getState().tries).toStrictEqual([]);
    expect(useGameStore.getState().hasPendingTry).toBe(false);
    expect(sendMessage).not.toHaveBeenCalled();
    expect(useGameStore.getState().achievements).toHaveLength(1);
  });

  test('typing a letter appends it uncolored, and does not overflow the solution length', () => {
    const { result } = renderHook(() => useGameLogic());
    fireKey(result.current.handleKeyDown, 'x');
    expect(useGameStore.getState().letters).toStrictEqual([{ letter: 'C', state: LetterState.Correct }, { letter: 'X' }]);

    // Fill up to the solution length (4) and confirm further letters are dropped.
    fireKey(result.current.handleKeyDown, 'y');
    fireKey(result.current.handleKeyDown, 'z');
    fireKey(result.current.handleKeyDown, 'w');
    const atCapacity = useGameStore.getState().letters;
    expect(atCapacity).toHaveLength(4);
    fireKey(result.current.handleKeyDown, 'q');
    expect(useGameStore.getState().letters).toStrictEqual(atCapacity);
  });

  test('Backspace never removes the pinned first letter', () => {
    const { result } = renderHook(() => useGameLogic());
    fireKey(result.current.handleKeyDown, 'Backspace');
    expect(useGameStore.getState().letters).toStrictEqual([{ letter: 'C', state: LetterState.Correct }]);
  });
});
