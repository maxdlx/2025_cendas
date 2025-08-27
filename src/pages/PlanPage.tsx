import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskForm from "./TaskForm";
import ChecklistEditor from "./ChecklistEditor";
import { ChecklistItem, Task, ChecklistStatus } from "../types";
import { getDb, TaskDocType } from "../db";
import { useUserStore } from "../store";

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

const PlanPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const user = useUserStore((s) => s.user);
  const navigate = useNavigate();

  // Redirect to login if no user is set
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Load tasks from RxDB on mount and subscribe to changes
  useEffect(() => {
    if (!user) return;
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

  // Track where the user last clicked on the plan
  const [pendingXY, setPendingXY] = useState<{ x: number; y: number } | null>(
    null
  );

  // Popover state for marker details
  const [popoverTaskId, setPopoverTaskId] = useState<string | null>(null);

  // Edit state
  const [editTask, setEditTask] = useState<Task | null>(null);

  // Add or update task in RxDB
  const handleCreateTask = async (
    title: string,
    checklist: ChecklistItem[]
  ) => {
    const db = await getDb();
    const tasksCollection = db.tasks as any;
    if (editTask) {
      // Update existing
      const doc = await tasksCollection
        .findOne({ selector: { id: editTask.id } })
        .exec();
      if (doc) {
        await doc.patch({ title, checklist });
      }
      setEditTask(null);
      setPopoverTaskId(null);
    } else {
      // Create new
      const x = pendingXY?.x ?? 0.5;
      const y = pendingXY?.y ?? 0.5;
      await tasksCollection.insert({
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString(),
        title,
        checklist,
        x,
        y,
        userId: user,
      });
      setPendingXY(null); // reset after placing
    }
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
        <div
          className="relative mb-4 cursor-crosshair"
          style={{ width: 600, height: 400 }}
          onClick={(e) => {
            const rect = (e.target as HTMLDivElement).getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            setPendingXY({ x, y });
          }}
        >
          <img
            src="/image.png"
            alt="Floor Plan"
            className="w-full h-full object-contain border rounded shadow"
            style={{ width: 600, height: 400 }}
            draggable={false}
          />
          {/* Render task markers */}
          {tasks.map((task) => (
            <React.Fragment key={task.id}>
              <button
                key={task.id}
                className="absolute z-10 bg-blue-600 text-white rounded-full px-2 py-1 text-xs shadow border border-white hover:bg-blue-800"
                style={{
                  left: `${Math.round((task.x ?? 0.5) * 100)}%`,
                  top: `${Math.round((task.y ?? 0.5) * 100)}%`,
                  transform: "translate(-50%, -50%)",
                  minWidth: 24,
                  minHeight: 24,
                }}
                title={task.title}
                onClick={(e) => {
                  e.stopPropagation();
                  setPopoverTaskId(task.id === popoverTaskId ? null : task.id);
                }}
              >
                {task.title.substring(0, 2).toUpperCase()}
              </button>
              {popoverTaskId === task.id && (
                <div
                  className="absolute z-20 bg-white border rounded shadow-lg p-3 text-xs min-w-[180px] max-w-[220px]"
                  style={{
                    left: `${Math.round((task.x ?? 0.5) * 100)}%`,
                    top: `${Math.round((task.y ?? 0.5) * 100)}%`,
                    transform: "translate(-50%, -110%)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="font-bold text-sm mb-1">{task.title}</div>
                  <div className="mb-1">Checklist:</div>
                  <ul className="mb-1">
                    {task.checklist.map((item) => (
                      <li key={item.id} className="flex items-center">
                        <span className="mr-1">•</span>
                        <span>{item.text}</span>
                        <span className="ml-2 text-gray-400">
                          [{item.status}]
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="text-blue-600 hover:underline text-xs"
                      onClick={() => {
                        setEditTask(task);
                        setPopoverTaskId(null);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500 hover:underline text-xs"
                      onClick={async () => {
                        await handleDeleteTask(task.id);
                        setPopoverTaskId(null);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="text-gray-500 hover:underline text-xs"
                      onClick={() => setPopoverTaskId(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
          {/* Close popover when clicking outside */}
          {popoverTaskId && (
            <div
              className="fixed inset-0 z-10"
              style={{ cursor: "default" }}
              onClick={() => setPopoverTaskId(null)}
            />
          )}
          {/* Show marker and popover for new task placement */}
          {pendingXY && (
            <>
              <div
                className="absolute z-20 bg-green-500 opacity-70 rounded-full border-2 border-white pointer-events-none"
                style={{
                  left: `${Math.round(pendingXY.x * 100)}%`,
                  top: `${Math.round(pendingXY.y * 100)}%`,
                  transform: "translate(-50%, -50%)",
                  width: 24,
                  height: 24,
                }}
              />
              <div
                className="absolute z-30 bg-white border rounded shadow-lg p-3 text-xs min-w-[180px] max-w-[220px]"
                style={{
                  left: `${Math.round(pendingXY.x * 100)}%`,
                  top: `${Math.round(pendingXY.y * 100)}%`,
                  transform: "translate(-50%, -110%)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="font-bold text-sm mb-1">Neue Aufgabe</div>
                <TaskForm onCreate={handleCreateTask} />
                <button
                  className="mt-2 text-xs text-gray-500 hover:underline"
                  onClick={() => setPendingXY(null)}
                >
                  Abbrechen
                </button>
              </div>
            </>
          )}
        </div>
        {/* Only show edit form below if not placing a new task */}
        {!pendingXY && (
          <div className="w-full max-w-xl bg-white rounded shadow p-4 mb-4">
            <TaskForm
              onCreate={handleCreateTask}
              {...(editTask
                ? {
                    initialTitle: editTask.title,
                    initialChecklist: editTask.checklist,
                  }
                : {})}
            />
            {editTask && (
              <button
                className="mt-2 text-xs text-gray-500 hover:underline"
                onClick={() => setEditTask(null)}
              >
                Cancel edit
              </button>
            )}
          </div>
        )}
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
