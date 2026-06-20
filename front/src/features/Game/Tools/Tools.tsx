import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './Tools.module.css';
import MinecraftTooltip from '../../../ui/Tooltip/MinecraftTooltip/MinecraftTooltip';
import Tooltip from '../../../ui/Tooltip/Tooltip';
import classNames from 'classnames';
import { useGameStore } from '../../../stores/useGameStore';
import useUIStore from '../../../stores/useUIStore';
import useTheme from '../../../hooks/useTheme';
import { Theme } from '../../../theme/theme';
import { UI } from '../../../ui/ids';
import { useTexture } from '../../../stores/useResourcePackStore';
import Button from '../../../ui/Button/Button';

interface ToolsProps {
  tabButtonRef: React.RefObject<HTMLButtonElement | null>;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
  chatButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function Tools({ tabButtonRef, menuButtonRef, chatButtonRef }: ToolsProps): JSX.Element {
  const { t } = useTranslation();
  const playerList = useGameStore((s) => s.playerList);
  const toggle = useUIStore((s) => s.toggle);
  const { theme, setTheme } = useTheme();
  const tabLampOff = useTexture('block/redstone_lamp.png');
  const tabLampOn = useTexture('block/redstone_lamp_on.png');
  const tabChat = useTexture('gui/sprites/toast/social_interactions.png');
  const tabPlayers = useTexture('gui/sprites/friends/friends.png');

  const nbUsers = playerList.length;

  const changeTheme = () => setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK);

  return (
    <div className={classes.toolbar}>
      <div className={classNames(classes.tools, classes.leftTools)}>
        <Tooltip
          tooltipContent={<MinecraftTooltip title={t('tools.menuTitle')} children={t('tools.menuHint')} />}
          className={classes.optionsButtonWrapper}
          as="div"
        >
          <Button
            className={classes.optionsButton}
            ref={menuButtonRef}
            shouldMarquee={false}
            text={t('tools.menuTitle')}
            onClick={() => toggle(UI.GAME_MENU)}
            aria-label={t('tools.menuAlt')}
          />
        </Tooltip>
        <Tooltip tooltipContent={<MinecraftTooltip title={t('tools.playersTitle')} children={t('tools.playersHint')} />}>
          <button
            className={classNames(classes.tool, classes.voirTab)}
            data-user-count={nbUsers}
            onClick={() => toggle(UI.TAB)}
            ref={tabButtonRef}
          >
            <img src={tabPlayers} alt={t('tools.playersAlt')} className={classes.toolImage} />
          </button>
        </Tooltip>
      </div>
      <div className={classNames(classes.tools, classes.rightTools)}>
        <Tooltip tooltipContent={<MinecraftTooltip title={t('tools.chatTitle')} children={t('tools.chatHint')} />}>
          <button className={classNames(classes.tool, classes.chatButton)} ref={chatButtonRef} onClick={() => toggle(UI.CHAT)}>
            <div id="chat-notification-circle"></div>
            <div className={classes.chatIconClip}>
              <img src={tabChat} alt={t('tools.chatAlt')} className={classNames(classes.toolImage, classes.chatIcon)} />
            </div>
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
