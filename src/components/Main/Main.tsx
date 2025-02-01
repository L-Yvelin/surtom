import { JSX, useEffect, useState } from "react";
import Grid from "./Grid/Grid";
import { Tries } from "./Grid/types";
import classes from "./Main.module.css";
import { getChestLabel } from "./Grid/utils";
import Tools, { Theme } from "./Tools/Tools";
import Credits from "./Credits/Credits";
import Keyboard from "./Keyboard/Keyboard";
import { Player } from "../Tab/Tab";
import classNames from "classnames";
import { detectKeyboardLayout, KeyboardLayouts } from "./Keyboard/utils";
import ExperienceBar from "./ExperienceBar/ExperienceBar";

interface MainProps {
  solution: string;
  tries: Tries;
  player: Player;
  players: Player[];
  theme: Theme;
  setTheme: (newTheme: Theme) => void;
  setShowTab: (value: (prev: boolean) => boolean) => void;
  tabButtonRef: React.RefObject<HTMLButtonElement | null>;
  setShowStats: (value: (prev: boolean) => boolean) => void;
  statsButtonRef: React.RefObject<HTMLButtonElement | null>;
  setShowCustomWord: (value: (prev: boolean) => boolean) => void;
  customWordButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function Main({
  solution,
  tries,
  players,
  player,
  theme,
  setTheme,
  setShowTab,
  tabButtonRef,
  setShowStats,
  statsButtonRef,
  setShowCustomWord,
  customWordButtonRef,
}: MainProps): JSX.Element {
  const [layout, setLayout] = useState<KeyboardLayouts>(KeyboardLayouts.AZERTY);

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

  const getLevel: (xp: number) => number = (score: number) => {
    if (score <= 352) {
      return Math.sqrt(score + 9) - 3;
    }
    if (score <= 1507) {
      return 81 / 10 + Math.sqrt((2 / 5) * (score - 7839 / 40));
    }
    return 325 / 18 + Math.sqrt((2 / 9) * (score - 54215 / 72));
  };

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
        nbUsers={players.length}
        gameFinished={false}
        isChatOpen={false}
        setShowTab={setShowTab}
        tabButtonRef={tabButtonRef}
        statsButtonRef={statsButtonRef}
        setShowStats={setShowStats}
        setShowCustomWord={setShowCustomWord}
        customWordButtonRef={customWordButtonRef}
      />
      <div className={classes.coffre}>
        <div className={classes.coffreUi}>
          <p className={classes.chestLabel}>{getChestLabel(solution.length)}</p>
          <Grid solution={solution} tries={tries} />
        </div>
      </div>
      <ExperienceBar level={getLevel(player.xp)} />
      <Keyboard layout={layout} />
      <Credits />
    </main>
  );
}

export default Main;
