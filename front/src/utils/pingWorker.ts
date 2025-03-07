/* eslint-disable no-restricted-globals */
const PING_INTERVAL = 15000;

self.onmessage = () => {
  setInterval(() => {
    self.postMessage({});
  }, PING_INTERVAL);
};

export {};