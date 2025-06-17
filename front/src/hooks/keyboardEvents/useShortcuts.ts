import { useEffect } from "react";
import useGameStore from "../../stores/useGameStore";
import useUIStore from "../../stores/useUIStore";

const useShortcuts = () => {
  const { setVisibility } = useUIStore();

  const { gameFinished } = useGameStore();

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Tab":
        event.preventDefault();
        setVisibility("showTab", true);
        break;
      case "Escape":
        setVisibility("showTab", false);
        setVisibility("showStats", false);
        setVisibility("showCustomWord", false);
        setVisibility("showEndPage", false);
        setVisibility("showChat", false);
        break;
      case "/":
        setVisibility("showChat", true);
        break;
      case "t":
        if (gameFinished()) {
          setVisibility("showChat", true);
          event.preventDefault();
        }
        break;
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === "Tab") {
      event.preventDefault();
      setVisibility("showTab", false);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return { handleKeyDown };
};

export default useShortcuts;
