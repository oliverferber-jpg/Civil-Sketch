import { useState } from "react";
import { fetchProjectById, fetchProjects } from "../../../api/projects";
import type { ProjectDetail, ProjectSummary } from "../../../types/projects";

export default function ApiTestPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    setProjectDetail(null);
    setDetailError(null);

    try {
      const data = await fetchProjects();
      setProjects(data);
      setSelectedProjectId(data[0]?.id ?? "");
    } catch {
      setError("Could not load projects from the backend.");
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetail = async () => {
    if (!selectedProjectId) {
      setDetailError("Select a project first.");
      return;
    }

    setDetailLoading(true);
    setDetailError(null);

    try {
      const data = await fetchProjectById(selectedProjectId);
      setProjectDetail(data);
    } catch {
      setDetailError("Could not load project details from the backend.");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          API test page
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          Verify the PostgreSQL-backed API from the browser
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Use these controls to verify both the projects list and project detail endpoints.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={loadProjects}
          disabled={loading}
          className="w-fit rounded-full bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {loading ? "Loading..." : "Load projects"}
        </button>
        <select
          value={selectedProjectId}
          onChange={(event) => setSelectedProjectId(event.target.value)}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
        >
          <option value="">Select project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={loadProjectDetail}
          disabled={detailLoading || projects.length === 0}
          className="w-fit rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {detailLoading ? "Loading detail..." : "Load project detail"}
        </button>
      </div>

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
      {detailError ? <p className="text-sm font-medium text-rose-600">{detailError}</p> : null}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          /api/projects response
        </h3>
        {projects.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No projects loaded yet.</p>
        ) : (
          <pre className="mt-3 overflow-x-auto text-sm text-slate-700">
            {JSON.stringify(projects, null, 2)}
          </pre>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          /api/projects/:id response
        </h3>
        {projectDetail ? (
          <pre className="mt-3 overflow-x-auto text-sm text-slate-700">
            {JSON.stringify(projectDetail, null, 2)}
          </pre>
        ) : (
          <p className="mt-2 text-sm text-slate-600">No project detail loaded yet.</p>
        )}
      </div>
    </div>
  );
}
