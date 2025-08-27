import { createRxDatabase, RxDatabase, RxCollection, RxJsonSchema } from "rxdb";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { addRxPlugin } from "rxdb/plugins/core";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { Task } from "./types";

addRxPlugin(RxDBDevModePlugin);

export interface TaskDocType extends Task {}

const taskSchema: RxJsonSchema<TaskDocType> = {
  title: "task schema",
  version: 0,
  description: "Describes a construction task",
  type: "object",
  primaryKey: "id",
  properties: {
    id: { type: "string", maxLength: 100 },
    title: { type: "string" },
    checklist: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          text: { type: "string" },
          status: { type: "string" },
        },
        required: ["id", "text", "status"],
      },
    },
    x: { type: "number" },
    y: { type: "number" },
    userId: { type: "string" },
  },
  required: ["id", "title", "checklist", "x", "y", "userId"],
};

export let dbPromise: Promise<RxDatabase> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = createRxDatabase({
      name: "construction_tasks",
      storage: getRxStorageDexie(),
      multiInstance: false,
    }).then(async (db) => {
      await db.addCollections({
        tasks: { schema: taskSchema },
      });
      return db;
    });
  }
  return dbPromise;
}

export type TaskCollection = RxCollection<TaskDocType>;
