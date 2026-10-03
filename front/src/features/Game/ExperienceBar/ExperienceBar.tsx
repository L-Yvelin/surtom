import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { ExperienceBar as DesignSystemExperienceBar } from '@surtom/design-system';
import { useGameStore } from '../../../stores/useGameStore';

interface ExperienceBarProps {
  xp: number;
}

const XPTooltipContent = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <>
      <p>{t('experience.gainPerGame')}</p>
      <br />
      <p>{t('experience.gainWin')}</p>
      <br />
      <p>{t('experience.gainLoss')}</p>
      <br />
    </>
  );
};

function ExperienceBar({ xp }: ExperienceBarProps): JSX.Element {
  const { t } = useTranslation();
  const hasLoaded = useGameStore((s) => s.hasLoaded);

  return (
    <DesignSystemExperienceBar
      xp={xp}
      animate={hasLoaded}
      alt={t('experience.barAlt')}
      getTooltipTitle={({ current, total }) => t('experience.progress', { current, total })}
      tooltipContent={<XPTooltipContent />}
    />
  );
}

export default ExperienceBar;
