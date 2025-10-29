import FullUser from './models/User.js';

interface State {
  users: { [key: string]: FullUser };
}

class Store {
  private state!: State;
  private subscribers!: Function[];
  private static instance: Store;

  constructor() {
    if (!Store.instance) {
      this.state = {
        users: {},
      };
      this.subscribers = [];
      Store.instance = this;
    }

    return Store.instance;
  }

  getState(): State {
    return this.state;
  }

  setState(newState: Partial<State>): void {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(callback: Function): void {
    this.subscribers.push(callback);
  }

  notify(): void {
    this.subscribers.forEach((callback) => callback(this.state));
  }
}

export const store = new Store();

export default store;
