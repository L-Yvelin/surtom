import { Server, Word } from '@surtom/interfaces';
import Cookies from 'js-cookie';
import { useGameStore } from './useGameStore';
import usePlayerStore from './usePlayerStore';
import { useChatStore } from './useChatStore';
import { useCursorsStore } from './useCursorsStore';
import { useWorldsStore } from './useWorldsStore';
import { useWebSocketStore } from './useWebSocketStore';
import useUIStore from './useUIStore';
import { getValidatedWords, isGameFinished, isWinningWord } from '../features/Game/utils/gameLogic';
import { UI } from '../ui/ids';
import i18n from '../i18n';
import { Achievement } from '../features/AchievementsStack/Achievement/Achievement';
import { AchievementIcon } from '../features/AchievementsStack/Achievement/utils';
import { hasUnreadMessages, isOthersChatMessage } from '../features/Chat/utils/unread';
import { isSavedChatMessage } from '../features/Chat/utils/messageFormatting';

const COOKIE_SESSION_HASH = 'modHash';

function isChatVisible(): boolean {
  return !!useUIStore.getState().visibility[UI.CHAT];
}

function addIncomingMessage(message: Server.ChatMessage.Type, selfName: string): void {
  const chat = useChatStore.getState();
  chat.addMessage(message);
  chat.scrollToBottom?.();
  if (!isChatVisible() && isOthersChatMessage(message, selfName)) {
    chat.setHasUnread(true);
  }
}

function revealFinish(lastTry: Word, awardedXp?: number): void {
  const game = useGameStore.getState();
  if (!isGameFinished(game.tries)) return;

  if (awardedXp !== undefined) {
    usePlayerStore.getState().setXP(awardedXp);
  }

  const win = isWinningWord(lastTry);
  game.setLetters([]);
  useUIStore.getState().setVisibility(UI.CHAT, true);
  game.addAchievement(
    new Achievement(
      i18n.t(win ? 'achievements.winTitle' : 'achievements.lossTitle'),
      i18n.t(win ? 'achievements.winSubtitle' : 'achievements.lossSubtitle'),
      AchievementIcon.BOOK,
    ),
  );
  addIncomingMessage(
    {
      type: Server.MessageType.GAME_FINISHED,
      content: {
        win,
        attempts: game.tries.map((word) => word.map((letter) => letter.letter)),
        hasSharedScore: game.hasSharedScore,
        timestamp: new Date().toISOString(),
      },
    },
    usePlayerStore.getState().player.name,
  );
}

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
    case Server.MessageType.CHAT_LAST_READ:
      chat.setLastReadAt(data.content);
      break;
    case Server.MessageType.GET_MESSAGES:
      chat.setMessages(data.content);
      useChatStore.getState().scrollToBottom?.();
      chat.setHasUnread(!isChatVisible() && hasUnreadMessages(data.content, useChatStore.getState().lastReadAt, player.player.name));
      break;
    case Server.MessageType.DELETE_MESSAGE: {
      const { id, deleted } = data.content;
      const isModerator = player.player.moderatorLevel > 0;
      if (deleted && !isModerator) {
        chat.removeMessage(String(id));
      } else {
        chat.setMessageDeleted(String(id), deleted);
      }
      break;
    }
    case Server.MessageType.MESSAGE:
      if (data.content.type === Server.MessageType.GAME_FINISHED) {
        game.setHasSharedScore(data.content.content.hasSharedScore);
      }
      addIncomingMessage(data.content, player.player.name);
      if (isSavedChatMessage(data.content)) {
        chat.emitLiveMessage(data.content);
      }
      break;
    case Server.MessageType.DAILY_WORDS: {
      const solution = data.content.words[data.content.words.length - 1];
      game.setSolution(solution);
      game.setValidWords(data.content.words);
      const validatedTries = getValidatedWords(
        data.content.attempts.map((a: string) => a.split('')),
        solution,
      );
      const previousTriesCount = game.tries?.length ?? 0;
      const isSingleNewTry = game.hasPendingTry
        ? validatedTries.length === previousTriesCount
        : game.hasLoaded && validatedTries.length === previousTriesCount + 1;
      game.setTries(validatedTries);
      game.setHasPendingTry(false);
      if (isSingleNewTry && isGameFinished(validatedTries)) {
        revealFinish(validatedTries[validatedTries.length - 1], data.content.xp);
      }
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
