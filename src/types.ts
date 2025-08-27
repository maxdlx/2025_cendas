export type ChecklistStatus =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "final_check"
  | "done";

export interface ChecklistItem {
  id: string;
  text: string;
  status: ChecklistStatus;
}

export interface Task {
  id: string;
  title: string;
  checklist: ChecklistItem[];
  x: number; // position on plan
  y: number;
  userId: string;
}

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "1", text: "Vorbereitung", status: "not_started" },
  { id: "2", text: "Material prüfen", status: "not_started" },
  { id: "3", text: "Ausführung", status: "not_started" },
  { id: "4", text: "Abschlusskontrolle", status: "not_started" },
];
