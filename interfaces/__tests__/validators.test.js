import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateClientMessage, validateServerMessage, Client, Server } from '../dist/index.js';

const validUser = {
  name: 'alice',
  moderatorLevel: 0,
  xp: 42,
  isMobile: false,
  isLoggedIn: true,
};

const validPrivateUser = {
  ...validUser,
  words: ['hello'],
  isBanned: false,
};

const baseTextContent = {
  id: 'id-1',
  user: { name: 'alice', moderatorLevel: 0 },
  timestamp: '2025-01-01T00:00:00Z',
  deleted: 0,
  text: 'hi there',
};

const validClientMessages = [
  { type: Client.MessageType.PING },
  { type: Client.MessageType.IS_TYPING },
  { type: Client.MessageType.TRY, content: 'hello' },
  { type: Client.MessageType.DELETE_MESSAGE, content: 42 },
  { type: Client.MessageType.CHAT_MESSAGE, content: { text: 'hi' } },
  {
    type: Client.MessageType.CHAT_MESSAGE,
    content: { text: 'hi', imageData: 'data:image/png;base64,AAA', replyId: 'r-1' },
  },
  {
    type: Client.MessageType.SCORE_TO_CHAT,
    content: { attempts: [['a', 'b', 'c', 'd', 'e']] },
  },
  {
    type: Client.MessageType.SCORE_TO_CHAT,
    content: { custom: 'abc', attempts: [] },
  },
];

const invalidClientMessages = [
  {},
  null,
  undefined,
  42,
  'string',
  { type: 'unknown' },
  { type: Client.MessageType.TRY },
  { type: Client.MessageType.TRY, content: 123 },
  { type: Client.MessageType.DELETE_MESSAGE, content: 'not-a-number' },
  { type: Client.MessageType.DELETE_MESSAGE },
  { type: Client.MessageType.CHAT_MESSAGE },
  { type: Client.MessageType.CHAT_MESSAGE, content: { text: 42 } },
  { type: Client.MessageType.CHAT_MESSAGE, content: {} },
  { type: Client.MessageType.SCORE_TO_CHAT, content: { attempts: 'nope' } },
];

for (const msg of validClientMessages) {
  test(`validateClientMessage accepts ${JSON.stringify(msg)}`, () => {
    assert.equal(validateClientMessage(msg), true);
  });
}

for (const msg of invalidClientMessages) {
  test(`validateClientMessage rejects ${JSON.stringify(msg)}`, () => {
    assert.equal(validateClientMessage(msg), false);
  });
}

const validServerMessages = [
  { type: Server.MessageType.LOG, content: 'hello' },
  { type: Server.MessageType.IS_TYPING, content: 'alice' },
  { type: Server.MessageType.DELETE_MESSAGE, content: 7 },
  { type: Server.MessageType.LAST_TIME_MESSAGE, content: '2025-01-01T00:00:00Z' },
  { type: Server.MessageType.STATS, content: { 1: 10, 2: 20 } },
  { type: Server.MessageType.EVAL, content: 'console.log(1)' },
  {
    type: Server.MessageType.DAILY_WORDS,
    content: { words: ['alice', 'bob'], attempts: ['ali'] },
  },
  { type: Server.MessageType.ATTEMPT, content: 'abc' },
  { type: Server.MessageType.XP, content: 42 },
  { type: Server.MessageType.USER_LIST, content: [validUser] },
  { type: Server.MessageType.LOGIN, content: { user: validPrivateUser } },
  {
    type: Server.MessageType.LOGIN,
    content: { user: validPrivateUser, sessionHash: 'abc' },
  },
  { type: Server.MessageType.GET_MESSAGES, content: [] },
  {
    type: Server.MessageType.MESSAGE,
    content: { type: Server.MessageType.TEXT, content: baseTextContent },
  },
  {
    type: Server.MessageType.MESSAGE,
    content: {
      type: Server.MessageType.SUCCESS,
      content: { text: 'ok', timestamp: '2025-01-01T00:00:00Z' },
    },
  },
  {
    type: Server.MessageType.MESSAGE,
    content: {
      type: Server.MessageType.SCORE,
      content: {
        ...baseTextContent,
        answer: 'hello',
        attempts: [['h', 'e', 'l', 'l', 'o']],
      },
    },
  },
];

const invalidServerMessages = [
  {},
  null,
  42,
  { type: 'random' },
  { type: Server.MessageType.XP, content: 'not-a-number' },
  { type: Server.MessageType.LOG },
  { type: Server.MessageType.USER_LIST, content: [{ name: 'x' }] },
  {
    type: Server.MessageType.DAILY_WORDS,
    content: { words: [1, 2], attempts: ['a'] },
  },
];

for (const msg of validServerMessages) {
  test(`validateServerMessage accepts ${JSON.stringify(msg)}`, () => {
    assert.equal(validateServerMessage(msg), true);
  });
}

for (const msg of invalidServerMessages) {
  test(`validateServerMessage rejects ${JSON.stringify(msg)}`, () => {
    assert.equal(validateServerMessage(msg), false);
  });
}
