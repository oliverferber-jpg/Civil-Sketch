import { Folder, FolderPlus } from "lucide-react";
import type { ProjectSummary } from "../../../types/project";

type StartPageProps = {
  projects: ProjectSummary[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
};

export default function StartPage({ projects, onSelectProject, onCreateProject }: StartPageProps) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Projects</h2>
        <span className="text-sm text-slate-500">
          {projects.length} project{projects.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {projects.map((project) => (
          <ProjectFolderTile key={project.id} project={project} onSelect={onSelectProject} />
        ))}
        <NewProjectTile onCreate={onCreateProject} />
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
