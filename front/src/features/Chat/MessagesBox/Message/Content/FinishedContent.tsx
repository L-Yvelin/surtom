import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Server, Client, LetterState } from '@surtom/interfaces';
import { getLetterColor } from '../../../../Game/Chest/Grid/types';
import useGameStore from '../../../../../stores/useGameStore';
import { useWebSocketStore } from '../../../../../stores/useWebSocketStore';
import classes from './FinishedContent.module.css';

function FinishedContent({ message }: { message: Server.ChatMessage.GameFinished }): JSX.Element {
  const { t } = useTranslation();
  const tries = useGameStore((s) => s.tries);
  const hasSharedScore = useGameStore((s) => s.hasSharedScore);
  const setHasSharedScore = useGameStore((s) => s.setHasSharedScore);
  const sendMessage = useWebSocketStore((s) => s.sendMessage);

  const { win, attempts } = message.content;

  const emojiScore = tries.map((word) => word.map(({ state }) => getLetterColor(state ?? LetterState.Miss)).join('')).join('\n');

  function handleShareInChat() {
    if (hasSharedScore) return;
    sendMessage({
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { attempts, custom: undefined },
    });
    setHasSharedScore(true);
  }

  function handleCopy() {
    void navigator.clipboard.writeText(`${t('chat.shareTextPrefix')} ${window.location.href}\n${emojiScore}`);
  }

  return (
    <span className={classes.root}>
      <span>{win ? t('chat.gameWon') : t('chat.gameLost')}</span>
      {' · '}
      <button className={hasSharedScore ? classes.disabledBtn : classes.actionBtn} onClick={handleShareInChat} disabled={hasSharedScore}>
        {t('chat.shareInChat')}
      </button>
      {' · '}
      <button className={classes.actionBtn} onClick={handleCopy}>
        {t('chat.copyScore')}
      </button>
    </span>
  );
}

export default FinishedContent;
