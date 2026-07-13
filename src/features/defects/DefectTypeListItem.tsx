import { useState } from "react";
import type { DefectType } from "../../types/defect";

type PlacementItemProps = {
  mode: "place";
  defectType: DefectType;
  isArmed: boolean;
  onArm: () => void;
};

type EditItemProps = {
  mode: "edit";
  defectType: DefectType;
  isInUse: boolean;
  onRename: (name: string) => void;
  onRemove: () => void;
};

type DefectTypeListItemProps = PlacementItemProps | EditItemProps;

function Swatch({ defectType }: { defectType: DefectType }) {
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
      style={{ backgroundColor: defectType.color }}
    >
      {defectType.abbreviation}
    </span>
  );
}

export default function DefectTypeListItem(props: DefectTypeListItemProps) {
  const [draftName, setDraftName] = useState(props.defectType.name);

  if (props.mode === "place") {
    const { defectType, isArmed, onArm } = props;
    return (
      <button
        onClick={onArm}
        className={`flex w-full items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${
          isArmed ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
        }`}
      >
        <Swatch defectType={defectType} />
        {defectType.name}
      </button>
    );
  }

  const { defectType, isInUse, onRename, onRemove } = props;

  return (
    <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
      <Swatch defectType={defectType} />
      <input
        type="text"
        value={draftName}
        onChange={(e) => setDraftName(e.target.value)}
        onBlur={() => onRename(draftName)}
        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
      />
      <button
        onClick={onRemove}
        disabled={isInUse}
        title={isInUse ? "In use — remove placed markers first" : "Remove"}
        className="shrink-0 text-sm font-bold text-rose-500 disabled:cursor-not-allowed disabled:text-slate-300"
      >
        &times;
      </button>
    </div>
  );
}
