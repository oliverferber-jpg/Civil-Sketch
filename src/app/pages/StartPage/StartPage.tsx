import { useState } from "react";
import { Folder, FolderPlus } from "lucide-react";
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

      <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {projects.map((project) => (
          <ProjectFolderTile key={project.id} project={project} onSelect={onSelectProject} />
        ))}
        <NewProjectTile onCreate={handleCreateProject} />
      </div>
    </div>
  );
}

function ProjectFolderTile({
  project,
  onSelect,
}: {
  project: ProjectSummary;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(project.id)}
      title={project.name}
      className="group flex flex-col items-center gap-2 rounded-2xl p-3 text-center transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
        <Folder size={32} strokeWidth={1.5} />
      </span>
      <span className="line-clamp-2 w-full break-words text-sm font-medium text-slate-700">
        {project.name}
      </span>
    </button>
  );
}

function NewProjectTile({ onCreate }: { onCreate: () => void }) {
  return (
    <button
      type="button"
      onClick={onCreate}
      aria-label="Create new project"
      className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 p-3 text-center transition hover:border-blue-400 hover:bg-blue-50"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl text-slate-400 transition group-hover:text-blue-600">
        <FolderPlus size={32} strokeWidth={1.5} />
      </span>
      <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600">
        New project
      </span>
    </button>
  );
}
