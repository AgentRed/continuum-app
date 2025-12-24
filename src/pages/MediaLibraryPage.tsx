import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  FileInput,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
  ActionIcon,
  Select,
  Modal,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import PageHeaderCard from "../ui/PageHeaderCard";
import LoadingRow from "../ui/LoadingRow";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import { getTableStyles } from "../ui/tableStyles";
import {
  listTracks,
  uploadTrack,
  deleteTrack,
  listPlaylists,
  createPlaylist,
  deletePlaylist,
  type Track,
  type Playlist,
} from "../lib/mediaApi";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import { API_BASE } from "../config";

type MediaLibraryPageProps = {
  palette: any;
  API_BASE: string;
};

export default function MediaLibraryPage({
  palette,
  API_BASE: apiBase,
}: MediaLibraryPageProps) {
  const navigate = useNavigate();
  const { playTrack, setQueue } = useAudioPlayer();
  const [activeTab, setActiveTab] = useState<"tracks" | "playlists">("tracks");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadArtist, setUploadArtist] = useState("");
  const [uploadAlbum, setUploadAlbum] = useState("");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [createPlaylistModalOpened, setCreatePlaylistModalOpened] = useState(false);
  const [addToPlaylistModalOpened, setAddToPlaylistModalOpened] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (activeTab === "tracks") {
        const data = await listTracks(apiBase);
        setTracks(data);
      } else {
        const data = await listPlaylists(apiBase);
        setPlaylists(data);
      }
    } catch (err: any) {
      console.error("Error loading data", err);
      setError(err?.message ?? "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setError("Please select a file");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", uploadFile);
      if (uploadTitle) formData.append("title", uploadTitle);
      if (uploadArtist) formData.append("artist", uploadArtist);
      if (uploadAlbum) formData.append("album", uploadAlbum);

      await uploadTrack(apiBase, formData);
      
      // Reset form
      setUploadFile(null);
      setUploadTitle("");
      setUploadArtist("");
      setUploadAlbum("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Show success message
      setSuccessMessage("Track uploaded successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Reload tracks
      await loadData();
    } catch (err: any) {
      console.error("Error uploading track", err);
      setError(err?.message ?? "Failed to upload track");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTrack = async (id: string) => {
    if (!confirm("Are you sure you want to delete this track?")) {
      return;
    }

    try {
      await deleteTrack(apiBase, id);
      await loadData();
    } catch (err: any) {
      console.error("Error deleting track", err);
      setError(err?.message ?? "Failed to delete track");
    }
  };

  const handlePlayTrack = async (track: Track) => {
    try {
      await playTrack(track);
    } catch (err: any) {
      console.error("Error playing track", err);
      setError(err?.message ?? "Failed to play track");
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setError("Playlist name is required");
      return;
    }

    try {
      const playlist = await createPlaylist(apiBase, { name: newPlaylistName.trim() });
      setNewPlaylistName("");
      setCreatePlaylistModalOpened(false);
      await loadData();
      // Navigate to the new playlist
      navigate(`/media/playlists/${playlist.id}`);
    } catch (err: any) {
      console.error("Error creating playlist", err);
      setError(err?.message ?? "Failed to create playlist");
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (!confirm("Are you sure you want to delete this playlist?")) {
      return;
    }

    try {
      await deletePlaylist(apiBase, id);
      await loadData();
    } catch (err: any) {
      console.error("Error deleting playlist", err);
      setError(err?.message ?? "Failed to delete playlist");
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!selectedTrackId) return;

    try {
      const { addPlaylistItem } = await import("../lib/mediaApi");
      await addPlaylistItem(apiBase, playlistId, { trackId: selectedTrackId });
      setAddToPlaylistModalOpened(false);
      setSelectedTrackId(null);
    } catch (err: any) {
      console.error("Error adding track to playlist", err);
      setError(err?.message ?? "Failed to add track to playlist");
    }
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds || isNaN(seconds)) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Stack gap="md">
      <PageHeaderCard
        title="Media Library"
        subtitle="Upload tracks, build playlists, and shape the Continuum soundtrack."
        palette={palette}
      />

      <SegmentedControl
        value={activeTab}
        onChange={(value) => setActiveTab(value as "tracks" | "playlists")}
        data={[
          { label: "Tracks", value: "tracks" },
          { label: "Playlists", value: "playlists" },
        ]}
        styles={{
          root: {
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          },
        }}
      />

      {error && (
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          }}
        >
          <ErrorState message={error} palette={palette} />
        </Paper>
      )}

      {successMessage && (
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.accent}`,
          }}
        >
          <Text size="sm" c={palette.accent} fw={500}>
            {successMessage}
          </Text>
        </Paper>
      )}

      {activeTab === "tracks" && (
        <Stack gap="md">
          {/* Upload Section */}
          <Paper
            shadow="sm"
            p="md"
            radius="md"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.border}`,
            }}
          >
            <Stack gap="md">
              <Text size="sm" fw={600} c={palette.text}>
                Upload Track
              </Text>
              <FileInput
                ref={fileInputRef}
                placeholder="Select MP3 file"
                accept="audio/mpeg,audio/mp3"
                value={uploadFile}
                onChange={setUploadFile}
                styles={{
                  label: { color: palette.text },
                  input: {
                    backgroundColor: palette.background,
                    borderColor: palette.border,
                    color: palette.text,
                  },
                }}
              />
              <TextInput
                label="Title (optional)"
                placeholder="Track title"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                styles={{
                  label: { color: palette.text },
                  input: {
                    backgroundColor: palette.background,
                    borderColor: palette.border,
                    color: palette.text,
                  },
                }}
              />
              <TextInput
                label="Artist (optional)"
                placeholder="Artist name"
                value={uploadArtist}
                onChange={(e) => setUploadArtist(e.target.value)}
                styles={{
                  label: { color: palette.text },
                  input: {
                    backgroundColor: palette.background,
                    borderColor: palette.border,
                    color: palette.text,
                  },
                }}
              />
              <TextInput
                label="Album (optional)"
                placeholder="Album name"
                value={uploadAlbum}
                onChange={(e) => setUploadAlbum(e.target.value)}
                styles={{
                  label: { color: palette.text },
                  input: {
                    backgroundColor: palette.background,
                    borderColor: palette.border,
                    color: palette.text,
                  },
                }}
              />
              <Button
                onClick={handleUpload}
                loading={uploading}
                disabled={!uploadFile}
                leftSection={<Icons.Add size={16} />}
                style={{ backgroundColor: palette.accent }}
              >
                Upload
              </Button>
            </Stack>
          </Paper>

          {/* Tracks Table */}
          <Paper
            shadow="sm"
            p="md"
            radius="md"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.border}`,
            }}
          >
            <Stack gap="md">
              {loading && (
                <LoadingRow message="Loading tracks..." palette={palette} />
              )}

              {!loading && !error && tracks.length === 0 && (
                <EmptyState message="No tracks found. Upload an MP3 to get started." palette={palette} />
              )}

              {!loading && !error && tracks.length > 0 && (
                <Table
                  withTableBorder
                  withColumnBorders
                  style={{ tableLayout: "fixed", width: "100%" }}
                  styles={getTableStyles(palette)}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: "30%" }}>Title</Table.Th>
                      <Table.Th style={{ width: "20%" }}>Artist</Table.Th>
                      <Table.Th style={{ width: "20%" }}>Album</Table.Th>
                      <Table.Th style={{ width: "10%", textAlign: "center" }}>
                        Duration
                      </Table.Th>
                      <Table.Th style={{ width: "20%", textAlign: "center" }}>
                        Actions
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {tracks.map((track) => (
                      <Table.Tr key={track.id}>
                        <Table.Td>
                          <Text size="sm" fw={500} lineClamp={1} c={palette.text}>
                            {track.title}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={1} c={palette.text}>
                            {track.artist || "--"}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={1} c={palette.text}>
                            {track.album || "--"}
                          </Text>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Text size="sm" c={palette.text}>
                            {formatDuration(track.duration)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs" justify="center">
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              onClick={() => handlePlayTrack(track)}
                              style={{ color: palette.accent }}
                              title="Play"
                            >
                              <Icons.Play size={16} />
                            </ActionIcon>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              onClick={() => {
                                setSelectedTrackId(track.id);
                                setAddToPlaylistModalOpened(true);
                              }}
                              style={{ color: palette.text }}
                              title="Add to playlist"
                            >
                              <Icons.Add size={16} />
                            </ActionIcon>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              onClick={() => handleDeleteTrack(track.id)}
                              style={{ color: "red" }}
                              title="Delete"
                            >
                              <Icons.Delete size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Stack>
          </Paper>
        </Stack>
      )}

      {activeTab === "playlists" && (
        <Paper
          shadow="sm"
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          }}
        >
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="sm" fw={600} c={palette.text}>
                Playlists
              </Text>
              <Button
                onClick={() => setCreatePlaylistModalOpened(true)}
                leftSection={<Icons.Add size={16} />}
                size="sm"
                style={{ backgroundColor: palette.accent }}
              >
                Create Playlist
              </Button>
            </Group>

            {loading && (
              <LoadingRow message="Loading playlists..." palette={palette} />
            )}

            {!loading && !error && playlists.length === 0 && (
              <EmptyState message="No playlists found. Create one to get started." palette={palette} />
            )}

            {!loading && !error && playlists.length > 0 && (
              <Table
                withTableBorder
                withColumnBorders
                style={{ tableLayout: "fixed", width: "100%" }}
                styles={getTableStyles(palette)}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: "60%" }}>Name</Table.Th>
                    <Table.Th style={{ width: "20%", textAlign: "center" }}>
                      Tracks
                    </Table.Th>
                    <Table.Th style={{ width: "20%", textAlign: "center" }}>
                      Actions
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {playlists.map((playlist) => (
                    <Table.Tr
                      key={playlist.id}
                      onClick={() => navigate(`/media/playlists/${playlist.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <Table.Td>
                        <Text size="sm" fw={500} lineClamp={1} c={palette.text}>
                          {playlist.name}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Text size="sm" c={palette.text}>
                          {playlist.items.length}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="center">
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlaylist(playlist.id);
                            }}
                            style={{ color: "red" }}
                            title="Delete"
                          >
                            <Icons.Delete size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        </Paper>
      )}

      {/* Create Playlist Modal */}
      <Modal
        opened={createPlaylistModalOpened}
        onClose={() => {
          setCreatePlaylistModalOpened(false);
          setNewPlaylistName("");
        }}
        title="Create Playlist"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        styles={{
          content: {
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          },
          header: { backgroundColor: palette.surface },
          title: { color: palette.text },
          close: { color: palette.text },
        }}
      >
        <Stack gap="md">
          <TextInput
            label="Playlist Name"
            placeholder="Enter playlist name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            styles={{
              label: { color: palette.text },
              input: {
                backgroundColor: palette.background,
                borderColor: palette.border,
                color: palette.text,
              },
            }}
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                setCreatePlaylistModalOpened(false);
                setNewPlaylistName("");
              }}
              styles={{ root: { color: palette.text } }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlaylist}
              style={{ backgroundColor: palette.accent }}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Add to Playlist Modal */}
      <Modal
        opened={addToPlaylistModalOpened}
        onClose={() => {
          setAddToPlaylistModalOpened(false);
          setSelectedTrackId(null);
        }}
        title="Add to Playlist"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        styles={{
          content: {
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          },
          header: { backgroundColor: palette.surface },
          title: { color: palette.text },
          close: { color: palette.text },
        }}
      >
        <Stack gap="md">
          {playlists.length === 0 ? (
            <Text size="sm" c={palette.textSoft}>
              No playlists available. Create one first.
            </Text>
          ) : (
            <>
              <Text size="sm" c={palette.text}>
                Select a playlist:
              </Text>
              {playlists.map((playlist) => (
                <Button
                  key={playlist.id}
                  variant="subtle"
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  styles={{
                    root: {
                      color: palette.text,
                      justifyContent: "flex-start",
                    },
                  }}
                >
                  {playlist.name}
                </Button>
              ))}
            </>
          )}
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                setAddToPlaylistModalOpened(false);
                setSelectedTrackId(null);
              }}
              styles={{ root: { color: palette.text } }}
            >
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

