import { useState } from "react";
import type { PlacedDefect } from "../../types/defect";

type Point = { x: number; y: number };

export function useDefectPlacement() {
  const [armedDefectTypeId, setArmedDefectTypeId] = useState<string | null>(null);
  const [placedDefects, setPlacedDefects] = useState<PlacedDefect[]>([]);
  const [pendingPosition, setPendingPosition] = useState<Point | null>(null);

  const armDefectType = (id: string) => {
    setArmedDefectTypeId((current) => (current === id ? null : id));
    setPendingPosition(null);
  };

  const cancelPending = () => {
    setPendingPosition(null);
  };

  const placeDefect = (position: Point) => {
    if (!armedDefectTypeId) return;

    if (!pendingPosition) {
      setPendingPosition(position);
      return;
    }

    setPlacedDefects((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        defectTypeId: armedDefectTypeId,
        position: pendingPosition,
        labelPosition: position,
      },
    ]);
    setPendingPosition(null);
  };

  const removeLastDefect = () => {
    setPlacedDefects((prev) => prev.slice(0, -1));
  };

  return {
    armedDefectTypeId,
    armDefectType,
    placedDefects,
    placeDefect,
    pendingPosition,
    cancelPending,
    removeLastDefect,
  };
}
