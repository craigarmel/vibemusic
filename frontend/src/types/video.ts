export interface ClipData {
  clip_id: string
  task_id: string
  artist_id: string
  track_id: string
  video_url: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
}

export interface TaskStatus {
  task_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  clip_id: string | null
  video_url: string | null
  error: string | null
}
