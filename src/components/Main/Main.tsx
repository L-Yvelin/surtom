import { JSX, useEffect, useState } from "react";
import classes from "./Main.module.css";
import Tools, { Theme } from "./Tools/Tools";
import Credits from "./Credits/Credits";
import Keyboard from "./Keyboard/Keyboard";
import classNames from "classnames";
import { detectKeyboardLayout, KeyboardLayouts } from "./Keyboard/utils";
import ExperienceBar from "./ExperienceBar/ExperienceBar";
import Game from "./Game/Game";
import useGameStore from "../../stores/useGameStore";

interface MainProps {
  theme: Theme;
  setTheme: (newTheme: Theme) => void;
  tabButtonRef: React.RefObject<HTMLButtonElement | null>;
  statsButtonRef: React.RefObject<HTMLButtonElement | null>;
  customWordButtonRef: React.RefObject<HTMLButtonElement | null>;
  endPageButtonRef: React.RefObject<HTMLButtonElement | null>;
  chatButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function Main({
  theme,
  setTheme,
  tabButtonRef,
  statsButtonRef,
  customWordButtonRef,
  endPageButtonRef,
  chatButtonRef,
}: MainProps): JSX.Element {
  const [layout, setLayout] = useState<KeyboardLayouts>(KeyboardLayouts.AZERTY);
  const { player } = useGameStore();

  useEffect(() => {
    const getLayout = async () => {
      detectKeyboardLayout().then((detectedLayout) => {
        if (detectedLayout) {
          setLayout(detectedLayout);
        }
      });
    };

    getLayout();
  }, []);

  return (
    <main
      className={classNames(classes.main, {
        [classes.dark]: theme === Theme.DARK,
      })}
    >
      <div data-backdrop className={classes.backdrop}></div>
      <Tools
        theme={theme}
        setTheme={setTheme}
        tabButtonRef={tabButtonRef}
        statsButtonRef={statsButtonRef}
        customWordButtonRef={customWordButtonRef}
        endPageButtonRef={endPageButtonRef}
        chatButtonRef={chatButtonRef}
      />
      <Game />
      <ExperienceBar xp={player?.xp ?? 0} />
      <Keyboard layout={layout} />
      <Credits />
    </main>
  );
}

export default Main;
