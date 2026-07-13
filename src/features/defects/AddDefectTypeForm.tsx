import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui";

const NEW_TYPE_COLOR = "#64748b";

type AddDefectTypeFormProps = {
  onAdd: (name: string, color: string) => void;
};

export default function AddDefectTypeForm({ onAdd }: AddDefectTypeFormProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name, NEW_TYPE_COLOR);
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New defect type"
        className="flex-1 rounded-full border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <Button type="submit" icon={Plus} size="sm">
        Add
      </Button>
    </form>
  );
}
