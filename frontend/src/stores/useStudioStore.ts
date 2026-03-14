import { create } from "zustand";
import type {
  AvatarAsset,
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
  music_prompt: string;
  performance_notes: string;
  avatar_prompt: string;
  avatar_reference_image: string | null;
  generated_avatar: AvatarAsset | null;
  setCameraStream: (stream: MediaStream | null) => void;
  setSessionError: (message: string | null) => void;
  startSession: (session: SessionRecord, stream: MediaStream) => void;
  endSession: () => void;
  setMicMuted: (value: boolean) => void;
  setAudioParams: (params: Partial<AudioParams>) => void;
  addFanInfluence: (influence: FanInfluence) => void;
  resetFanInfluences: () => void;
  setCurrentTrack: (track: TrackRecord | null) => void;
  setMusicPrompt: (value: string) => void;
  setPerformanceNotes: (value: string) => void;
  setAvatarPrompt: (value: string) => void;
  setAvatarReferenceImage: (value: string | null) => void;
  setGeneratedAvatar: (avatar: AvatarAsset | null) => void;
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
  music_prompt: "",
  performance_notes: "",
  avatar_prompt: "Chrome vocalist, cinematic lighting, futuristic streetwear",
  avatar_reference_image: null,
  generated_avatar: null,
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
      music_prompt: session.music_prompt,
      performance_notes: session.performance_notes,
      avatar_prompt: session.avatar_prompt,
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
  setMusicPrompt: (value) => set({ music_prompt: value }),
  setPerformanceNotes: (value) => set({ performance_notes: value }),
  setAvatarPrompt: (value) => set({ avatar_prompt: value }),
  setAvatarReferenceImage: (value) => set({ avatar_reference_image: value }),
  setGeneratedAvatar: (avatar) =>
    set((state) => ({
      generated_avatar: avatar,
      artist: avatar ? { ...state.artist, avatar_url: avatar.image_url } : state.artist,
    })),
}));
