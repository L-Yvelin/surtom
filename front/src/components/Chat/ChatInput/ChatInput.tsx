import { JSX, useCallback, useEffect, useRef, useState } from 'react';
import classes from './ChatInput.module.css';
import useChatStore from '../../../stores/useChatStore';
import classNames from 'classnames';
import { Server, Client } from '@surtom/interfaces';
import { isSavedChatMessage, isScoreMessage, isTextMessage } from '../utils';
import { useWebSocketStore } from '../../../stores/useWebSocketStore';
import useChatInputHistory from '../../../hooks/useChatInputHistory';

interface ChatInputProps {
  onSend: () => void;
  onImagePaste: (image: string) => void;
  display: boolean;
}

function SimpleMessage({ message }: { message: Server.ChatMessage.SavedType }): JSX.Element {
  return (
    <div className={classes.simpleMessage}>
      {isTextMessage(message) ? message.content.text : null}
      {isScoreMessage(message) ? `Les ${message.content.attempts?.length} essais de ${message.content.user.name}.` : null}
    </div>
  );
}

function ChatInput({ onSend, display }: ChatInputProps): JSX.Element {
  const keyboardRef = useRef<HTMLInputElement>(null);
  const [input, setInputValue] = useState<string>('');
  const { sendMessage: sendWebSocketMessage } = useWebSocketStore();
  const { answeringTo, setAnsweringTo, messages, focusInput, setFocusInput } = useChatStore();
  const { push: pushHistory, handleKeyDown: handleHistoryKeyDown, reset: resetHistory, inputRef: historyInputRef } = useChatInputHistory();

  const focusInputFunction = useCallback((message?: string) => {
    if (keyboardRef.current) {
      keyboardRef.current.focus();
      if (message) {
        setInputValue(message);
        keyboardRef.current.setSelectionRange(keyboardRef.current.value.length, keyboardRef.current.value.length);
      }
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
    resetHistory();
  }

  function sendMessage() {
    if (input.trim()) {
      onSend();
      sendWebSocketMessage({
        type: Client.MessageType.CHAT_MESSAGE,
        content: {
          text: input.trim(),
          imageData: undefined,
          replyId: undefined,
        },
      });
      pushHistory(input.trim());
      setInputValue('');
      focusInput();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      sendMessage();
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      handleHistoryKeyDown(event, setInputValue);
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
        ref={(el) => {
          keyboardRef.current = el;
          historyInputRef.current = el;
        }}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <div
        className={classNames(classes.answering, {
          [classes.hidden]: !answeringTo,
        })}
        onClick={() => setAnsweringTo('')}
      >
        {answeringTo &&
          (() => {
            const message = messages.find((m): m is Server.ChatMessage.SavedType => isSavedChatMessage(m) && m.content.id === answeringTo);
            if (message) {
              return (
                <div className={classes.answeringMessage}>
                  ➦&nbsp;&nbsp;
                  <SimpleMessage message={message} />
                </div>
              );
            } else {
              return 'Impossible de charger le message';
            }
          })()}
      </div>
    </div>
  );
}

export default ChatInput;
