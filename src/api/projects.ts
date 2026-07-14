import type {
  CreateDrawingInput,
  CreateProjectInput,
  DrawingSummary,
  ProjectDetail,
  ProjectSummary,
} from "../types/projects";
import { parseJsonResponse } from "./http";

export async function fetchProjects(): Promise<ProjectSummary[]> {
  const response = await fetch("/api/projects", { credentials: "include" });
  return parseJsonResponse<ProjectSummary[]>(response);
}

export async function fetchProjectById(projectId: string): Promise<ProjectDetail> {
  const response = await fetch(`/api/projects/${projectId}`, { credentials: "include" });
  return parseJsonResponse<ProjectDetail>(response);
}

export async function createProject(input: CreateProjectInput): Promise<ProjectSummary> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  return parseJsonResponse<ProjectSummary>(response);
}

export async function createDrawing(
  projectId: string,
  input: CreateDrawingInput
): Promise<DrawingSummary> {
  const response = await fetch(`/api/projects/${projectId}/drawings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  return parseJsonResponse<DrawingSummary>(response);
}
