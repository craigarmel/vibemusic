import { create } from "zustand";
import type {
  Artist,
  AudioParams,
  FanInfluence,
  SessionRecord,
  TrackRecord,
} from "../types/studio";

interface StudioState {
  artist: Artist;
  camera_stream: MediaStream | null;
  session_id: string | null;
  is_session_active: boolean;
  session_start_time: number | null;
  is_mic_muted: boolean;
  session_error: string | null;
  audio_params: AudioParams;
  fan_influences: FanInfluence[];
  current_track: TrackRecord | null;
  setCameraStream: (stream: MediaStream | null) => void;
  setSessionError: (message: string | null) => void;
  startSession: (session: SessionRecord, stream: MediaStream) => void;
  endSession: () => void;
  setMicMuted: (value: boolean) => void;
  setAudioParams: (params: Partial<AudioParams>) => void;
  addFanInfluence: (influence: FanInfluence) => void;
  resetFanInfluences: () => void;
  setCurrentTrack: (track: TrackRecord | null) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  artist: {
    artist_id: "artist-neon-01",
    name: "NEON MIRAGE",
    genre_tags: ["Techno", "Dark Ambient"],
    biography:
      "Cyborg chanteuse de Neo-Paris. Elle transforme la rumeur urbaine en pulsations froides et nocturnes.",
  },
  camera_stream: null,
  session_id: null,
  is_session_active: false,
  session_start_time: null,
  is_mic_muted: false,
  session_error: null,
  audio_params: {
    bpm: 118,
    guidance: 4,
    temperature: 1.1,
    density: 0.5,
    brightness: 0.5,
  },
  fan_influences: [],
  current_track: null,
  setCameraStream: (stream) => set({ camera_stream: stream }),
  setSessionError: (message) => set({ session_error: message }),
  startSession: (session, stream) =>
    set({
      session_id: session.session_id,
      is_session_active: true,
      session_start_time: new Date(session.start_time).getTime(),
      camera_stream: stream,
      session_error: null,
      current_track: null,
      fan_influences: [],
    }),
  endSession: () =>
    set({
      is_session_active: false,
      session_id: null,
      session_start_time: null,
      camera_stream: null,
      is_mic_muted: false,
    }),
  setMicMuted: (value) => set({ is_mic_muted: value }),
  setAudioParams: (params) =>
    set((state) => ({ audio_params: { ...state.audio_params, ...params } })),
  addFanInfluence: (influence) =>
    set((state) => ({ fan_influences: [...state.fan_influences, influence] })),
  resetFanInfluences: () => set({ fan_influences: [] }),
  setCurrentTrack: (track) => set({ current_track: track }),
}));
