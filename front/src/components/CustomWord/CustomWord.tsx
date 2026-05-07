import { Achievement } from '../AchievementsStack/Achievement/Achievement';
import { AchievementIcon } from '../AchievementsStack/Achievement/utils';
import Button from '../Widgets/Button/Button';
import TextField from '../Widgets/TextField/TextField';
import MinecraftToast from '../MinecraftToast/MinecraftToast';
import classes from './CustomWord.module.css';
import { JSX, useState } from 'react';
import useGameStore from '../../stores/useGameStore';
import useUIStore from '../../stores/useUIStore';

interface CustomWordProps {
  customWordButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function CustomWord({ customWordButtonRef }: CustomWordProps): JSX.Element {
  const addAchievement = useGameStore((s) => s.addAchievement);
  const setVisibility = useUIStore((s) => s.setVisibility);

  const [customWord, setCustomWord] = useState<string>('');

  function validate() {
    if (!/^[a-zA-Z]{2,}$/.test(customWord)) {
      addAchievement(new Achievement('Succès obtenu !', 'Jouer avec les limites', AchievementIcon.QUESTION));
      return;
    }

    const encodedWord = btoa(customWord.toUpperCase());
    window.location.assign(`/${encodedWord}`);
  }

  return (
    <MinecraftToast id="customWord" toastButtonRef={customWordButtonRef} className={classes.customWord}>
      <p>Mot personnalisé</p>
      <TextField className={classes.textField} onChange={(e) => setCustomWord(e.target.value)} pattern={'[a-zA-Z]+'} autoFocus />
      <Button text={'Lancer la partie'} onClick={validate} />
      <Button text={'Fermer'} onClick={() => setVisibility('customWord', false)} />
    </MinecraftToast>
  );
}

export default CustomWord;
