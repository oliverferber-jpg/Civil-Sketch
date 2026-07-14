import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  createDrawing,
  createProject,
  deleteDrawing,
  getProjectById,
  getProjectSummaries,
  renameDrawing,
} from "../services/projectService";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const projects = await getProjectSummaries(req.user!.id);
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
    const project = await createProject(req.user!.id, {
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

router.post("/:projectId/drawings", async (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const angle = typeof req.body?.angle === "string" ? req.body.angle.trim() : "";
  const status = typeof req.body?.status === "string" ? req.body.status.trim() : "";
  const notes = typeof req.body?.notes === "string" ? req.body.notes.trim() : "";

  if (!title) {
    res.status(400).json({ error: "title is required" });
    return;
  }

  try {
    const drawing = await createDrawing(req.user!.id, req.params.projectId, {
      title,
      angle,
      status,
      notes,
    });

    if (!drawing) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.status(201).json(drawing);
  } catch (error) {
    console.error("Failed to create drawing", error);
    res.status(500).json({ error: "Could not create drawing" });
  }
});

router.get("/:projectId", async (req, res) => {
  const project = await getProjectById(req.user!.id, req.params.projectId);

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(project);
});

router.patch("/:projectId/drawings/:drawingId", async (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";

  if (!title) {
    res.status(400).json({ error: "title is required" });
    return;
  }

  try {
    const drawing = await renameDrawing(req.user!.id, req.params.projectId, req.params.drawingId, {
      title,
    });

    if (!drawing) {
      res.status(404).json({ error: "Drawing not found" });
      return;
    }

    res.json(drawing);
  } catch (error) {
    console.error("Failed to rename drawing", error);
    res.status(500).json({ error: "Could not rename drawing" });
  }
});

router.delete("/:projectId/drawings/:drawingId", async (req, res) => {
  try {
    const deleted = await deleteDrawing(req.user!.id, req.params.projectId, req.params.drawingId);

    if (!deleted) {
      res.status(404).json({ error: "Drawing not found" });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete drawing", error);
    res.status(500).json({ error: "Could not delete drawing" });
  }
});

export default router;
