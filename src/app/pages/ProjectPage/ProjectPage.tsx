type DrawingSummary = {
  id: string;
  title: string;
  angle: string;
  status: string;
  updatedAt: string;
  notes: string;
};

type ProjectDetail = {
  id: string;
  name: string;
  folder: string;
  description: string;
  drawings: DrawingSummary[];
};

type ProjectPageProps = {
  project: ProjectDetail;
  onBack: () => void;
  onSelectDrawing: (drawingId: string) => void;
  onStartNewDrawing: () => void;
};

export default function ProjectPage({
  project,
  onBack,
  onSelectDrawing,
  onStartNewDrawing,
}: ProjectPageProps) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              {project.folder}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{project.name}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{project.description}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back to projects
            </button>
            <button
              type="button"
              onClick={onStartNewDrawing}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              New drawing
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Available drawings</h3>
            <p className="text-sm text-slate-500">Open a previous sketch or create a fresh one from this project.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {project.drawings.map((drawing) => (
            <div key={drawing.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-900">{drawing.title}</h4>
                  <p className="mt-1 text-sm text-slate-600">{drawing.angle}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {drawing.status}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-600">{drawing.notes}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>Updated {drawing.updatedAt}</span>
                <button
                  type="button"
                  onClick={() => onSelectDrawing(drawing.id)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Continue drawing
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
