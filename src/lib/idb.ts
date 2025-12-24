/**
 * IndexedDB helper for soundtrack persistence
 * DB name: "continuum_soundtrack"
 * Store: "tracks" keyed by id
 */

const DB_NAME = "continuum_soundtrack";
const DB_VERSION = 1;
const STORE_NAME = "tracks";

let db: IDBDatabase | null = null;

export interface TrackBlob {
  id: string;
  title: string;
  blob: Blob;
}

/**
 * Initialize IndexedDB
 */
async function initDb(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

/**
 * Save a track blob to IndexedDB
 */
export async function saveTrackBlob({
  id,
  title,
  blob,
}: TrackBlob): Promise<void> {
  const database = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, title, blob });

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error("Failed to save track blob"));
    };
  });
}

/**
 * Get all track blobs from IndexedDB
 */
export async function getAllTrackBlobs(): Promise<TrackBlob[]> {
  const database = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result || [];
      resolve(
        results.map((r) => ({
          id: r.id,
          title: r.title,
          blob: r.blob,
        }))
      );
    };

    request.onerror = () => {
      reject(new Error("Failed to get track blobs"));
    };
  });
}

/**
 * Delete a track blob from IndexedDB
 */
export async function deleteTrackBlob(id: string): Promise<void> {
  const database = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error("Failed to delete track blob"));
    };
  });
}





