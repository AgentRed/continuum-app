/**
 * Media API
 * 
 * Utilities for managing tracks and playlists via the backend API.
 */

export type Track = {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  filename: string;
  fileUrl: string;
  coverUrl?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
};

export type PlaylistItem = {
  id: string;
  trackId: string;
  position: number;
  track?: Track;
};

export type Playlist = {
  id: string;
  name: string;
  items: PlaylistItem[];
  createdAt: string;
  updatedAt: string;
};

/**
 * List all tracks
 */
export async function listTracks(API_BASE: string): Promise<Track[]> {
  const res = await fetch(`${API_BASE}/api/media/tracks`);
  if (!res.ok) {
    throw new Error(`Failed to list tracks: HTTP ${res.status}`);
  }
  return (await res.json()) as Track[];
}

/**
 * Upload a track
 */
export async function uploadTrack(
  API_BASE: string,
  formData: FormData
): Promise<Track> {
  const res = await fetch(`${API_BASE}/api/media/tracks`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to upload track: HTTP ${res.status} - ${errorText}`);
  }
  return (await res.json()) as Track;
}

/**
 * Update a track
 */
export async function updateTrack(
  API_BASE: string,
  id: string,
  patch: Partial<Pick<Track, "title" | "artist" | "album">>
): Promise<Track> {
  const res = await fetch(`${API_BASE}/api/media/tracks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update track: HTTP ${res.status} - ${errorText}`);
  }
  return (await res.json()) as Track;
}

/**
 * Delete a track
 */
export async function deleteTrack(API_BASE: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/media/tracks/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete track: HTTP ${res.status} - ${errorText}`);
  }
}

/**
 * List all playlists
 */
export async function listPlaylists(API_BASE: string): Promise<Playlist[]> {
  const res = await fetch(`${API_BASE}/api/media/playlists`);
  if (!res.ok) {
    throw new Error(`Failed to list playlists: HTTP ${res.status}`);
  }
  return (await res.json()) as Playlist[];
}

/**
 * Create a playlist
 */
export async function createPlaylist(
  API_BASE: string,
  data: { name: string }
): Promise<Playlist> {
  const res = await fetch(`${API_BASE}/api/media/playlists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create playlist: HTTP ${res.status} - ${errorText}`);
  }
  return (await res.json()) as Playlist;
}

/**
 * Get a playlist by ID
 */
export async function getPlaylist(
  API_BASE: string,
  id: string
): Promise<Playlist> {
  const res = await fetch(`${API_BASE}/api/media/playlists/${id}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Playlist not found");
    }
    throw new Error(`Failed to get playlist: HTTP ${res.status}`);
  }
  return (await res.json()) as Playlist;
}

/**
 * Rename a playlist
 */
export async function renamePlaylist(
  API_BASE: string,
  id: string,
  data: { name: string }
): Promise<Playlist> {
  const res = await fetch(`${API_BASE}/api/media/playlists/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to rename playlist: HTTP ${res.status} - ${errorText}`);
  }
  return (await res.json()) as Playlist;
}

/**
 * Delete a playlist
 */
export async function deletePlaylist(API_BASE: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/media/playlists/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete playlist: HTTP ${res.status} - ${errorText}`);
  }
}

/**
 * Add a track to a playlist
 */
export async function addPlaylistItem(
  API_BASE: string,
  playlistId: string,
  data: { trackId: string }
): Promise<PlaylistItem> {
  const res = await fetch(`${API_BASE}/api/media/playlists/${playlistId}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to add playlist item: HTTP ${res.status} - ${errorText}`);
  }
  return (await res.json()) as PlaylistItem;
}

/**
 * Reorder playlist items
 */
export async function reorderPlaylistItems(
  API_BASE: string,
  playlistId: string,
  data: { items: Array<{ id: string; position: number }> }
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/media/playlists/${playlistId}/items/reorder`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to reorder playlist items: HTTP ${res.status} - ${errorText}`);
  }
}

/**
 * Remove an item from a playlist
 */
export async function removePlaylistItem(
  API_BASE: string,
  playlistId: string,
  itemId: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/media/playlists/${playlistId}/items/${itemId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to remove playlist item: HTTP ${res.status} - ${errorText}`);
  }
}



