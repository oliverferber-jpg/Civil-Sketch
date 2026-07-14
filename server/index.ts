import cookieParser from "cookie-parser";
import express from "express";
import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
