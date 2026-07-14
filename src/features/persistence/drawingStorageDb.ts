import type { DrawLine } from "../../components/sketch/ui/DrawingPadCanvas";
import type { PlacedDefect } from "../../types/defect";

export type PersistedBackground = { blob: Blob; name: string };

export type PersistedDrawingState = {
  drawingId: string;
  lines: DrawLine[];
  placedDefects: PlacedDefect[];
  background: PersistedBackground | null;
  updatedAt: string;
};

const DB_NAME = "civil-sketch";
const DB_VERSION = 1;
const STORE_NAME = "drawing-canvas-state";

let dbPromise: Promise<IDBDatabase> | null = null;

export function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDrawingDb(): Promise<IDBDatabase> {
  if (!isIndexedDbAvailable()) {
    return Promise.reject(new Error("IndexedDB is not available in this browser context."));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "drawingId" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB."));
    });
  }

  return dbPromise;
}

export async function getPersistedDrawingState(drawingId: string): Promise<PersistedDrawingState | null> {
  const db = await openDrawingDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(drawingId);

    request.onsuccess = () => resolve((request.result as PersistedDrawingState | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error("Failed to read drawing state."));
  });
}

export async function putPersistedDrawingState(record: PersistedDrawingState): Promise<void> {
  const db = await openDrawingDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Failed to save drawing state."));
  });
}
