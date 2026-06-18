import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { CreatureAttributes, SavedCreature } from "../analyzer/types";

const DB_NAME = "mahoujin";
const DB_VERSION = 1;
const STORE = "creatures";

interface MahoujinDB extends DBSchema {
  [STORE]: {
    key: string;
    value: SavedCreature;
    indexes: { capturedAt: string };
  };
}

let dbPromise: Promise<IDBPDatabase<MahoujinDB>> | null = null;

function getDB(): Promise<IDBPDatabase<MahoujinDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MahoujinDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("capturedAt", "capturedAt");
      },
    });
  }
  return dbPromise;
}

export async function saveCreature(
  attrs: CreatureAttributes,
  name: string,
  imageUrl: string
): Promise<SavedCreature> {
  const creature: SavedCreature = {
    ...attrs,
    id: crypto.randomUUID(),
    name: name.trim() || attrs.creature_name,
    imageUrl,
    capturedAt: new Date().toISOString(),
  };

  const db = await getDB();
  await db.put(STORE, creature);
  return creature;
}

/** All saved creatures, newest first. */
export async function getAll(): Promise<SavedCreature[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex(STORE, "capturedAt");
  return all.reverse();
}

/** Remove a saved creature by id. */
export async function deleteCreature(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE, id);
}
