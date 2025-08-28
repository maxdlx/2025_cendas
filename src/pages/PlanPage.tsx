import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskForm from "./TaskForm";
import ChecklistEditor from "./ChecklistEditor";
import { ChecklistItem, Task, ChecklistStatus } from "../types";
import { getDb, TaskDocType } from "../db";
import { useUserStore } from "../store";
import { Subscription } from "rxjs";

// Delete a task from RxDB
const handleDeleteTask = async (taskId: string) => {
  const db = await getDb();
  const tasksCollection = db.tasks;
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
  const logout = useUserStore((s) => s.logout);
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
    let sub: Subscription;
    let mounted = true;
    getDb().then((db) => {
      const tasksCollection = db.tasks;
      // Only show tasks for current user
      sub = tasksCollection
        .find({ selector: { userId: user } })
        .$.subscribe((docs: TaskDocType[]) => {
          if (mounted) {
            setTasks(docs);
          }
        });
    });
    return () => {
      mounted = false;
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [user]);

  // Track where the user last clicked on the plan (plan-relative and screen coordinates)
  const [pendingXY, setPendingXY] = useState<{
    x: number;
    y: number;
    clientX: number;
    clientY: number;
  } | null>(null);

  // Popover state for marker details
  const [popoverTaskId, setPopoverTaskId] = useState<string | null>(null);

  // Edit state
  const [editTask, setEditTask] = useState<Task | null>(null);

  // Delete confirmation state
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // Add or update task in RxDB
  const handleCreateTask = async (
    title: string,
    checklist: ChecklistItem[]
  ) => {
    const db = await getDb();
    const tasksCollection = db.tasks;
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
    const tasksCollection = db.tasks;
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
      <header className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <span className="text-xl font-bold">Construction Tasks</span>
        <button
          className="bg-blue-800 hover:bg-blue-900 text-white text-xs px-3 py-1 rounded ml-4"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div
          className="relative mb-4 cursor-crosshair"
          style={{ width: 600, height: 400 }}
          onClick={(e) => {
            const rect = (e.target as HTMLDivElement).getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            setPendingXY({ x, y, clientX: e.clientX, clientY: e.clientY });
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
                  setPendingXY(null);
                }}
              >
                {task.title.substring(0, 3).toUpperCase()}
              </button>
              {popoverTaskId === task.id && !pendingXY && (
                <div
                  className="absolute z-20 bg-white border rounded shadow-lg p-3 text-xs min-w-[320px] max-w-[540px]"
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
                        <span className="whitespace-nowrap">{item.text}</span>
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
                      onClick={() => setDeleteTaskId(task.id)}
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
          {popoverTaskId && !editTask && (
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
                className="fixed z-30 bg-white border rounded shadow-lg p-3 text-xs min-w-[220px] max-w-[260px]"
                style={{
                  left: pendingXY.clientX + 10,
                  top: pendingXY.clientY + 10,
                  // prevent overflow
                  maxWidth: 260,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="font-bold text-sm mb-1">New Task</div>
                <TaskForm onCreate={handleCreateTask} />
                <button
                  className="mt-2 text-xs text-gray-500 hover:underline"
                  onClick={() => setPendingXY(null)}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
        {/* Only show edit form below if not placing a new task, and only show new task form when a position is clicked */}
        {!pendingXY && editTask && (
          <div className="w-full max-w-xl bg-white rounded shadow p-4 mb-4">
            <TaskForm
              onCreate={handleCreateTask}
              initialTitle={editTask.title}
              initialChecklist={editTask.checklist}
            />
            <button
              className="mt-2 text-xs text-gray-500 hover:underline"
              onClick={() => setEditTask(null)}
            >
              Cancel edit
            </button>
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
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{task.title}</span>
                    <div className="flex gap-2">
                      {!(editTask && editTask.id === task.id) && (
                        <>
                          <button
                            className="text-blue-600 text-xs px-2 py-1 rounded hover:underline"
                            onClick={() => setEditTask(task)}
                            disabled={!!editTask && editTask.id === task.id}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-500 text-xs px-2 py-1 rounded hover:bg-red-100"
                            onClick={() => setDeleteTaskId(task.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
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
        {/* Delete confirmation dialog */}
        {deleteTaskId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded shadow-lg p-6 min-w-[260px] max-w-[90vw] text-center">
              <div className="font-bold mb-2">Delete Task?</div>
              <div className="mb-4 text-sm text-gray-700">
                Are you sure you want to delete this task? This cannot be
                undone.
              </div>
              <div className="flex justify-center gap-4">
                <button
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                  onClick={async () => {
                    await handleDeleteTask(deleteTaskId);
                    setDeleteTaskId(null);
                    setPopoverTaskId((id) => (id === deleteTaskId ? null : id));
                    setEditTask((t) => (t && t.id === deleteTaskId ? null : t));
                  }}
                >
                  Delete
                </button>
                <button
                  className="bg-gray-200 text-gray-800 px-4 py-1 rounded hover:bg-gray-300"
                  onClick={() => setDeleteTaskId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PlanPage;
