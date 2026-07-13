import type {
  CreateDrawingInput,
  CreateProjectInput,
  DrawingSummary,
  ProjectDetail,
  ProjectSummary,
} from "../types/projects";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchProjects(): Promise<ProjectSummary[]> {
  const response = await fetch("/api/projects");
  return parseJsonResponse<ProjectSummary[]>(response);
}

export async function fetchProjectById(projectId: string): Promise<ProjectDetail> {
  const response = await fetch(`/api/projects/${projectId}`);
  return parseJsonResponse<ProjectDetail>(response);
}

export async function createProject(input: CreateProjectInput): Promise<ProjectSummary> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
    body: JSON.stringify(input),
  });

  return parseJsonResponse<DrawingSummary>(response);
}
