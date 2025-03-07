var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import databaseService from '../src/services/databaseService';
jest.mock('mysql2/promise');
describe('DatabaseService', () => {
    let mockPool;
    beforeEach(() => {
        mockPool = {
            query: jest.fn(),
            end: jest.fn(),
        };
        Pool.mockReturnValue(mockPool);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('getLastMessageId', () => {
        it('should return the last message ID', () => __awaiter(void 0, void 0, void 0, function* () {
            mockPool.query.mockResolvedValue([[{ ID: 1 }]]);
            const result = yield databaseService.getLastMessageId();
            expect(result).toBe(1);
        }));
        it('should return null if no messages found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockPool.query.mockResolvedValue([[]]);
            const result = yield databaseService.getLastMessageId();
            expect(result).toBeNull();
        }));
    });
    describe('getMessages', () => {
        it('should return messages', () => __awaiter(void 0, void 0, void 0, function* () {
            mockPool.query.mockResolvedValue([[{ ID: 1, Texte: 'test' }]]);
            const result = yield databaseService.getMessages();
            expect(result).toHaveLength(1);
            expect(result[0].Texte).toBe('test');
        }));
    });
    describe('saveMessage', () => {
        it('should save a message', () => __awaiter(void 0, void 0, void 0, function* () {
            mockPool.query.mockResolvedValue([{ insertId: 1 }]);
            const result = yield databaseService.saveMessage('user', 'text', false, 'message');
            expect(result.ID).toBe(1);
        }));
    });
    describe('deleteMessage', () => {
        it('should delete a message', () => __awaiter(void 0, void 0, void 0, function* () {
            mockPool.query.mockResolvedValue([{ affectedRows: 1 }]);
            const result = yield databaseService.deleteMessage(1);
            expect(result).toBe(true);
        }));
        it('should return false if message not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockPool.query.mockResolvedValue([{ affectedRows: 0 }]);
            const result = yield databaseService.deleteMessage(1);
            expect(result).toBe(false);
        }));
    });
});
