import { dispatchKey, isGameKey, KeyDispatchDeps } from './keyDispatcher';
import type { InputScope } from '../../../stores/useInputStore';

const ev = (key: string, opts: { altKey?: boolean; ctrlKey?: boolean; metaKey?: boolean } = {}): KeyboardEvent =>
  ({ key, altKey: opts.altKey ?? false, ctrlKey: opts.ctrlKey ?? false, metaKey: opts.metaKey ?? false }) as KeyboardEvent;

const makeDeps = (overrides: Partial<KeyDispatchDeps> = {}): KeyDispatchDeps => ({
  showChat: false,
  focusInput: jest.fn(),
  gameFinished: false,
  shortcutsKeyDown: jest.fn(),
  shortcutsKeyUp: jest.fn(),
  gameKeyDown: jest.fn(),
  ...overrides,
});

describe('isGameKey', () => {
  test.each([
    ['a', true],
    ['z', true],
    ['A', true],
    ['Enter', true],
    ['Backspace', true],
    ['Escape', false],
    ['Tab', false],
    ['/', false],
  ])('%s -> %s', (key, expected) => {
    expect(isGameKey(ev(key))).toBe(expected);
  });
});

describe('dispatchKey - block-all on top', () => {
  test('nothing fires regardless of key, state, or chat', () => {
    const deps = makeDeps({ showChat: true });
    const top: InputScope = { id: 'load', policy: 'block-all' };
    dispatchKey(ev('a'), 'down', top, deps);
    dispatchKey(ev('Escape'), 'down', top, deps);
    dispatchKey(ev('Tab'), 'up', top, deps);
    expect(deps.focusInput).not.toHaveBeenCalled();
    expect(deps.shortcutsKeyDown).not.toHaveBeenCalled();
    expect(deps.shortcutsKeyUp).not.toHaveBeenCalled();
    expect(deps.gameKeyDown).not.toHaveBeenCalled();
  });
});

describe('dispatchKey - empty stack (game scope)', () => {
  test('letter key down with chat closed routes to gameKeyDown', () => {
    const deps = makeDeps();
    dispatchKey(ev('a'), 'down', null, deps);
    expect(deps.gameKeyDown).toHaveBeenCalledTimes(1);
    expect(deps.shortcutsKeyDown).not.toHaveBeenCalled();
    expect(deps.focusInput).not.toHaveBeenCalled();
  });

  test('letter key down with chat open routes to focusInput', () => {
    const deps = makeDeps({ showChat: true });
    dispatchKey(ev('a'), 'down', null, deps);
    expect(deps.focusInput).toHaveBeenCalledTimes(1);
    expect(deps.gameKeyDown).not.toHaveBeenCalled();
  });

  test('non-game key down (Tab, Escape, /) routes to shortcutsKeyDown', () => {
    const deps = makeDeps();
    dispatchKey(ev('Tab'), 'down', null, deps);
    dispatchKey(ev('Escape'), 'down', null, deps);
    dispatchKey(ev('/'), 'down', null, deps);
    expect(deps.shortcutsKeyDown).toHaveBeenCalledTimes(3);
    expect(deps.gameKeyDown).not.toHaveBeenCalled();
  });

  test('letter key while gameFinished is true is treated as a shortcut (not a game key)', () => {
    const deps = makeDeps({ gameFinished: true });
    dispatchKey(ev('a'), 'down', null, deps);
    expect(deps.shortcutsKeyDown).toHaveBeenCalledTimes(1);
    expect(deps.gameKeyDown).not.toHaveBeenCalled();
  });

  test('modifier combos (ctrl/cmd/alt) are not caught by the app at all', () => {
    const cases: Array<{ altKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }> = [
      { altKey: true },
      { ctrlKey: true },
      { metaKey: true },
    ];
    for (const modifiers of cases) {
      for (const key of ['a', '/', 'Tab', 'Enter']) {
        const deps = makeDeps({ showChat: true });
        dispatchKey(ev(key, modifiers), 'down', null, deps);
        dispatchKey(ev(key, modifiers), 'up', null, deps);
        expect(deps.focusInput).not.toHaveBeenCalled();
        expect(deps.shortcutsKeyDown).not.toHaveBeenCalled();
        expect(deps.shortcutsKeyUp).not.toHaveBeenCalled();
        expect(deps.gameKeyDown).not.toHaveBeenCalled();
      }
    }
  });

  test('keyup routes to shortcutsKeyUp regardless of key', () => {
    const deps = makeDeps();
    dispatchKey(ev('Tab'), 'up', null, deps);
    dispatchKey(ev('a'), 'up', null, deps);
    expect(deps.shortcutsKeyUp).toHaveBeenCalledTimes(2);
  });
});

describe('dispatchKey - modal on top', () => {
  const top: InputScope = { id: 'stats', policy: 'modal' };

  test('letter key down with chat closed: blocks game (does not call gameKeyDown)', () => {
    const deps = makeDeps();
    dispatchKey(ev('a'), 'down', top, deps);
    expect(deps.gameKeyDown).not.toHaveBeenCalled();
    expect(deps.shortcutsKeyDown).not.toHaveBeenCalled();
  });

  test('letter key down with chat open: still focuses chat', () => {
    const deps = makeDeps({ showChat: true });
    dispatchKey(ev('a'), 'down', top, deps);
    expect(deps.focusInput).toHaveBeenCalledTimes(1);
  });

  test('non-game key down (Escape, Tab) still routes to shortcutsKeyDown', () => {
    const deps = makeDeps();
    dispatchKey(ev('Escape'), 'down', top, deps);
    dispatchKey(ev('Tab'), 'down', top, deps);
    expect(deps.shortcutsKeyDown).toHaveBeenCalledTimes(2);
  });

  test('keyup still fires shortcutsKeyUp', () => {
    const deps = makeDeps();
    dispatchKey(ev('Tab'), 'up', top, deps);
    expect(deps.shortcutsKeyUp).toHaveBeenCalledTimes(1);
  });
});
