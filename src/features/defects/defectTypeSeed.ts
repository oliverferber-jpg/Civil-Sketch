import type { DefectType } from "../../types/defect";

export const DEFAULT_DEFECT_TYPES: DefectType[] = [
  { id: "crack", name: "Crack", abbreviation: "CR", color: "#ef4444" },
  { id: "chipping", name: "Chipping", abbreviation: "CH", color: "#f59e0b" },
  { id: "spalling", name: "Spalling", abbreviation: "SP", color: "#8b5cf6" },
  { id: "corrosion", name: "Corrosion", abbreviation: "CO", color: "#10b981" },
];
