import { JSX, useMemo } from 'react';
import classes from './EndPage.module.css';
import { getLetterColor } from '../Main/Game/Grid/types';
import { LetterState } from '@surtom/interfaces';
import Button from '../Widgets/Button/Button';
import MinecraftToast from '../MinecraftToast/MinecraftToast';
import copyIcon from '../../assets/images/ui/copy-icon.png';
import useGameStore from '../../stores/useGameStore';
import useUIStore from '../../stores/useUIStore';
import { useWebSocketStore } from '../../stores/useWebSocketStore';
import { Client } from '@surtom/interfaces';

interface EndPageProps {
  endPageButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function EndPage({ endPageButtonRef }: EndPageProps): JSX.Element {
  const tries = useGameStore((state) => state.tries);
  const sendMessage = useWebSocketStore((s) => s.sendMessage);
  const setVisibility = useUIStore((s) => s.setVisibility);

  const emojiScore = useMemo(() => {
    return tries.map((word) => word.map(({ state }) => getLetterColor(state ?? LetterState.Miss)).join('')).join('\n');
  }, [tries]);

  function handleCopy() {
    const copyText = `Mon score sur ${window.location.href}\n${emojiScore}`;
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
        <Button text={'Partager le score dans le tchat'} onClick={() => shareInTchat()} className={classes.shareInTchat} />
        <Button
          text={<img src={copyIcon} alt="Copy icon" className={classes.copyIcon} />}
          onClick={() => handleCopy()}
          className={classes.copyScore}
          size="square"
        />
      </div>
      <Button text={'Fermer'} onClick={() => setVisibility('endPage', false)} />
    </MinecraftToast>
  );
}

export default EndPage;
