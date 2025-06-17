import { JSX } from "react";
import { Server } from "../../../../../../../interfaces/Message";
import classes from "../Message.module.css";
import PlayerName from "../PlayerName/PlayerName";
import {
  isUserMessage,
  extractImageUrls,
  isEnhancedMessage,
  extractUrls,
} from "../../../utils";
import classNames from "classnames";

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

function formatText(text: string): JSX.Element {
  const urls = extractUrls(text);
  if (urls.length === 0) return <p>{text}</p>;

  const result: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  urls.forEach((url) => {
    const index = text.indexOf(url, lastIndex);
    if (index === -1) return;

    if (index > lastIndex) {
      result.push(text.slice(lastIndex, index));
    }

    const displayText = url.split("/")[2];
    result.push(
      <a key={index} href={url} target="_blank" rel="noopener noreferrer" className={classes.link}>
        {displayText}
      </a>
    );

    lastIndex = index + url.length;
  });

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return <p>{result}</p>;
}

function UserContent({
  message,
}: {
  message: Server.ChatMessage.User;
}): JSX.Element {
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
      {isUserMessage(message) &&
        (() => {
          const imageUrls = extractImageUrls(message.content.text);
          return (
            <>
              <span className={classes.text}>
                {isEnhancedMessage(message)
                  ? enhancedMessageContent(message.content.text)
                  : formatText(message.content.text)}
              </span>
              {message.content.imageData ? (
                <div className={classes.image}>
                  <img
                    src={message.content.imageData}
                    onError={(e) => e.currentTarget.remove()}
                  />
                </div>
              ) : null}
              {imageUrls.length ? (
                <div className={classes.image}>
                  <img
                    src={imageUrls[0]}
                    onError={(e) => e.currentTarget.remove()}
                  />
                </div>
              ) : null}
            </>
          );
        })()}
    </>
  );
}

export default UserContent;
