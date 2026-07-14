import { Image, Pencil, Plus, Trash2 } from "lucide-react";
import type { DrawingSummary, ProjectDetail } from "../../../types/projects";

type ProjectPageProps = {
  project: ProjectDetail;
  onBack: () => void;
  onSelectDrawing: (drawingId: string) => void;
  onStartNewDrawing: () => Promise<void>;
  onRenameDrawing: (drawingId: string) => Promise<void>;
  onDeleteDrawing: (drawingId: string) => Promise<void>;
  creatingDrawing: boolean;
};

export default function ProjectPage({
  project,
  onBack,
  onSelectDrawing,
  onStartNewDrawing,
  onRenameDrawing,
  onDeleteDrawing,
  creatingDrawing,
}: ProjectPageProps) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Back to projects
          </button>
          <h2 className="text-xl font-semibold text-slate-900">{project.name}</h2>
        </div>
        <span className="text-sm text-slate-500">
          {project.drawings.length} drawing{project.drawings.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {project.drawings.map((drawing) => (
          <DrawingTile
            key={drawing.id}
            drawing={drawing}
            onSelect={onSelectDrawing}
            onRename={onRenameDrawing}
            onDelete={onDeleteDrawing}
          />
        ))}
        <NewDrawingTile onCreate={onStartNewDrawing} creatingDrawing={creatingDrawing} />
      </div>
    </div>
  );
}

function DrawingTile({
  drawing,
  onSelect,
  onRename,
  onDelete,
}: {
  drawing: DrawingSummary;
  onSelect: (id: string) => void;
  onRename: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="group flex flex-col gap-2 rounded-2xl p-3 text-left transition hover:bg-slate-100">
      <button type="button" onClick={() => onSelect(drawing.id)} title={drawing.title} className="w-full text-left">
        <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition group-hover:bg-slate-200">
          <Image size={40} strokeWidth={1.5} />
        </div>
      </button>
      <span className="line-clamp-2 text-sm font-medium text-slate-700">{drawing.title}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void onRename(drawing.id)}
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
        >
          <Pencil size={12} />
          Rename
        </button>
        <button
          type="button"
          onClick={() => void onDelete(drawing.id)}
          className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>
    </div>
  );
}

function NewDrawingTile({
  onCreate,
  creatingDrawing,
}: {
  onCreate: () => void;
  creatingDrawing: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onCreate}
      disabled={creatingDrawing}
      aria-label="Start new drawing"
      className="group flex flex-col gap-2 rounded-2xl border-2 border-dashed border-slate-300 p-3 text-left transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl text-slate-400 transition group-hover:text-blue-600">
        <Plus size={40} strokeWidth={1.5} />
      </div>
      <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600">
        {creatingDrawing ? "Creating..." : "New drawing"}
      </span>
    </button>
  );
}
