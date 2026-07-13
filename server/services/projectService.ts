import { query } from "../db";

type ProjectSummary = {
  id: string;
  name: string;
  folder: string;
  description: string;
  drawingCount: number;
  lastUpdated: string;
};

type DrawingSummary = {
  id: string;
  title: string;
  angle: string;
  status: string;
  updatedAt: string;
  notes: string;
};

type ProjectDetail = {
  id: string;
  name: string;
  folder: string;
  description: string;
  drawings: DrawingSummary[];
};

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
  const rows = await query<ProjectSummary>(`
    SELECT id, name, folder, description, drawing_count AS "drawingCount", last_updated AS "lastUpdated"
    FROM projects
    ORDER BY name
  `);

  return rows;
}

export async function getProjectById(projectId: string): Promise<ProjectDetail | null> {
  const rows = await query<ProjectDetail>(`
    SELECT id, name, folder, description
    FROM projects
    WHERE id = $1
  `, [projectId]);

  const project = rows[0];

  if (!project) {
    return null;
  }

  const drawings = await query<DrawingSummary>(`
    SELECT id, title, angle, status, updated_at AS "updatedAt", notes
    FROM drawings
    WHERE project_id = $1
    ORDER BY created_at
  `, [projectId]);

  return {
    ...project,
    drawings,
  };
}

export type { ProjectDetail, ProjectSummary, DrawingSummary };
