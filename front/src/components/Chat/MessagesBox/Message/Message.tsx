import { JSX } from "react";
import classes from "./Message.module.css";
import { ChatPlayer, MessageType } from "../../Chat";
import { getPlayerColor } from "../../../../utils/Player";
import MessageTool from "./MessageTool/MessageTool";
import classNames from "classnames";
import SwipeActions from "../../../Widgets/SwipeActions/SwipeActions";

interface MessageProps {
  id: string;
  type: MessageType;
  player: ChatPlayer;
  text?: string;
}

function MessageLine({ id, type, player, text }: MessageProps): JSX.Element {
  const handleRespond = (id: string) => {
    console.log("Responding to message with id", id);
  };

  const handleDelete = (id: string) => {
    console.log("Deleting message with id", id);
  };

  return (
    <SwipeActions
      direction="left"
      onSwipeOne={() => handleRespond(id)}
      onSwipeTwo={() => handleDelete(id)}
    >
      <div className={classNames(classes.message, classes.content)} id={id}>
        {player.name ? (
          <span className={classes.username}>
            &lt;
            <span
              style={{ color: getPlayerColor(player.isModerator, player.name) }}
            >
              {player.name}
            </span>
            &gt;&nbsp;
          </span>
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
        <div className={classes.tool}>
          <MessageTool
            onDelete={() => handleDelete(id)}
            onRespond={() => handleRespond(id)}
          />
        </div>
      </div>
    </SwipeActions>
  );
}

export default MessageLine;
