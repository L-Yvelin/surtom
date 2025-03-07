var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { WebSocketServer } from 'ws';
import { updateUsersList } from '../src/server';
import store from '../src/store';
import User from '../src/models/User';
jest.mock('../src/store');
jest.mock('../src/services/databaseService');
jest.mock('../src/utils/helpers');
jest.mock('ws');
describe('Server', () => {
    let mockServer;
    beforeEach(() => {
        mockServer = new WebSocketServer({ port: 27020 });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should initialize connection', () => {
        const mockConnection = { send: jest.fn(), readyState: WebSocket.OPEN };
        const user = new User('1', 'testUser', false, mockConnection);
        initializeConnection(user);
        expect(mockConnection.send).toHaveBeenCalled();
    });
    it('should update users list', () => {
        updateUsersList();
        expect(store.setState).toHaveBeenCalled();
    });
    it('should handle messages', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockConnection = { send: jest.fn(), readyState: WebSocket.OPEN };
        const user = new User('1', 'testUser', false, mockConnection);
        yield handleMessage(user, { Type: 'ping' });
        expect(mockConnection.send).toHaveBeenCalledWith(JSON.stringify({ Type: 'pong' }));
    }));
});
