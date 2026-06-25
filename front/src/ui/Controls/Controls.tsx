import { JSX, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './Controls.module.css';
import Button from '../Button/Button';
import Screen from '../Screen/Screen';
import useUIStore from '../../stores/useUIStore';
import { useSettingsStore, KEYBIND_ACTIONS, type KeybindAction } from '../../stores/useSettingsStore';
import { UI } from '../ids';

const MODIFIER_KEYS = ['Shift', 'Control', 'Alt', 'Meta'];

const KEY_LABELS: Record<string, string> = {
  ' ': 'Space',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Escape: 'Esc',
};

function formatKey(key: string): string {
  if (!key) return '—';
  if (KEY_LABELS[key]) return KEY_LABELS[key];
  return key.length === 1 ? key.toUpperCase() : key;
}

function Controls(): JSX.Element {
  const { t } = useTranslation();
  const setVisibility = useUIStore((s) => s.setVisibility);
  const keybindings = useSettingsStore((s) => s.keybindings);
  const setKeybinding = useSettingsStore((s) => s.setKeybinding);
  const resetKeybindings = useSettingsStore((s) => s.resetKeybindings);
  const [listening, setListening] = useState<KeybindAction | null>(null);

  useEffect(() => {
    if (!listening) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      event.preventDefault();
      event.stopPropagation();
      if (MODIFIER_KEYS.includes(event.key)) return;
      if (event.key !== 'Escape') setKeybinding(listening, event.key);
      setListening(null);
    };
    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [listening, setKeybinding]);

  return (
    <Screen id={UI.CONTROLS}>
      <div className={classes.title}>{t('controls.title')}</div>

      <div className={classes.mainContent}>
        <div className={classes.list}>
          {KEYBIND_ACTIONS.map((action) => (
            <div key={action} className={classes.row}>
              <span className={classes.label}>{t(`controls.${action}`)}</span>
              <Button
                text={listening === action ? t('controls.pressKey') : formatKey(keybindings[action])}
                onClick={() => setListening(action)}
                className={classes.bindButton}
              />
            </div>
          ))}
        </div>

        <div className={classes.actions}>
          <Button text={t('controls.reset')} onClick={resetKeybindings} className={classes.action} />
          <Button text={t('controls.done')} onClick={() => setVisibility(UI.CONTROLS, false)} className={classes.action} />
        </div>
      </div>
    </Screen>
  );
}

export default Controls;
