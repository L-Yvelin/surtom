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
