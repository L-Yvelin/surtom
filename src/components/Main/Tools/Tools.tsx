import { JSX } from "react";
import classes from "./Tools.module.css";
import tabImage from "../../../assets/images/tools/multiplayer.png";
import tabScore from "../../../assets/images/tools/stats2.png";
import tabLectern from "../../../assets/images/tools/lectern.webp";
import tabChat from "../../../assets/images/tools/chat.webp";
import tabBook from "../../../assets/images/tools/book_and_quill.webp";
import tabLampOff from "../../../assets/images/tools/lamp-off.webp";
import tabLampOn from "../../../assets/images/tools/lamp-on.webp";
import MinecraftTooltip from "../../Tooltip/MinecraftTooltip/MinecraftTooltip";
import Tooltip from "../../Tooltip/Tooltip";
import classNames from "classnames";
import useGameStore from "../../../stores/useGameStore";
import useUIStore from "../../../stores/useUIStore";

export enum Theme {
  DARK = "DARK",
  LIGHT = "LIGHT",
}

interface ToolsProps {
  theme: Theme;
  setTheme: (newTheme: Theme) => void;
  tabButtonRef: React.RefObject<HTMLButtonElement | null>;
  statsButtonRef: React.RefObject<HTMLButtonElement | null>;
  customWordButtonRef: React.RefObject<HTMLButtonElement | null>;
  endPageButtonRef: React.RefObject<HTMLButtonElement | null>;
  chatButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function Tools({
  theme,
  setTheme,
  tabButtonRef,
  statsButtonRef,
  endPageButtonRef,
  chatButtonRef,
  customWordButtonRef,
}: ToolsProps): JSX.Element {
  const { playerList, gameFinished } = useGameStore();
  const { toggle } = useUIStore();

  const nbUsers = playerList.length;

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
              onClick={() => toggle("showTab")}
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
              onClick={() => toggle("showStats")}
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
              ref={endPageButtonRef}
              onClick={() => gameFinished && toggle("showEndPage")}
            >
              <img
                src={tabLectern}
                alt="End page icon"
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
            <button
              className={classes.tool}
              ref={chatButtonRef}
              onClick={() => toggle("showChat")}
            >
              <div id="chat-notification-circle"></div>
              <img
                src={tabChat}
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
              onClick={() => toggle("showCustomWord")}
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
