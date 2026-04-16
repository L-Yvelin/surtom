import classNames from 'classnames';
import useClickOutside from '../../hooks/useClickOutside';
import { Achievement } from '../AchievementsStack/Achievement/Achievement';
import { AchievementIcon } from '../AchievementsStack/Achievement/utils';
import Button from '../Widgets/Button/Button';
import TextField from '../Widgets/TextField/TextField';
import classes from './CustomWord.module.css';
import { JSX, useRef, useState } from 'react';
import useGameStore from '../../stores/useGameStore';
import useUIStore from '../../stores/useUIStore';

interface CustomWordProps {
  customWordButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function CustomWord({ customWordButtonRef }: CustomWordProps): JSX.Element {
  const { addAchievement } = useGameStore();
  const { setVisibility, showCustomWord: display } = useUIStore();

  const [customWord, setCustomWord] = useState<string>('');
  const customWordRef = useRef(null);

  useClickOutside(customWordRef, () => setVisibility('showCustomWord', false), [customWordButtonRef]);

  function validate() {
    if (!/^[a-zA-Z]{2,}$/.test(customWord)) {
      addAchievement(new Achievement('Succès obtenu !', 'Jouer avec les limites', AchievementIcon.QUESTION));
      return;
    }

    const encodedWord = btoa(customWord.toUpperCase());
    window.location.assign(`/${encodedWord}`);
  }

  return (
    <div className={classNames(classes.customWord, { [classes.hidden]: !display })} ref={customWordRef}>
      <div className={classes.content}>
        <p>Mot personnalisé</p>
        <TextField className={classes.textField} onChange={(e) => setCustomWord(e.target.value)} pattern={'[a-zA-Z]+'} autoFocus />
        <Button text={'Lancer la partie'} onClick={validate} />
        <Button text={'Fermer'} onClick={() => setVisibility('showCustomWord', false)} />
      </div>
    </div>
  );
}

export default CustomWord;
