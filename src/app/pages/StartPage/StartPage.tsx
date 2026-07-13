import { useState } from "react";
import type { CreateProjectInput, ProjectSummary } from "../../../types/projects";

type StartPageProps = {
  projects: ProjectSummary[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: (input: CreateProjectInput) => Promise<void>;
};

export default function StartPage({ projects, onSelectProject, onCreateProject }: StartPageProps) {
  const [name, setName] = useState("");
  const [folder, setFolder] = useState("Uncategorized");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const groupedProjects = projects.reduce<Record<string, ProjectSummary[]>>(
    (groups, project) => {
      const folder = project.folder;
      if (!groups[folder]) {
        groups[folder] = [];
      }
      groups[folder].push(project);
      return groups;
    },
    {}
  );

  const handleCreateProject = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setCreateError("Project name is required.");
      return;
    }

    setSubmitting(true);
    setCreateError(null);

    try {
      await onCreateProject({
        name: trimmedName,
        folder: folder.trim() || "Uncategorized",
        description: description.trim(),
      });

      setName("");
      setFolder("Uncategorized");
      setDescription("");
    } catch {
      setCreateError("Could not create project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Start page
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Choose a project to continue
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Browse your project folders, open an existing set of drawings, or begin a fresh one.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              {projects.length} projects available
            </div>
            <div className="grid w-full max-w-xl gap-2 md:grid-cols-3">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Project name"
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
              />
              <input
                value={folder}
                onChange={(event) => setFolder(event.target.value)}
                placeholder="Folder"
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
              />
              <button
                type="button"
                onClick={handleCreateProject}
                disabled={submitting}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {submitting ? "Creating..." : "Create project"}
              </button>
            </div>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
              className="w-full max-w-xl rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
            />
            {createError ? <p className="text-sm text-rose-600">{createError}</p> : null}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedProjects).map(([folderName, folderProjects]) => (
          <section key={folderName} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{folderName}</h3>
                <p className="text-sm text-slate-500">
                  {folderProjects.length} project{folderProjects.length === 1 ? "" : "s"} in this folder
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {folderProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onSelectProject(project.id)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-slate-900">{project.name}</h4>
                      <p className="mt-2 text-sm text-slate-600">{project.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span>{project.drawingCount} drawings</span>
                    <span>Updated {project.lastUpdated}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
