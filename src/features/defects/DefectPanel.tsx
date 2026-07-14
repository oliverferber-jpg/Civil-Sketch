import { Card } from "../../components/ui";

type DefectPanelProps = {
  defectCount: number;
};

export default function DefectPanel({ defectCount }: DefectPanelProps) {
  return (
    <Card className="flex flex-col gap-3 lg:w-72">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Defects</h2>
      </div>

      <p className="text-sm text-slate-700">
        Select a defect from the toolbar, then tap the canvas to place it.
      </p>
      <p className="text-xs text-slate-500">Tap the canvas to place a marker.</p>
      <p className="text-xs text-slate-400">{defectCount} defect types available.</p>
    </Card>
  );
}
