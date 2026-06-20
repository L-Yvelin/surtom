import { JSX, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import classes from './MainMenu.module.css';
import Button from '../../ui/Button/Button';
import Tooltip from '../../ui/Tooltip/Tooltip';
import MinecraftTooltip from '../../ui/Tooltip/MinecraftTooltip/MinecraftTooltip';
import Credits from '../../features/Game/Credits/Credits';
import { UI } from '../../ui/ids';
import useUIStore from '../../stores/useUIStore';
import ButtonRow from '../../ui/ButtonRow/ButtonRow';

function MainMenu(): JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const toggle = useUIStore((s) => s.toggle);

  return (
    <>
      <div className={classes.menu}>
        <div data-backdrop className={classes.backdrop}></div>

        <div className={classes.buttons}>
          <Button text={t('mainMenu.daily')} onClick={() => navigate('/quotidien')} className={classes.primaryButton} />
          <Tooltip tooltipContent={<MinecraftTooltip title={t('mainMenu.competitive')} children={t('mainMenu.competitiveSoon')} />}>
            <div className={classes.tooltipWrapper}>
              <Button text={t('mainMenu.competitive')} disabled className={classes.primaryButton} />
            </div>
          </Tooltip>
          <ButtonRow>
            <Button
              ref={optionsButtonRef}
              text={t('mainMenu.options')}
              onClick={() => toggle(UI.SETTINGS)}
              className={classes.primaryButton}
            />
            <Tooltip tooltipContent={<MinecraftTooltip title={'???'} children={'🙅'} />}>
              <Button text={t('mainMenu.quit')} disabled className={classes.primaryButton} />
            </Tooltip>
          </ButtonRow>
        </div>

        <div className={classes.creditsWrapper}>
          <Credits />
        </div>
      </div>
    </>
  );
}

export default MainMenu;
