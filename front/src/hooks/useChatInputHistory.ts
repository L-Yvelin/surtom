import { useCallback, useRef, useState, useMemo } from "react";
import {
  loadHistory,
  saveHistory,
  filterHistory,
  pushHistory as pushHistoryService,
  navigateHistory,
} from "../utils/chatInputHistoryStorage";

const STORAGE_KEY = "chatInputHistory";

export default function useChatInputHistory() {
  const [history, setHistory] = useState<string[]>(() => loadHistory());
  const [index, setIndex] = useState<number | null>(null); // index in filteredHistory
  const [tempInput, setTempInput] = useState<string>("");
  const [filterText, setFilterText] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filteredHistory = useMemo(
    () => filterHistory(history, filterText),
    [history, filterText],
  );

  const push = useCallback((input: string) => {
    setHistory((prev) => {
      const newHistory = pushHistoryService(prev, input);
      saveHistory(newHistory);
      return newHistory;
    });
    setIndex(null);
    setTempInput("");
    setFilterText("");
  }, []);

  const reset = useCallback(() => {
    setIndex(null);
    setFilterText("");
  }, []);

  const handleKeyDown = useCallback(
    (
      event: React.KeyboardEvent<HTMLInputElement>,
      setInput: (v: string) => void,
    ) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();

        if (index === null) {
          const currentInput = inputRef.current?.value || "";
          setTempInput(currentInput);
          setFilterText(currentInput);
        }

        if (filteredHistory.length === 0 && filterText === "") {
          // if starting navigation on empty input, filter by empty string
          // which is the whole history
          const fullHistory = filterHistory(history, "");
          if (fullHistory.length === 0) return;
          const newIdx = fullHistory.length - 1;
          setInput(fullHistory[newIdx]);
          setIndex(newIdx);
          return;
        }

        if (filteredHistory.length === 0) return;

        setIndex((idx) => {
          let newIdx = navigateHistory(filteredHistory, idx, "up");
          if (typeof newIdx === "number") {
            setInput(filteredHistory[newIdx]);
          }
          return newIdx;
        });
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        if (index === null) return; // Can't go down if not navigating

        setIndex((idx) => {
          let newIdx = navigateHistory(filteredHistory, idx, "down");
          if (newIdx === null) {
            setInput(tempInput || "");
          } else {
            setInput(filteredHistory[newIdx]);
          }
          return newIdx;
        });
      }
    },
    [history, tempInput, index, filteredHistory, filterText],
  );

  return {
    history,
    push,
    handleKeyDown,
    reset,
    inputRef,
  };
}
