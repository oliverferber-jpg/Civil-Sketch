import type { DefectType } from "../../types/defect";

export const DEFAULT_DEFECT_TYPES: DefectType[] = [
  { id: crypto.randomUUID(), name: "Crack", abbreviation: "CR", color: "#ef4444" },
  { id: crypto.randomUUID(), name: "Chipping", abbreviation: "CH", color: "#f59e0b" },
  { id: crypto.randomUUID(), name: "Spalling", abbreviation: "SP", color: "#8b5cf6" },
  { id: crypto.randomUUID(), name: "Corrosion", abbreviation: "CO", color: "#10b981" },
];
