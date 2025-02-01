export function debounce(fn: Function | void, delay: number) {
  let timeout: NodeJS.Timeout;

  return function (...args: any[]) {
    if (fn) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    }
  };
}
