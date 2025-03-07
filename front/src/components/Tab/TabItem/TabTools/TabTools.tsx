import classes from "./TabTools.module.css";
import chatBubble from "../../../../assets/images/tools/chat.webp";
import greenBars from "../../../../assets/images/tools/green_bars.png";
import { JSX } from "react";
import classNames from "classnames";

function TabTools(): JSX.Element {
  return (
    <div className={classes.tools}>
      <img
        src={chatBubble}
        alt="Send private message"
        className={classNames(classes.icon, classes.message)}
      />
      <img src={greenBars} alt="Connectivity" className={classes.icon} />
    </div>
  );
}

export default TabTools;
