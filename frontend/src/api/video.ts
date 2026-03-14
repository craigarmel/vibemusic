import { apiGet, apiPost } from './client'

interface GenerateClipResponse {
  task_id: string
}

interface TaskStatusResponse {
  task_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  clip_id: string | null
  video_url: string | null
  error: string | null
}

export async function generateClip(artistId: string, trackId: string) {
  return apiPost<GenerateClipResponse>('/api/clips/generate', {
    artist_id: artistId,
    track_id: trackId,
  })
}

export async function getTaskStatus(taskId: string) {
  return apiGet<TaskStatusResponse>(`/api/tasks/${taskId}/status`)
}
