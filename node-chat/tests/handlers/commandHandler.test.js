var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getAvailableCommands, handleCommand, subscribe } from '../src/handlers/commandHandler';
import { User } from '../src/models/User';
import databaseService from '../src/services/databaseService';
import { WebSocket } from 'ws';
jest.mock('../src/services/databaseService');
jest.mock('../src/utils/helpers');
jest.mock('bcrypt');
describe('CommandHandler', () => {
    let user;
    let mockConnection;
    beforeEach(() => {
        mockConnection = { send: jest.fn(), readyState: WebSocket.OPEN };
        user = new User('1', 'testUser', false, mockConnection);
    });
    describe('getAvailableCommands', () => {
        it('should return available commands for non-moderator', () => {
            const commands = getAvailableCommands(false);
            expect(commands).toHaveProperty('/register');
            expect(commands).toHaveProperty('/login');
            expect(commands).not.toHaveProperty('/mod');
        });
        it('should return available commands for moderator', () => {
            const commands = getAvailableCommands(true);
            expect(commands).toHaveProperty('/mod');
            expect(commands).toHaveProperty('/refresh');
        });
    });
    describe('handleCommand', () => {
        it('should handle /nick command', () => __awaiter(void 0, void 0, void 0, function* () {
            yield handleCommand(user, '/nick newNick');
            expect(mockConnection.send).toHaveBeenCalledWith(JSON.stringify({
                Type: 'commandError',
                status: 'error',
                message: 'Eh non pardi ! Les temps ont changé...',
            }));
        }));
        it('should handle /login command', () => __awaiter(void 0, void 0, void 0, function* () {
            databaseService.loginUser.mockResolvedValue({ Pseudo: 'testUser', Admin: false });
            yield handleCommand(user, '/login testUser password');
            expect(mockConnection.send).toHaveBeenCalledWith(JSON.stringify({
                Type: 'commandSuccess',
                status: 'success',
                message: 'Rebonjour testUser !',
            }));
        }));
        it('should handle /register command', () => __awaiter(void 0, void 0, void 0, function* () {
            databaseService.registerUser.mockResolvedValue();
            yield handleCommand(user, '/register newUser password');
            expect(mockConnection.send).toHaveBeenCalledWith(JSON.stringify({
                Type: 'commandSuccess',
                status: 'success',
                message: 'Rebonjour newUser !',
            }));
        }));
        it('should handle unknown command', () => __awaiter(void 0, void 0, void 0, function* () {
            yield handleCommand(user, '/unknownCommand');
            expect(mockConnection.send).toHaveBeenCalledWith(JSON.stringify({ Type: 'commandError', message: 'Commande invalide !' }));
        }));
    });
    describe('subscribe', () => {
        it('should add a callback to the event', () => {
            const callback = jest.fn();
            subscribe('testEvent', callback);
            expect(callback).not.toHaveBeenCalled();
            publish('testEvent');
            expect(callback).toHaveBeenCalled();
        });
    });
});
