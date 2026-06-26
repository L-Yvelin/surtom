import { useEffect, useRef } from 'react';
import i18n from '../../../i18n';
import { Achievement } from '../../AchievementsStack/Achievement/Achievement';
import { AchievementIcon } from '../../AchievementsStack/Achievement/utils';
import { LetterState } from '@surtom/interfaces';
import { isGuessValid, validateWord, isGameFinished } from '../utils/gameLogic';
import { useGameStore } from '../../../stores/useGameStore';
import { useWebSocketStore } from '../../../stores/useWebSocketStore';
import { Client } from '@surtom/interfaces';

const useGameLogic = () => {
  const letters = useGameStore((s) => s.letters);
  const setLetters = useGameStore((s) => s.setLetters);
  const addTry = useGameStore((s) => s.addTry);
  const solution = useGameStore((s) => s.solution);
  const addAchievement = useGameStore((s) => s.addAchievement);
  const validWords = useGameStore((s) => s.validWords);
  const gameFinished = useGameStore((s) => isGameFinished(s.tries));

  const skipFirstLetter = useRef(true);
  const sendMessage = useWebSocketStore((s) => s.sendMessage);

  useEffect(() => {
    if (gameFinished) {
      setLetters([]);
      return;
    }
    if (!solution) return;
    setLetters([{ letter: solution[0], state: LetterState.Correct }]);
  }, [solution, setLetters, gameFinished]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!solution) return;
    if ((event.ctrlKey || event.altKey || event.metaKey) && event.key === 'Backspace') {
      setLetters([{ letter: solution[0], state: LetterState.Correct }]);
    } else if (event.key === 'Backspace') {
      setLetters(letters.length > 1 ? letters.slice(0, -1) : letters);
    } else if (/^[a-zA-Z]$/.test(event.key)) {
      if (event.key.toUpperCase() === solution[0] && letters.length === 1 && skipFirstLetter.current) {
        skipFirstLetter.current = false;
        return;
      }
      setLetters(letters.length < solution.length ? [...letters, { letter: event.key.toUpperCase() }] : letters);
      skipFirstLetter.current = true;
    } else if (event.key === 'Enter') {
      processGuess();
    }
  };

  const processGuess = () => {
    if (!solution) return;
    const guess = letters
      .map((l) => l.letter)
      .join('')
      .toUpperCase();

    if (isGuessValid(guess, solution) && validWords.includes(guess)) {
      sendMessage({ type: Client.MessageType.TRY, content: guess });
      const guessColors = validateWord(guess, solution);
      const newTry = letters.map((l, i) => ({ ...l, state: guessColors[i] }));
      addTry(newTry);
      resetLetters();
    } else {
      addAchievement(
        new Achievement(i18n.t('achievements.invalidWordTitle'), i18n.t('achievements.invalidWordSubtitle'), AchievementIcon.BOOK),
      );
    }
  };

  const resetLetters = () => {
    if (!solution) return;
    setLetters([{ letter: solution[0], state: LetterState.Correct }]);
  };

  return { handleKeyDown };
};

export default useGameLogic;
