import { JSX, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './Chest.module.css';
import Grid from './Grid/Grid';
import useGameStore from '../../../stores/useGameStore';
import EyeOpen from '../../../assets/images/ui/eye_open.svg?react';
import EyeClosed from '../../../assets/images/ui/eye_closed.svg?react';

const EyeToggle = ({ open, onClick }: { open: boolean; onClick: () => void }) => {
  return (
    <button className={classes.eyeToggle} onClick={onClick}>
      {open ? <EyeOpen /> : <EyeClosed />}
    </button>
  );
};

function Chest(): JSX.Element {
  const { t } = useTranslation();
  const solution = useGameStore((s) => s.solution);
  const tries = useGameStore((s) => s.tries);
  const letters = useGameStore((s) => s.letters);
  const gameFinished = useGameStore((s) => s.gameFinished());
  const wasFinishedOnLoad = useGameStore((s) => s.wasFinishedOnLoad);
  const showProgression = useGameStore((s) => s.showProgression);
  const setShowProgression = useGameStore((s) => s.setShowProgression);
  const shownSolution = solution ?? '      ';

  function getChestLabel(length: number): string {
    if ([24, 25].includes(new Date().getDate()) && new Date().getMonth() === 11) {
      return t('chest.christmas');
    } else if (length < 7) {
      return t('chest.ender');
    } else {
      return t('chest.large');
    }
  }

  useEffect(() => {
    if (!gameFinished || wasFinishedOnLoad) return;
    const timeout = setTimeout(() => {
      setShowProgression(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [gameFinished, wasFinishedOnLoad, setShowProgression]);

  return (
    <div className={classes.coffre}>
      <div className={classes.coffreUi}>
        <p className={classes.chestLabel}>
          {getChestLabel(shownSolution.length)}{' '}
          {gameFinished && <EyeToggle open={showProgression} onClick={() => setShowProgression(!showProgression)} />}
        </p>
        <Grid solution={shownSolution} tries={[...tries, letters]} confidential={gameFinished && !showProgression} />
      </div>
    </div>
  );
}

export default Chest;
