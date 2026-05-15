import { openDB, type DBSchema, type IDBPDatabase } from "idb";

const DB_NAME = "dressly-pending";
const STORE_NAME = "pending-actions";

interface PendingAction {
  id: string;
  type: "like" | "unlike" | "publish" | "unpublish" | "save-outfit";
  payload: unknown;
  timestamp: number;
}

interface PendingDB extends DBSchema {
  "pending-actions": {
    key: string;
    value: PendingAction;
  };
}

let dbPromise: Promise<IDBPDatabase<PendingDB>> | null = null;

const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<PendingDB>(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      },
    });
  }
  return dbPromise;
};

export async function addToPendingQueue(
  type: PendingAction["type"],
  payload: unknown
) {
  const db = await getDB();
  const action: PendingAction = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    payload,
    timestamp: Date.now(),
  };
  await db.put(STORE_NAME, action);
  return action.id;
}

export async function getPendingActions(): Promise<PendingAction[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function removeFromPendingQueue(id: string) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function clearPendingQueue() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

export async function getPendingActionsCount(): Promise<number> {
  const db = await getDB();
  return db.count(STORE_NAME);
}