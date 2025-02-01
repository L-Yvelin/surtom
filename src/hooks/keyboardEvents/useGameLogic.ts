import { useState } from "react";
import {
  Achievement,
  AchievementProps,
} from "../../components/AchievementsStack/Achievement/Achievement";
import { AchievementIcon } from "../../components/AchievementsStack/Achievement/utils";
import { Word, LetterState, Tries } from "../../components/Main/Grid/types";
import {
  isGuessValid,
  validateWord,
  areWinningColors,
} from "../../utils/gameLogic";

const useGameLogic = (
  addAchievement: (achievement: AchievementProps) => void,
  solution: string,
  gameFinished: boolean,
  setGameFinished: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const [letters, setLetters] = useState<Word>([
    { letter: solution[0], state: LetterState.Correct },
  ]);
  const [tries, setTries] = useState<Tries>([]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (gameFinished) return;

    if (/^[a-zA-Z]$/.test(event.key)) {
      setLetters((prev) =>
        prev.length < solution.length
          ? [...prev, { letter: event.key.toLowerCase() }]
          : prev
      );
    } else if (event.key === "Backspace") {
      setLetters((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    } else if (event.key === "Enter") {
      processGuess();
    }
  };

  const processGuess = () => {
    const guess = letters.map((l) => l.letter).join("");

    if (isGuessValid(guess, solution)) {
      const guessColors = validateWord(guess, solution);
      setTries((prev) => [
        ...prev,
        letters.map((l, i) => ({ ...l, state: guessColors[i] })),
      ]);

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
    addAchievement(
      new Achievement("VICTOIRE !", "👏👏👏", AchievementIcon.BOOK)
    );
  };

  const resetLetters = () => {
    setLetters([{ letter: solution[0], state: LetterState.Correct }]);
  };

  return { letters, setLetters, tries, setTries, gameFinished, handleKeyDown };
};

export default useGameLogic;
