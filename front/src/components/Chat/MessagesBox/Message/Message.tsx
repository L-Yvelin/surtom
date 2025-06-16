import { JSX } from "react";
import classes from "./Message.module.css";
import { Server } from "../../../../../../interfaces/Message";
import { getPlayerColor } from "../../../../utils/Player";
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
  isUserMessage,
  isEnhancedMessage,
} from "../../utils";
import { isMobile } from "react-device-detect";

const PlayerName = ({
  name,
  moderatorLevel,
}: Pick<Server.User, "name" | "moderatorLevel">) => (
  <span
    style={{
      color: getPlayerColor(moderatorLevel, name),
    }}
  >
    {name}
  </span>
);

const enhancedMessageContent = (text: string): JSX.Element => {
  type enhancedMessageContent = {
    text: string;
    color?: string;
    clickable?: string;
  };

  let parsedContent: enhancedMessageContent | enhancedMessageContent[];

  try {
    parsedContent = JSON.parse(text);
  } catch (err) {
    console.error("Error while parsing enhanced message", err);
    return <>Unable to generate message</>;
  }

  const createMessage = (
    text: string,
    color?: string,
    onClickAction?: string,
    key?: number
  ) => {
    return (
      <span
        key={key}
        style={{ color }}
        onClick={() => {
          if (onClickAction) {
            try {
              const action = new Function(onClickAction);
              action();
            } catch {
              console.error("Error while executing action", onClickAction);
            }
          }
        }}
        className={classNames({ [classes.clickable]: !!onClickAction })}
      >
        {text}
      </span>
    );
  };

  return Array.isArray(parsedContent) ? (
    <>
      {parsedContent.map((message, index) =>
        createMessage(message.text, message.color, message.clickable, index)
      )}
    </>
  ) : (
    createMessage(
      parsedContent.text,
      parsedContent.color,
      parsedContent.clickable
    )
  );
};

const MessageContent = ({
  message,
}: {
  message: Server.ChatMessage.Type;
}): JSX.Element => {
  if (isStatusMessage(message)) {
    return <span className={classes.text}>{message.content.text}</span>;
  } else if (isScoreMessage(message)) {
    return (
      <span>
        <PlayerName
          name={message.content.user.name}
          moderatorLevel={message.content.user.moderatorLevel}
        />{" "}
        <span className={classes.score}>
          finit la partie en {message.content.attempts?.length} essais ! <u>(voir)</u>
        </span>
      </span>
    );
  } else if (isSavedChatMessage(message)) {
    const user = message.content.user;
    return (
      <>
        {user?.name && (
          <span className={classes.username}>
            &lt;
            <PlayerName name={user.name} moderatorLevel={user.moderatorLevel} />
            &gt;&nbsp;
          </span>
        )}
        {isUserMessage(message) && (
          <>
            <span className={classes.text}>
              {isEnhancedMessage(message)
                ? enhancedMessageContent(message.content.text)
                : message.content.text}
            </span>
            {message.content.imageData ? (
              <div className={classes.image}>
                <img
                  src={message.content.imageData}
                  onError={(e) => e.currentTarget.remove()}
                />
              </div>
            ) : null}
          </>
        )}
      </>
    );
  } else {
    console.log(`Unknown type: ${message}`);
    return <></>;
  }
};

export default function Message({
  message,
}: {
  message: Server.ChatMessage.Type;
}): JSX.Element {
  const { setAnsweringTo, focusInput } = useChatStore();
  const username = useGameStore((state) => state.player.name);
  const myModeratorLevel = useGameStore((state) => state.player.moderatorLevel);

  const { id, user } = (message as Server.ChatMessage.User).content;

  const handleRespond = (id: string) => {
    setAnsweringTo(id);
    focusInput();
  };

  const handleDelete = (id: string) => {
    console.log(`Deleting message with id: ${id}`);
  };

  return (
    <CustomContextMenu
      menuContent={
        <MessageContextMenu
          actions={[
            ...(isSavedChatMessage(message)
              ? [
                  {
                    label: "Répondre",
                    icon: answerIcon,
                    onClick: () => handleRespond(id),
                  },
                ]
              : []),
            ...((user && myModeratorLevel > user.moderatorLevel) ||
            user.name === username ||
            !isSavedChatMessage(message)
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
          <div className={classNames(classes.message, classes.content)} id={id}>
            <MessageContent message={message} />
          </div>
          <div className={classes.tool}>
            <MessageTool
              onDelete={() => handleDelete(id)}
              onRespond={() => handleRespond(id)}
            />
          </div>
        </SwipeActions>
      ) : (
        <div className={classNames(classes.message, classes.content)} id={id}>
          <MessageContent message={message} />
        </div>
      )}
    </CustomContextMenu>
  );
}
