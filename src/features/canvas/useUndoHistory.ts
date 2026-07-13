import { useState } from "react";

export type UndoEntryType = "stroke" | "defect";

export function useUndoHistory() {
  const [history, setHistory] = useState<UndoEntryType[]>([]);

  const pushStroke = () => setHistory((prev) => [...prev, "stroke"]);
  const pushDefect = () => setHistory((prev) => [...prev, "defect"]);

  const peekLast = (): UndoEntryType | undefined => history[history.length - 1];

  const popLast = () => setHistory((prev) => prev.slice(0, -1));

  const removeAllOfType = (type: UndoEntryType) =>
    setHistory((prev) => prev.filter((entry) => entry !== type));

  return {
    history,
    canUndo: history.length > 0,
    pushStroke,
    pushDefect,
    peekLast,
    popLast,
    removeAllOfType,
  };
}
