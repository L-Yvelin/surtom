import { JSX } from 'react';
import classes from './Game.module.css';
import Tools from './Tools/Tools';
import Credits from './Credits/Credits';
import Keyboard from './Keyboard/Keyboard';
import ExperienceBar from './ExperienceBar/ExperienceBar';
import Chest from './Chest/Chest';
import usePlayerStore from '../../stores/usePlayerStore';
import useKeyboardLayout from './hooks/useKeyboardLayout';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { KeyboardLayouts } from './Keyboard/utils';
import GameMenu from '../../ui/GameMenu/GameMenu';

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

  return (
    <main className={classes.main}>
      <div data-backdrop className={classes.backdrop}></div>
      <Tools tabButtonRef={tabButtonRef} menuButtonRef={menuButtonRef} chatButtonRef={chatButtonRef} />
      <Chest />
      <ExperienceBar xp={player?.xp} />
      <Keyboard layout={layout} />
      <Credits />

      <GameMenu menuButtonRef={menuButtonRef} />
    </main>
  );
}

export default Game;
