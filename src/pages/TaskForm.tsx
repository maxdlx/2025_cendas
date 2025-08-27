import React, { useState } from "react";
import { DEFAULT_CHECKLIST, ChecklistItem } from "../types";

interface TaskFormProps {
  onCreate: (title: string, checklist: ChecklistItem[]) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onCreate }) => {
  const [title, setTitle] = useState("");
  const [checklist, setChecklist] =
    useState<ChecklistItem[]>(DEFAULT_CHECKLIST);

  const handleAddChecklistItem = () => {
    setChecklist([
      ...checklist,
      { id: Date.now().toString(), text: "", status: "not_started" },
    ]);
  };

  const handleChecklistTextChange = (idx: number, text: string) => {
    setChecklist((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, text } : item))
    );
  };

  const handleRemoveChecklistItem = (idx: number) => {
    setChecklist((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), checklist);
    setTitle("");
    setChecklist(DEFAULT_CHECKLIST);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        className="border p-2 rounded w-full mb-2"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="mb-2">
        <div className="font-semibold mb-1">Checklist</div>
        {checklist.map((item, idx) => (
          <div key={item.id} className="flex items-center mb-1">
            <input
              className="border p-1 rounded flex-1 mr-2"
              placeholder="Checklist item"
              value={item.text}
              onChange={(e) => handleChecklistTextChange(idx, e.target.value)}
            />
            <button
              type="button"
              className="text-red-500 px-2"
              onClick={() => handleRemoveChecklistItem(idx)}
              disabled={checklist.length <= 1}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-blue-500 mt-1"
          onClick={handleAddChecklistItem}
        >
          + Add item
        </button>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Create Task
      </button>
    </form>
  );
};

export default TaskForm;
