import { useState, useEffect } from "react";

const useShortcuts = () => {
  const [showTab, setShowTab] = useState(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showCustomWord, setShowCustomWord] = useState<boolean>(false);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Tab") {
      event.preventDefault();
      setShowTab(true);
    } else if (event.key === "Escape") {
      setShowTab(false);
      setShowStats(false);
      setShowCustomWord(false);
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === "Tab") {
      event.preventDefault();
      setShowTab(false);
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

  return { showTab, setShowTab, showStats, setShowStats, showCustomWord, setShowCustomWord, handleKeyDown };
};

export default useShortcuts;
