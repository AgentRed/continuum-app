/**
 * Soundtrack Database (IndexedDB)
 * 
 * Stores MP3 file blobs in IndexedDB for persistence across reloads.
 * Uses localStorage only for lightweight settings.
 */

const DB_NAME = "continuum_soundtrack_db";
const DB_VERSION = 1;
const STORE_NAME = "tracks";

export type Track = {
  id: string;
  fileName: string;
  mimeType: string;
  createdAt: string;
};

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
export async function initDb(): Promise<IDBDatabase> {
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
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        objectStore.createIndex("fileName", "fileName", { unique: false });
        objectStore.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

/**
 * List all tracks
 */
export async function listTracks(): Promise<Track[]> {
  try {
    const database = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error("Failed to list tracks"));
      };
    });
  } catch (err) {
    console.error("Error listing tracks:", err);
    return [];
  }
}

/**
 * Add tracks from File objects
 */
export async function addTracks(files: File[]): Promise<Track[]> {
  try {
    const database = await initDb();
    const tracks: Track[] = [];

    for (const file of files) {
      if (file.type !== "audio/mpeg" && !file.name.toLowerCase().endsWith(".mp3")) {
        continue;
      }

      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const track: Track = {
        id,
        fileName: file.name,
        mimeType: file.type || "audio/mpeg",
        createdAt: new Date().toISOString(),
      };

      // Store the blob
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({
          ...track,
          blob: file,
        });

        request.onsuccess = () => {
          tracks.push(track);
          resolve();
        };

        request.onerror = () => {
          reject(new Error(`Failed to add track: ${file.name}`));
        };
      });
    }

    return tracks;
  } catch (err) {
    console.error("Error adding tracks:", err);
    throw err;
  }
}

/**
 * Remove a track by ID
 */
export async function removeTrack(id: string): Promise<void> {
  try {
    const database = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error("Failed to remove track"));
      };
    });
  } catch (err) {
    console.error("Error removing track:", err);
    throw err;
  }
}

/**
 * Clear all tracks
 */
export async function clearTracks(): Promise<void> {
  try {
    const database = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error("Failed to clear tracks"));
      };
    });
  } catch (err) {
    console.error("Error clearing tracks:", err);
    throw err;
  }
}

/**
 * Get a track's blob by ID
 */
export async function getTrackBlob(id: string): Promise<Blob | null> {
  try {
    const database = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.blob) {
          resolve(result.blob);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(new Error("Failed to get track blob"));
      };
    });
  } catch (err) {
    console.error("Error getting track blob:", err);
    return null;
  }
}

/**
 * Load lightweight settings from localStorage
 */
export function loadSettings(): {
  lastPlayedTrackId: string | null;
  lastPlaybackPosition: number;
  volume: number;
} {
  try {
    const stored = localStorage.getItem("continuum_soundtrack_settings_v1");
    if (!stored) {
      return {
        lastPlayedTrackId: null,
        lastPlaybackPosition: 0,
        volume: 1,
      };
    }
    const parsed = JSON.parse(stored);
    return {
      lastPlayedTrackId: parsed.lastPlayedTrackId || null,
      lastPlaybackPosition: parsed.lastPlaybackPosition || 0,
      volume: parsed.volume ?? 1,
    };
  } catch (err) {
    console.error("Error loading settings:", err);
    return {
      lastPlayedTrackId: null,
      lastPlaybackPosition: 0,
      volume: 1,
    };
  }
}

/**
 * Save lightweight settings to localStorage
 */
export function saveSettings(settings: {
  lastPlayedTrackId: string | null;
  lastPlaybackPosition: number;
  volume: number;
}): void {
  try {
    localStorage.setItem("continuum_soundtrack_settings_v1", JSON.stringify(settings));
  } catch (err) {
    console.error("Error saving settings:", err);
  }
}





