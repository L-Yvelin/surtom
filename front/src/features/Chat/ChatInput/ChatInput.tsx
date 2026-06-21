import { JSX, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './ChatInput.module.css';
import { useChatStore } from '../../../stores/useChatStore';
import classNames from 'classnames';
import { Server, Client, MAX_IMAGE_BYTES } from '@surtom/interfaces';
import { isSavedChatMessage, isScoreMessage, isTextMessage } from '../utils/messageFormatting';
import { useWebSocketStore } from '../../../stores/useWebSocketStore';
import useChatInputHistory from '../hooks/useChatInputHistory';
import { useInputSuggestions, applySuggestion, Suggestion } from './useInputSuggestions';
import SuggestionDropdown from './SuggestionDropdown';
import { compressImageToLimit } from '../utils/imageCompression';
import { useGameStore } from '../../../stores/useGameStore';
import { Achievement } from '../../AchievementsStack/Achievement/Achievement';
import { AchievementIcon } from '../../AchievementsStack/Achievement/utils';
import { useTexture } from '../../../stores/useResourcePackStore';

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

function ChatInput({ onSend, onImagePaste, display }: ChatInputProps): JSX.Element {
  const { t } = useTranslation();
  const keyboardRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInputValue] = useState<string>('');
  const [imageData, setImageData] = useState<string | null>(null);
  const addAchievement = useGameStore((s) => s.addAchievement);
  const attachImageIcon = useTexture('painting/meditative.png');
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

  function notifyImageError(subtitle: string) {
    addAchievement(new Achievement(t('achievements.imageErrorTitle'), subtitle, AchievementIcon.QUESTION));
  }

  async function loadImageFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    try {
      const result = await compressImageToLimit(file, MAX_IMAGE_BYTES);
      if (!result) {
        notifyImageError(t('achievements.imageTooLargeSubtitle'));
        return;
      }
      setImageData(result);
      onImagePaste(result);
    } catch {
      notifyImageError(t('achievements.imageErrorSubtitle'));
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          void loadImageFile(file);
        }
        return;
      }
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void loadImageFile(file);
    event.target.value = '';
  }

  function clearImage() {
    setImageData(null);
    focusInput();
  }

  function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed && !imageData) return;

    onSend();
    sendWebSocketMessage({
      type: Client.MessageType.CHAT_MESSAGE,
      content: {
        text: trimmed,
        imageData: imageData ?? undefined,
        replyId: answeringTo ?? undefined,
      },
    });
    setAnsweringTo(null);
    if (trimmed) pushHistory(trimmed);
    setInputValue('');
    setImageData(null);
    focusInput();
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
      {imageData && (
        <div className={classes.imagePreview}>
          <img src={imageData} alt={t('chat.imagePreviewAlt')} />
          <button className={classes.removeImage} onClick={clearImage} aria-label={t('chat.removeImage')}>
            ✕
          </button>
        </div>
      )}
      <input
        className={classes.input}
        type="text"
        ref={keyboardRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
      />
      <button className={classes.button} onClick={() => fileInputRef.current?.click()} aria-label={t('chat.attachImage')}>
        <img className={classes.attachIcon} src={attachImageIcon} alt={t('chat.attachImage')} />
      </button>
      <input ref={fileInputRef} className={classes.hiddenInput} type="file" accept="image/*" onChange={handleFileChange} />
      {active && <SuggestionDropdown active={active} onSelect={selectSuggestion} selectedIndex={selectedIndex} />}
    </div>
  );
}

export default ChatInput;
