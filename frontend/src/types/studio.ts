export interface Artist {
  artist_id: string;
  name: string;
  genre_tags: string[];
  biography: string;
}

export interface SessionRecord {
  session_id: string;
  artist_id: string;
  start_time: string;
  status: "active" | "completed";
}

export interface AudioParams {
  bpm: number;
  guidance: number;
  temperature: number;
  density: number;
  brightness: number;
}

export interface FanInfluence {
  tag: string;
  received_at: string;
}

export interface TrackRecord {
  track_id: string;
  session_id: string;
  artist_id: string;
  audio_url: string;
  duration_seconds: number;
  created_at: string;
  status: "draft" | "published";
  influences: string[];
}
