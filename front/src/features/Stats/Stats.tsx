import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './Stats.module.css';
import Button from '../../ui/Button/Button';
import Screen from '../../ui/Screen/Screen';
import useGameStore from '../../stores/useGameStore';
import useUIStore from '../../stores/useUIStore';
import { UI } from '../../ui/ids';

interface StatsProps {
  onBack?: () => void;
}

function Stats({ onBack }: StatsProps): JSX.Element {
  const { t } = useTranslation();
  const scores = useGameStore((s) => s.scores);
  const setVisibility = useUIStore((s) => s.setVisibility);

  const close = onBack ?? (() => setVisibility(UI.STATS, false));

  const total = Object.values(scores).reduce((sum, count) => sum + count, 0);

  const entries: { label: string; value: number }[] = [
    { label: t('stats.gamesPlayed'), value: total },
    ...Object.keys(scores)
      .map(Number)
      .sort((a, b) => a - b)
      .map((tries) => ({ label: t('stats.solvedIn', { count: tries }), value: scores[tries] })),
  ];

  const content = (
    <>
      <div className={classes.title}>{t('stats.title')}</div>

      <div className={classes.list}>
        {entries.map(({ label, value }) => (
          <div className={classes.row} key={label}>
            <span className={classes.label}>{label}</span>
            <span className={classes.dots} />
            <span className={classes.value}>{value}</span>
          </div>
        ))}
      </div>

      <Button text={onBack ? t('common.back') : t('common.close')} onClick={close} />
    </>
  );

  if (onBack) return <>{content}</>;
  return <Screen id={UI.STATS}>{content}</Screen>;
}

export default Stats;
