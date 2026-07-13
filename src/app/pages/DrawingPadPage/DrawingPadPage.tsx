import { useRef } from "react";
import { ArrowLeft } from "lucide-react";
import DrawingPadCanvas, { type DrawingPadCanvasHandle } from "../../../components/sketch/ui/DrawingPadCanvas";
import { Button } from "../../../components/ui";
import DefectPanel from "../../../features/defects/DefectPanel";
import { useDefectPlacement } from "../../../features/defects/useDefectPlacement";
import { useDefectTypes } from "../../../features/defects/useDefectTypes";
import { useUndoHistory } from "../../../features/canvas/useUndoHistory";

type DrawingPadPageProps = {
  title?: string;
  onBack?: () => void;
};

export default function DrawingPadPage({ title = "Untitled drawing", onBack }: DrawingPadPageProps) {
  const { armedDefectTypeId, armDefectType, placedDefects, placeDefect, removeLastDefect } = useDefectPlacement();
  const { defectTypes, addType, renameType, removeType, isTypeInUse } = useDefectTypes(placedDefects);
  const { canUndo, pushStroke, pushDefect, peekLast, popLast, removeAllOfType } = useUndoHistory();
  const canvasRef = useRef<DrawingPadCanvasHandle>(null);

  const handleCanvasTap = (position: { x: number; y: number }) => {
    if (!armedDefectTypeId) return;
    placeDefect(position);
    pushDefect();
  };

  const handleUndo = () => {
    const last = peekLast();
    if (!last) return;
    if (last === "stroke") {
      canvasRef.current?.undoLastLine();
    } else {
      removeLastDefect();
    }
    popLast();
  };

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
            ref={canvasRef}
            armedDefectTypeId={armedDefectTypeId}
            onCanvasTap={handleCanvasTap}
            onStrokeComplete={pushStroke}
            onClearStrokes={() => removeAllOfType("stroke")}
            canUndo={canUndo}
            onUndo={handleUndo}
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
