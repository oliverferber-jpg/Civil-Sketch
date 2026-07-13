import { prisma } from "../prisma";

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
  const projects = await prisma.project.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      folder: true,
      description: true,
      drawingCount: true,
      lastUpdated: true,
    },
  });

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    folder: project.folder ?? "Uncategorized",
    description: project.description ?? "",
    drawingCount: project.drawingCount ?? 0,
    lastUpdated: project.lastUpdated ?? "Unknown",
  }));
}

export async function getProjectById(projectId: string): Promise<ProjectDetail | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      folder: true,
      description: true,
    },
  });

  if (!project) {
    return null;
  }

  const drawings = await prisma.drawing.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      angle: true,
      status: true,
      updatedAt: true,
      notes: true,
    },
  });

  return {
    id: project.id,
    name: project.name,
    folder: project.folder ?? "Uncategorized",
    description: project.description ?? "",
    drawings: drawings.map((drawing) => ({
      id: drawing.id,
      title: drawing.title,
      angle: drawing.angle ?? "",
      status: drawing.status ?? "",
      updatedAt: drawing.updatedAt ?? "",
      notes: drawing.notes ?? "",
    })),
  };
}

export type { ProjectDetail, ProjectSummary, DrawingSummary };
