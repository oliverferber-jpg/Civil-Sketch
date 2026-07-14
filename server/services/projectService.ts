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

type CreateProjectInput = {
  name: string;
  folder: string;
  description: string;
};

type CreateDrawingInput = {
  title: string;
  angle?: string;
  status?: string;
  notes?: string;
};

export async function getProjectSummaries(userId: string): Promise<ProjectSummary[]> {
  const projects = await prisma.project.findMany({
    where: { userId },
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

export async function getProjectById(userId: string, projectId: string): Promise<ProjectDetail | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId, userId },
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

export async function createProject(userId: string, input: CreateProjectInput): Promise<ProjectSummary> {
  const project = await prisma.project.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      name: input.name,
      folder: input.folder,
      description: input.description,
      drawingCount: 0,
      lastUpdated: "just now",
    },
    select: {
      id: true,
      name: true,
      folder: true,
      description: true,
      drawingCount: true,
      lastUpdated: true,
    },
  });

  return {
    id: project.id,
    name: project.name,
    folder: project.folder ?? "Uncategorized",
    description: project.description ?? "",
    drawingCount: project.drawingCount ?? 0,
    lastUpdated: project.lastUpdated ?? "Unknown",
  };
}

export async function createDrawing(
  userId: string,
  projectId: string,
  input: CreateDrawingInput
): Promise<DrawingSummary | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId, userId },
    select: { id: true },
  });

  if (!project) {
    return null;
  }

  const drawing = await prisma.drawing.create({
    data: {
      id: crypto.randomUUID(),
      projectId,
      title: input.title,
      angle: input.angle ?? "Front view",
      status: input.status ?? "Draft",
      updatedAt: "just now",
      notes: input.notes ?? "",
    },
    select: {
      id: true,
      title: true,
      angle: true,
      status: true,
      updatedAt: true,
      notes: true,
    },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: {
      drawingCount: {
        increment: 1,
      },
      lastUpdated: "just now",
    },
  });

  return {
    id: drawing.id,
    title: drawing.title,
    angle: drawing.angle ?? "",
    status: drawing.status ?? "",
    updatedAt: drawing.updatedAt ?? "",
    notes: drawing.notes ?? "",
  };
}

export type {
  ProjectDetail,
  ProjectSummary,
  DrawingSummary,
  CreateProjectInput,
  CreateDrawingInput,
};
