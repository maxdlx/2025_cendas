// Delete a task from RxDB
const handleDeleteTask = async (taskId: string) => {
  const db = await getDb();
  const tasksCollection = db.tasks as any;
  const doc = await tasksCollection
    .findOne({ selector: { id: taskId } })
    .exec();
  if (doc) {
    await doc.remove();
  }
};
import React, { useEffect, useState } from "react";
import TaskForm from "./TaskForm";
import ChecklistEditor from "./ChecklistEditor";
import { ChecklistItem, Task, ChecklistStatus } from "../types";
import { getDb, TaskDocType } from "../db";
import { useUserStore } from "../store";

const PlanPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const user = useUserStore((s) => s.user) || "demo";

  // Load tasks from RxDB on mount and subscribe to changes
  useEffect(() => {
    let sub: any;
    let mounted = true;
    getDb().then((db) => {
      const tasksCollection = db.tasks as any;
      // Only show tasks for current user
      sub = tasksCollection
        .find({ selector: { userId: user } })
        .$.subscribe((docs: TaskDocType[]) => {
          if (mounted) setTasks(docs.map((d: any) => d._data));
        });
    });
    return () => {
      mounted = false;
      if (sub) sub.unsubscribe();
    };
  }, [user]);

  // Add new task to RxDB
  const handleCreateTask = async (
    title: string,
    checklist: ChecklistItem[]
  ) => {
    const db = await getDb();
    const tasksCollection = db.tasks as any;
    await tasksCollection.insert({
      id: Date.now().toString(),
      title,
      checklist,
      x: 0.5,
      y: 0.5,
      userId: user,
    });
  };

  // Update checklist item status in RxDB
  const handleChecklistStatusChange = async (
    taskId: string,
    itemId: string,
    status: ChecklistStatus
  ) => {
    const db = await getDb();
    const tasksCollection = db.tasks as any;
    const doc = await tasksCollection
      .findOne({ selector: { id: taskId } })
      .exec();
    if (doc) {
      const updatedChecklist = doc._data.checklist.map((item: ChecklistItem) =>
        item.id === itemId ? { ...item, status } : item
      );
      await doc.patch({ checklist: updatedChecklist });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-600 text-white p-4 text-xl font-bold">
        Construction Tasks
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <img
          src="/image.png"
          alt="Floor Plan"
          className="max-w-full h-auto border rounded shadow mb-4"
        />
        {/* Task creation form */}
        <div className="w-full max-w-xl bg-white rounded shadow p-4 mb-4">
          <TaskForm onCreate={handleCreateTask} />
        </div>
        {/* Task board/list */}
        <div className="w-full max-w-xl bg-white rounded shadow p-4">
          <h2 className="text-lg font-bold mb-2">Tasks</h2>
          {tasks.length === 0 ? (
            <div className="text-gray-500">No tasks yet.</div>
          ) : (
            <ul>
              {tasks.map((task) => (
                <li key={task.id} className="mb-2 border-b pb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{task.title}</span>
                    <button
                      className="text-red-500 text-xs ml-2 px-2 py-1 rounded hover:bg-red-100"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <ChecklistEditor
                    checklist={task.checklist}
                    onStatusChange={(itemId, status) =>
                      handleChecklistStatusChange(task.id, itemId, status)
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default PlanPage;
