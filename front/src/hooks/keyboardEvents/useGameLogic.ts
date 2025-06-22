import { useEffect, useRef } from "react";
import { Achievement } from "../../components/AchievementsStack/Achievement/Achievement";
import { AchievementIcon } from "../../components/AchievementsStack/Achievement/utils";
import { LetterState } from "../../utils/Message";
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
    tries,
    addTry,
    solution,
    addAchievement,
    validWords,
  } = useGameStore();

  const { setVisibility } = useUIStore();
  const skipFirstLetter = useRef(true);

  useEffect(() => {
    if (!solution) return;
    setLetters([{ letter: solution[0], state: LetterState.Correct }]);
  }, [solution, setLetters]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!solution) return;
    if (event.key === "Backspace") {
      if (event.ctrlKey || event.metaKey) {
        setLetters(letters.slice(0, 1));
      } else {
        setLetters(letters.length > 1 ? letters.slice(0, -1) : letters);
      }
    } else if (event.metaKey || event.ctrlKey) {
      return;
    } else if (/^[a-zA-Z]$/.test(event.key)) {
      if (
        event.key.toUpperCase() === solution[0] &&
        letters.length === 1 &&
        skipFirstLetter.current
      ) {
        skipFirstLetter.current = false;
        return;
      }
      setLetters(
        letters.length < solution.length
          ? [...letters, { letter: event.key.toUpperCase() }]
          : letters
      );
      skipFirstLetter.current = true;
    } else if (event.key === "Enter") {
      processGuess();
    }
  };

  const processGuess = () => {
    if (!solution) return;
    const guess = letters
      .map((l) => l.letter)
      .join("")
      .toUpperCase();

    if (isGuessValid(guess, solution) && validWords.includes(guess)) {
      const guessColors = validateWord(guess, solution);
      const newTry = letters.map((l, i) => ({ ...l, state: guessColors[i] }));
      addTry(newTry);

      if (areWinningColors(guessColors)) {
        handleWin();
      } else if (tries.length === 5) {
        handleLoss();
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
    setVisibility("showEndPage", true);
    addAchievement(
      new Achievement("VICTOIRE !", "👏👏👏", AchievementIcon.BOOK)
    );
  };

  const handleLoss = () => {
    setLetters([]);
    setVisibility("showEndPage", true);
    addAchievement(
      new Achievement(
        "Perdu",
        "Vous avez perdu, mais vous pouvez réessayer demain !",
        AchievementIcon.BOOK
      )
    );
  };

  const resetLetters = () => {
    if (!solution) return;
    setLetters([{ letter: solution[0], state: LetterState.Correct }]);
  };

  return { handleKeyDown };
};

export default useGameLogic;
