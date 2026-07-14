import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import DrawingPadCanvas, {
  type DrawingBackground,
  type DrawingPadCanvasHandle,
  type DrawLine,
} from "../../../components/sketch/ui/DrawingPadCanvas";
import { Button } from "../../../components/ui";
import { useDefectPlacement } from "../../../features/defects/useDefectPlacement";
import { useDefectTypes } from "../../../features/defects/useDefectTypes";
import { useUndoHistory } from "../../../features/canvas/useUndoHistory";
import {
  useDrawingPersistence,
  type DrawingPersistenceRecord,
} from "../../../features/persistence/useDrawingPersistence";

type DrawingPadPageProps = {
  drawingId: string;
  title?: string;
  onBack?: () => void;
};

export default function DrawingPadPage({ drawingId, title = "Untitled drawing", onBack }: DrawingPadPageProps) {
  const { isLoading, loadedRecord, saveStatus, saveError, scheduleSave } = useDrawingPersistence(drawingId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Drawing</p>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === "saving" ? <span className="text-xs text-slate-500">Saving...</span> : null}
          {saveStatus === "saved" ? <span className="text-xs text-emerald-600">Saved</span> : null}
          {saveStatus === "error" ? (
            <span className="text-xs text-rose-600">{saveError ?? "Save failed"}</span>
          ) : null}
          {onBack ? (
            <Button variant="outline" icon={ArrowLeft} onClick={onBack}>
              Back
            </Button>
          ) : null}
        </div>
      </div>
      {isLoading || !loadedRecord ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Loading drawing...
        </div>
      ) : (
        <DrawingPadWorkspace loadedRecord={loadedRecord} scheduleSave={scheduleSave} />
      )}
    </div>
  );
}

type DrawingPadWorkspaceProps = {
  loadedRecord: DrawingPersistenceRecord;
  scheduleSave: (record: DrawingPersistenceRecord) => void;
};

function DrawingPadWorkspace({ loadedRecord, scheduleSave }: DrawingPadWorkspaceProps) {
  const {
    armedDefectTypeId,
    armDefectType,
    placedDefects,
    placeDefect,
    pendingPosition,
    cancelPending,
    removeLastDefect,
  } = useDefectPlacement();
  const { defectTypes, addType } = useDefectTypes(placedDefects);
  const { canUndo, pushStroke, pushDefect, peekLast, popLast, removeAllOfType } = useUndoHistory();
  const canvasRef = useRef<DrawingPadCanvasHandle>(null);

  const [lines, setLines] = useState<DrawLine[]>(loadedRecord.lines);
  const [background, setBackground] = useState<DrawingBackground | null>(loadedRecord.background);

  useEffect(() => {
    scheduleSave({ lines, placedDefects, background });
  }, [lines, placedDefects, background, scheduleSave]);

  const handleCanvasTap = (position: { x: number; y: number }) => {
    if (!armedDefectTypeId) return;
    const isCompletingPlacement = pendingPosition !== null;
    placeDefect(position);
    if (isCompletingPlacement) pushDefect();
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
      <div className="flex flex-col gap-4">
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
          pendingPosition={pendingPosition}
          onCancelPending={cancelPending}
          onToolSelect={() => {
            if (armedDefectTypeId) {
              armDefectType(armedDefectTypeId);
            }
          }}
          onArmDefectType={armDefectType}
          onAddType={addType}
        />
      </div>
    </div>
  );
}
