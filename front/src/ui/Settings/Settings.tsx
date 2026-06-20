import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './Settings.module.css';
import Button from '../Button/Button';
import Screen from '../Screen/Screen';
import useUIStore from '../../stores/useUIStore';
import { SUPPORTED_LOCALES, type Locale } from '../../i18n';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { RESOURCE_PACKS_TOAST_ID } from '../ResourcePacks/ResourcePacks';

export const SETTINGS_TOAST_ID = 'settings';

interface SettingsProps {
  onBack?: () => void;
}

function Settings({ onBack }: SettingsProps): JSX.Element {
  const { t, i18n } = useTranslation();
  const setVisibility = useUIStore((s) => s.setVisibility);
  const close = onBack ?? ((): void => setVisibility(SETTINGS_TOAST_ID, false));
  const cycleKeyboard = useSettingsStore((s) => s.cycleKeyboard);
  const cycleSound = useSettingsStore((s) => s.cycleSound);
  const keyboard = useSettingsStore((s) => s.keyboard);
  const sound = useSettingsStore((s) => s.sound);

  const currentLocale = (i18n.resolvedLanguage ?? i18n.language ?? 'fr').slice(0, 2) as Locale;
  const currentLocaleLabel = t(`settings.languageOption.${currentLocale}`);

  const cycleLocale = (): void => {
    const idx = SUPPORTED_LOCALES.indexOf(currentLocale);
    const next = SUPPORTED_LOCALES[(idx + 1) % SUPPORTED_LOCALES.length];
    void i18n.changeLanguage(next);
  };

  const content = (
    <>
      <div className={classes.title}>{t('settings.title')}</div>

      <div className={classes.mainContent}>
        <div className={classes.grid}>
          <Button text={`${t('settings.language')}: ${currentLocaleLabel}`} onClick={cycleLocale} className={classes.button} />
          <Button text={`${t('settings.keyboard')}: ${keyboard}`} onClick={cycleKeyboard} className={classes.button} />
          <Button
            text={`${t('settings.sound')}: ${sound ? t('settings.soundOn') : t('settings.soundOff')}`}
            onClick={cycleSound}
            className={classes.button}
          />
          <Button
            text={t('settings.resourcePacks')}
            onClick={() => setVisibility(RESOURCE_PACKS_TOAST_ID, true)}
            className={classes.button}
          />
        </div>

        <Button text={onBack ? t('common.back') : t('settings.done')} onClick={close} className={classes.button} />
      </div>
    </>
  );

  if (onBack) return <>{content}</>;
  return <Screen id={SETTINGS_TOAST_ID}>{content}</Screen>;
}

export default Settings;
