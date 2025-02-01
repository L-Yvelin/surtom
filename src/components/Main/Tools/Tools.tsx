import { JSX } from "react";
import classes from "./Tools.module.css";
import tabImage from "../../../assets/images/tools/multiplayer.png";
import tabScore from "../../../assets/images/tools/stats2.png";
import tabLectern from "../../../assets/images/tools/lectern.webp";
import tabChat from "../../../assets/images/tools/chat.webp";
import tabChatCrossed from "../../../assets/images/tools/chat_crossed.webp";
import tabBook from "../../../assets/images/tools/book_and_quill.webp";
import tabLampOff from "../../../assets/images/tools/lamp-off.webp";
import tabLampOn from "../../../assets/images/tools/lamp-on.webp";
import MinecraftTooltip from "../../Tooltip/MinecraftTooltip/MinecraftTooltip";
import Tooltip from "../../Tooltip/Tooltip";
import classNames from "classnames";

export enum Theme {
  DARK = "DARK",
  LIGHT = "LIGHT",
}

interface ToolsProps {
  theme: Theme;
  setTheme: (newTheme: Theme) => void;
  nbUsers: number;
  gameFinished: boolean;
  isChatOpen: boolean;
  setShowTab: (value: (prev: boolean) => boolean) => void;
  tabButtonRef: React.RefObject<HTMLButtonElement | null>;
  statsButtonRef: React.RefObject<HTMLButtonElement | null>;
  setShowStats: (value: (prev: boolean) => boolean) => void;
  setShowCustomWord: (value: (prev: boolean) => boolean) => void;
  customWordButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function Tools({
  theme,
  setTheme,
  nbUsers,
  gameFinished,
  isChatOpen,
  setShowTab,
  tabButtonRef,
  statsButtonRef,
  setShowStats,
  setShowCustomWord,
  customWordButtonRef,
}: ToolsProps): JSX.Element {
  const changeTheme = () =>
    setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK);

  return (
    <div className={classes.toolbar}>
      <div className={classNames(classes.tools, classes.leftTools)}>
        <Tooltip
          element={
            <button
              className={classNames(classes.tool, classes.voirTab)}
              data-user-count={nbUsers}
              onClick={() => setShowTab((prev) => !prev)}
              ref={tabButtonRef}
            >
              <img
                src={tabImage}
                alt="User list icon"
                className={classes.toolImage}
              />
            </button>
          }
          tooltipContent={
            <MinecraftTooltip
              title="Joueurs connectés"
              content="Envoyez des messages privés en cliquant sur la bulle"
            />
          }
        />
        <Tooltip
          element={
            <button
              className={classes.tool}
              ref={statsButtonRef}
              onClick={() => setShowStats((prev) => !prev)}
            >
              <img
                src={tabScore}
                alt="Stats page icon"
                className={classes.toolImage}
              />
            </button>
          }
          tooltipContent={
            <MinecraftTooltip
              title="Statistiques"
              content="Combien de temps avez-vous perdu sur ce site ?"
            />
          }
        />
      </div>
      <div className={classNames(classes.tools, classes.rightTools)}>
        <Tooltip
          element={
            <button
              className={classNames(
                !gameFinished ? classes.disabled : undefined,
                classes.tool
              )}
            >
              <img
                src={tabLectern}
                alt="Score page icon"
                className={classes.toolImage}
              />
            </button>
          }
          tooltipContent={
            <MinecraftTooltip
              title="Voir le score"
              content="Veuillez d'abord finir la partie"
            />
          }
        />
        <Tooltip
          element={
            <button className={classes.tool}>
              <div id="chat-notification-circle"></div>
              <img
                src={isChatOpen ? tabChatCrossed : tabChat}
                alt="Chat page icon"
                className={classes.toolImage}
              />
            </button>
          }
          tooltipContent={
            <MinecraftTooltip
              title="Tchat en direct"
              content="Discutez avec la communauté et partagez votre score"
            />
          }
        />
        <Tooltip
          element={
            <button
              className={classes.tool}
              onClick={() => setShowCustomWord((prev) => !prev)}
              ref={customWordButtonRef}
            >
              <img
                src={tabBook}
                alt="Custom word icon"
                className={classes.toolImage}
              />
            </button>
          }
          tooltipContent={
            <MinecraftTooltip
              title="Mot personnalisé"
              content="Faites jouer vos amis avec votre propre mot"
            />
          }
        />
        <Tooltip
          element={
            <button className={classes.tool} onClick={() => changeTheme()}>
              <img
                src={theme === Theme.LIGHT ? tabLampOn : tabLampOff}
                alt="Theme changer icon"
                className={classes.toolImage}
              />
            </button>
          }
          tooltipContent={
            <MinecraftTooltip
              title="Changeur de thème"
              content="Customisez votre interface"
            />
          }
        />
      </div>
    </div>
  );
}

export default Tools;
