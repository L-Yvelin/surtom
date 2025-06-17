import { useEffect } from "react";
import useShortcuts from "./useShortcuts";
import useGameLogic from "./useGameLogic";
import useGameStore from "../../stores/useGameStore";
import useUIStore from "../../stores/useUIStore";

const useKeyPress = () => {
  const { gameFinished } = useGameStore();
  const { isAnyInterfaceOpen } = useUIStore();

  const shortcutsState = useShortcuts();
  const gameLogicState = useGameLogic();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameFinished() || event.altKey) {
        shortcutsState.handleKeyDown(event);
      } else if (!isAnyInterfaceOpen() && !gameFinished()) {
        gameLogicState.handleKeyDown(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameFinished, gameLogicState, shortcutsState, isAnyInterfaceOpen]);

  return {
    ...shortcutsState,
    ...gameLogicState,
  };
};

export default useKeyPress;
