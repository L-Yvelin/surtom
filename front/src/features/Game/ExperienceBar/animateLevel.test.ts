import { animateLevel } from './animateLevel';

const drainQueue = (queue: Array<() => void>) => {
  while (queue.length) queue.shift()!();
};

const runAnimation = (from: number, to: number) => {
  const onUpdate = jest.fn<void, [number]>();
  const onLevelUp = jest.fn();
  const onComplete = jest.fn();
  const queue: Array<() => void> = [];

  animateLevel({
    from,
    to,
    onUpdate,
    onLevelUp,
    onComplete,
    schedule: (cb) => {
      queue.push(cb);
    },
  });
  drainQueue(queue);

  return { onUpdate, onLevelUp, onComplete };
};

describe('animateLevel — snap branch (to <= from)', () => {
  test('snaps when to < from', () => {
    const { onUpdate, onLevelUp, onComplete } = runAnimation(5, 4);
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(4);
    expect(onLevelUp).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('snaps when to === from (no animation, no level-up)', () => {
    const { onUpdate, onLevelUp, onComplete } = runAnimation(5, 5);
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(5);
    expect(onLevelUp).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('snaps when delta is smaller than one animation step', () => {
    const { onUpdate, onLevelUp } = runAnimation(5, 5.005);
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(5.005);
    expect(onLevelUp).not.toHaveBeenCalled();
  });
});

describe('animateLevel — animation branch (to > from)', () => {
  test('lands on exactly `to` at the end of the animation', () => {
    const { onUpdate, onComplete } = runAnimation(5, 6);
    const lastCall = onUpdate.mock.calls.at(-1)!;
    expect(lastCall[0]).toBe(6);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('emits multiple intermediate updates for a non-trivial delta', () => {
    const { onUpdate } = runAnimation(5, 6);
    expect(onUpdate.mock.calls.length).toBeGreaterThan(50);
  });

  test('updates are monotonically increasing toward `to`', () => {
    const { onUpdate } = runAnimation(5, 6);
    const values = onUpdate.mock.calls.map((c) => c[0]);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
    expect(values[values.length - 1]).toBe(6);
  });

  test('triggers onLevelUp at least once when crossing an integer boundary', () => {
    // Starting mid-level so the first integer crossing falls inside the animation.
    const { onLevelUp } = runAnimation(5.5, 6.5);
    expect(onLevelUp.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  test('does not trigger onLevelUp when no integer is crossed', () => {
    const { onLevelUp } = runAnimation(5.1, 5.9);
    expect(onLevelUp).not.toHaveBeenCalled();
  });
});

describe('animateLevel — default schedule', () => {
  test('falls back to requestAnimationFrame when no schedule is provided', () => {
    const onUpdate = jest.fn();
    const rafSpy = jest.fn().mockReturnValue(0);
    Object.defineProperty(globalThis, 'requestAnimationFrame', {
      value: rafSpy,
      configurable: true,
      writable: true,
    });

    animateLevel({ from: 5, to: 6, onUpdate, onLevelUp: () => {} });
    expect(rafSpy).toHaveBeenCalledTimes(1);
  });
});

describe('animateLevel — cancel', () => {
  test('returns a cancel function that stops further onUpdate calls', () => {
    const onUpdate = jest.fn<void, [number]>();
    const onLevelUp = jest.fn();
    const onComplete = jest.fn();
    const queue: Array<() => void> = [];

    const cancel = animateLevel({
      from: 5,
      to: 6,
      onUpdate,
      onLevelUp,
      onComplete,
      schedule: (cb) => {
        queue.push(cb);
      },
    });

    // Run a few ticks then cancel.
    for (let i = 0; i < 3; i++) queue.shift()!();
    cancel();
    while (queue.length) queue.shift()!();

    expect(onUpdate.mock.calls.length).toBeLessThanOrEqual(3);
    expect(onComplete).not.toHaveBeenCalled();
  });

  test('cancel before any tick runs prevents updates entirely', () => {
    const onUpdate = jest.fn();
    const onComplete = jest.fn();
    const queue: Array<() => void> = [];

    const cancel = animateLevel({
      from: 5,
      to: 6,
      onUpdate,
      onLevelUp: () => {},
      onComplete,
      schedule: (cb) => {
        queue.push(cb);
      },
    });
    cancel();
    while (queue.length) queue.shift()!();

    expect(onUpdate).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  test('cancel is a no-op for the snap branch (animation already finished synchronously)', () => {
    const onUpdate = jest.fn();
    const onComplete = jest.fn();
    const cancel = animateLevel({
      from: 5,
      to: 5,
      onUpdate,
      onLevelUp: () => {},
      onComplete,
      schedule: () => {},
    });
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(() => cancel()).not.toThrow();
  });
});
