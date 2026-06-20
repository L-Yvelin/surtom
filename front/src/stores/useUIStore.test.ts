import useUIStore from './useUIStore';
import { UI } from '../ui/ids';

beforeEach(() => {
  useUIStore.setState({ visibility: {} });
});

describe('setVisibility & toggle', () => {
  test('setVisibility creates a new key', () => {
    useUIStore.getState().setVisibility(UI.CHAT, true);
    expect(useUIStore.getState().visibility).toStrictEqual({ chat: true });
  });

  test('setVisibility overrides an existing key', () => {
    useUIStore.setState({ visibility: { chat: true } });
    useUIStore.getState().setVisibility(UI.CHAT, false);
    expect(useUIStore.getState().visibility.chat).toBe(false);
  });

  test('toggle flips an existing key', () => {
    useUIStore.setState({ visibility: { chat: true } });
    useUIStore.getState().toggle(UI.CHAT);
    expect(useUIStore.getState().visibility.chat).toBe(false);
    useUIStore.getState().toggle(UI.CHAT);
    expect(useUIStore.getState().visibility.chat).toBe(true);
  });

  test('toggle on a missing key sets it to true', () => {
    useUIStore.getState().toggle(UI.TAB);
    expect(useUIStore.getState().visibility.tab).toBe(true);
  });
});

describe('closeAll', () => {
  test('closes every registered key when called without an exception list', () => {
    useUIStore.setState({ visibility: { chat: true, stats: true, tab: false } });
    useUIStore.getState().closeAll();
    expect(useUIStore.getState().visibility).toStrictEqual({ chat: false, stats: false, tab: false });
  });

  test('keeps keys that are in the exception list untouched', () => {
    useUIStore.setState({ visibility: { chat: true, stats: true, tab: true } });
    useUIStore.getState().closeAll([UI.CHAT]);
    expect(useUIStore.getState().visibility).toStrictEqual({ chat: true, stats: false, tab: false });
  });

  test('does not introduce keys that were not already in visibility', () => {
    useUIStore.setState({ visibility: { chat: true } });
    useUIStore.getState().closeAll([UI.STATS]);
    expect(useUIStore.getState().visibility).toStrictEqual({ chat: false });
  });

  test('is a no-op on an empty visibility map', () => {
    useUIStore.getState().closeAll([UI.CHAT]);
    expect(useUIStore.getState().visibility).toStrictEqual({});
  });
});

describe('resetSession', () => {
  test('clears the visibility map entirely (no exceptions)', () => {
    useUIStore.setState({ visibility: { chat: true, stats: false, tab: true } });
    useUIStore.getState().resetSession();
    expect(useUIStore.getState().visibility).toStrictEqual({});
  });

  test('is a no-op on an already-empty visibility map', () => {
    useUIStore.getState().resetSession();
    expect(useUIStore.getState().visibility).toStrictEqual({});
  });
});
