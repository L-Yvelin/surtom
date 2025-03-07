import databaseService from '../src/services/databaseService';
import { Pool } from 'mysql2/promise';

jest.mock('mysql2/promise');

describe('DatabaseService', () => {
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
      end: jest.fn(),
    } as unknown as jest.Mocked<Pool>;
    (Pool as jest.Mock).mockReturnValue(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLastMessageId', () => {
    it('should return the last message ID', async () => {
      mockPool.query.mockResolvedValue([[{ ID: 1 }]]);
      const result = await databaseService.getLastMessageId();
      expect(result).toBe(1);
    });

    it('should return null if no messages found', async () => {
      mockPool.query.mockResolvedValue([[]]);
      const result = await databaseService.getLastMessageId();
      expect(result).toBeNull();
    });
  });

  describe('getMessages', () => {
    it('should return messages', async () => {
      mockPool.query.mockResolvedValue([[{ ID: 1, Texte: 'test' }]]);
      const result = await databaseService.getMessages();
      expect(result).toHaveLength(1);
      expect(result[0].Texte).toBe('test');
    });
  });

  describe('saveMessage', () => {
    it('should save a message', async () => {
      mockPool.query.mockResolvedValue([{ insertId: 1 }]);
      const result = await databaseService.saveMessage('user', 'text', false, 'message');
      expect(result.ID).toBe(1);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      mockPool.query.mockResolvedValue([{ affectedRows: 1 }]);
      const result = await databaseService.deleteMessage(1);
      expect(result).toBe(true);
    });

    it('should return false if message not found', async () => {
      mockPool.query.mockResolvedValue([{ affectedRows: 0 }]);
      const result = await databaseService.deleteMessage(1);
      expect(result).toBe(false);
    });
  });
});
