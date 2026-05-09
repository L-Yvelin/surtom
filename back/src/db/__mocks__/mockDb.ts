type Resolver = unknown | ((calls: number) => unknown);

export interface MockDb {
  db: unknown;
  enqueue: (...values: Resolver[]) => void;
  reset: () => void;
  callCount: () => number;
  lastBuilderCalls: () => string[];
}

export function createMockDb(): MockDb {
  let queue: Resolver[] = [];
  let calls = 0;
  let builderCalls: string[] = [];

  const resolveNext = (resolve: (v: unknown) => void): void => {
    const next = queue.shift();
    calls++;
    const value = typeof next === 'function' ? (next as (c: number) => unknown)(calls) : next;
    resolve(value);
  };

  const makeBuilder = (): unknown => {
    const handler: ProxyHandler<object> = {
      get(_target, prop) {
        if (prop === 'then') {
          return (resolve: (v: unknown) => void): void => resolveNext(resolve);
        }
        if (typeof prop === 'string') {
          return (..._args: unknown[]): unknown => {
            builderCalls.push(prop);
            return builder;
          };
        }
        return undefined;
      },
    };
    const builder: unknown = new Proxy({}, handler);
    return builder;
  };

  const builder = makeBuilder();

  const dbHandler: ProxyHandler<object> = {
    get(_target, prop) {
      if (prop === 'execute') {
        return (..._args: unknown[]): Promise<unknown> => {
          builderCalls.push('execute');
          return new Promise((resolve) => resolveNext(resolve));
        };
      }
      if (typeof prop === 'string') {
        return (..._args: unknown[]): unknown => {
          builderCalls.push(prop);
          return builder;
        };
      }
      return undefined;
    },
  };
  const db = new Proxy({}, dbHandler);

  return {
    db,
    enqueue: (...values: Resolver[]): void => {
      queue.push(...values);
    },
    reset: (): void => {
      queue = [];
      calls = 0;
      builderCalls = [];
    },
    callCount: (): number => calls,
    lastBuilderCalls: (): string[] => builderCalls,
  };
}
