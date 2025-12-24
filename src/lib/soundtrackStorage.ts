/**
 * Soundtrack Storage Helper
 * 
 * Handles persistence of playlist and playback state in localStorage.
 * Includes safe error handling for quota exceeded scenarios.
 */

export type Track = {
  id: string;
  name: string;
  url: string; // Object URL for session-only, or data URL for persisted
  dataUrl?: string; // Base64 data URL for persistence
  addedAt: string;
  size?: number; // File size in bytes
  persisted: boolean; // Whether this track is persisted (base64) or session-only
};

export type PlaybackState = {
  index: number;
  time: number; // Current playback time in seconds
  volume: number; // 0-1
};

const PLAYLIST_KEY = "continuum_soundtrack_playlist_v1";
const STATE_KEY = "continuum_soundtrack_state_v1";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB default

/**
 * Load playlist from localStorage
 */
export function loadPlaylist(): Track[] {
  try {
    const stored = localStorage.getItem(PLAYLIST_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Track[];
    // Recreate object URLs from data URLs for persisted tracks
    return parsed.map((track) => {
      if (track.dataUrl && track.persisted) {
        // Data URL is already usable, but we'll use it directly
        return {
          ...track,
          url: track.dataUrl,
        };
      }
      return track;
    });
  } catch (err) {
    console.error("Error loading playlist:", err);
    return [];
  }
}

/**
 * Save playlist to localStorage
 */
export function savePlaylist(playlist: Track[]): void {
  try {
    // Only save tracks that are persisted (have dataUrl)
    const toSave = playlist.map((track) => ({
      id: track.id,
      name: track.name,
      dataUrl: track.dataUrl,
      addedAt: track.addedAt,
      size: track.size,
      persisted: track.persisted,
      // Don't save object URLs, they won't persist
      url: track.persisted ? track.dataUrl : undefined,
    }));
    localStorage.setItem(PLAYLIST_KEY, JSON.stringify(toSave));
  } catch (err: any) {
    if (err.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded, playlist not saved");
      throw new Error("Storage quota exceeded. Some tracks may not persist.");
    }
    console.error("Error saving playlist:", err);
  }
}

/**
 * Load playback state from localStorage
 */
export function loadState(): PlaybackState | null {
  try {
    const stored = localStorage.getItem(STATE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as PlaybackState;
  } catch (err) {
    console.error("Error loading playback state:", err);
    return null;
  }
}

/**
 * Save playback state to localStorage
 */
export function saveState(state: PlaybackState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Error saving playback state:", err);
  }
}

/**
 * Check if a file size is acceptable for persistence
 */
export function canPersistFile(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

/**
 * Get max file size in MB
 */
export function getMaxFileSizeMB(): number {
  return MAX_FILE_SIZE / (1024 * 1024);
}





