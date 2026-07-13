import { useState } from "react";
import { Check, Pencil } from "lucide-react";
import type { DefectType } from "../../types/defect";
import { Button, Card } from "../../components/ui";
import AddDefectTypeForm from "./AddDefectTypeForm";
import DefectTypeListItem from "./DefectTypeListItem";

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
  onRenameType,
  onRemoveType,
  isTypeInUse,
}: DefectPanelProps) {
  const [mode, setMode] = useState<"place" | "edit">("place");

  return (
    <Card className="flex flex-col gap-3 lg:w-72">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Defects</h2>
        <Button
          variant="ghost"
          size="sm"
          icon={mode === "place" ? Pencil : Check}
          onClick={() => setMode(mode === "place" ? "edit" : "place")}
        >
          {mode === "place" ? "Edit list" : "Done"}
        </Button>
      </div>

      {defectTypes.length === 0 ? (
        <p className="text-xs text-slate-500">No defect types yet — add one below.</p>
      ) : (
        <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto pr-1">
          {defectTypes.map((defectType) =>
            mode === "place" ? (
              <DefectTypeListItem
                key={defectType.id}
                mode="place"
                defectType={defectType}
                isArmed={armedDefectTypeId === defectType.id}
                onArm={() => onArmDefectType(defectType.id)}
              />
            ) : (
              <DefectTypeListItem
                key={defectType.id}
                mode="edit"
                defectType={defectType}
                isInUse={isTypeInUse(defectType.id)}
                onRename={(name) => onRenameType(defectType.id, name)}
                onRemove={() => onRemoveType(defectType.id)}
              />
            ),
          )}
        </div>
      )}

      {mode === "edit" ? (
        <AddDefectTypeForm onAdd={onAddType} />
      ) : defectTypes.length > 0 ? (
        <p className="text-xs text-slate-500">Tap the canvas to place a marker.</p>
      ) : null}
    </Card>
  );
}
