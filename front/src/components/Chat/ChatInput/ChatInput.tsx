import { JSX, useCallback, useEffect, useRef, useState } from "react";
import classes from "./ChatInput.module.css";
import useGameStore from "../../../stores/useGameStore";
import useChatStore from "../../../stores/useChatStore";
import classNames from "classnames";
import { MessageContent } from "../MessagesBox/Message/Message";

interface ChatInputProps {
  onSend: () => void;
  onImagePaste: (image: string) => void;
  display: boolean;
}

function ChatInput({ onSend, display }: ChatInputProps): JSX.Element {
  const keyboardRef = useRef<HTMLInputElement>(null);
  const [input, setInputValue] = useState<string>("");
  const { player } = useGameStore();
  const {
    addMessage,
    answeringTo,
    setAnsweringTo,
    messages,
    focusInput,
    setFocusInput,
  } = useChatStore();

  const focusInputFunction = useCallback(() => {
    if (keyboardRef.current) {
      keyboardRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setFocusInput(focusInputFunction);
  }, [focusInputFunction, setFocusInput]);

  useEffect(() => {
    if (keyboardRef.current && display) {
      keyboardRef.current.focus();
    }
  }, [display]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value);
  }

  function sendMessage() {
    if (input.trim()) {
      onSend();
      addMessage({
        content: { text: input },
        id: Math.random().toString(),
        player: player,
        type: "message",
      });
      setInputValue("");
      focusInput();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      sendMessage();
    }
  }

  return (
    <div className={classes.chatInput}>
      <button className={classes.button} onClick={sendMessage}>
        &gt;
      </button>
      <input
        className={classes.input}
        type="text"
        ref={keyboardRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <div
        className={classNames(classes.answering, {
          [classes.hidden]: !answeringTo,
        })}
        onClick={() => setAnsweringTo("")}
      >
        {answeringTo &&
          (() => {
            const message = messages.find(
              (message) => message.id === answeringTo
            );
            if (message) {
              return (
                <div className={classes.answeringMessage}>
                  ➦&nbsp;&nbsp;
                  <MessageContent
                    id={message.id}
                    type={message.type}
                    player={message.player}
                    text={message.content.text}
                  />
                </div>
              );
            } else {
              return "Impossible de charger le message";
            }
          })()}
      </div>
    </div>
  );
}

export default ChatInput;
