import { Achievement } from '../AchievementsStack/Achievement/Achievement';
import { AchievementIcon } from '../AchievementsStack/Achievement/utils';
import Button from '../../ui/Button/Button';
import TextField from '../../ui/TextField/TextField';
import MinecraftToast from '../../ui/MinecraftToast/MinecraftToast';
import classes from './CustomWord.module.css';
import { JSX, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useGameStore from '../../stores/useGameStore';
import useUIStore from '../../stores/useUIStore';

interface CustomWordProps {
  customWordButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function CustomWord({ customWordButtonRef }: CustomWordProps): JSX.Element {
  const { t } = useTranslation();
  const addAchievement = useGameStore((s) => s.addAchievement);
  const setVisibility = useUIStore((s) => s.setVisibility);
  const navigate = useNavigate();
  const { lang = 'fr' } = useParams<{ lang: string }>();

  const [customWord, setCustomWord] = useState<string>('');

  function validate() {
    if (!/^[a-zA-Z]{2,}$/.test(customWord)) {
      addAchievement(new Achievement(t('customWord.achievementTitle'), t('customWord.achievementText'), AchievementIcon.QUESTION));
      return;
    }

    const encodedWord = btoa(customWord.toUpperCase());
    navigate(`/quotidien/${lang}/c/${encodedWord}`);
  }

  return (
    <MinecraftToast id="customWord" toastButtonRef={customWordButtonRef} className={classes.customWord}>
      <p>{t('customWord.title')}</p>
      <TextField className={classes.textField} onChange={(e) => setCustomWord(e.target.value)} pattern={'[a-zA-Z]+'} autoFocus />
      <Button text={t('customWord.start')} onClick={validate} />
      <Button text={t('common.close')} onClick={() => setVisibility('customWord', false)} />
    </MinecraftToast>
  );
}

export default CustomWord;
