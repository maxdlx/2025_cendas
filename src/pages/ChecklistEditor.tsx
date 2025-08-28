import React from "react";
import { ChecklistItem, ChecklistStatus } from "../types";

const STATUS_LABELS: Record<ChecklistStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  blocked: "Blocked",
  final_check: "Final Check awaiting",
  done: "Done",
};

interface ChecklistEditorProps {
  checklist: ChecklistItem[];
  onStatusChange: (itemId: string, status: ChecklistStatus) => void;
  onTextChange?: (itemId: string, text: string) => void;
  onRemoveItem?: (itemId: string) => void;
  editable?: boolean;
  hideStatus?: boolean;
}

const ChecklistEditor: React.FC<ChecklistEditorProps> = ({
  checklist,
  onStatusChange,
  onTextChange,
  onRemoveItem,
  editable = false,
  hideStatus = false,
}) => (
  <ul className="ml-4 mt-1">
    {checklist.map((item) => (
      <li key={item.id} className="flex items-center text-sm mb-1">
        <span className="mr-2">•</span>
        {editable ? (
          <input
            className="border p-1 rounded flex-1 mr-2"
            value={item.text}
            onChange={(e) =>
              onTextChange && onTextChange(item.id, e.target.value)
            }
          />
        ) : (
          <span className="flex-1">{item.text}</span>
        )}
        {!hideStatus && (
          <select
            className="ml-2 border rounded px-1 py-0.5 text-xs"
            value={item.status}
            onChange={(e) =>
              onStatusChange(item.id, e.target.value as ChecklistStatus)
            }
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        )}
        {editable && onRemoveItem && (
          <button
            type="button"
            className="text-red-500 px-2"
            onClick={() => onRemoveItem(item.id)}
            disabled={checklist.length <= 1}
          >
            ✕
          </button>
        )}
      </li>
    ))}
  </ul>
);

export default ChecklistEditor;
