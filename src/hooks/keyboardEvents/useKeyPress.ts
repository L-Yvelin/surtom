import { useState, useEffect } from "react";
import useShortcuts from "./useShortcuts";
import useGameLogic from "./useGameLogic";
import { AchievementProps } from "../../components/AchievementsStack/Achievement/Achievement";

const useKeyPress = (
  addAchievement: (achievement: AchievementProps) => void,
  solution: string
) => {
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  const shortcutsState = useShortcuts();
  const gameLogicState = useGameLogic(
    addAchievement,
    solution,
    gameFinished,
    setGameFinished
  );

  useEffect(() => {
    const isAnyInterfaceOpen: boolean =
      shortcutsState.showTab ||
      shortcutsState.showStats ||
      shortcutsState.showCustomWord;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameFinished || event.metaKey || event.ctrlKey || event.altKey) {
        shortcutsState.handleKeyDown(event);
      } else if (!isAnyInterfaceOpen) {
        gameLogicState.handleKeyDown(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameFinished, gameLogicState, shortcutsState]);

  return {
    ...shortcutsState,
    ...gameLogicState,
    setGameFinished,
  };
};

export default useKeyPress;
