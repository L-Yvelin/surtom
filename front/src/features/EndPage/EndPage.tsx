import { JSX, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './EndPage.module.css';
import { getLetterColor } from '../Game/Chest/Grid/types';
import { LetterState } from '@surtom/interfaces';
import Button from '../../ui/Button/Button';
import MinecraftToast from '../../ui/MinecraftToast/MinecraftToast';
import copyIcon from '../../assets/images/ui/copy-icon.png';
import useGameStore from '../../stores/useGameStore';
import useUIStore from '../../stores/useUIStore';
import { useWebSocketStore } from '../../stores/useWebSocketStore';
import { Client } from '@surtom/interfaces';

interface EndPageProps {
  endPageButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function EndPage({ endPageButtonRef }: EndPageProps): JSX.Element {
  const { t } = useTranslation();
  const tries = useGameStore((state) => state.tries);
  const sendMessage = useWebSocketStore((s) => s.sendMessage);
  const setVisibility = useUIStore((s) => s.setVisibility);

  const emojiScore = useMemo(() => {
    return tries.map((word) => word.map(({ state }) => getLetterColor(state ?? LetterState.Miss)).join('')).join('\n');
  }, [tries]);

  function handleCopy() {
    const copyText = `${t('endPage.shareTextPrefix')} ${window.location.href}\n${emojiScore}`;
    navigator.clipboard.writeText(copyText);
  }

  function shareInTchat() {
    sendMessage({
      type: Client.MessageType.SCORE_TO_CHAT,
      content: {
        attempts: tries.map((w) => w.map((l) => l.letter)),
        custom: undefined,
      },
    });
    return;
  }

  return (
    <MinecraftToast id="endPage" toastButtonRef={endPageButtonRef} className={classes.pageFin}>
      <div className={classes.emojiScore}>{emojiScore}</div>
      <div className={classes.boutonsFlex}>
        <Button text={t('endPage.shareInChat')} onClick={() => shareInTchat()} className={classes.shareInTchat} />
        <Button
          text={<img src={copyIcon} alt={t('endPage.copyIconAlt')} className={classes.copyIcon} />}
          onClick={() => handleCopy()}
          size="square"
        />
      </div>
      <Button text={t('common.close')} onClick={() => setVisibility('endPage', false)} />
    </MinecraftToast>
  );
}

export default EndPage;
