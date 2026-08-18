import { JSX } from 'react';
import classes from './Game.module.css';
import Tools from './Tools/Tools';
import Credits from './Credits/Credits';
import Keyboard from './Keyboard/Keyboard';
import ExperienceBar from './ExperienceBar/ExperienceBar';
import Chest from './Chest/Chest';
import Chat from '../Chat/Chat';
import usePlayerStore from '../../stores/usePlayerStore';
import useKeyboardLayout from './hooks/useKeyboardLayout';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { KeyboardLayouts } from './Keyboard/utils';
import GameMenu from '../../ui/GameMenu/GameMenu';
import Backdrop from '../../ui/Backdrop/Backdrop';
import useTheme from '../../hooks/useTheme';
import { Theme } from '../../theme/theme';
import BackgroundChat from '../Chat/BackgroundChat/BackgroundChat';
import { isDesktop } from 'react-device-detect';
import { useVisibility } from '../../stores/useUIStore';
import { UI } from '../../ui/ids';

interface GameProps {
  tabButtonRef: React.RefObject<HTMLButtonElement | null>;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
  chatButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function Game({ tabButtonRef, menuButtonRef, chatButtonRef }: GameProps): JSX.Element {
  const keyboard = useSettingsStore((s) => s.keyboard);
  const setKeyboard = useSettingsStore((s) => s.setKeyboard);
  const layout = useKeyboardLayout({
    fallback: keyboard ?? KeyboardLayouts.QWERTY,
    valueInStorage: keyboard,
    setValueInStorage: setKeyboard,
  });
  const player = usePlayerStore((s) => s.player);
  const { theme } = useTheme();
  const chatVisible = useVisibility(UI.CHAT);

  return (
    <main className={classes.main}>
      <Backdrop />
      {theme === Theme.LIGHT && <div className={classes.light} aria-hidden />}
      <Tools tabButtonRef={tabButtonRef} menuButtonRef={menuButtonRef} chatButtonRef={chatButtonRef} />

      <div className={classes.contentWrapper}>
        <BackgroundChat hidden={!isDesktop || chatVisible} />
        <div className={classes.content}>
          <Chest />
          <ExperienceBar xp={player?.xp} />
          <Keyboard layout={layout} />
          <div className={classes.creditsSlot}>
            <BackgroundChat hidden={isDesktop || chatVisible} className={classes.creditsChat} messageClassName={classes.creditsMessage} />
            <Credits />
          </div>
        </div>
        <Chat chatButtonRef={chatButtonRef} />
      </div>

      <GameMenu menuButtonRef={menuButtonRef} />
    </main>
  );
}

export default Game;
