import { JSX, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../../stores/useGameStore';
import { isGameFinished } from '../utils/gameLogic';
import EyeOpen from '../../../assets/images/ui/eye_open.svg?react';
import EyeClosed from '../../../assets/images/ui/eye_closed.svg?react';
import UIChest from '../../../ui/Chest/Chest';
import Cell from './Grid/Row/Cell/Cell';
import classes from './Chest.module.css';

const CHEST_ROWS = 6;
const CELL_SIZE = 'calc(16 * var(--chest-s))';

const EyeToggle = ({ open, onClick }: { open: boolean; onClick: () => void }) => (
  <button className={classes.eyeToggle} onClick={onClick}>
    {open ? <EyeOpen /> : <EyeClosed />}
  </button>
);

function Chest(): JSX.Element {
  const { t } = useTranslation();
  const solution = useGameStore((s) => s.solution);
  const tries = useGameStore((s) => s.tries);
  const letters = useGameStore((s) => s.letters);
  const gameFinished = useGameStore((s) => isGameFinished(s.tries));
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

  const confidential = gameFinished && !showProgression;
  const allWords = [...tries, letters];

  const chestCols = shownSolution.length;
  const slots = Array.from({ length: CHEST_ROWS * chestCols }, (_, i) => {
    const row = Math.floor(i / chestCols);
    const col = i % chestCols;
    const word = allWords[row] ?? null;
    const letter = word ? word[col] : undefined;
    return <Cell key={i} as="div" letter={letter} confidential={confidential} cellSize={CELL_SIZE} />;
  });

  const title = (
    <>
      {getChestLabel(shownSolution.length)}{' '}
      {gameFinished && <EyeToggle open={showProgression} onClick={() => setShowProgression(!showProgression)} />}
    </>
  );

  return <UIChest title={title} slots={slots} cols={chestCols} />;
}

export default Chest;
