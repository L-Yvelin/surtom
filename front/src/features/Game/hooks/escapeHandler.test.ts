import useInputStore from '../../../stores/useInputStore';
import { handleEscape } from './useShortcuts';

beforeEach(() => {
  useInputStore.setState({ scopes: [] });
});

describe('handleEscape', () => {
  test('with no scope on top, falls back to closeAll', () => {
    const closeAll = jest.fn();
    handleEscape(closeAll);
    expect(closeAll).toHaveBeenCalledTimes(1);
  });

  test('with a modal scope on top, calls its onEscape and skips closeAll', () => {
    const closeAll = jest.fn();
    const onEscape = jest.fn();
    useInputStore.getState().push({ id: 'stats', policy: 'modal', onEscape });
    handleEscape(closeAll);
    expect(onEscape).toHaveBeenCalledTimes(1);
    expect(closeAll).not.toHaveBeenCalled();
  });

  test('with a modal scope on top but no onEscape, falls back to closeAll', () => {
    const closeAll = jest.fn();
    useInputStore.getState().push({ id: 'stats', policy: 'modal' });
    handleEscape(closeAll);
    expect(closeAll).toHaveBeenCalledTimes(1);
  });

  test('with a block-all scope on top, falls back to closeAll (block-all has no escape semantics)', () => {
    const closeAll = jest.fn();
    useInputStore.getState().push({ id: 'load', policy: 'block-all' });
    handleEscape(closeAll);
    expect(closeAll).toHaveBeenCalledTimes(1);
  });

  test('only the topmost scope is consulted (deeper modals are not affected)', () => {
    const closeAll = jest.fn();
    const lowerOnEscape = jest.fn();
    const topOnEscape = jest.fn();
    useInputStore.getState().push({ id: 'stats', policy: 'modal', onEscape: lowerOnEscape });
    useInputStore.getState().push({ id: 'chat', policy: 'modal', onEscape: topOnEscape });
    handleEscape(closeAll);
    expect(topOnEscape).toHaveBeenCalledTimes(1);
    expect(lowerOnEscape).not.toHaveBeenCalled();
    expect(closeAll).not.toHaveBeenCalled();
  });
});
