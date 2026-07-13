import express from "express";
import projectsRouter from "./routes/projects";

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "poop" });
});

app.use("/api/projects", projectsRouter);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
