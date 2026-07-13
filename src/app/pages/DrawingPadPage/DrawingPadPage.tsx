import { ArrowLeft } from "lucide-react";
import DrawingPadCanvas from "../../../components/sketch/ui/DrawingPadCanvas";
import { Button } from "../../../components/ui";
import DefectPanel from "../../../features/defects/DefectPanel";
import { useDefectPlacement } from "../../../features/defects/useDefectPlacement";
import { useDefectTypes } from "../../../features/defects/useDefectTypes";

type DrawingPadPageProps = {
  title?: string;
  onBack?: () => void;
};

export default function DrawingPadPage({ title = "Untitled drawing", onBack }: DrawingPadPageProps) {
  const { armedDefectTypeId, armDefectType, placedDefects, placeDefect, pendingPosition, cancelPending } =
    useDefectPlacement();
  const { defectTypes, addType, renameType, removeType, isTypeInUse } = useDefectTypes(placedDefects);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Drawing</p>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        </div>
        {onBack ? (
          <Button variant="outline" icon={ArrowLeft} onClick={onBack}>
            Back
          </Button>
        ) : null}
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="lg:flex-1">
          <DrawingPadCanvas
            armedDefectTypeId={armedDefectTypeId}
            onCanvasTap={placeDefect}
            placedDefects={placedDefects}
            defectTypes={defectTypes}
            pendingPosition={pendingPosition}
            onCancelPending={cancelPending}
          />
        </div>
        <DefectPanel
          defectTypes={defectTypes}
          armedDefectTypeId={armedDefectTypeId}
          onArmDefectType={armDefectType}
          onAddType={addType}
          onRenameType={renameType}
          onRemoveType={removeType}
          isTypeInUse={isTypeInUse}
        />
      </div>
    </div>
  );
}
