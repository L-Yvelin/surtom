import store from '../src/store';
describe('Store', () => {
    it('should initialize with empty state', () => {
        const state = store.getState();
        expect(state.users).toEqual({});
    });
    it('should update state and notify subscribers', () => {
        const callback = jest.fn();
        store.subscribe(callback);
        store.setState({ users: { 1: { name: 'testUser' } } });
        expect(store.getState().users).toEqual({ 1: { name: 'testUser' } });
        expect(callback).toHaveBeenCalledWith(store.getState());
    });
});
