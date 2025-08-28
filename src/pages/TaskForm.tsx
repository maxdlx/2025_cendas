import React, { useState } from "react";
import { DEFAULT_CHECKLIST, ChecklistItem, ChecklistStatus } from "../types";
import ChecklistEditor from "./ChecklistEditor";

interface TaskFormProps {
  onCreate: (title: string, checklist: ChecklistItem[]) => void;
  initialTitle?: string;
  initialChecklist?: ChecklistItem[];
}

const TaskForm: React.FC<TaskFormProps> = ({
  onCreate,
  initialTitle = "",
  initialChecklist,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    initialChecklist ?? DEFAULT_CHECKLIST
  );
  const [error, setError] = useState<string | null>(null);

  // Ref for the title input
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  // Reset form state when editing a different task
  React.useEffect(() => {
    setTitle(initialTitle);
    setChecklist(initialChecklist ?? DEFAULT_CHECKLIST);
    // Focus the title input when editing/creating
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [initialTitle, initialChecklist]);

  const handleAddChecklistItem = () => {
    setChecklist([
      ...checklist,
      {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString(),
        text: "",
        status: "not_started",
      },
    ]);
  };

  const handleChecklistTextChange = (itemId: string, text: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, text } : item))
    );
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }
    setError(null);
    onCreate(title.trim(), checklist);
    setTitle("");
    setChecklist(DEFAULT_CHECKLIST);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        ref={titleInputRef}
        className="border p-2 rounded w-full mb-2"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        aria-invalid={!!error}
        aria-describedby={error ? "task-title-error" : undefined}
      />
      {error && (
        <div id="task-title-error" className="text-red-600 text-xs mb-2">
          {error}
        </div>
      )}
      <div className="mb-2">
        <div className="font-semibold mb-1">Checklist</div>
        <ChecklistEditor
          checklist={checklist}
          onStatusChange={(itemId, status) =>
            setChecklist((prev) =>
              prev.map((item) =>
                item.id === itemId
                  ? { ...item, status: status as ChecklistStatus }
                  : item
              )
            )
          }
          onTextChange={handleChecklistTextChange}
          onRemoveItem={handleRemoveChecklistItem}
          editable
          hideStatus={true}
        />
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
        {initialTitle ? "Update Task" : "Create Task"}
      </button>
    </form>
  );
};

export default TaskForm;
