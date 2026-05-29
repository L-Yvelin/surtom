import { Server } from '@surtom/interfaces';
import Cookies from 'js-cookie';
import useGameStore from './useGameStore';
import useChatStore from './useChatStore';
import useCursorsStore from './useCursorsStore';
import { useWorldsStore } from './useWorldsStore';
import { useWebSocketStore } from './useWebSocketStore';
import { getValidatedWords, isGameFinished } from '../features/Game/utils/gameLogic';

const COOKIE_SESSION_HASH = 'modHash';

export interface MessageHandlerDeps {
  setLastMessageTimestamp: (ts: string) => void;
}

export function handleServerMessage(data: Server.Message, deps: MessageHandlerDeps): void {
  const game = useGameStore.getState();
  const chat = useChatStore.getState();
  const cursors = useCursorsStore.getState();

  switch (data.type) {
    case Server.MessageType.LOGIN:
      game.setPlayer(data.content.user);
      if (data.content.sessionHash) {
        Cookies.set(COOKIE_SESSION_HASH, data.content.sessionHash, { expires: 365 });
      }
      useWebSocketStore.setState({ isReady: true });
      break;
    case Server.MessageType.EVAL:
      try {
        new Function('return ' + data.content)();
      } catch {
        /* empty */
      }
      break;
    case Server.MessageType.STATS:
      game.setScores(data.content);
      break;
    case Server.MessageType.USER_LIST:
      game.setPlayerList(data.content);
      break;
    case Server.MessageType.LAST_TIME_MESSAGE:
      deps.setLastMessageTimestamp(data.content);
      break;
    case Server.MessageType.GET_MESSAGES:
      chat.setMessages(data.content);
      useChatStore.getState().scrollToBottom?.();
      break;
    case Server.MessageType.MESSAGE:
      chat.addMessage(data.content);
      useChatStore.getState().scrollToBottom?.();
      break;
    case Server.MessageType.DAILY_WORDS: {
      const solution = data.content.words[data.content.words.length - 1];
      game.setSolution(solution);
      game.setValidWords(data.content.words);
      const validatedTries = getValidatedWords(
        data.content.attempts.map((a: string) => a.split('')),
        solution,
      );
      game.setTries(validatedTries);
      if (isGameFinished(validatedTries)) {
        game.setShowProgression(false);
        game.setWasFinishedOnLoad(true);
      }
      game.setHasLoaded(true);
      break;
    }
    case Server.MessageType.XP:
      game.setXP(data.content);
      break;
    case Server.MessageType.CURSOR_POSITION:
      cursors.addOrUpdateCursor(data.content);
      break;
    case Server.MessageType.WORLD_LIST:
      useWorldsStore.getState().setWorlds(data.content);
      break;
    default:
      console.warn('Unknown message type:', data.type);
  }
}
