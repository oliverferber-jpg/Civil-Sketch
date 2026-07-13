export type ProjectBase = {
  id: string;
  name: string;
  folder: string;
  description: string;
};

export type ProjectSummary = ProjectBase & {
  drawingCount: number;
  lastUpdated: string;
};

export type DrawingSummary = {
  id: string;
  title: string;
  angle: string;
  status: string;
  updatedAt: string;
  notes: string;
};

export type ProjectDetail = ProjectBase & {
  drawings: DrawingSummary[];
};
