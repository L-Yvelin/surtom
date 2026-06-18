import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './Tools.module.css';
import tabImage from '../../../assets/images/tools/multiplayer.png';
import tabScore from '../../../assets/images/tools/stats2.png';
import tabLectern from '../../../assets/images/tools/lectern.webp';
import tabChat from '../../../assets/images/tools/chat.webp';
import tabBook from '../../../assets/images/tools/book_and_quill.webp';
import tabLampOff from '../../../assets/images/tools/lamp-off.webp';
import tabLampOn from '../../../assets/images/tools/lamp-on.webp';
import MinecraftTooltip from '../../../ui/Tooltip/MinecraftTooltip/MinecraftTooltip';
import Tooltip from '../../../ui/Tooltip/Tooltip';
import classNames from 'classnames';
import useGameStore from '../../../stores/useGameStore';
import useUIStore from '../../../stores/useUIStore';
import useTheme from '../../../hooks/useTheme';
import { Theme } from '../../../theme/theme';
import { isGameFinished } from '../utils/gameLogic';

interface ToolsProps {
  tabButtonRef: React.RefObject<HTMLButtonElement | null>;
  statsButtonRef: React.RefObject<HTMLButtonElement | null>;
  customWordButtonRef: React.RefObject<HTMLButtonElement | null>;
  endPageButtonRef: React.RefObject<HTMLButtonElement | null>;
  chatButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function Tools({ tabButtonRef, statsButtonRef, endPageButtonRef, chatButtonRef, customWordButtonRef }: ToolsProps): JSX.Element {
  const { t } = useTranslation();
  const playerList = useGameStore((s) => s.playerList);
  const gameFinished = useGameStore((s) => isGameFinished(s.tries));
  const toggle = useUIStore((s) => s.toggle);
  const { theme, setTheme } = useTheme();

  const nbUsers = playerList.length;

  const changeTheme = () => setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK);

  return (
    <div className={classes.toolbar}>
      <div className={classNames(classes.tools, classes.leftTools)}>
        <Tooltip tooltipContent={<MinecraftTooltip title={t('tools.playersTitle')} children={t('tools.playersHint')} />}>
          <button
            className={classNames(classes.tool, classes.voirTab)}
            data-user-count={nbUsers}
            onClick={() => toggle('tab')}
            ref={tabButtonRef}
          >
            <img src={tabImage} alt={t('tools.playersAlt')} className={classes.toolImage} />
          </button>
        </Tooltip>
        <Tooltip tooltipContent={<MinecraftTooltip title={t('tools.statsTitle')} children={t('tools.statsHint')} />}>
          <button className={classes.tool} ref={statsButtonRef} onClick={() => toggle('stats')}>
            <img src={tabScore} alt={t('tools.statsAlt')} className={classes.toolImage} />
          </button>
        </Tooltip>
      </div>
      <div className={classNames(classes.tools, classes.rightTools)}>
        <Tooltip tooltipContent={<MinecraftTooltip title={t('tools.scoreTitle')} children={t('tools.scoreHintLocked')} />}>
          <button
            className={classNames(!gameFinished ? classes.disabled : undefined, classes.tool)}
            ref={endPageButtonRef}
            onClick={() => gameFinished && toggle('endPage')}
          >
            <img src={tabLectern} alt={t('tools.scoreAlt')} className={classes.toolImage} />
          </button>
        </Tooltip>
        <Tooltip tooltipContent={<MinecraftTooltip title={t('tools.chatTitle')} children={t('tools.chatHint')} />}>
          <button className={classes.tool} ref={chatButtonRef} onClick={() => toggle('chat')}>
            <div id="chat-notification-circle"></div>
            <img src={tabChat} alt={t('tools.chatAlt')} className={classes.toolImage} />
          </button>
        </Tooltip>
        <Tooltip tooltipContent={<MinecraftTooltip title={t('tools.customWordTitle')} children={t('tools.customWordHint')} />}>
          <button className={classes.tool} onClick={() => toggle('customWord')} ref={customWordButtonRef}>
            <img src={tabBook} alt={t('tools.customWordAlt')} className={classes.toolImage} />
          </button>
        </Tooltip>
        <Tooltip tooltipContent={<MinecraftTooltip title={t('tools.themeTitle')} children={t('tools.themeHint')} />}>
          <button className={classes.tool} onClick={() => changeTheme()}>
            <img src={theme === Theme.LIGHT ? tabLampOn : tabLampOff} alt={t('tools.themeAlt')} className={classes.toolImage} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

export default Tools;
