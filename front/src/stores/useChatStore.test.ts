import { Server } from '@surtom/interfaces';
import { defaultPlayer } from './usePlayerStore';
import { useChatStore } from './useChatStore';

const makeText = (id: string, text = `m-${id}`): Server.ChatMessage.Text => ({
  type: Server.MessageType.TEXT,
  content: {
    id,
    user: defaultPlayer,
    text,
    timestamp: new Date().toISOString(),
    deleted: 0,
  },
});

const makeStatus = (text = 'ok'): Server.ChatMessage.Status => ({
  type: Server.MessageType.SUCCESS,
  content: {
    text,
    timestamp: new Date().toISOString(),
  },
});

beforeEach(() => {
  useChatStore.setState({
    messages: [],
    answeringTo: null,
    scrollToBottom: () => {},
    focusInput: () => {},
  });
});

describe('messages', () => {
  test('addMessage appends', () => {
    useChatStore.getState().addMessage(makeText('1'));
    useChatStore.getState().addMessage(makeText('2'));
    const ids = useChatStore.getState().messages.map((m) => (m as Server.ChatMessage.Text).content.id);
    expect(ids).toStrictEqual(['1', '2']);
  });

  test('removeMessage drops the matching id from saved messages', () => {
    useChatStore.setState({ messages: [makeText('a'), makeText('b'), makeText('c')] });
    useChatStore.getState().removeMessage('b');
    const ids = useChatStore
      .getState()
      .messages.filter((m): m is Server.ChatMessage.Text => 'content' in m && 'id' in m.content)
      .map((m) => m.content.id);
    expect(ids).toStrictEqual(['a', 'c']);
  });

  test('removeMessage preserves status messages (they have no id to match against)', () => {
    const status = makeStatus();
    useChatStore.setState({ messages: [makeText('a'), status, makeText('b')] });
    useChatStore.getState().removeMessage('a');
    const remaining = useChatStore.getState().messages;
    expect(remaining).toHaveLength(2);
    expect(remaining).toContain(status);
    expect(remaining.some((m) => m.type === Server.MessageType.TEXT && m.content.id === 'b')).toBe(true);
  });

  test('removeMessage leaves messages unchanged when id is unknown (among saved messages)', () => {
    const messages = [makeText('a'), makeText('b')];
    useChatStore.setState({ messages });
    useChatStore.getState().removeMessage('zzz');
    expect(useChatStore.getState().messages).toStrictEqual(messages);
  });

  test('setMessages replaces the message list wholesale', () => {
    useChatStore.setState({ messages: [makeText('keep')] });
    useChatStore.getState().setMessages([makeText('x'), makeText('y')]);
    const ids = useChatStore.getState().messages.map((m) => (m as Server.ChatMessage.Text).content.id);
    expect(ids).toStrictEqual(['x', 'y']);
  });
});

describe('answeringTo', () => {
  test('setAnsweringTo updates the value', () => {
    useChatStore.getState().setAnsweringTo('msg-1');
    expect(useChatStore.getState().answeringTo).toBe('msg-1');
  });

  test('setAnsweringTo accepts null to clear', () => {
    useChatStore.setState({ answeringTo: 'msg-1' });
    useChatStore.getState().setAnsweringTo(null);
    expect(useChatStore.getState().answeringTo).toBeNull();
  });
});

describe('scroll/focus injection points', () => {
  test('setScrollToBottom replaces the registered callback', () => {
    const fn = jest.fn();
    useChatStore.getState().setScrollToBottom(fn);
    useChatStore.getState().scrollToBottom();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('setFocusInput replaces the registered callback', () => {
    const fn = jest.fn();
    useChatStore.getState().setFocusInput(fn);
    useChatStore.getState().focusInput('hi');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('resetSession', () => {
  test('clears answeringTo', () => {
    useChatStore.setState({ answeringTo: 'msg-1' });
    useChatStore.getState().resetSession();
    expect(useChatStore.getState().answeringTo).toBeNull();
  });

  test('preserves messages (World tier)', () => {
    const messages = [makeText('a'), makeText('b')];
    useChatStore.setState({ messages, answeringTo: 'msg-1' });
    useChatStore.getState().resetSession();
    expect(useChatStore.getState().messages).toStrictEqual(messages);
  });

  test('preserves the registered scrollToBottom / focusInput refs (Component tier)', () => {
    const scroll = jest.fn();
    const focus = jest.fn();
    useChatStore.getState().setScrollToBottom(scroll);
    useChatStore.getState().setFocusInput(focus);
    useChatStore.getState().resetSession();
    useChatStore.getState().scrollToBottom();
    useChatStore.getState().focusInput('x');
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(focus).toHaveBeenCalledTimes(1);
  });
});

describe('resetWorld', () => {
  test('replaces messages with the loading placeholder', () => {
    useChatStore.setState({ messages: [makeText('a'), makeText('b')] });
    useChatStore.getState().resetWorld();
    const messages = useChatStore.getState().messages;
    expect(messages).toHaveLength(1);
    expect(messages[0].type).toBe(Server.MessageType.TEXT);
    expect((messages[0] as Server.ChatMessage.Text).content.text).toBe('En cours de chargement');
  });

  test('also clears answeringTo (resetWorld is a superset of resetSession for chat)', () => {
    useChatStore.setState({ answeringTo: 'msg-1' });
    useChatStore.getState().resetWorld();
    expect(useChatStore.getState().answeringTo).toBeNull();
  });

  test('preserves the registered scrollToBottom / focusInput refs', () => {
    const scroll = jest.fn();
    useChatStore.getState().setScrollToBottom(scroll);
    useChatStore.getState().resetWorld();
    useChatStore.getState().scrollToBottom();
    expect(scroll).toHaveBeenCalledTimes(1);
  });
});
