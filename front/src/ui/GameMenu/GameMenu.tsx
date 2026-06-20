import { JSX, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './GameMenu.module.css';
import Button from '../Button/Button';
import ButtonRow from '../ButtonRow/ButtonRow';
import Screen from '../Screen/Screen';
import useUIStore, { useVisibility } from '../../stores/useUIStore';
import { useNavigate } from 'react-router-dom';
import Stats from '../../features/Stats/Stats';
import Settings from '../Settings/Settings';
import { UI } from '../ids';

type GameMenuPage = 'main' | 'stats' | 'settings';

interface GameMenuProps {
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function GameMenu({ menuButtonRef }: GameMenuProps): JSX.Element {
  const { t } = useTranslation();
  const setVisibility = useUIStore((s) => s.setVisibility);
  const visible = useVisibility(UI.GAME_MENU);
  const navigate = useNavigate();

  const [page, setPage] = useState<GameMenuPage>('main');

  useEffect(() => {
    if (!visible) setPage('main');
  }, [visible]);

  const close = useCallback((): void => setVisibility(UI.GAME_MENU, false), [setVisibility]);

  const handleEscape = useCallback((): void => {
    if (page !== 'main') setPage('main');
    else close();
  }, [page, close]);

  return (
    <Screen id={UI.GAME_MENU} variant="dim" anchorRef={menuButtonRef} onEscape={handleEscape}>
      {page === 'main' && (
        <div className={classes.mainContent}>
          <Button text={t('gameMenu.backToGame')} onClick={close} className={classes.button} />
          <ButtonRow className={classes.row}>
            <Button text={t('gameMenu.achievements')} disabled className={classes.button} />
            <Button text={t('gameMenu.statistics')} onClick={() => setPage('stats')} className={classes.button} />
          </ButtonRow>
          <Button text={t('gameMenu.options')} onClick={() => setPage('settings')} className={classes.button} />
          <Button text={t('gameMenu.quit')} onClick={() => navigate('/')} className={classes.button} />
        </div>
      )}
      {page === 'stats' && <Stats onBack={() => setPage('main')} />}
      {page === 'settings' && <Settings onBack={() => setPage('main')} />}
    </Screen>
  );
}

export default GameMenu;
