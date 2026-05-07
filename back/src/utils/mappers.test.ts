import { Server } from '@surtom/interfaces';
import store from '../state/store.js';
import FullUser from '../models/FullUser.js';
import {
  mapDatabaseMessageToMemoryMessage,
  mapDatabaseTypeToMemoryType,
  mapDatabaseUserToMemoryUser,
  mapFullUserToUser,
  mapScoreMessageToMemoryMessage,
  mapUserMessageToMemoryMessage,
} from './mappers.js';

const fakeWs = {} as never;

const buildPrivateUser = (overrides: Partial<Server.PrivateUser> = {}): Server.PrivateUser => ({
  name: 'alice',
  moderatorLevel: 0,
  isLoggedIn: true,
  isMobile: false,
  words: [],
  isBanned: false,
  xp: 42,
  ...overrides,
});

describe('mapFullUserToUser', () => {
  it('exposes only the public-safe fields', () => {
    const user = new FullUser('id-1', buildPrivateUser({ name: 'bob', moderatorLevel: 2, xp: 100 }), fakeWs, '127.0.0.1');
    expect(mapFullUserToUser(user)).toEqual({
      name: 'bob',
      moderatorLevel: 2,
      isMobile: false,
      isLoggedIn: true,
      xp: 100,
    });
  });

  it('does not leak isBanned, words, or ip', () => {
    const user = new FullUser('id-1', buildPrivateUser({ isBanned: true, words: ['secret'] }), fakeWs, '10.0.0.1');
    const mapped = mapFullUserToUser(user) as unknown as Record<string, unknown>;
    expect(mapped.isBanned).toBeUndefined();
    expect(mapped.words).toBeUndefined();
    expect(mapped.ip).toBeUndefined();
  });
});

describe('mapDatabaseUserToMemoryUser', () => {
  beforeEach(() => {
    store.setState({ users: {} });
  });

  it('returns null on null input', () => {
    expect(mapDatabaseUserToMemoryUser(null)).toBeNull();
  });

  it('returns the matching FullUser from the store by Pseudo', () => {
    const user = new FullUser('id-1', buildPrivateUser({ name: 'alice' }), fakeWs, '127.0.0.1');
    store.setState({ users: { [user.id]: user } });
    expect(mapDatabaseUserToMemoryUser({ Pseudo: 'alice' })).toBe(user);
  });

  it('returns null when no FullUser matches', () => {
    expect(mapDatabaseUserToMemoryUser({ Pseudo: 'unknown' })).toBeNull();
  });
});

describe('mapUserMessageToMemoryMessage', () => {
  it('maps every field, including reply id stringification', () => {
    expect(
      mapUserMessageToMemoryMessage({
        ID: 1,
        Pseudo: 'alice',
        Moderator: 1,
        Texte: 'hello',
        Date: '2024-01-01T00:00:00.000Z',
        ImageData: 'base64',
        Reply: 7,
      }),
    ).toEqual({
      id: '1',
      user: { name: 'alice', moderatorLevel: 1 },
      text: 'hello',
      timestamp: '2024-01-01T00:00:00.000Z',
      imageData: 'base64',
      replyId: '7',
      deleted: 0,
    });
  });

  it('handles missing optional fields gracefully', () => {
    expect(
      mapUserMessageToMemoryMessage({
        Pseudo: '',
        Moderator: 0,
        Date: '',
      }),
    ).toEqual({
      id: '',
      user: { name: '', moderatorLevel: 0 },
      text: '',
      timestamp: '',
      imageData: undefined,
      replyId: undefined,
      deleted: 0,
    });
  });

  it('skips imageData when not a string', () => {
    expect(
      mapUserMessageToMemoryMessage({
        Pseudo: 'a',
        Moderator: 0,
        Date: 'd',
        ImageData: undefined,
      }).imageData,
    ).toBeUndefined();
  });
});

describe('mapScoreMessageToMemoryMessage', () => {
  it('parses Mots as JSON', () => {
    expect(
      mapScoreMessageToMemoryMessage({
        ID: 5,
        Pseudo: 'alice',
        Moderator: 0,
        Date: '2024-01-01',
        Answer: 'GRASS',
        Mots: '[["G","R","A","S","S"]]',
      }),
    ).toEqual({
      id: '5',
      user: { name: 'alice', moderatorLevel: 0 },
      answer: 'GRASS',
      attempts: [['G', 'R', 'A', 'S', 'S']],
      timestamp: '2024-01-01',
      deleted: 0,
    });
  });

  it('falls back to an empty attempts list when Mots is missing', () => {
    const out = mapScoreMessageToMemoryMessage({ Pseudo: '', Moderator: 0, Date: '' });
    expect(out.attempts).toEqual([]);
  });
});

describe('mapDatabaseTypeToMemoryType', () => {
  it('maps each known type', () => {
    expect(mapDatabaseTypeToMemoryType('score')).toBe(Server.MessageType.SCORE);
    expect(mapDatabaseTypeToMemoryType('enhanced')).toBe(Server.MessageType.ENHANCED);
    expect(mapDatabaseTypeToMemoryType('message')).toBe(Server.MessageType.TEXT);
  });

  it('returns undefined for missing type', () => {
    expect(mapDatabaseTypeToMemoryType(undefined)).toBeUndefined();
  });
});

describe('mapDatabaseMessageToMemoryMessage', () => {
  it('returns undefined when Type is missing', () => {
    expect(mapDatabaseMessageToMemoryMessage({ Pseudo: '', Moderator: 0, Date: '' })).toBeUndefined();
  });

  it('routes message/enhanced to the user message mapper', () => {
    const out = mapDatabaseMessageToMemoryMessage({
      ID: 1,
      Pseudo: 'a',
      Moderator: 0,
      Date: 'd',
      Texte: 'hi',
      Type: 'message',
    });
    expect(out).toMatchObject({ text: 'hi' });
  });

  it('routes score to the score mapper', () => {
    const out = mapDatabaseMessageToMemoryMessage({
      ID: 1,
      Pseudo: 'a',
      Moderator: 0,
      Date: 'd',
      Answer: 'GRASS',
      Mots: '[["G"]]',
      Type: 'score',
    });
    expect(out).toMatchObject({ answer: 'GRASS' });
  });
});
