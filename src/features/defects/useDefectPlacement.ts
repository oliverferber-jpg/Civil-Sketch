import { useState } from "react";
import type { PlacedDefect } from "../../types/defect";

const LABEL_OFFSET = { x: 40, y: -40 };

export function useDefectPlacement() {
  const [armedDefectTypeId, setArmedDefectTypeId] = useState<string | null>(null);
  const [placedDefects, setPlacedDefects] = useState<PlacedDefect[]>([]);

  const armDefectType = (id: string) => {
    setArmedDefectTypeId((current) => (current === id ? null : id));
  };

  const placeDefect = (position: { x: number; y: number }) => {
    if (!armedDefectTypeId) return;

    setPlacedDefects((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        defectTypeId: armedDefectTypeId,
        position,
        labelPosition: { x: position.x + LABEL_OFFSET.x, y: position.y + LABEL_OFFSET.y },
      },
    ]);
  };

  const removeLastDefect = () => {
    setPlacedDefects((prev) => prev.slice(0, -1));
  };

  return { armedDefectTypeId, armDefectType, placedDefects, placeDefect, removeLastDefect };
}
