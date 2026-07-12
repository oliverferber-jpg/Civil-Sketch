import { useState } from "react";
import type { DefectType } from "../../types/defect";
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
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:w-72">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Defects</h2>
        <button
          onClick={() => setMode(mode === "place" ? "edit" : "place")}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
        >
          {mode === "place" ? "Edit list" : "Done"}
        </button>
      </div>

      <div className="flex flex-col gap-2">
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

      {mode === "edit" ? (
        <AddDefectTypeForm onAdd={onAddType} />
      ) : (
        <p className="text-xs text-slate-500">Tap the canvas to place a marker.</p>
      )}
    </div>
  );
}
