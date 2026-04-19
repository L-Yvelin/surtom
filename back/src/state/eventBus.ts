type Listener = (...args: unknown[]) => void;

const events: { [key: string]: Listener[] } = {};

export function subscribe(eventName: string, callback: Listener): void {
  if (!events[eventName]) {
    events[eventName] = [];
  }
  events[eventName].push(callback);
}

export function publish(eventName: string, ...args: unknown[]): void {
  if (!events[eventName]) return;
  events[eventName].forEach((callback) => callback(...args));
}
