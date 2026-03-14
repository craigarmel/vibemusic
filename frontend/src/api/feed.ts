import { apiGet, apiPost } from './client'
import type { FeedItem, ArtistInfluences } from '../types/feed'

interface FeedDataResponse {
  clips: FeedItem[]
  total: number
}

export async function getFeed() {
  return apiGet<FeedDataResponse>('/api/feed')
}

export async function submitInfluence(artistId: string, clipId: string, tag: string) {
  return apiPost<{ artist_id: string; clip_id: string; tag: string; created_at: string }>(
    '/api/feed/influence',
    { artist_id: artistId, clip_id: clipId, tag: tag }
  )
}

export async function getArtistInfluences(artistId: string) {
  return apiGet<ArtistInfluences>(`/api/artists/${artistId}/influences`)
}
