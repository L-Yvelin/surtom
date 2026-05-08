import useInputStore from './useInputStore';

beforeEach(() => {
  useInputStore.setState({ scopes: [] });
});

describe('push / popById / top', () => {
  test('push appends a scope to the top of the stack', () => {
    useInputStore.getState().push({ id: 'worldLoading', policy: 'block-all' });
    expect(useInputStore.getState().scopes).toStrictEqual([{ id: 'worldLoading', policy: 'block-all' }]);
    expect(useInputStore.getState().top()).toStrictEqual({ id: 'worldLoading', policy: 'block-all' });
  });

  test('push preserves stack order when several ids stack up', () => {
    useInputStore.getState().push({ id: 'stats', policy: 'modal' });
    useInputStore.getState().push({ id: 'chat', policy: 'modal' });
    expect(useInputStore.getState().scopes.map((s) => s.id)).toStrictEqual(['stats', 'chat']);
    expect(useInputStore.getState().top()?.id).toBe('chat');
  });

  test('popById removes the latest scope with that id', () => {
    useInputStore.getState().push({ id: 'stats', policy: 'modal' });
    useInputStore.getState().push({ id: 'chat', policy: 'modal' });
    useInputStore.getState().popById('chat');
    expect(useInputStore.getState().scopes.map((s) => s.id)).toStrictEqual(['stats']);
    expect(useInputStore.getState().top()?.id).toBe('stats');
  });

  test('popById on an unknown id is a no-op', () => {
    useInputStore.getState().push({ id: 'stats', policy: 'modal' });
    useInputStore.getState().popById('ghost');
    expect(useInputStore.getState().scopes.map((s) => s.id)).toStrictEqual(['stats']);
  });

  test('top returns null on an empty stack', () => {
    expect(useInputStore.getState().top()).toBeNull();
  });
});

describe('block / unblock back-compat (push block-all)', () => {
  test('block adds a block-all scope', () => {
    useInputStore.getState().block('worldLoading');
    expect(useInputStore.getState().top()).toStrictEqual({ id: 'worldLoading', policy: 'block-all' });
    expect(useInputStore.getState().isBlocked()).toBe(true);
  });

  test('unblock removes the matching id', () => {
    useInputStore.getState().block('worldLoading');
    useInputStore.getState().unblock('worldLoading');
    expect(useInputStore.getState().scopes).toStrictEqual([]);
    expect(useInputStore.getState().isBlocked()).toBe(false);
  });

  test('isBlocked is true only if the topmost scope is block-all', () => {
    useInputStore.getState().push({ id: 'stats', policy: 'modal' });
    expect(useInputStore.getState().isBlocked()).toBe(false);
    useInputStore.getState().push({ id: 'worldLoading', policy: 'block-all' });
    expect(useInputStore.getState().isBlocked()).toBe(true);
    useInputStore.getState().popById('worldLoading');
    expect(useInputStore.getState().isBlocked()).toBe(false);
  });
});

describe('resetSession', () => {
  test('clears every scope', () => {
    useInputStore.getState().push({ id: 'a', policy: 'block-all' });
    useInputStore.getState().push({ id: 'b', policy: 'modal' });
    useInputStore.getState().resetSession();
    expect(useInputStore.getState().scopes).toStrictEqual([]);
    expect(useInputStore.getState().top()).toBeNull();
  });
});
