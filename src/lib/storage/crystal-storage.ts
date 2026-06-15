import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { ARCHETYPE_REGISTRY } from "../analyzer/archetypes";
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

/**
 * Persist a kept creature to the Crystal Shelf. Derives `id`, `category`
 * (denormalized from the Archetype Registry) and `capturedAt` at save time.
 *
 * @param attrs   The creature's attributes from the summon pipeline.
 * @param name    The player's final name (defaults to `attrs.creatureName`).
 * @param imageUrl The rendered sprite as a data URL.
 * @returns The fully-formed SavedCreature that was persisted.
 */
export async function saveCreature(
  attrs: CreatureAttributes,
  name: string,
  imageUrl: string
): Promise<SavedCreature> {
  const creature: SavedCreature = {
    ...attrs,
    id: crypto.randomUUID(),
    name: name.trim() || attrs.creatureName,
    category: ARCHETYPE_REGISTRY[attrs.archetype].category,
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
