import fs from "node:fs/promises";
import path from "node:path";

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

const dataDir = path.join(process.cwd(), "server", "data");

async function readJsonFile<T>(fileName: string): Promise<T> {
  const filePath = path.join(dataDir, fileName);
  const contents = await fs.readFile(filePath, "utf8");
  return JSON.parse(contents) as T;
}

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
  return readJsonFile<ProjectSummary[]>("projects.json");
}

export async function getProjectById(projectId: string): Promise<ProjectDetail | null> {
  const projectDetails = await readJsonFile<Record<string, ProjectDetail>>(
    "projectDetails.json"
  );

  return projectDetails[projectId] ?? null;
}

export type { ProjectDetail, ProjectSummary, DrawingSummary };
