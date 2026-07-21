import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './Stats.module.css';
import Button from '../../ui/Button/Button';
import Screen from '../../ui/Screen/Screen';
import { useGameStore } from '../../stores/useGameStore';
import useUIStore from '../../stores/useUIStore';
import { UI } from '../../ui/ids';

interface StatsContentProps {
  onClose: () => void;
  closeLabel?: string;
}

export function StatsContent({ onClose, closeLabel }: StatsContentProps): JSX.Element {
  const { t } = useTranslation();
  const scores = useGameStore((s) => s.scores);

  const total = Object.values(scores).reduce((sum, count) => sum + count, 0);

  const entries: { label: string; value: number }[] = [
    { label: t('stats.gamesPlayed'), value: total },
    ...Array.from({ length: 6 }, (_, index) => index + 1).map((tries) => ({
      label: t('stats.solvedIn', { count: tries }),
      value: scores[tries] ?? 0,
    })),
    { label: t('stats.notFound'), value: scores[0] ?? 0 },
  ];

  return (
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

      <Button text={closeLabel ?? t('common.close')} onClick={onClose} />
    </>
  );
}

function Stats(): JSX.Element {
  const setVisibility = useUIStore((s) => s.setVisibility);
  return (
    <Screen id={UI.STATS}>
      <StatsContent onClose={() => setVisibility(UI.STATS, false)} />
    </Screen>
  );
}

export default Stats;
