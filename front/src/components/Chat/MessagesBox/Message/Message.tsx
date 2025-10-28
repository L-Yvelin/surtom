import { JSX, memo } from "react";
import classes from "./Message.module.css";
import { Server, Client } from "@surtom/interfaces";
import MessageTool from "./MessageTool/MessageTool";
import classNames from "classnames";
import SwipeActions from "../../../Widgets/SwipeActions/SwipeActions";
import useChatStore from "../../../../stores/useChatStore";
import CustomContextMenu from "../../../CustomContextMenu/CustomContextMenu";
import MessageContextMenu from "./MessageContextMenu/MessageContextMenu";
import useGameStore from "../../../../stores/useGameStore";
import answerIcon from "../../../../assets/images/ui/answer.svg";
import deleteIcon from "../../../../assets/images/ui/delete.svg";
import {
  isSavedChatMessage,
  isScoreMessage,
  isStatusMessage,
  isTextMessage,
} from "../../utils";
import { isMobile } from "react-device-detect";
import StatusContent from "./Content/StatusContent";
import ScoreContent from "./Content/ScoreContent";
import UserContent from "./Content/UserContent";
import { useWebSocketStore } from "../../../../stores/useWebSocketStore";

const MessageContent = ({
  message,
}: {
  message: Server.ChatMessage.Type;
}): JSX.Element => {
  if (isStatusMessage(message)) {
    return <StatusContent message={message} />;
  } else if (isSavedChatMessage(message)) {
    if (isScoreMessage(message)) {
      return <ScoreContent message={message} />;
    } else if (isTextMessage(message)) {
      return <UserContent message={message} />;
    } else {
      console.log(`Unknown type: ${message}`);
      return <></>;
    }
  } else {
    console.log(`Unknown type: ${message}`);
    return <></>;
  }
};

function Message({
  message,
}: {
  message: Server.ChatMessage.Type;
}): JSX.Element {
  const { setAnsweringTo, focusInput } = useChatStore();
  const { sendMessage } = useWebSocketStore();
  const username = useGameStore((state) => state.player.name);
  const myModeratorLevel = useGameStore((state) => state.player.moderatorLevel);

  let id = "";
  let user: { name: string; moderatorLevel: number } = {
    name: "",
    moderatorLevel: 0,
  };
  if (isTextMessage(message) || isScoreMessage(message)) {
    id = message.content.id;
    user = message.content.user;
  }

  const handleRespond = (id: string) => {
    setAnsweringTo(id);
    focusInput();
  };

  const handleDelete = (id: string) => {
    const intId = parseInt(id);
    sendMessage({
      type: Client.MessageType.DELETE_MESSAGE,
      content: intId,
    });
    console.log(`Deleting message with id: ${id}`);
  };

  const date = new Date(message.content.timestamp);
  const timeString = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <CustomContextMenu
      menuContent={
        <MessageContextMenu
          actions={[
            ...(isSavedChatMessage(message) && id
              ? [
                  {
                    label: "Répondre",
                    icon: answerIcon,
                    onClick: () => handleRespond(id),
                  },
                ]
              : []),
            ...(!isSavedChatMessage(message) ||
            (user && myModeratorLevel > user.moderatorLevel) ||
            user.name === username
              ? [
                  {
                    label: "Supprimer",
                    icon: deleteIcon,
                    onClick: () => handleDelete(id),
                  },
                ]
              : []),
          ]}
        />
      }
      offset={5}
    >
      {isMobile ? (
        <SwipeActions
          direction="left"
          onSwipeOne={() => handleRespond(id)}
          onSwipeTwo={() => handleDelete(id)}
        >
          <div className={classNames(classes.message)} id={id}>
            <div className={classes.content}>
              <MessageContent message={message} />
            </div>
          </div>
          <div className={classes.tool}>
            <MessageTool
              onDelete={() => handleDelete(id)}
              onRespond={() => handleRespond(id)}
            />
          </div>
        </SwipeActions>
      ) : (
        <div className={classNames(classes.message)} id={id}>
          <div className={classes.content}>
            <MessageContent message={message} />
          </div>
          <p className={classes.timestamp}>{timeString}</p>
        </div>
      )}
    </CustomContextMenu>
  );
}

export default memo(Message);
