import { JSX, useEffect } from 'react';
import classes from './Game.module.css';
import Grid from './Grid/Grid';
import useGameStore from '../../../stores/useGameStore';
import eyeOpen from '../../../assets/images/ui/eye_open.svg';
import eyeClosed from '../../../assets/images/ui/eye_closed.svg';

const EyeToggle = ({ open, onClick }: { open: boolean; onClick: () => void }) => {
  return (
    <button className={classes.eyeToggle} onClick={onClick}>
      <img src={open ? eyeOpen : eyeClosed} alt="Toggle progression visibility" />
    </button>
  );
};

function Game(): JSX.Element {
  const solution = useGameStore((s) => s.solution);
  const tries = useGameStore((s) => s.tries);
  const letters = useGameStore((s) => s.letters);
  const gameFinished = useGameStore((s) => s.gameFinished());
  const showProgression = useGameStore((s) => s.showProgression);
  const setShowProgression = useGameStore((s) => s.setShowProgression);
  const shownSolution = solution ?? '      ';

  function getChestLabel(length: number): string {
    if ([24, 25].includes(new Date().getDate()) && new Date().getMonth() === 11) {
      return 'Coffre de noël';
    } else if (length < 7) {
      return "Coffre de l'Ender";
    } else {
      return 'Grand coffre';
    }
  }

  useEffect(() => {
    if (!gameFinished) return;
    const timeout = setTimeout(() => {
      setShowProgression(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [gameFinished, setShowProgression]);

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

export default Game;
