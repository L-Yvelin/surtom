export function debounce(fn: Function | void, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;

  return function (...args: any[]) {
    if (fn) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    }
  };
}
