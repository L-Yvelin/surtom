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

export const GAME_MENU_TOAST_ID = 'game-menu-settings';

type GameMenuPage = 'main' | 'stats' | 'settings';

interface GameMenuProps {
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function GameMenu({ menuButtonRef }: GameMenuProps): JSX.Element {
  const { t } = useTranslation();
  const setVisibility = useUIStore((s) => s.setVisibility);
  const visible = useVisibility(GAME_MENU_TOAST_ID);
  const navigate = useNavigate();

  const [page, setPage] = useState<GameMenuPage>('main');

  useEffect(() => {
    if (!visible) setPage('main');
  }, [visible]);

  const close = useCallback((): void => setVisibility(GAME_MENU_TOAST_ID, false), [setVisibility]);

  const handleEscape = useCallback((): void => {
    if (page !== 'main') setPage('main');
    else close();
  }, [page, close]);

  return (
    <Screen id={GAME_MENU_TOAST_ID} variant="dim" anchorRef={menuButtonRef} onEscape={handleEscape}>
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
