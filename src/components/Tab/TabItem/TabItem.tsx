import { JSX } from "react";
import classes from "./TabItem.module.css";
import { getPlayerColor, rank } from "../../../utils/Player";
import TabTools from "./TabTools/TabTools";
import phoneIcon from "../../../assets/images/tools/phone.png";
import computerIcon from "../../../assets/images/tools/computer.png";

interface TabItemProps {
  user?: {
    name: string;
    isModerator: number;
    isMobile: boolean;
  };
}

function TabItem({ user }: TabItemProps): JSX.Element {
  if (!user) return <div className={classes.player}></div>;

  return (
    <div className={classes.player}>
      <img
        src={user.isMobile ? phoneIcon : computerIcon}
        alt="User's device"
        className={classes.icon}
      />
      <div
        className={classes.name}
        style={{ color: getPlayerColor(user.isModerator, user.name) }}
      >
        {user.name}
      </div>
      {user.isModerator > 0 && (
        <span className={classes.rank}>[{rank[user.isModerator] ?? "?"}]</span>
      )}
      <div className={classes.tools}>
        <TabTools />
      </div>
    </div>
  );
}

export default TabItem;
