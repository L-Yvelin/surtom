import useClickOutside from "../../hooks/useClickOutside";
import {
  Achievement,
  AchievementProps,
} from "../AchievementsStack/Achievement/Achievement";
import { AchievementIcon } from "../AchievementsStack/Achievement/utils";
import Button from "../Widgets/Button/Button";
import TextField from "../Widgets/TextField/TextField";
import classes from "./CustomWord.module.css";
import { JSX, useRef, useState } from "react";

interface CustomWordProps {
  display: boolean;
  setShowCustomWord: (value: (prev: boolean) => boolean) => void;
  customWordButtonRef: React.RefObject<HTMLButtonElement | null>;
  showAchievement: (achievement: AchievementProps) => void;
}

function CustomWord({
  setShowCustomWord,
  customWordButtonRef,
  display,
  showAchievement,
}: CustomWordProps): JSX.Element {
  const [customWord, setCustomWord] = useState<string>("");
  const customWordRef = useRef(null);

  useClickOutside(customWordRef, () => setShowCustomWord(() => false), [
    customWordButtonRef,
  ]);

  function validate() {
    if (!/^[a-zA-Z]{2,}$/.test(customWord)) {
      showAchievement(
        new Achievement(
          "Succès obtenu !",
          "Jouer avec les limites",
          AchievementIcon.QUESTION
        )
      );
      return;
    }

    const encodedWord = btoa(customWord.toUpperCase());
    window.location.assign(`/${encodedWord}`);
  }

  return !display ? (
    <></>
  ) : (
    <div className={classes.customWord} ref={customWordRef}>
      <div className={classes.content}>
        <p>Mot personnalisé</p>
        <TextField
          className={classes.textField}
          onChange={(e) => setCustomWord(e.target.value)}
          pattern={"[a-zA-Z]+"}
          autoFocus
        />
        <Button text={"Lancer la partie"} onClick={validate} />
        <Button
          text={"Fermer"}
          onClick={() => setShowCustomWord(() => false)}
        />
      </div>
    </div>
  );
}

export default CustomWord;
