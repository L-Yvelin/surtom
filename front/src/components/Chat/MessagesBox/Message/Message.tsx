import { JSX } from "react";
import classes from "./Message.module.css";
import { ChatPlayer, MessageType } from "../../Chat";
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

interface MessageProps {
  id: string;
  type: MessageType;
  player: ChatPlayer;
  text?: string;
}

const PlayerName = ({ name, isModerator }: ChatPlayer) => (
  <span
    style={{
      color: getPlayerColor(isModerator, name),
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
    onClickAction?: string
  ) => {
    return (
      <span
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
      >
        {text}
      </span>
    );
  };

  return Array.isArray(parsedContent) ? (
    <>
      {parsedContent.map((message) =>
        createMessage(message.text, message.color, message.clickable)
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

export const MessageContent = ({
  id,
  type,
  player,
  text,
}: MessageProps): JSX.Element => {
  return (
    <div className={classNames(classes.message, classes.content)} id={id}>
      {player.name && ["message", "enhancedMessage"].includes(type) ? (
        <span className={classes.username}>
          &lt;
          <PlayerName name={player.name} isModerator={player.isModerator} />
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
              return (
                <span className={classes.score}>
                  <PlayerName
                    name={player.name}
                    isModerator={player.isModerator}
                  />{" "}
                  finit la partie en X essais ! (voir)
                </span>
              );
            case "enhancedMessage":
              return enhancedMessageContent(text ?? "");
            default:
              return "Unknown type";
          }
        })()}
      </span>
    </div>
  );
};

function MessageLine({ id, type, player, text }: MessageProps): JSX.Element {
  const { setAnsweringTo, focusInput } = useChatStore();
  const myModeratorLevel = useGameStore((state) => state.player.isModerator);

  const handleRespond = (id: string) => {
    console.log("Responding to message with id", id);
    setAnsweringTo(id);
    focusInput();
  };

  const handleDelete = (id: string) => {
    console.log("Deleting message with id", id);
  };

  return (
    <CustomContextMenu
      menuContent={
        <MessageContextMenu
          actions={[
            {
              label: "Répondre",
              icon: answerIcon,
              onClick: () => handleRespond(id),
            },
            ...(myModeratorLevel > player.isModerator
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
      <SwipeActions
        direction="left"
        onSwipeOne={() => handleRespond(id)}
        onSwipeTwo={() => handleDelete(id)}
      >
        <MessageContent id={id} type={type} player={player} text={text} />
        <div className={classes.tool}>
          <MessageTool
            onDelete={() => handleDelete(id)}
            onRespond={() => handleRespond(id)}
          />
        </div>
      </SwipeActions>
    </CustomContextMenu>
  );
}

export default MessageLine;
