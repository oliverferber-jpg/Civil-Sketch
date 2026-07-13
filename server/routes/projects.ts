import { Router } from "express";
import { createProject, getProjectById, getProjectSummaries } from "../services/projectService";

const router = Router();

router.get("/", async (_req, res) => {
  const projects = await getProjectSummaries();
  res.json(projects);
});

router.post("/", async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const folder = typeof req.body?.folder === "string" ? req.body.folder.trim() : "";
  const description = typeof req.body?.description === "string" ? req.body.description.trim() : "";

  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  try {
    const project = await createProject({
      name,
      folder: folder || "Uncategorized",
      description,
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Failed to create project", error);
    res.status(500).json({ error: "Could not create project" });
  }
});

router.get("/:projectId", async (req, res) => {
  const project = await getProjectById(req.params.projectId);

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(project);
});

export default router;
