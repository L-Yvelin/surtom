import { publish, subscribe } from './eventBus.js';

describe('eventBus', () => {
  it('invokes subscribers when an event is published', () => {
    const cb = jest.fn();
    subscribe('eventBus.test.basic', cb);
    publish('eventBus.test.basic');
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('forwards arguments to subscribers', () => {
    const cb = jest.fn();
    subscribe('eventBus.test.args', cb);
    publish('eventBus.test.args', 1, 'two', { three: 3 });
    expect(cb).toHaveBeenCalledWith(1, 'two', { three: 3 });
  });

  it('invokes every subscriber registered for an event', () => {
    const a = jest.fn();
    const b = jest.fn();
    subscribe('eventBus.test.multi', a);
    subscribe('eventBus.test.multi', b);
    publish('eventBus.test.multi');
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('is a no-op when publishing an event with no subscribers', () => {
    expect(() => publish('eventBus.test.nobody')).not.toThrow();
  });
});
