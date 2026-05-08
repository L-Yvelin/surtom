import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './Credits.module.css';
import Tooltip from '../../../ui/Tooltip/Tooltip';
import MinecraftTooltip from '../../../ui/Tooltip/MinecraftTooltip/MinecraftTooltip';

function Credits(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className={classes.credits}>
      {t('common.credits')}:{' '}
      <Tooltip
        children={
          <a href="https://sutom.nocle.fr" target="_blank" className={classes.nocle} rel="noreferrer">
            ↦sutom.nocle.fr
          </a>
        }
        tooltipContent={<MinecraftTooltip title={'Suivi en justice par France TV'} children={'Me fais pas le même coup stp'} />}
      />
      ,{' '}
      <Tooltip
        children={<span className={classes.lowrd}>Lowrd</span>}
        tooltipContent={<MinecraftTooltip title={'Hammond Sus'} children={'The empire is pretty chill'} />}
      />
      ,{' '}
      <Tooltip
        children={<span className={classes.anxton}>Anxton</span>}
        tooltipContent={<MinecraftTooltip title={'WAWAWAWAWA'} children={'笨蛋'} />}
      />
      ,{' '}
      <Tooltip
        children={<span className={classes.embuscade}>Embuscade</span>}
        tooltipContent={<MinecraftTooltip title={'Un repère Galiléen'} children={'tah gros'} />}
      />
    </div>
  );
}

export default Credits;
