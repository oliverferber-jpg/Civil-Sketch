import { Router } from "express";
import { getProjectById, getProjectSummaries } from "../services/projectService";

const router = Router();

router.get("/", async (_req, res) => {
  const projects = await getProjectSummaries();
  res.json(projects);
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
