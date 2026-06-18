import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './GameMenu.module.css';
import Button from '../Button/Button';
import MinecraftToast from '../MinecraftToast/MinecraftToast';
import useUIStore from '../../stores/useUIStore';
import { useNavigate } from 'react-router-dom';
import { SETTINGS_TOAST_ID } from '../Settings/Settings';

export const GAME_MENU_TOAST_ID = 'game-menu-settings';

interface GameMenuProps {
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function GameMenu({ menuButtonRef }: GameMenuProps): JSX.Element {
  const { t } = useTranslation();
  const setVisibility = useUIStore((s) => s.setVisibility);
  const close = (): void => setVisibility(GAME_MENU_TOAST_ID, false);
  const navigate = useNavigate();

  const openStats = (): void => {
    close();
    setVisibility('stats', true);
  };

  return (
    <MinecraftToast id={GAME_MENU_TOAST_ID} toastButtonRef={menuButtonRef} className={classes.gameMenu}>
      <div className={classes.mainContent}>
        <Button text={t('gameMenu.backToGame')} onClick={close} className={classes.button} />
        <div className={classes.row}>
          <Button text={t('gameMenu.achievements')} disabled className={classes.button} />
          <Button text={t('gameMenu.statistics')} onClick={openStats} className={classes.button} />
        </div>
        <Button text={t('gameMenu.options')} onClick={() => setVisibility(SETTINGS_TOAST_ID, true)} className={classes.button} />
        <Button text={t('gameMenu.quit')} onClick={() => navigate('/')} className={classes.button} />
      </div>
    </MinecraftToast>
  );
}

export default GameMenu;
