import { useState } from "react";
import { X } from "lucide-react";
import type { DefectType } from "../../types/defect";
import { Button } from "../../components/ui";

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
      <Button variant="ghost" active={isArmed} fullWidth onClick={onArm}>
        <Swatch defectType={defectType} />
        {defectType.name}
      </Button>
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
      <Button
        variant="ghost-danger"
        size="sm"
        icon={X}
        disabled={isInUse}
        title={isInUse ? "In use — remove placed markers first" : "Remove"}
        aria-label="Remove defect type"
        onClick={onRemove}
      />
    </div>
  );
}
