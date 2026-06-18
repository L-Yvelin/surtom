import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Server } from '@surtom/interfaces';
import classes from '../Message.module.css';
import { getValidatedWords, isGameFinished } from '../../../../Game/utils/gameLogic';
import PlayerName from '../PlayerName/PlayerName';
import Tooltip from '../../../../../ui/Tooltip/Tooltip';
import Grid from '../../../../Game/Chest/Grid/Grid';
import useGameStore from '../../../../../stores/useGameStore';

function ScoreContent({ message }: { message: Server.ChatMessage.Score }): JSX.Element {
  const { t } = useTranslation();
  const tries = message.content.attempts;
  const answer = message.content.answer;
  const words = getValidatedWords(tries, answer);
  const gameFinished = useGameStore((s) => isGameFinished(s.tries));

  return (
    <span>
      <PlayerName name={message.content.user.name} moderatorLevel={message.content.user.moderatorLevel} />{' '}
      <span className={classes.score}>
        {t('chat.scoreInline', { count: tries?.length ?? 0 })}{' '}
        <Tooltip
          activeOnMobile
          tooltipContent={
            <Grid
              solution={answer}
              tries={words}
              confidential={new Date(message.content.timestamp).getDate() === new Date().getDate() && !gameFinished}
              cellSize={'2dvh'}
            />
          }
        >
          <u>{t('chat.scoreView')}</u>
        </Tooltip>
      </span>
    </span>
  );
}

export default ScoreContent;
