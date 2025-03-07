import { getAvailableCommands, handleCommand, subscribe } from '../src/handlers/commandHandler';
import { User } from '../src/models/User';
import databaseService from '../src/services/databaseService';
import Helpers from '../src/utils/helpers';
import Constants from '../src/utils/constants';
import bcrypt from 'bcrypt';
import { WebSocket } from 'ws';

jest.mock('../src/services/databaseService');
jest.mock('../src/utils/helpers');
jest.mock('bcrypt');

describe('CommandHandler', () => {
  let user: User;
  let mockConnection: WebSocket;

  beforeEach(() => {
    mockConnection = { send: jest.fn(), readyState: WebSocket.OPEN } as unknown as WebSocket;
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
    it('should handle /nick command', async () => {
      await handleCommand(user, '/nick newNick');
      expect(mockConnection.send).toHaveBeenCalledWith(
        JSON.stringify({
          Type: 'commandError',
          status: 'error',
          message: 'Eh non pardi ! Les temps ont changé...',
        })
      );
    });

    it('should handle /login command', async () => {
      (databaseService.loginUser as jest.Mock).mockResolvedValue({ Pseudo: 'testUser', Admin: false });
      await handleCommand(user, '/login testUser password');
      expect(mockConnection.send).toHaveBeenCalledWith(
        JSON.stringify({
          Type: 'commandSuccess',
          status: 'success',
          message: 'Rebonjour testUser !',
        })
      );
    });

    it('should handle /register command', async () => {
      (databaseService.registerUser as jest.Mock).mockResolvedValue();
      await handleCommand(user, '/register newUser password');
      expect(mockConnection.send).toHaveBeenCalledWith(
        JSON.stringify({
          Type: 'commandSuccess',
          status: 'success',
          message: 'Rebonjour newUser !',
        })
      );
    });

    it('should handle unknown command', async () => {
      await handleCommand(user, '/unknownCommand');
      expect(mockConnection.send).toHaveBeenCalledWith(
        JSON.stringify({ Type: 'commandError', message: 'Commande invalide !' })
      );
    });
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
