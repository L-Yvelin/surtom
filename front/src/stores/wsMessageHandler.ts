import { Server } from '@surtom/interfaces';
import Cookies from 'js-cookie';
import { useGameStore } from './useGameStore';
import usePlayerStore from './usePlayerStore';
import { useChatStore } from './useChatStore';
import { useCursorsStore } from './useCursorsStore';
import { useWorldsStore } from './useWorldsStore';
import { useWebSocketStore } from './useWebSocketStore';
import { useUIStore } from './useUIStore';
import { getValidatedWords, isGameFinished } from '../features/Game/utils/gameLogic';
import { UI } from '../ui/ids';
import i18n from '../i18n';
import { Achievement } from '../features/AchievementsStack/Achievement/Achievement';
import { AchievementIcon } from '../features/AchievementsStack/Achievement/utils';

const COOKIE_SESSION_HASH = 'modHash';

export interface MessageHandlerDeps {
  setLastMessageTimestamp: (ts: string) => void;
}

export function handleServerMessage(data: Server.Message, deps: MessageHandlerDeps): void {
  const game = useGameStore.getState();
  const player = usePlayerStore.getState();
  const chat = useChatStore.getState();
  const cursors = useCursorsStore.getState();

  switch (data.type) {
    case Server.MessageType.LOGIN:
      player.setPlayer(data.content.user);
      if (data.content.sessionHash) {
        Cookies.set(COOKIE_SESSION_HASH, data.content.sessionHash, { expires: 365 });
      }
      useWebSocketStore.setState({ isReady: true });
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
      if (data.content.type === Server.MessageType.GAME_FINISHED) {
        const { win } = data.content.content;
        game.setHasSharedScore(data.content.content.hasSharedScore);
        game.setLetters([]);
        useUIStore.getState().setVisibility(UI.CHAT, true);
        game.addAchievement(
          new Achievement(
            i18n.t(win ? 'achievements.winTitle' : 'achievements.lossTitle'),
            i18n.t(win ? 'achievements.winSubtitle' : 'achievements.lossSubtitle'),
            AchievementIcon.BOOK,
          ),
        );
      }
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
      if (!game.hasLoaded && isGameFinished(validatedTries)) {
        game.setShowProgression(false);
        game.setWasFinishedOnLoad(true);
      }
      game.setHasLoaded(true);
      break;
    }
    case Server.MessageType.XP:
      player.setXP(data.content);
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
