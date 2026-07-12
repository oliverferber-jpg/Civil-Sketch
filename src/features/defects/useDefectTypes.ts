import { useState } from "react";
import type { DefectType, PlacedDefect } from "../../types/defect";
import { DEFAULT_DEFECT_TYPES } from "./defectTypeSeed";

export function useDefectTypes(placedDefects: PlacedDefect[]) {
  const [defectTypes, setDefectTypes] = useState<DefectType[]>(DEFAULT_DEFECT_TYPES);

  const addType = (name: string, color: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setDefectTypes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: trimmed,
        abbreviation: trimmed.slice(0, 2).toUpperCase(),
        color,
      },
    ]);
  };

  const renameType = (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setDefectTypes((prev) =>
      prev.map((type) => (type.id === id ? { ...type, name: trimmed } : type)),
    );
  };

  const isTypeInUse = (id: string) => placedDefects.some((defect) => defect.defectTypeId === id);

  const removeType = (id: string) => {
    if (isTypeInUse(id)) return;
    setDefectTypes((prev) => prev.filter((type) => type.id !== id));
  };

  return { defectTypes, addType, renameType, removeType, isTypeInUse };
}
