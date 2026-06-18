import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { CreatureAttributes, SavedCreature } from "../analyzer/types";

const DB_NAME = "mahoujin";
const DB_VERSION = 2;
const STORE = "creatures";

interface MahoujinDB extends DBSchema {
  [STORE]: {
    key: string;
    value: SavedCreature;
    indexes: { capturedAt: string };
  };
}

let dbPromise: Promise<IDBPDatabase<MahoujinDB>> | null = null;

function migrateV1Record(old: Record<string, unknown>): SavedCreature {
  const stats = old.stats as { hp?: number; mp?: number; atk?: number; def?: number } | undefined;
  const complexity = stats
    ? Math.round(((stats.hp ?? 50) + (stats.mp ?? 50) + (stats.atk ?? 50) + (stats.def ?? 50)) / 4)
    : 50;
  return {
    id: old.id as string,
    name: (old.name ?? old.creatureName ?? "Unknown") as string,
    imageUrl: (old.imageUrl ?? "") as string,
    capturedAt: (old.capturedAt ?? new Date().toISOString()) as string,
    creature_name: (old.creatureName ?? old.creature_name ?? "Unknown") as string,
    creature_archetype: (old.archetype ?? old.creature_archetype ?? "Unknown") as string,
    powers: Array.isArray(old.powers)
      ? old.powers
      : [(old.element as string | undefined)?.toLowerCase() ?? "mystery"],
    complexity,
    summary_description: (old.description ?? old.summary_description ?? "") as string,
    confidence: (old.confidence ?? "low") as "high" | "low",
  };
}

function getDB(): Promise<IDBPDatabase<MahoujinDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MahoujinDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, tx) {
        if (oldVersion < 1) {
          const store = db.createObjectStore(STORE, { keyPath: "id" });
          store.createIndex("capturedAt", "capturedAt");
        }
        if (oldVersion === 1) {
          // Migrate v1 records (old field names) to v2 shape
          const store = tx.objectStore(STORE);
          store.openCursor().then(function migrate(cursor): Promise<unknown> | undefined {
            if (!cursor) return;
            const migrated = migrateV1Record(cursor.value as unknown as Record<string, unknown>);
            cursor.update(migrated);
            return cursor.continue().then(migrate);
          });
        }
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
