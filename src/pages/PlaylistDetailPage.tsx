import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ActionIcon,
  Button,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import { IconChevronUp, IconChevronDown } from "@tabler/icons-react";
import PageHeaderCard from "../ui/PageHeaderCard";
import LoadingRow from "../ui/LoadingRow";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import { getTableStyles } from "../ui/tableStyles";
import {
  getPlaylist,
  renamePlaylist,
  reorderPlaylistItems,
  removePlaylistItem,
  type Playlist,
} from "../lib/mediaApi";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import { API_BASE } from "../config";

type PlaylistDetailPageProps = {
  palette: any;
  API_BASE: string;
};

export default function PlaylistDetailPage({
  palette,
  API_BASE: apiBase,
}: PlaylistDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setQueue, play } = useAudioPlayer();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadPlaylist();
    }
  }, [id]);

  const loadPlaylist = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getPlaylist(apiBase, id);
      setPlaylist(data);
      setPlaylistName(data.name);
    } catch (err: any) {
      console.error("Error loading playlist", err);
      setError(err?.message ?? "Failed to load playlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!id || !playlistName.trim()) return;

    try {
      setSaving(true);
      const updated = await renamePlaylist(apiBase, id, {
        name: playlistName.trim(),
      });
      setPlaylist(updated);
      setEditingName(false);
    } catch (err: any) {
      console.error("Error renaming playlist", err);
      setError(err?.message ?? "Failed to rename playlist");
    } finally {
      setSaving(false);
    }
  };

  const handleMoveUp = async (itemId: string, currentPosition: number) => {
    if (!playlist || currentPosition <= 0) return;

    const items = [...playlist.items];
    const item = items.find((i) => i.id === itemId);
    const prevItem = items.find((i) => i.position === currentPosition - 1);
    
    if (!item || !prevItem) return;

    // Swap positions
    const newItems = items.map((i) => {
      if (i.id === itemId) {
        return { ...i, position: currentPosition - 1 };
      }
      if (i.id === prevItem.id) {
        return { ...i, position: currentPosition };
      }
      return i;
    });

    try {
      await reorderPlaylistItems(apiBase, playlist.id, {
        items: newItems.map((i) => ({ id: i.id, position: i.position })),
      });
      await loadPlaylist();
    } catch (err: any) {
      console.error("Error reordering playlist", err);
      setError(err?.message ?? "Failed to reorder playlist");
    }
  };

  const handleMoveDown = async (itemId: string, currentPosition: number) => {
    if (!playlist || currentPosition >= playlist.items.length - 1) return;

    const items = [...playlist.items];
    const item = items.find((i) => i.id === itemId);
    const nextItem = items.find((i) => i.position === currentPosition + 1);
    
    if (!item || !nextItem) return;

    // Swap positions
    const newItems = items.map((i) => {
      if (i.id === itemId) {
        return { ...i, position: currentPosition + 1 };
      }
      if (i.id === nextItem.id) {
        return { ...i, position: currentPosition };
      }
      return i;
    });

    try {
      await reorderPlaylistItems(apiBase, playlist.id, {
        items: newItems.map((i) => ({ id: i.id, position: i.position })),
      });
      await loadPlaylist();
    } catch (err: any) {
      console.error("Error reordering playlist", err);
      setError(err?.message ?? "Failed to reorder playlist");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!playlist || !confirm("Remove this track from the playlist?")) return;

    try {
      await removePlaylistItem(apiBase, playlist.id, itemId);
      await loadPlaylist();
    } catch (err: any) {
      console.error("Error removing item", err);
      setError(err?.message ?? "Failed to remove item");
    }
  };

  const handlePlayPlaylist = async () => {
    if (!playlist || playlist.items.length === 0) return;

    try {
      // Extract tracks from playlist items
      const tracks = playlist.items
        .sort((a, b) => a.position - b.position)
        .map((item) => item.track)
        .filter((track): track is NonNullable<typeof track> => track !== undefined);

      if (tracks.length === 0) {
        setError("Playlist has no valid tracks");
        return;
      }

      setQueue(tracks, tracks[0]?.id);
      await play();
    } catch (err: any) {
      console.error("Error playing playlist", err);
      setError(err?.message ?? "Failed to play playlist");
    }
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds || isNaN(seconds)) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const sortedItems = playlist
    ? [...playlist.items].sort((a, b) => a.position - b.position)
    : [];

  return (
    <Stack gap="md">
      <PageHeaderCard
        title="Playlist"
        subtitle={playlist ? `Manage ${playlist.name}` : "Loading..."}
        palette={palette}
        right={
          <Button
            leftSection={<Icons.ArrowLeft size={16} />}
            onClick={() => navigate("/media")}
            size="sm"
            variant="subtle"
            styles={{
              root: {
                color: palette.text,
              },
            }}
          >
            Back
          </Button>
        }
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

      {loading && (
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          }}
        >
          <LoadingRow message="Loading playlist..." palette={palette} />
        </Paper>
      )}

      {!loading && playlist && (
        <Stack gap="md">
          {/* Playlist Name */}
          <Paper
            shadow="sm"
            p="md"
            radius="md"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.border}`,
            }}
          >
            <Group gap="md" align="center">
              {editingName ? (
                <>
                  <TextInput
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    style={{ flex: 1 }}
                    styles={{
                      input: {
                        backgroundColor: palette.background,
                        borderColor: palette.border,
                        color: palette.text,
                      },
                    }}
                  />
                  <Button
                    onClick={handleRename}
                    loading={saving}
                    size="sm"
                    style={{ backgroundColor: palette.accent }}
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingName(false);
                      setPlaylistName(playlist.name);
                    }}
                    size="sm"
                    variant="default"
                    styles={{ root: { color: palette.text } }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Text size="lg" fw={600} c={palette.text} style={{ flex: 1 }}>
                    {playlist.name}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    onClick={() => setEditingName(true)}
                    style={{ color: palette.text }}
                    title="Edit name"
                  >
                    <Icons.Edit size={18} />
                  </ActionIcon>
                </>
              )}
            </Group>
          </Paper>

          {/* Play Button */}
          {sortedItems.length > 0 && (
            <Paper
              shadow="sm"
              p="md"
              radius="md"
              style={{
                backgroundColor: palette.surface,
                border: `1px solid ${palette.border}`,
              }}
            >
              <Button
                onClick={handlePlayPlaylist}
                leftSection={<Icons.Play size={16} />}
                size="md"
                style={{ backgroundColor: palette.accent }}
              >
                Play Playlist
              </Button>
            </Paper>
          )}

          {/* Items Table */}
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
              {sortedItems.length === 0 ? (
                <EmptyState
                  message="This playlist is empty. Add tracks from the Media Library."
                  palette={palette}
                />
              ) : (
                <Table
                  withTableBorder
                  withColumnBorders
                  style={{ tableLayout: "fixed", width: "100%" }}
                  styles={getTableStyles(palette)}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: "5%", textAlign: "center" }}>
                        #
                      </Table.Th>
                      <Table.Th style={{ width: "35%" }}>Title</Table.Th>
                      <Table.Th style={{ width: "20%" }}>Artist</Table.Th>
                      <Table.Th style={{ width: "20%" }}>Album</Table.Th>
                      <Table.Th style={{ width: "10%", textAlign: "center" }}>
                        Duration
                      </Table.Th>
                      <Table.Th style={{ width: "10%", textAlign: "center" }}>
                        Actions
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {sortedItems.map((item, index) => (
                      <Table.Tr key={item.id}>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Text size="sm" c={palette.text}>
                            {index + 1}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={500} lineClamp={1} c={palette.text}>
                            {item.track?.title || "--"}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={1} c={palette.text}>
                            {item.track?.artist || "--"}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={1} c={palette.text}>
                            {item.track?.album || "--"}
                          </Text>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center" }}>
                          <Text size="sm" c={palette.text}>
                            {formatDuration(item.track?.duration)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs" justify="center">
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              onClick={() => handleMoveUp(item.id, item.position)}
                              disabled={item.position === 0}
                              style={{
                                color: item.position === 0 ? palette.textSoft : palette.text,
                              }}
                              title="Move up"
                            >
                              <IconChevronUp size={16} />
                            </ActionIcon>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              onClick={() => handleMoveDown(item.id, item.position)}
                              disabled={item.position >= sortedItems.length - 1}
                              style={{
                                color:
                                  item.position >= sortedItems.length - 1
                                    ? palette.textSoft
                                    : palette.text,
                              }}
                              title="Move down"
                            >
                              <IconChevronDown size={16} />
                            </ActionIcon>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              onClick={() => handleRemoveItem(item.id)}
                              style={{ color: "red" }}
                              title="Remove"
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
    </Stack>
  );
}

