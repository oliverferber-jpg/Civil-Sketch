import { useMemo, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import type { DefectType } from "../../types/defect";
import { Button } from "../../components/ui";

const NEW_OPTION_VALUE = "__new__";

function OptionButton({
  label,
  value,
  onSelect,
}: {
  label: string;
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
    >
      <span>{label}</span>
    </button>
  );
}

type DefectTypeDropdownProps = {
  defectTypes: DefectType[];
  armedDefectTypeId: string | null;
  onArmDefectType: (id: string) => void;
  onAddType: (name: string, color: string) => void;
};

function Swatch({ defectType }: { defectType: DefectType }) {
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
      style={{ backgroundColor: defectType.color }}
    >
      {defectType.abbreviation}
    </span>
  );
}

export default function DefectTypeDropdown({
  defectTypes,
  armedDefectTypeId,
  onArmDefectType,
  onAddType,
}: DefectTypeDropdownProps) {
  const [open, setOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState("#64748b");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const selectedDefect = useMemo(
    () => defectTypes.find((defectType) => defectType.id === armedDefectTypeId) ?? null,
    [armedDefectTypeId, defectTypes],
  );

  const handleSelect = (value: string) => {
    if (value === NEW_OPTION_VALUE) {
      setIsCreatingNew(true);
      setDraftName("");
      setDraftColor("#64748b");
      return;
    }

    setIsCreatingNew(false);
    onArmDefectType(value);
    setOpen(false);
  };

  const handleAdd = () => {
    const name = draftName.trim();
    if (!name) return;

    onAddType(name, draftColor);
    setDraftName("");
    setDraftColor("#64748b");
    setIsCreatingNew(false);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <Button
        variant="outline"
        size="sm"
        fullWidth
        className="justify-between"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="flex items-center gap-2">
          {selectedDefect ? <Swatch defectType={selectedDefect} /> : null}
          <span>{selectedDefect ? selectedDefect.name : "Select defect"}</span>
        </span>
        <ChevronDown size={14} />
      </Button>

      {open ? (
        <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <div className="flex flex-col gap-1">
            <OptionButton label="Select defect" value="" onSelect={handleSelect} />
            {defectTypes.map((defectType) => (
              <OptionButton
                key={defectType.id}
                label={defectType.name}
                value={defectType.id}
                onSelect={handleSelect}
              />
            ))}
            <OptionButton label="Add new defect…" value={NEW_OPTION_VALUE} onSelect={handleSelect} />
          </div>

          {isCreatingNew ? (
            <div className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="New defect type"
                className="w-full rounded-full border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-600">Color</label>
                <input
                  type="color"
                  value={draftColor}
                  onChange={(e) => setDraftColor(e.target.value)}
                  className="h-8 w-12 cursor-pointer rounded border border-slate-300 bg-transparent p-1"
                />
                <Button type="button" icon={Plus} size="sm" onClick={handleAdd}>
                  Add
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
