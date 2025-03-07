import Helpers from '../src/utils/helpers';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Constants from '../src/utils/constants';

jest.mock('bcrypt');
jest.mock('crypto');
jest.mock('../src/utils/constants');

describe('Helpers', () => {
  describe('passwordInHashArray', () => {
    it('should return true if password matches any hash', () => {
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      const result = Helpers.passwordInHashArray('password', ['hash1', 'hash2']);
      expect(result).toBe(true);
    });

    it('should return false if password does not match any hash', () => {
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);
      const result = Helpers.passwordInHashArray('password', ['hash1', 'hash2']);
      expect(result).toBe(false);
    });
  });

  describe('generateRandomHash', () => {
    it('should generate a random hash', () => {
      (crypto.randomBytes as jest.Mock).mockReturnValue({ toString: () => 'hash' });
      const result = Helpers.generateRandomHash();
      expect(result).toBe('hash');
    });
  });

  describe('getRandomFunnyName', () => {
    it('should return a random funny name', () => {
      (Constants.funnyNames as jest.Mock).mockReturnValue(['name1', 'name2']);
      (Math.random as jest.Mock).mockReturnValue(0.5);
      const result = Helpers.getRandomFunnyName();
      expect(result).toBe('name2');
    });
  });

  describe('validateUsername', () => {
    it('should return true for valid username', () => {
      const result = Helpers.validateUsername('validUser');
      expect(result).toBe(true);
    });

    it('should return false for invalid username', () => {
      const result = Helpers.validateUsername('invalid@User');
      expect(result).toBe(false);
    });
  });

  describe('validateText', () => {
    it('should return true for valid text', () => {
      const result = Helpers.validateText('validText');
      expect(result).toBe(true);
    });

    it('should return false for invalid text', () => {
      const result = Helpers.validateText('a'.repeat(257));
      expect(result).toBe(false);
    });
  });

  describe('handleIsBanned', () => {
    it('should send ban message and close connection', () => {
      const mockConnection = { send: jest.fn(), close: jest.fn() } as unknown as WebSocket;
      const user = { connection: mockConnection } as unknown as User;
      Helpers.handleIsBanned(user);
      expect(mockConnection.send).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });
  });
});
