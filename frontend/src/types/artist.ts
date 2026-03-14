export interface LoreData {
  name: string
  biography: string
  personality_traits: string[]
  lyrics: string
}

export interface ArtistData {
  artist_id: string
  prompt: string
  lore: LoreData | null
  avatar_url: string | null
}
