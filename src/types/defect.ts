export type DefectType = {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
};

export type PlacedDefect = {
  id: string;
  defectTypeId: string;
  position: { x: number; y: number };
  labelPosition: { x: number; y: number };
};
