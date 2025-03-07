import { JSX } from "react";
import classes from "./Message.module.css";
import { ChatPlayer, MessageType } from "../../Chat";
import { getPlayerColor } from "../../../../utils/Player";

interface MessageProps {
  id: string;
  type: MessageType;
  player: ChatPlayer;
  text?: string;
}

function MessageLine({ id, type, player, text }: MessageProps): JSX.Element {
  return (
    <div className={classes.message}>
      {player.name ? (
        <span className={classes.username}>&lt;<span  style={{color: getPlayerColor(player.isModerator, player.name)}}>{player.name}</span>&gt;&nbsp;</span>
      ) : null}
      <span className={classes.text}>
        {(() => {
          switch (type) {
            case "tellraw":
            case "message":
              return text;
            case "score":
              return "Score";
            case "enhancedMessage":
              return "Enhanced message";
            default:
              return "Unknown type";
          }
        })()}
      </span>
    </div>
  );
}

export default MessageLine;
 