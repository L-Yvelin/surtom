import { JSX, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './ChatInput.module.css';
import { useChatStore } from '../../../stores/useChatStore';
import classNames from 'classnames';
import { Server, Client } from '@surtom/interfaces';
import { isSavedChatMessage, isScoreMessage, isTextMessage } from '../utils/messageFormatting';
import { useWebSocketStore } from '../../../stores/useWebSocketStore';
import useChatInputHistory from '../hooks/useChatInputHistory';
import { useInputSuggestions, applySuggestion, Suggestion } from './useInputSuggestions';
import SuggestionDropdown from './SuggestionDropdown';

interface ChatInputProps {
  onSend: () => void;
  onImagePaste: (image: string) => void;
  display: boolean;
}

export function SimpleMessage({ message }: { message: Server.ChatMessage.SavedType }): JSX.Element {
  const { t } = useTranslation();
  return (
    <span className={classes.simpleMessage}>
      {isTextMessage(message) ? message.content.text : null}
      {isScoreMessage(message)
        ? t('chat.scoreSimple', {
            count: message.content.attempts?.length ?? 0,
            name: message.content.user.name,
          })
        : null}
    </span>
  );
}

function ChatInput({ onSend, display }: ChatInputProps): JSX.Element {
  const { t } = useTranslation();
  const keyboardRef = useRef<HTMLInputElement>(null);
  const [input, setInputValue] = useState<string>('');
  const sendWebSocketMessage = useWebSocketStore((s) => s.sendMessage);
  const answeringTo = useChatStore((s) => s.answeringTo);
  const setAnsweringTo = useChatStore((s) => s.setAnsweringTo);
  const messages = useChatStore((s) => s.messages);
  const focusInput = useChatStore((s) => s.focusInput);
  const setFocusInput = useChatStore((s) => s.setFocusInput);
  const {
    push: pushHistory,
    handleKeyDown: handleHistoryKeyDown,
    reset: resetHistory,
  } = useChatInputHistory({ getCurrentInput: () => keyboardRef.current?.value ?? '' });
  const [cursorPos, setCursorPos] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const active = useInputSuggestions(input, cursorPos);

  const focusInputFunction = (message?: string) => {
    if (keyboardRef.current) {
      keyboardRef.current.focus();
      if (message) {
        setInputValue(message);
        keyboardRef.current.setSelectionRange(keyboardRef.current.value.length, keyboardRef.current.value.length);
      }
    }
  };

  useEffect(() => {
    setFocusInput(focusInputFunction);
  }, [setFocusInput]);

  useEffect(() => {
    if (keyboardRef.current && display) {
      keyboardRef.current.focus();
    }
  }, [display]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value);
    setCursorPos(event.target.selectionStart ?? event.target.value.length);
    setSelectedIndex(0);
    resetHistory();
  }

  function selectSuggestion(suggestion: Suggestion) {
    if (!active) return;
    const newValue = applySuggestion(input, active, suggestion);
    setInputValue(newValue);
    setCursorPos(newValue.length);
    setSelectedIndex(0);
    keyboardRef.current?.focus();
  }

  function sendMessage() {
    if (input.trim()) {
      onSend();
      sendWebSocketMessage({
        type: Client.MessageType.CHAT_MESSAGE,
        content: {
          text: input.trim(),
          imageData: undefined,
          replyId: answeringTo ?? undefined,
        },
      });
      setAnsweringTo(null);
      pushHistory(input.trim());
      setInputValue('');
      focusInput();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (active) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((i) => (i + 1) % active.suggestions.length);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((i) => (i - 1 + active.suggestions.length) % active.suggestions.length);
        return;
      }
      if (event.key === 'Tab' || event.key === 'Enter') {
        event.preventDefault();
        selectSuggestion(active.suggestions[selectedIndex]);
        return;
      }
      if (event.key === 'Escape') {
        setCursorPos(0);
        return;
      }
    }

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
              return t('chat.replyTargetError');
            }
          })()}
      </div>
      <input className={classes.input} type="text" ref={keyboardRef} value={input} onChange={handleChange} onKeyDown={handleKeyDown} />
      {active && <SuggestionDropdown active={active} onSelect={selectSuggestion} selectedIndex={selectedIndex} />}
    </div>
  );
}

export default ChatInput;
