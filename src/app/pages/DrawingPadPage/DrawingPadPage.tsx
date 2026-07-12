import DrawingPadCanvas from "../../../components/sketch/ui/DrawingPadCanvas";

type DrawingPadPageProps = {
  onBack?: () => void;
};

export default function DrawingPadPage({ onBack }: DrawingPadPageProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            Back
          </button>
        ) : null}
      </div>
      <DrawingPadCanvas />
    </div>
  );
}
