import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import VUMeter from "./VUMeter";
import {
  ActionIcon,
  Button,
  Group,
  Paper,
  Slider,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconChartBar,
} from "@tabler/icons-react";

// Rollback flag - set to false to revert to minimal player
const ENABLE_ADVANCED_PLAYER = true;

// IMPORTANT: Do not use <Text> unless imported from @mantine/core, otherwise it resolves to DOM Text().
// Always import: import { Text } from "@mantine/core";

// Constant title - must persist
export const PLAYER_TITLE = "Traverse the Continuum...";

const DEBUG = false;

type PaletteDef = {
  background: string;
  surface: string;
  header: string;
  accent: string;
  accentSoft: string;
  text: string;
  textSoft: string;
  border: string;
};

interface SoundtrackPlayerProps {
  palette: PaletteDef;
}


export default function SoundtrackPlayer({ palette }: SoundtrackPlayerProps) {
  const navigate = useNavigate();
  // Use audio player context for persistent state
  const {
    state,
    audioRef,
    audioContextRef,
    analyserRef,
    play,
    pause,
    toggle,
    next,
    prev,
    seek,
    setTrack,
    setPlaylist,
    setVolume,
    initAudioContext,
  } = useAudioPlayer();

  const { queue, currentTrackId, currentTrackIndex, isPlaying, volume, currentTime, duration } = state;

  const [playError, setPlayError] = useState<string | null>(null);
  const [showVuMeter, setShowVuMeter] = useState(() => {
    try {
      const stored = localStorage.getItem("continuum_player_show_vu_meter_v1");
      if (stored !== null) {
        return stored === "true";
      }
    } catch (err) {
      if (DEBUG) console.error("Failed to load VU meter preference:", err);
    }
    return true; // Default to showing VU meter
  });


  // Save VU meter preference
  useEffect(() => {
    try {
      localStorage.setItem("continuum_player_show_vu_meter_v1", showVuMeter.toString());
    } catch (err) {
      if (DEBUG) console.error("Failed to save VU meter preference:", err);
    }
  }, [showVuMeter]);

  const handlePlayPause = async () => {
    // If no track selected, select first track
    if (currentTrackIndex < 0 && queue.length > 0) {
      await setTrack(0);
      return;
    }

    if (currentTrackIndex < 0 || currentTrackIndex >= queue.length) {
      setPlayError("No track selected");
      return;
    }

    // Initialize AudioContext on first play (for VU meter)
    if (ENABLE_ADVANCED_PLAYER) {
      initAudioContext();
      
      // Resume AudioContext if suspended
      if (audioContextRef.current?.state === "suspended") {
        try {
          await audioContextRef.current.resume();
          if (DEBUG) console.log("AudioContext resumed");
        } catch (err) {
          if (DEBUG) console.error("Failed to resume AudioContext:", err);
        }
      }
    }

    try {
      await toggle();
      setPlayError(null);
    } catch (err: any) {
      const errorMsg = err.message || "Playback failed";
      setPlayError(`Audio playback was blocked. Click Play again. (${errorMsg})`);
      if (DEBUG) console.error("Playback error:", err);
    }
  };

  const handlePrevious = async () => {
    if (queue.length === 0) return;
    try {
      await prev();
      setPlayError(null);
    } catch (err) {
      setPlayError("Failed to play previous track");
      if (DEBUG) console.error("Previous track error:", err);
    }
  };

  const handleNext = async () => {
    if (queue.length === 0) return;
    try {
      await next();
      setPlayError(null);
    } catch (err) {
      setPlayError("Failed to play next track");
      if (DEBUG) console.error("Next track error:", err);
    }
  };

  const handleSeek = (value: number) => {
    seek(value);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
  };


  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentTrack =
    currentTrackIndex >= 0 && currentTrackIndex < queue.length
      ? queue[currentTrackIndex]
      : null;

  // Helper to get track title
  const getTrackTitle = (track: any): string => {
    if (!track) return "";
    if ("title" in track) return track.title;
    return track.name || "";
  };

  // Helper to get track artist
  const getTrackArtist = (track: any): string => {
    if (!track) return "";
    return track.artist || "";
  };

  // Helper to get cover URL
  const getCoverUrl = (track: any): string | null => {
    if (!track) return null;
    if ("coverUrl" in track && track.coverUrl) {
      // Build full URL if it's a relative path
      if (track.coverUrl.startsWith("http") || track.coverUrl.startsWith("/")) {
        return track.coverUrl;
      }
      return `${API_BASE}/media/${track.coverUrl}`;
    }
    return null;
  };

  // Minimal player (rollback mode)
  if (!ENABLE_ADVANCED_PLAYER) {
    return (
      <Paper
        p="sm"
        radius="md"
        style={{
          backgroundColor: palette.surface,
          border: `1px solid ${palette.border}`,
          flexShrink: 0,
          marginTop: "auto",
        }}
      >
        <Stack gap="xs">
          <Text size="sm" fw={600} c={palette.text}>
            {PLAYER_TITLE}
          </Text>
          {playError && (
            <Text size="xs" c="red">
              {playError}
            </Text>
          )}
          {queue.length === 0 && (
            <Stack gap="xs" align="center">
              <Text size="xs" c={palette.textSoft} style={{ fontStyle: "italic", textAlign: "center" }}>
                No tracks loaded. Upload tracks in the Media Library.
              </Text>
              <Button
                size="xs"
                variant="light"
                onClick={() => navigate("/media")}
                style={{
                  backgroundColor: palette.accent,
                  color: palette.background,
                }}
              >
                Open Media Library
              </Button>
            </Stack>
          )}
          {currentTrack && (
            <Text size="xs" c={palette.text} fw={500} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {getTrackTitle(currentTrack)}
            </Text>
          )}
          <Group gap="xs" justify="center">
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={handlePrevious}
              disabled={queue.length === 0}
              style={{ 
                color: queue.length === 0 ? palette.textSoft : palette.text,
                opacity: queue.length === 0 ? 0.5 : 1,
              }}
            >
              <IconPlayerSkipBack size={16} />
            </ActionIcon>
            <ActionIcon
              size="md"
              variant="filled"
              onClick={handlePlayPause}
              disabled={currentTrackIndex < 0}
              style={{
                backgroundColor: currentTrackIndex < 0 ? palette.textSoft : palette.accent,
                color: palette.background,
                opacity: currentTrackIndex < 0 ? 0.5 : 1,
              }}
            >
              {isPlaying ? <IconPlayerPause size={20} /> : <IconPlayerPlay size={20} />}
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={handleNext}
              disabled={queue.length === 0}
              style={{ 
                color: queue.length === 0 ? palette.textSoft : palette.text,
                opacity: queue.length === 0 ? 0.5 : 1,
              }}
            >
              <IconPlayerSkipForward size={16} />
            </ActionIcon>
          </Group>
        </Stack>
      </Paper>
    );
  }

  // Advanced player
  return (
    <>
      <Paper
        p="sm"
        radius="md"
        style={{
          backgroundColor: palette.surface,
          border: `1px solid ${palette.border}`,
          flexShrink: 0,
          marginTop: "auto",
        }}
      >
        <Stack gap="xs">
          {/* Header */}
          <Group justify="space-between" align="center">
            <Text size="sm" fw={600} c={palette.text}>
              {PLAYER_TITLE}
            </Text>
            {ENABLE_ADVANCED_PLAYER && (
              <Tooltip label={showVuMeter ? "Hide VU Meter" : "Show VU Meter"}>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={() => setShowVuMeter(!showVuMeter)}
                  style={{ color: showVuMeter ? palette.accent : palette.text }}
                >
                  <IconChartBar size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>

          {/* Error message */}
          {playError && (
            <Text size="xs" c="red">
              {playError}
            </Text>
          )}

          {/* Empty state */}
          {queue.length === 0 && (
            <Stack gap="xs" align="center">
              <Text size="xs" c={palette.textSoft} style={{ fontStyle: "italic", textAlign: "center" }}>
                No tracks loaded. Upload tracks in the Media Library.
              </Text>
              <Button
                size="xs"
                variant="light"
                onClick={() => navigate("/media")}
                style={{
                  backgroundColor: palette.accent,
                  color: palette.background,
                }}
              >
                Open Media Library
              </Button>
            </Stack>
          )}

          {/* Album cover and track info */}
          {currentTrack && (
            <Group gap="xs" align="center">
              {/* Album cover */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "4px",
                  backgroundColor: palette.background,
                  border: `1px solid ${palette.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {getCoverUrl(currentTrack) ? (
                  <img
                    src={getCoverUrl(currentTrack) || ""}
                    alt="Album cover"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  // Placeholder using Continuum logo palette
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentSoft} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text size="xs" c={palette.background} fw={700}>
                      C
                    </Text>
                  </div>
                )}
              </div>
              {/* Track info */}
              <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                <Text
                  size="xs"
                  c={palette.text}
                  fw={500}
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={getTrackTitle(currentTrack)}
                >
                  {getTrackTitle(currentTrack) || "Unknown Track"}
                </Text>
                {getTrackArtist(currentTrack) && (
                  <Text
                    size="xs"
                    c={palette.textSoft}
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={getTrackArtist(currentTrack)}
                  >
                    {getTrackArtist(currentTrack)}
                  </Text>
                )}
              </Stack>
            </Group>
          )}

          {/* VU Meter */}
          {ENABLE_ADVANCED_PLAYER && showVuMeter && (
            <VUMeter
              isActive={isPlaying}
              analyser={analyserRef.current}
              audioContext={audioContextRef.current}
              palette={palette}
            />
          )}

          {/* Controls - Always visible */}
          <Group gap="xs" justify="center">
            <Tooltip label="Previous">
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={handlePrevious}
                disabled={queue.length === 0}
                style={{ 
                  color: queue.length === 0 ? palette.textSoft : palette.text,
                  opacity: queue.length === 0 ? 0.5 : 1,
                }}
              >
                <IconPlayerSkipBack size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={isPlaying ? "Pause" : "Play"}>
              <ActionIcon
                size="md"
                variant="filled"
                onClick={handlePlayPause}
                disabled={currentTrackIndex < 0}
                style={{
                  backgroundColor: currentTrackIndex < 0 ? palette.textSoft : palette.accent,
                  color: palette.background,
                  opacity: currentTrackIndex < 0 ? 0.5 : 1,
                }}
              >
                {isPlaying ? (
                  <IconPlayerPause size={20} />
                ) : (
                  <IconPlayerPlay size={20} />
                )}
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Next">
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={handleNext}
                disabled={queue.length === 0}
                style={{ 
                  color: queue.length === 0 ? palette.textSoft : palette.text,
                  opacity: queue.length === 0 ? 0.5 : 1,
                }}
              >
                <IconPlayerSkipForward size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* Progress */}
          {currentTrack && (
            <Stack gap={2}>
              <Slider
                value={currentTime}
                onChange={handleSeek}
                max={duration || 100}
                step={1}
                label={null}
                style={{ flex: 1 }}
                color={palette.accent}
                styles={{
                  track: { backgroundColor: palette.border },
                  thumb: { borderColor: palette.accent },
                }}
              />
              <Group justify="space-between" gap="xs">
                <Text size="xs" c={palette.textSoft}>
                  {formatTime(currentTime)}
                </Text>
                <Text size="xs" c={palette.textSoft}>
                  {formatTime(duration)}
                </Text>
              </Group>
            </Stack>
          )}

          {/* Volume - Always visible */}
          <Group gap="xs" align="center">
            <Text size="xs" c={palette.textSoft} style={{ minWidth: "40px" }}>
              Vol
            </Text>
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.01}
              label={null}
              style={{ flex: 1 }}
              color={palette.accent}
              styles={{
                track: { backgroundColor: palette.border },
                thumb: { borderColor: palette.accent },
              }}
            />
          </Group>
        </Stack>
      </Paper>

    </>
  );
}
