import DrawingPadCanvas from "../../../components/sketch/ui/DrawingPadCanvas";
import DefectPanel from "../../../features/defects/DefectPanel";
import { useDefectPlacement } from "../../../features/defects/useDefectPlacement";
import { useDefectTypes } from "../../../features/defects/useDefectTypes";

type DrawingPadPageProps = {
  onBack?: () => void;
};

export default function DrawingPadPage({ onBack }: DrawingPadPageProps) {
  const { armedDefectTypeId, armDefectType, placedDefects, placeDefect } = useDefectPlacement();
  const { defectTypes, addType, renameType, removeType, isTypeInUse } = useDefectTypes(placedDefects);

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
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="lg:flex-1">
          <DrawingPadCanvas
            armedDefectTypeId={armedDefectTypeId}
            onCanvasTap={placeDefect}
            placedDefects={placedDefects}
            defectTypes={defectTypes}
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
