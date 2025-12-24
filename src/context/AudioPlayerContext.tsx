import React, { createContext, useContext, useRef, useState, useEffect, useCallback, ReactNode } from "react";
import type { Track as BackendTrack } from "../lib/mediaApi";
import { API_BASE } from "../config";

const DEBUG = false;

// Support both old format (for backward compatibility) and new backend format
type LegacyTrack = {
  id: string;
  name: string;
  url: string;
  addedAt: string;
  source: "PUBLIC" | "LOCAL_FILE" | "URL";
};

// Unified track type that works with both formats
type PlayerTrack = BackendTrack | LegacyTrack;

// Helper to get URL from either format
function getTrackUrl(track: PlayerTrack): string {
  if ("fileUrl" in track) {
    return track.fileUrl;
  }
  return track.url;
}

// Helper to get title/name from either format
function getTrackTitle(track: PlayerTrack): string {
  if ("title" in track) {
    return track.title;
  }
  return track.name;
}

type AudioPlayerState = {
  queue: PlayerTrack[];
  currentTrackId: string | null;
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  activePlaylistId: string | null;
  userInteracted: boolean;
};

type AudioPlayerContextType = {
  state: AudioPlayerState;
  audioRef: React.RefObject<HTMLAudioElement>;
  audioContextRef: React.RefObject<AudioContext | null>;
  analyserRef: React.RefObject<AnalyserNode | null>;
  sourceNodeRef: React.RefObject<MediaElementAudioSourceNode | null>;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  seek: (seconds: number) => void;
  playTrack: (track: PlayerTrack) => Promise<void>;
  setQueue: (tracks: PlayerTrack[], startTrackId?: string) => void;
  setTrack: (index: number) => Promise<void>;
  setPlaylist: (tracks: PlayerTrack[]) => void; // Legacy support
  setVolume: (volume: number) => void;
  initAudioContext: () => AudioContext | null;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

const PLAYLIST_STORAGE_KEY = "continuum_player_playlist_v1";
const LAST_TRACK_ID_KEY = "continuum_player_last_track_id_v1";
const LAST_TIME_KEY = "continuum_player_last_time_v1";
const LAST_VOLUME_KEY = "continuum_player_last_volume_v1";
const USER_INTERACTED_KEY = "continuum_player_user_interacted_v1";
const IS_PLAYING_KEY = "continuum_player_is_playing_v1";

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const objectUrlsRef = useRef<Map<string, string>>(new Map());

  const [queue, setQueueState] = useState<PlayerTrack[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(() => {
    try {
      const stored = localStorage.getItem(LAST_VOLUME_KEY);
      if (stored) {
        const vol = parseFloat(stored);
        if (!isNaN(vol) && vol >= 0 && vol <= 1) return vol;
      }
    } catch (err) {
      if (DEBUG) console.error("Failed to load volume:", err);
    }
    return 1;
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [userInteracted, setUserInteracted] = useState(() => {
    try {
      return localStorage.getItem(USER_INTERACTED_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;

      audioRef.current.addEventListener("timeupdate", () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          try {
            localStorage.setItem(LAST_TIME_KEY, audioRef.current.currentTime.toString());
          } catch (err) {
            if (DEBUG) console.error("Failed to save time:", err);
          }
        }
      });

      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      });

      audioRef.current.addEventListener("play", () => {
        setIsPlaying(true);
      });

      audioRef.current.addEventListener("pause", () => {
        setIsPlaying(false);
      });

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        // Auto-advance to next track
        if (queue.length > 0) {
          const nextIndex = currentTrackIndex >= queue.length - 1 ? 0 : currentTrackIndex + 1;
          setCurrentTrackIndex(nextIndex);
          const nextTrack = queue[nextIndex];
          if (nextTrack) {
            setCurrentTrackId(nextTrack.id);
            setTimeout(async () => {
              if (audioRef.current && nextIndex >= 0 && nextIndex < queue.length) {
                try {
                  await audioRef.current.play();
                  setIsPlaying(true);
                } catch (err) {
                  if (DEBUG) console.error("Auto-play failed:", err);
                }
              }
            }, 100);
          }
        }
      });

      audioRef.current.addEventListener("error", (e) => {
        const error = audioRef.current?.error;
        if (error) {
          if (DEBUG) console.error("Audio error:", error.message || "Unknown error");
          setIsPlaying(false);
        }
      });
    }

    return () => {
      // Don't cleanup audio element - we want it to persist
    };
  }, []);

  // Load queue on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PLAYLIST_STORAGE_KEY);
      if (stored) {
        const tracks = JSON.parse(stored) as PlayerTrack[];
        // Filter out local files that lost their object URLs
        const validTracks = tracks.filter((t) => {
          if ("source" in t && t.source === "LOCAL_FILE") {
            return false;
          }
          return true;
        });
        setQueueState(validTracks);
        if (validTracks.length !== tracks.length) {
          try {
            localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(validTracks));
          } catch (err) {
            if (DEBUG) console.error("Failed to save filtered queue:", err);
          }
        }

        // Restore last track
        const lastTrackId = localStorage.getItem(LAST_TRACK_ID_KEY);
        if (lastTrackId) {
          const index = validTracks.findIndex((t) => t.id === lastTrackId);
          if (index >= 0) {
            setCurrentTrackIndex(index);
            setCurrentTrackId(lastTrackId);
          }
        }
      }
    } catch (err) {
      if (DEBUG) console.error("Failed to load queue:", err);
    }
  }, []);

  // Save queue to localStorage
  const saveQueue = useCallback((tracks: PlayerTrack[]) => {
    try {
      localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(tracks));
    } catch (err) {
      if (DEBUG) console.error("Failed to save queue:", err);
    }
  }, []);

  // Update audio source when track changes
  useEffect(() => {
    if (audioRef.current && currentTrackIndex >= 0 && currentTrackIndex < queue.length) {
      const track = queue[currentTrackIndex];
      if (!track) {
        return;
      }

      const trackUrl = getTrackUrl(track);
      if (!trackUrl) {
        return;
      }

      // Build full URL if it's a relative path
      const fullUrl = trackUrl.startsWith("http") || trackUrl.startsWith("/")
        ? trackUrl
        : `${API_BASE}/media/${trackUrl}`;

      if (audioRef.current.src !== fullUrl && !audioRef.current.src.endsWith(trackUrl)) {
        audioRef.current.src = fullUrl;
        audioRef.current.load();
      }

      setCurrentTime(0);
      setDuration(0);
      setCurrentTrackId(track.id);

      try {
        localStorage.setItem(LAST_TRACK_ID_KEY, track.id);
      } catch (err) {
        if (DEBUG) console.error("Failed to save last track:", err);
      }
    } else if (audioRef.current && currentTrackIndex === -1) {
      audioRef.current.pause();
      audioRef.current.src = "";
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setCurrentTrackId(null);
    }
  }, [currentTrackIndex, queue]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      try {
        localStorage.setItem(LAST_VOLUME_KEY, volume.toString());
      } catch (err) {
        if (DEBUG) console.error("Failed to save volume:", err);
      }
    }
  }, [volume]);

  // Restore playback position on mount if user has interacted
  useEffect(() => {
    if (userInteracted && audioRef.current && currentTrackIndex >= 0) {
      try {
        const lastTime = localStorage.getItem(LAST_TIME_KEY);
        const lastTrackId = localStorage.getItem(LAST_TRACK_ID_KEY);
        // Only restore if it's the same track
        if (lastTime && lastTrackId === currentTrackId) {
          const time = parseFloat(lastTime);
          if (!isNaN(time) && time > 0) {
            audioRef.current.addEventListener(
              "loadedmetadata",
              () => {
                if (audioRef.current) {
                  audioRef.current.currentTime = time;
                }
              },
              { once: true }
            );
          }
        }
      } catch (err) {
        if (DEBUG) console.error("Failed to restore time:", err);
      }
    }
  }, [userInteracted, currentTrackIndex, currentTrackId]);

  // Initialize AudioContext for VU meter
  const initAudioContext = useCallback(() => {
    if (audioContextRef.current && analyserRef.current && sourceNodeRef.current) {
      return audioContextRef.current;
    }

    try {
      if (!audioContextRef.current) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
      }

      if (audioRef.current && !sourceNodeRef.current) {
        const source = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceNodeRef.current = source;
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 2048; // As per requirements
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyser.connect(audioContextRef.current.destination);
        analyserRef.current = analyser;
        if (DEBUG) console.log("AudioContext and analyser initialized");
      }

      return audioContextRef.current;
    } catch (err) {
      if (DEBUG) console.error("Failed to create AudioContext:", err);
      return null;
    }
  }, []);

  const play = useCallback(async () => {
    if (!audioRef.current || currentTrackIndex < 0 || currentTrackIndex >= queue.length) {
      return;
    }

    const track = queue[currentTrackIndex];
    if (!track) {
      return;
    }

    const trackUrl = getTrackUrl(track);
    if (!trackUrl) {
      return;
    }

    // Build full URL if it's a relative path
    const fullUrl = trackUrl.startsWith("http") || trackUrl.startsWith("/")
      ? trackUrl
      : `${API_BASE}/media/${trackUrl}`;

    // Initialize AudioContext on first play
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

    // Mark user as interacted
    if (!userInteracted) {
      setUserInteracted(true);
      try {
        localStorage.setItem(USER_INTERACTED_KEY, "true");
      } catch (err) {
        if (DEBUG) console.error("Failed to save user interacted:", err);
      }
    }

    try {
      if (audioRef.current.src !== fullUrl && !audioRef.current.src.endsWith(trackUrl)) {
        audioRef.current.src = fullUrl;
        audioRef.current.load();
        await new Promise((resolve) => {
          if (audioRef.current) {
            audioRef.current.addEventListener("canplay", resolve, { once: true });
            setTimeout(resolve, 1000);
          } else {
            resolve(null);
          }
        });
      }

      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err: any) {
      if (DEBUG) console.error("Playback error:", err);
      setIsPlaying(false);
    }
  }, [currentTrackIndex, queue, userInteracted, initAudioContext]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(async () => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [isPlaying, play, pause]);

  // Alias for toggle (as per requirements)
  const togglePlay = toggle;

  const next = useCallback(async () => {
    if (queue.length === 0) return;
    const newIndex = currentTrackIndex >= queue.length - 1 ? 0 : currentTrackIndex + 1;
    setCurrentTrackIndex(newIndex);
    const nextTrack = queue[newIndex];
    if (nextTrack) {
      setCurrentTrackId(nextTrack.id);
    }
    setTimeout(async () => {
      await play();
    }, 100);
  }, [queue.length, currentTrackIndex, play]);

  const prev = useCallback(async () => {
    if (queue.length === 0) return;
    const newIndex = currentTrackIndex <= 0 ? queue.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(newIndex);
    const prevTrack = queue[newIndex];
    if (prevTrack) {
      setCurrentTrackId(prevTrack.id);
    }
    setTimeout(async () => {
      await play();
    }, 100);
  }, [queue.length, currentTrackIndex, play]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setTrack = useCallback(async (index: number) => {
    if (index >= 0 && index < queue.length) {
      setCurrentTrackIndex(index);
      const track = queue[index];
      if (track) {
        setCurrentTrackId(track.id);
      }
      setTimeout(async () => {
        await play();
      }, 100);
    }
  }, [queue.length, queue, play]);

  // New: playTrack - plays a single track (queues it and plays)
  const playTrack = useCallback(async (track: PlayerTrack) => {
    setQueueState([track]);
    setCurrentTrackIndex(0);
    setCurrentTrackId(track.id);
    setActivePlaylistId(null);
    saveQueue([track]);
    setTimeout(async () => {
      await play();
    }, 100);
  }, [play]);

  // New: setQueue - sets the queue and optionally starts at a specific track
  const setQueue = useCallback((tracks: PlayerTrack[], startTrackId?: string) => {
    setQueueState(tracks);
    saveQueue(tracks);
    if (startTrackId) {
      const index = tracks.findIndex((t) => t.id === startTrackId);
      if (index >= 0) {
        setCurrentTrackIndex(index);
        setCurrentTrackId(startTrackId);
      } else {
        setCurrentTrackIndex(0);
        setCurrentTrackId(tracks[0]?.id || null);
      }
    } else {
      setCurrentTrackIndex(0);
      setCurrentTrackId(tracks[0]?.id || null);
    }
  }, [saveQueue]);

  // Legacy: setPlaylist - for backward compatibility
  const setPlaylist = useCallback(
    (tracks: PlayerTrack[]) => {
      setQueueState(tracks);
      saveQueue(tracks);
      if (tracks.length > 0) {
        setCurrentTrackIndex(0);
        setCurrentTrackId(tracks[0].id);
      }
    },
    [saveQueue]
  );

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
  }, []);

  const state: AudioPlayerState = {
    queue,
    currentTrackId,
    currentTrackIndex,
    isPlaying,
    volume,
    currentTime,
    duration,
    activePlaylistId,
    userInteracted,
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        state,
        audioRef,
        audioContextRef,
        analyserRef,
        sourceNodeRef,
        play,
        pause,
        toggle,
        togglePlay,
        next,
        prev,
        seek,
        playTrack,
        setQueue,
        setTrack,
        setPlaylist,
        setVolume,
        initAudioContext,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return context;
}

