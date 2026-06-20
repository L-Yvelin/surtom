import { JSX, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useBlockInput } from '../../stores/useInputStore';
import { UI } from '../ids';
import useGameStore from '../../stores/useGameStore';
import { COSMETIC_MS, isWorldReady } from './utils';
import classes from './WorldLoading.module.css';

function WorldLoading(): JSX.Element {
  const { t } = useTranslation();
  const [cosmeticDone, setCosmeticDone] = useState(false);
  const solution = useGameStore((s) => s.solution);
  const ready = isWorldReady(cosmeticDone, solution);

  useBlockInput(UI.WORLD_LOADING, !ready);

  useEffect(() => {
    const timer = setTimeout(() => setCosmeticDone(true), COSMETIC_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={classNames(classes.screen, { [classes.hidden]: ready })}>
      <div className={classes.label}>{t('worldLoading.label')}</div>
      <div className={classes.bar}>
        <div className={classes.fill} />
      </div>
    </div>
  );
}

export default WorldLoading;
