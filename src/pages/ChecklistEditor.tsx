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
}

const ChecklistEditor: React.FC<ChecklistEditorProps> = ({
  checklist,
  onStatusChange,
}) => (
  <ul className="ml-4 mt-1">
    {checklist.map((item) => (
      <li key={item.id} className="flex items-center text-sm mb-1">
        <span className="mr-2">•</span>
        <span className="flex-1">{item.text}</span>
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
      </li>
    ))}
  </ul>
);

export default ChecklistEditor;
