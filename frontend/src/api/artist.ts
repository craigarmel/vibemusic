import { apiGet, apiPost } from './client'
import type { ArtistData, LoreData } from '../types/artist'

interface CreateArtistResponse {
  artist_id: string
  lore: LoreData
}

export async function createArtist(prompt: string) {
  return apiPost<CreateArtistResponse>('/api/artists', { prompt })
}

interface AvatarResponse {
  artist_id: string
  avatar_url: string
}

export async function generateAvatar(artistId: string) {
  return apiPost<AvatarResponse>(`/api/artists/${artistId}/avatar`, {})
}

export async function getArtist(artistId: string) {
  return apiGet<ArtistData>(`/api/artists/${artistId}`)
}
