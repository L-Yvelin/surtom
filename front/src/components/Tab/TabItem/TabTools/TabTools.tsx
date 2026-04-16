import classes from './TabTools.module.css';
import greenBars from '../../../../assets/images/tools/green_bars.png';
import { JSX } from 'react';

function TabTools(): JSX.Element {
  return (
    <div className={classes.tools}>
      {/* <img
        src={chatBubble}
        alt="Send private message"
        className={classNames(classes.icon, classes.message)}
        onClick={(e) => {
          e.preventDefault();
          sendPrivateMessage(username);
        }}
      /> */}
      <img src={greenBars} alt="Connectivity" className={classes.icon} />
    </div>
  );
}

export default TabTools;
