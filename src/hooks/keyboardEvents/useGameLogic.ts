import { useEffect } from "react";
import { Achievement } from "../../components/AchievementsStack/Achievement/Achievement";
import { AchievementIcon } from "../../components/AchievementsStack/Achievement/utils";
import { LetterState } from "../../components/Main/Game/Grid/types";
import {
  isGuessValid,
  validateWord,
  areWinningColors,
} from "../../utils/gameLogic";
import useGameStore from "../../stores/useGameStore";
import useUIStore from "../../stores/useUIStore";

const useGameLogic = () => {
  const {
    letters,
    setLetters,
    addTry,
    setGameFinished,
    solution,
    addAchievement,
  } = useGameStore();

  const { setVisibility } = useUIStore();

  useEffect(() => {
    setLetters([{ letter: solution[0], state: LetterState.Correct }]);
  }, [solution, setLetters]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (/^[a-zA-Z]$/.test(event.key)) {
      setLetters(
        letters.length < solution.length
          ? [...letters, { letter: event.key.toLowerCase() }]
          : letters
      );
    } else if (event.key === "Backspace") {
      if (event.ctrlKey) {
        setLetters(letters.slice(0, 1));
      } else {
        setLetters(letters.length > 1 ? letters.slice(0, -1) : letters);
      }
    } else if (event.key === "Enter") {
      processGuess();
    }
  };

  const processGuess = () => {
    const guess = letters.map((l) => l.letter).join("");

    if (isGuessValid(guess, solution)) {
      const guessColors = validateWord(guess, solution);
      const newTry = letters.map((l, i) => ({ ...l, state: guessColors[i] }));
      addTry(newTry);

      if (areWinningColors(guessColors)) {
        handleWin();
      } else {
        resetLetters();
      }
    } else {
      addAchievement(
        new Achievement(
          "Succès obtenu",
          "Ne pas savoir écrire",
          AchievementIcon.BOOK
        )
      );
    }
  };

  const handleWin = () => {
    setLetters([]);
    setGameFinished(true);
    setVisibility("showEndPage", true);
    addAchievement(
      new Achievement("VICTOIRE !", "👏👏👏", AchievementIcon.BOOK)
    );
  };

  const resetLetters = () => {
    setLetters([{ letter: solution[0], state: LetterState.Correct }]);
  };

  return { handleKeyDown };
};

export default useGameLogic;
