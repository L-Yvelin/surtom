import useUIStore from './useUIStore';

beforeEach(() => {
  useUIStore.setState({ visibility: {} });
});

describe('setVisibility & toggle', () => {
  test('setVisibility creates a new key', () => {
    useUIStore.getState().setVisibility('chat', true);
    expect(useUIStore.getState().visibility).toStrictEqual({ chat: true });
  });

  test('setVisibility overrides an existing key', () => {
    useUIStore.setState({ visibility: { chat: true } });
    useUIStore.getState().setVisibility('chat', false);
    expect(useUIStore.getState().visibility.chat).toBe(false);
  });

  test('toggle flips an existing key', () => {
    useUIStore.setState({ visibility: { chat: true } });
    useUIStore.getState().toggle('chat');
    expect(useUIStore.getState().visibility.chat).toBe(false);
    useUIStore.getState().toggle('chat');
    expect(useUIStore.getState().visibility.chat).toBe(true);
  });

  test('toggle on a missing key sets it to true', () => {
    useUIStore.getState().toggle('newKey');
    expect(useUIStore.getState().visibility.newKey).toBe(true);
  });
});

describe('closeAll', () => {
  test('closes every registered key when called without an exception list', () => {
    useUIStore.setState({ visibility: { a: true, b: true, c: false } });
    useUIStore.getState().closeAll();
    expect(useUIStore.getState().visibility).toStrictEqual({ a: false, b: false, c: false });
  });

  test('keeps keys that are in the exception list untouched', () => {
    useUIStore.setState({ visibility: { chat: true, stats: true, tab: true } });
    useUIStore.getState().closeAll(['chat']);
    expect(useUIStore.getState().visibility).toStrictEqual({ chat: true, stats: false, tab: false });
  });

  test('does not introduce keys that were not already in visibility', () => {
    useUIStore.setState({ visibility: { chat: true } });
    useUIStore.getState().closeAll(['neverRegistered']);
    expect(useUIStore.getState().visibility).toStrictEqual({ chat: false });
  });

  test('is a no-op on an empty visibility map', () => {
    useUIStore.getState().closeAll(['anything']);
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
