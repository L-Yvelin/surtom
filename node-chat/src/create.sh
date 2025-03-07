#!/bin/bash

# Create the tests directory structure
mkdir -p tests/handlers tests/models tests/services tests/utils

# Create test files with basic content
cat <<EOL > tests/handlers/commandHandler.test.ts
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
EOL

cat <<EOL > tests/services/databaseService.test.ts
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
EOL

cat <<EOL > tests/store.test.ts
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
EOL

cat <<EOL > tests/server.test.ts
import { WebSocketServer } from 'ws';
import { updateUsersList } from '../src/server';
import store from '../src/store';
import User from '../src/models/User';
import databaseService from '../src/services/databaseService';
import Helpers from '../src/utils/helpers';

jest.mock('../src/store');
jest.mock('../src/services/databaseService');
jest.mock('../src/utils/helpers');
jest.mock('ws');

describe('Server', () => {
  let mockServer: WebSocketServer;

  beforeEach(() => {
    mockServer = new WebSocketServer({ port: 27020 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize connection', () => {
    const mockConnection = { send: jest.fn(), readyState: WebSocket.OPEN } as unknown as WebSocket;
    const user = new User('1', 'testUser', false, mockConnection);
    initializeConnection(user);
    expect(mockConnection.send).toHaveBeenCalled();
  });

  it('should update users list', () => {
    updateUsersList();
    expect(store.setState).toHaveBeenCalled();
  });

  it('should handle messages', async () => {
    const mockConnection = { send: jest.fn(), readyState: WebSocket.OPEN } as unknown as WebSocket;
    const user = new User('1', 'testUser', false, mockConnection);
    await handleMessage(user, { Type: 'ping' });
    expect(mockConnection.send).toHaveBeenCalledWith(JSON.stringify({ Type: 'pong' }));
  });
});
EOL

cat <<EOL > tests/utils/helpers.test.ts
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
EOL

cat <<EOL > tests/utils/constants.test.ts
import Constants from '../src/utils/constants';

describe('Constants', () => {
  it('should have funny names', () => {
    expect(Constants.funnyNames).toContain('Surtomien');
    expect(Constants.funnyNames).toContain('Cracotto');
  });

  it('should have MAX_MESSAGES_LOADED', () => {
    expect(Constants.MAX_MESSAGES_LOADED).toBe(300);
  });
});
EOL

cat <<EOL > tests/models/User.test.ts
import User from '../src/models/User';
import { WebSocket } from 'ws';

describe('User', () => {
  let mockConnection: WebSocket;

  beforeEach(() => {
    mockConnection = { send: jest.fn(), readyState: WebSocket.OPEN } as unknown as WebSocket;
  });

  it('should create a user with default values', () => {
    const user = new User('1', 'testUser', false, mockConnection);
    expect(user.id).toBe('1');
    expect(user.name).toBe('testUser');
    expect(user.isModerator).toBe(false);
    expect(user.connection).toBe(mockConnection);
    expect(user.messageCount).toBe(0);
    expect(user.lastMessageTimestamp).toBeNull();
    expect(user.messageCooldown).toBe(1);
    expect(user.cooldownMultiplier).toBe(2);
    expect(user.sentTheScore).toBe(false);
    expect(user.listeningTypes).toEqual(new Set());
    expect(user.ip).toBe('unknown');
    expect(user.isLoggedIn).toBe(false);
    expect(user.mobileDevice).toBe(false);
  });

  it('should create a user with custom values', () => {
    const user = new User('1', 'testUser', true, mockConnection, '127.0.0.1', true, true);
    expect(user.ip).toBe('127.0.0.1');
    expect(user.isLoggedIn).toBe(true);
    expect(user.mobileDevice).toBe(true);
  });
});
EOL

echo "Test files created successfully!"
