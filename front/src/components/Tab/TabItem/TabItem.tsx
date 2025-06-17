import { JSX } from "react";
import classes from "./TabItem.module.css";
import { getPlayerColor, rank } from "../../Chat/utils";
import TabTools from "./TabTools/TabTools";
import phoneIcon from "../../../assets/images/tools/phone.png";
import computerIcon from "../../../assets/images/tools/computer.png";
import { Server } from "../../../../../interfaces/Message";

interface TabItemProps {
  user?: Server.User;
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
        style={{ color: getPlayerColor(user.moderatorLevel, user.name) }}
      >
        {user.name}
      </div>
      {Object.keys(rank).includes(`${user.moderatorLevel}`) && (
        <span className={classes.rank}>
          [{rank[user.moderatorLevel as keyof typeof rank] ?? "?"}]
        </span>
      )}
      <div className={classes.tools}>
        <TabTools />
      </div>
    </div>
  );
}

export default TabItem;
