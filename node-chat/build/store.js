"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
class Store {
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
    getState() {
        return this.state;
    }
    setState(newState) {
        this.state = Object.assign(Object.assign({}, this.state), newState);
        this.notify();
    }
    subscribe(callback) {
        this.subscribers.push(callback);
    }
    notify() {
        this.subscribers.forEach((callback) => callback(this.state));
    }
}
exports.store = new Store();
exports.default = exports.store;
