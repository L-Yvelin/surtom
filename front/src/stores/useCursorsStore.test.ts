import { Server } from '@surtom/interfaces';
import { defaultPlayer } from './usePlayerStore';
import useCursorsStore from './useCursorsStore';

const makeCursor = (name: string, x: number, y: number): Server.CursorPositionMessage => ({
  user: { ...defaultPlayer, name },
  cursor: { x, y },
});

beforeEach(() => {
  useCursorsStore.setState({ cursors: [] });
});

describe('addOrUpdateCursor', () => {
  test('adds a cursor when no cursor exists for that user', () => {
    useCursorsStore.getState().addOrUpdateCursor(makeCursor('Alice', 1, 2));
    expect(useCursorsStore.getState().cursors).toStrictEqual([makeCursor('Alice', 1, 2)]);
  });

  test('replaces in place when a cursor for the same user already exists', () => {
    useCursorsStore.setState({ cursors: [makeCursor('Alice', 1, 2), makeCursor('Bob', 3, 4)] });
    useCursorsStore.getState().addOrUpdateCursor(makeCursor('Alice', 99, 99));
    expect(useCursorsStore.getState().cursors).toStrictEqual([makeCursor('Alice', 99, 99), makeCursor('Bob', 3, 4)]);
  });

  test('preserves existing cursor order when replacing', () => {
    useCursorsStore.setState({
      cursors: [makeCursor('A', 0, 0), makeCursor('B', 0, 0), makeCursor('C', 0, 0)],
    });
    useCursorsStore.getState().addOrUpdateCursor(makeCursor('B', 7, 7));
    expect(useCursorsStore.getState().cursors.map((c) => c.user.name)).toStrictEqual(['A', 'B', 'C']);
  });
});

describe('removeCursor', () => {
  test('drops the matching user', () => {
    useCursorsStore.setState({ cursors: [makeCursor('Alice', 1, 2), makeCursor('Bob', 3, 4)] });
    useCursorsStore.getState().removeCursor('Alice');
    expect(useCursorsStore.getState().cursors.map((c) => c.user.name)).toStrictEqual(['Bob']);
  });

  test('is a no-op for unknown users', () => {
    useCursorsStore.setState({ cursors: [makeCursor('Alice', 1, 2)] });
    useCursorsStore.getState().removeCursor('Nobody');
    expect(useCursorsStore.getState().cursors).toStrictEqual([makeCursor('Alice', 1, 2)]);
  });
});

describe('setCursors', () => {
  test('replaces the cursor list wholesale', () => {
    useCursorsStore.setState({ cursors: [makeCursor('Alice', 1, 2)] });
    useCursorsStore.getState().setCursors([makeCursor('X', 0, 0), makeCursor('Y', 0, 0)]);
    expect(useCursorsStore.getState().cursors.map((c) => c.user.name)).toStrictEqual(['X', 'Y']);
  });
});

describe('resetWorld', () => {
  test('clears the cursor list', () => {
    useCursorsStore.setState({ cursors: [makeCursor('Alice', 1, 2), makeCursor('Bob', 3, 4)] });
    useCursorsStore.getState().resetWorld();
    expect(useCursorsStore.getState().cursors).toStrictEqual([]);
  });

  test('is a no-op on an already-empty cursor list', () => {
    useCursorsStore.getState().resetWorld();
    expect(useCursorsStore.getState().cursors).toStrictEqual([]);
  });
});
