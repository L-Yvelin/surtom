import FullUser from '../models/FullUser.js';

interface State {
  users: { [key: string]: FullUser };
}

type Subscriber = (state: State) => void;

class Store {
  private state: State = { users: {} };
  private subscribers: Subscriber[] = [];

  getState(): State {
    return this.state;
  }

  setState(newState: Partial<State>): void {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(callback: Subscriber): void {
    this.subscribers.push(callback);
  }

  private notify(): void {
    this.subscribers.forEach((callback) => callback(this.state));
  }
}

export const store = new Store();

export default store;
