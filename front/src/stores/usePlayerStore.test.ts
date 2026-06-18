import { Server } from '@surtom/interfaces';
import usePlayerStore, { defaultPlayer } from './usePlayerStore';

const makeUser = (overrides: Partial<Server.User>): Server.User => ({
  ...defaultPlayer,
  ...overrides,
});

beforeEach(() => {
  usePlayerStore.setState({ player: defaultPlayer });
});

describe('setPlayer', () => {
  test('merges into defaults (missing fields fall back to defaultPlayer)', () => {
    usePlayerStore.getState().setPlayer({ name: 'Alice' });
    expect(usePlayerStore.getState().player).toStrictEqual({ ...defaultPlayer, name: 'Alice' });
  });

  test('preserves existing fields not in the patch', () => {
    usePlayerStore.setState({ player: makeUser({ name: 'Alice', xp: 42 }) });
    usePlayerStore.getState().setPlayer({ moderatorLevel: 2 });
    expect(usePlayerStore.getState().player).toStrictEqual({
      ...defaultPlayer,
      name: 'Alice',
      xp: 42,
      moderatorLevel: 2,
    });
  });
});

describe('setXP', () => {
  test('updates only the xp field', () => {
    usePlayerStore.setState({ player: makeUser({ name: 'Alice', xp: 1 }) });
    usePlayerStore.getState().setXP(99);
    expect(usePlayerStore.getState().player.xp).toBe(99);
    expect(usePlayerStore.getState().player.name).toBe('Alice');
  });
});
