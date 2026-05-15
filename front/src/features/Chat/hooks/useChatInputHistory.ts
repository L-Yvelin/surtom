import { useState } from 'react';
import {
  loadHistory,
  saveHistory,
  filterHistory,
  pushHistory as pushHistoryService,
  navigateHistory,
} from '../utils/chatInputHistoryStorage';

interface UseChatInputHistoryOptions {
  getCurrentInput: () => string;
}

export default function useChatInputHistory({ getCurrentInput }: UseChatInputHistoryOptions) {
  const [history, setHistory] = useState<string[]>(() => loadHistory());
  const [index, setIndex] = useState<number | null>(null);
  const [tempInput, setTempInput] = useState<string>('');
  const [filterText, setFilterText] = useState<string>('');

  const filteredHistory = filterHistory(history, filterText);

  const push = (input: string) => {
    if (input.includes('/login') || input.includes('/register')) return;

    const newHistory = pushHistoryService(history, input);
    setHistory(newHistory);
    saveHistory(newHistory);
    setIndex(null);
    setTempInput('');
    setFilterText('');
  };

  const reset = () => {
    setIndex(null);
    setFilterText('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, setInput: (v: string) => void) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (index === null) {
        const currentInput = getCurrentInput();
        setTempInput(currentInput);
        setFilterText(currentInput);
      }

      if (filteredHistory.length === 0 && filterText === '') {
        const fullHistory = filterHistory(history, '');
        if (fullHistory.length === 0) return;
        const newIdx = fullHistory.length - 1;
        setInput(fullHistory[newIdx]);
        setIndex(newIdx);
        return;
      }

      if (filteredHistory.length === 0) return;

      const newIdx = navigateHistory(filteredHistory, index, 'up');
      if (typeof newIdx === 'number') {
        setInput(filteredHistory[newIdx]);
      }
      setIndex(newIdx);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (index === null) return;

      const newIdx = navigateHistory(filteredHistory, index, 'down');
      if (newIdx === null) {
        setInput(tempInput || '');
      } else {
        setInput(filteredHistory[newIdx]);
      }
      setIndex(newIdx);
    }
  };

  return {
    history,
    push,
    handleKeyDown,
    reset,
  };
}
