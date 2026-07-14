import type { DefectType } from "../../types/defect";
import { Card } from "../../components/ui";
import DefectTypeDropdown from "./DefectTypeDropdown";

type DefectPanelProps = {
  defectTypes: DefectType[];
  armedDefectTypeId: string | null;
  onArmDefectType: (id: string) => void;
  onAddType: (name: string, color: string) => void;
  onRenameType: (id: string, name: string) => void;
  onRemoveType: (id: string) => void;
  isTypeInUse: (id: string) => boolean;
};

export default function DefectPanel({
  defectTypes,
  armedDefectTypeId,
  onArmDefectType,
  onAddType,
}: DefectPanelProps) {
  return (
    <Card className="flex flex-col gap-3 lg:w-72">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Defects</h2>
      </div>

      <DefectTypeDropdown
        defectTypes={defectTypes}
        armedDefectTypeId={armedDefectTypeId}
        onArmDefectType={onArmDefectType}
        onAddType={onAddType}
      />

      <p className="text-xs text-slate-500">Tap the canvas to place a marker.</p>
    </Card>
  );
}
