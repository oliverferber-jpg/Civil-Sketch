type ProjectSummary = {
  id: string;
  name: string;
  folder: string;
  description: string;
  drawingCount: number;
  lastUpdated: string;
};

type StartPageProps = {
  projects: ProjectSummary[];
  onSelectProject: (projectId: string) => void;
};

export default function StartPage({ projects, onSelectProject }: StartPageProps) {
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
          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
            {projects.length} projects available
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
